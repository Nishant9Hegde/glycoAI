
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Droplet, Calculator as CalculatorIcon, ChevronsUpDown, X, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UtensilsCrossed } from '../icons/utensils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { INDIAN_FOODS } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface PredictionResult {
  success: boolean;
  current_bg: number;
  current_iob: number;
  correction_dose: number;
  carb_coverage_dose: number;
  iob_adjustment: number;
  recommended_insulin: number;
  planned_carbs: number;
  predictions: {
    times: string[];
    values: number[];
    one_hour: number;
    two_hours: number;
    three_hours: number;
    peak: number;
  };
  alert: {
    type: 'warning' | 'success';
    message: string;
    details: string | null;
  };
}

export function DoseCalculator() {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [currentGlucose, setCurrentGlucose] = useState(120);
  const [carbs, setCarbs] = useState(0);
  const [recommendedDose, setRecommendedDose] = useState(0);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [calculating, setCalculating] = useState(false);

  // Default values, will be replaced by user data
  const [carbRatio, setCarbRatio] = useState(10);
  const [correctionFactor, setCorrectionFactor] = useState(50);
  const [targetGlucose, setTargetGlucose] = useState(125);
  const [targetRange, setTargetRange] = useState([70, 180]);
  
  const [isLogging, setIsLogging] = useState(false);
  const [selectedFoods, setSelectedFoods] = useState<{ label: string; carbs: number }[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);

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
    const totalCarbs = selectedFoods.reduce((sum, food) => sum + food.carbs, 0);
    setCarbs(totalCarbs);
  }, [selectedFoods]);

  // Fetch ML-based recommendation when BG or carbs change
  useEffect(() => {
    const fetchMLRecommendation = async () => {
      if (carbs <= 0) {
        setPredictionResult(null);
        return;
      }

      setCalculating(true);
      try {
        const response = await fetch('https://unsignalised-idella-devotionally.ngrok-free.dev/api/scenario2', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            current_bg: currentGlucose,
            planned_carbs: carbs,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch ML recommendation');
        }

        const data = await response.json();
        
        if (data.success) {
          setPredictionResult(data);
          setRecommendedDose(data.recommended_insulin);
        }
      } catch (error) {
        console.error('ML recommendation error:', error);
        // Fall back to simple calculation
        const carbCoverage = carbRatio > 0 ? carbs / carbRatio : 0;
        let correctionDose = 0;
        if (correctionFactor > 0 && currentGlucose > targetGlucose) {
          correctionDose = (currentGlucose - targetGlucose) / correctionFactor;
        }
        const totalDose = carbCoverage + correctionDose;
        setRecommendedDose(Math.round(totalDose * 10) / 10);
      } finally {
        setCalculating(false);
      }
    };

    fetchMLRecommendation();
  }, [currentGlucose, carbs, carbRatio, correctionFactor, targetGlucose]);

  const handleFoodSelect = (foodLabel: string) => {
    const food = INDIAN_FOODS.find(f => f.label === foodLabel);
    if (food) {
        setSelectedFoods(prev => [...prev, { label: food.label, carbs: food.carbs }]);
    }
    setPopoverOpen(false);
  };

  const removeFood = (indexToRemove: number) => {
    setSelectedFoods(prev => prev.filter((_, index) => index !== indexToRemove));
  };

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
                foods: selectedFoods.map(f => f.label),
            }
        });
        toast({
            title: 'Dose Logged',
            description: `${recommendedDose} units have been logged successfully.`,
        });
        setSelectedFoods([]);
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
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dose Calculator</h1>
          <p className="text-muted-foreground">Calculate your insulin dose with AI predictions</p>
        </div>
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {predictionResult && predictionResult.alert && (
        <Alert variant={predictionResult.alert.type === 'warning' ? 'destructive' : 'default'} className="mb-6">
          {predictionResult.alert.type === 'warning' ? (
            <AlertTriangle className="h-4 w-4" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          <AlertTitle>{predictionResult.alert.message}</AlertTitle>
          {predictionResult.alert.details && (
            <AlertDescription>{predictionResult.alert.details}</AlertDescription>
          )}
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Current Blood Glucose Card */}
          <Card>
            <CardContent className="p-6">
              <div className='flex items-center gap-2 mb-4'>
                <Droplet className="h-5 w-5 text-primary" />
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
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between mb-4"
                    >
                        Add a food item...
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
                    <Command>
                    <CommandInput placeholder="Search food..." />
                    <CommandList>
                        <CommandEmpty>No food found.</CommandEmpty>
                        <CommandGroup>
                        {INDIAN_FOODS.map((food) => (
                            <CommandItem
                                key={food.value}
                                value={food.label}
                                onSelect={() => handleFoodSelect(food.label)}
                            >
                                {food.label} ({food.carbs}g)
                            </CommandItem>
                        ))}
                        </CommandGroup>
                    </CommandList>
                    </Command>
                </PopoverContent>
              </Popover>

              <div className='space-y-2'>
                <div className='flex justify-between items-center'>
                    <p className='text-muted-foreground'>Total Carbs:</p>
                    <p className='font-bold text-2xl'>{carbs}g</p>
                </div>
                {selectedFoods.length > 0 && (
                    <div className='flex flex-wrap gap-2 pt-2 border-t'>
                        {selectedFoods.map((food, index) => (
                            <Badge key={`${food.label}-${index}`} variant="secondary" className='flex items-center gap-1'>
                                {food.label} ({food.carbs}g)
                                <button onClick={() => removeFood(index)} className='ml-1 rounded-full hover:bg-muted-foreground/20'>
                                    <X className='h-3 w-3' />
                                </button>
                            </Badge>
                        ))}
                    </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ML Prediction Card */}
          {predictionResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                  AI Glucose Prediction (Next 3 Hours)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">1 Hour</p>
                    <p className="text-2xl font-bold">{predictionResult.predictions.one_hour.toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">mg/dL</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">2 Hours</p>
                    <p className="text-2xl font-bold">{predictionResult.predictions.two_hours.toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">mg/dL</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">3 Hours</p>
                    <p className="text-2xl font-bold">{predictionResult.predictions.three_hours.toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">mg/dL</p>
                  </div>
                </div>
                <div className="text-center pt-4 border-t">
                  <p className="text-sm text-muted-foreground">Peak Glucose</p>
                  <p className="text-3xl font-bold text-primary">{predictionResult.predictions.peak.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">mg/dL</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recommended Dose Card */}
        <Card className="bg-accent/40 lg:col-span-1">
          <CardContent className="p-6 flex flex-col h-full">
            <div className='flex items-center gap-2 mb-4'>
                <CalculatorIcon className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">
                  {calculating ? 'Calculating...' : 'Recommended Dose'}
                </h3>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              {calculating ? (
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
              ) : (
                <>
                  <span className="text-7xl font-bold text-primary">{recommendedDose}</span>
                  <span className="text-xl ml-2 text-muted-foreground">units</span>
                </>
              )}
            </div>
            {predictionResult && (
              <div className="space-y-2 text-sm border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current IOB</span>
                  <span className="font-medium">{predictionResult.current_iob.toFixed(2)} u</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Carb coverage</span>
                  <span className="font-medium">+{predictionResult.carb_coverage_dose.toFixed(1)} u</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Correction dose</span>
                  <span className="font-medium">+{predictionResult.correction_dose.toFixed(1)} u</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IOB adjustment</span>
                  <span className="font-medium">-{predictionResult.iob_adjustment.toFixed(1)} u</span>
                </div>
              </div>
            )}
            <Button 
              size="lg" 
              className="w-full mt-6" 
              onClick={handleLogDose} 
              disabled={isLogging || recommendedDose <= 0 || calculating}
            >
              {isLogging ? 'Logging...' : `Log ${recommendedDose} Units`}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
