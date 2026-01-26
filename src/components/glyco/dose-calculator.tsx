'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Activity, Calculator as CalculatorIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UtensilsCrossed } from '../icons/utensils';

export function DoseCalculator() {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [currentGlucose, setCurrentGlucose] = useState(120);
  const [carbs, setCarbs] = useState(0);
  const [recommendedDose, setRecommendedDose] = useState(0);

  // Default values, will be replaced by user data
  const [carbRatio, setCarbRatio] = useState(10);
  const [correctionFactor, setCorrectionFactor] = useState(50);
  const [targetGlucose, setTargetGlucose] = useState(125);
  const [targetRange, setTargetRange] = useState([70, 180]);
  
  const [isLogging, setIsLogging] = useState(false);

  useEffect(() => {
    if (user && firestore) {
      const fetchPatientData = async () => {
        const patientDocRef = doc(firestore, `users/${user.uid}/patients/${user.uid}`);
        const patientDoc = await getDoc(patientDocRef);
        if (patientDoc.exists()) {
          const data = patientDoc.data();
          // Assuming these fields exist. Add default values if they might not.
          setCarbRatio(data.carbRatio || 10);
          setCorrectionFactor(data.correctionFactor || 50);
          setTargetGlucose(data.targetGlucose || 125);
          setTargetRange([data.targetGlucoseMin || 70, data.targetGlucoseMax || 180]);
        }
      };
      fetchPatientData();
    }
  }, [user, firestore]);

  useEffect(() => {
    const carbCoverage = carbRatio > 0 ? carbs / carbRatio : 0;
    
    let correctionDose = 0;
    if (correctionFactor > 0 && currentGlucose > targetGlucose) {
      correctionDose = (currentGlucose - targetGlucose) / correctionFactor;
    }

    const totalDose = carbCoverage + correctionDose;
    setRecommendedDose(Math.round(totalDose * 10) / 10); // Round to one decimal place
  }, [currentGlucose, carbs, carbRatio, correctionFactor, targetGlucose]);

  const handleLogDose = async () => {
    if (!user || !firestore || recommendedDose <= 0) return;
    
    setIsLogging(true);
    try {
        const dosageCollectionRef = collection(firestore, `users/${user.uid}/patients/${user.uid}/insulinDosages`);
        await addDoc(dosageCollectionRef, {
            patientId: user.uid,
            units: recommendedDose,
            timestamp: serverTimestamp(),
            calculationDetails: {
                currentGlucose,
                carbs,
                carbRatio,
                correctionFactor,
                targetGlucose,
            }
        });
        toast({
            title: 'Dose Logged',
            description: `${recommendedDose} units have been logged successfully.`,
        });
    } catch (error: any) {
        console.error("Error logging dose:", error);
        toast({
            variant: "destructive",
            title: "Logging Failed",
            description: error.message || "Could not log the dose. Please try again.",
        });
    } finally {
        setIsLogging(false);
    }
  };


  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dose Calculator</h1>
          <p className="text-muted-foreground">Calculate your insulin dose</p>
        </div>
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* Current Blood Glucose Card */}
          <Card>
            <CardContent className="p-6">
              <div className='flex items-center gap-2 mb-4'>
                <Activity className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Current Blood Glucose</h3>
              </div>
              <div className="text-center">
                <span className="text-5xl font-bold text-primary">{currentGlucose}</span>
                <span className="text-lg ml-2 text-muted-foreground">mg/dL</span>
              </div>
              <div className="mt-6">
                <Slider
                  value={[currentGlucose]}
                  onValueChange={(value) => setCurrentGlucose(value[0])}
                  max={400}
                  min={40}
                  step={1}
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>40</span>
                   <span className='text-primary font-medium'>Target: {targetRange[0]}-{targetRange[1]}</span>
                  <span>400</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Carbohydrates Card */}
          <Card>
            <CardContent className="p-6">
              <div className='flex items-center gap-2 mb-4'>
                  <UtensilsCrossed className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">Carbohydrates</h3>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  value={carbs}
                  onChange={(e) => setCarbs(parseInt(e.target.value, 10) || 0)}
                  className="text-center text-2xl h-16 pr-16"
                  placeholder="0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">grams</span>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-4">
                {[15, 30, 45, 60].map((val) => (
                  <Button
                    key={val}
                    variant="outline"
                    onClick={() => setCarbs(carbs + val)}
                  >
                    +{val}g
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommended Dose Card */}
        <Card className="bg-accent/40">
          <CardContent className="p-6 flex flex-col h-full">
            <div className='flex items-center gap-2 mb-4'>
                <CalculatorIcon className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Recommended Dose</h3>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <span className="text-7xl font-bold text-primary">{recommendedDose}</span>
              <span className="text-xl ml-2 text-muted-foreground">units</span>
            </div>
            <div className="space-y-2 text-sm border-t pt-4">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Carb coverage ({carbs}g ÷ {carbRatio})</span>
                    <span className="font-medium">+{(carbs / carbRatio).toFixed(1)} u</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Correction ({currentGlucose} → {targetGlucose})</span>
                    <span className="font-medium">
                        +{Math.max(0, (currentGlucose - targetGlucose) / correctionFactor).toFixed(1)} u
                    </span>
                </div>
            </div>
            <Button size="lg" className="w-full mt-6" onClick={handleLogDose} disabled={isLogging || recommendedDose <= 0}>
              {isLogging ? 'Logging...' : `Log ${recommendedDose} Units`}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
