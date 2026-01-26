'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StepIndicator } from '@/components/health-profile/step-indicator';
import { Step1 } from '@/components/health-profile/step-1';
import { Step2 } from '@/components/health-profile/step-2';
import { Step3 } from '@/components/health-profile/step-3';
import { Step4 } from '@/components/health-profile/step-4';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Droplets } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import Loading from '../loading';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export type HealthProfileData = {
  age: string;
  weight: string;
  heightFt: string;
  heightIn: string;
  dateOfBirth: Date;
  dateOfDiagnosis: Date;
  insulinSelections: { type: string; brand: string }[];
  glucoseDataFile: File | null;
  targetRange: [number, number];
};

export default function HealthProfilePage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<HealthProfileData>({
    age: '',
    weight: '',
    heightFt: '',
    heightIn: '',
    dateOfBirth: new Date(),
    dateOfDiagnosis: new Date(),
    insulinSelections: [],
    glucoseDataFile: null,
    targetRange: [80, 140],
  });

  useEffect(() => {
    if (loading) {
      return; // Wait for the auth state to be determined
    }
    if (!user) {
      router.push('/login'); // Not logged in, redirect
      return;
    }
    if (firestore) {
      // Logged in, check if profile is already complete
      const checkProfile = async () => {
        const patientDocRef = doc(firestore, `users/${user.uid}/patients/${user.uid}`);
        const patientDoc = await getDoc(patientDocRef);
        if (patientDoc.exists() && patientDoc.data()?.profileComplete) {
          router.push('/'); // If complete, go to dashboard
        }
      };
      checkProfile();
    }
  }, [user, loading, firestore, router]);

  const nextStep = () => setCurrentStep(prev => (prev < 4 ? prev + 1 : prev));
  const prevStep = () => setCurrentStep(prev => (prev > 1 ? prev - 1 : prev));

  const updateFormData = (data: Partial<HealthProfileData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleFinish = async () => {
    if (!user || !firestore) return;

    // This is a placeholder for file upload logic.
    // In a real app, you'd upload the file to Firebase Storage
    // and get a URL. For now, we'll use a placeholder.
    let glucoseDataImageUrl = '';
    if (formData.glucoseDataFile) {
      console.log('Uploading file:', formData.glucoseDataFile.name);
      glucoseDataImageUrl = 'https://placehold.co/600x400';
    }
    
    const heightInCm = (parseInt(formData.heightFt) * 30.48) + (parseInt(formData.heightIn) * 2.54);

    try {
      const patientRef = doc(firestore, `users/${user.uid}/patients/${user.uid}`);
      await setDoc(
        patientRef,
        {
          id: user.uid,
          name: user.displayName,
          email: user.email,
          profileComplete: true,
          age: parseInt(formData.age),
          weight: parseInt(formData.weight),
          height: heightInCm,
          dateOfBirth: formData.dateOfBirth.toISOString().split('T')[0],
          dateOfDiagnosis: formData.dateOfDiagnosis.toISOString().split('T')[0],
          insulinSelections: formData.insulinSelections,
          glucoseDataImageUrl,
          targetGlucoseMin: formData.targetRange[0],
          targetGlucoseMax: formData.targetRange[1],
        },
        { merge: true }
      );

      toast({
        title: 'Profile Saved!',
        description: 'Your health profile has been successfully saved.',
      });
      router.push('/');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem saving your profile. Please try again.',
      });
    }
  };

  if (loading || !user) {
    return <Loading />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6">
      <div className="w-full max-w-3xl">
        <div className="flex flex-col items-center mb-6 text-center">
            <Droplets className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-wide mt-2">Create Your Health Profile</h1>
            <p className="text-muted-foreground mt-1">This will help us personalize your InsuTech experience.</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <StepIndicator currentStep={currentStep} />
            <div className="mt-8">
              {currentStep === 1 && <Step1 formData={formData} updateFormData={updateFormData} />}
              {currentStep === 2 && <Step2 formData={formData} updateFormData={updateFormData} />}
              {currentStep === 3 && <Step3 formData={formData} updateFormData={updateFormData} />}
              {currentStep === 4 && <Step4 formData={formData} updateFormData={updateFormData} />}
            </div>
          </CardContent>
        </Card>
        <div className="mt-6 flex justify-between">
          {currentStep > 1 ? (
            <Button variant="outline" onClick={prevStep}>
              Back
            </Button>
          ) : <div />}
          {currentStep < 4 ? (
            <Button onClick={nextStep}>Next</Button>
          ) : (
            <Button onClick={handleFinish}>Finish & Go to Dashboard</Button>
          )}
        </div>
      </div>
    </div>
  );
}
