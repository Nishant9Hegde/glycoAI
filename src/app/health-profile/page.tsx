'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, UploadCloud, Calendar as CalendarIcon } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import Loading from '../loading';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { INSULIN_TYPES } from '@/lib/insulin-brands';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import Image from 'next/image';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';


export type HealthProfileData = {
  age: string;
  weight: string;
  heightFt: string;
  heightIn: string;
  dateOfBirth: Date;
  dateOfDiagnosis: Date;
  insulinSelections: { type: string; brand: string }[];
  glucoseDataFile: File | null;
  glucoseDataImageUrl: string;
  targetRange: [number, number];
  totalDailyDose: string;
};

export default function HealthProfilePage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [loadingData, setLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<HealthProfileData>({
    age: '',
    weight: '',
    heightFt: '',
    heightIn: '',
    dateOfBirth: new Date(),
    dateOfDiagnosis: new Date(),
    insulinSelections: [],
    glucoseDataFile: null,
    glucoseDataImageUrl: '',
    targetRange: [80, 140],
    totalDailyDose: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);


  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (user && firestore) {
      setLoadingData(true);
      const patientDocRef = doc(firestore, `users/${user.uid}/patients/${user.uid}`);
      getDoc(patientDocRef).then(patientDoc => {
        if (patientDoc.exists()) {
          const data = patientDoc.data();
          const heightInches = data.height / 2.54;
          const feet = Math.floor(heightInches / 12);
          const inches = Math.round(heightInches % 12);
          
          setFormData({
            age: data.age?.toString() || '',
            weight: data.weight?.toString() || '',
            heightFt: feet.toString() || '',
            heightIn: inches.toString() || '',
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : new Date(),
            dateOfDiagnosis: data.dateOfDiagnosis ? new Date(data.dateOfDiagnosis) : new Date(),
            insulinSelections: data.insulinSelections || [],
            glucoseDataFile: null,
            glucoseDataImageUrl: data.glucoseDataImageUrl || '',
            targetRange: [data.targetGlucoseMin || 80, data.targetGlucoseMax || 140],
            totalDailyDose: data.totalDailyDose?.toString() || '',
          });
          if(data.glucoseDataImageUrl) {
            setImagePreview(data.glucoseDataImageUrl);
          }
        }
        setLoadingData(false);
      }).catch(err => {
        console.error("Error fetching patient data: ", err);
        setLoadingData(false);
      });
    }
  }, [user, userLoading, firestore, router]);


  const updateFormData = (data: Partial<HealthProfileData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      updateFormData({ glucoseDataFile: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleInsulinChange = (checked: boolean | 'indeterminate', type: string, brand: string) => {
    const newSelection = { type, brand };
    const currentSelections = formData.insulinSelections || [];

    let updatedSelections;

    if (checked) {
      updatedSelections = [...currentSelections, newSelection];
    } else {
      updatedSelections = currentSelections.filter(
        (selection) => !(selection.brand === brand && selection.type === type)
      );
    }
    updateFormData({ insulinSelections: updatedSelections });
  };
  
  const isSelected = (brand: string) => {
    return formData.insulinSelections.some((selection) => selection.brand === brand);
  };
  
  const openAccordionItems = formData.insulinSelections.map(s => s.type).filter((v, i, a) => a.indexOf(v) === i);


  const handleSave = async () => {
    if (!user || !firestore) return;

    setIsSaving(true);

    let glucoseDataImageUrl = formData.glucoseDataImageUrl;
    if (formData.glucoseDataFile) {
      console.log('Uploading file:', formData.glucoseDataFile.name);
      // In a real app, you would upload to Firebase storage and get the URL. This is a placeholder.
      glucoseDataImageUrl = 'https://placehold.co/600x400';
    }
    
    const heightInCm = (parseInt(formData.heightFt || '0') * 30.48) + (parseInt(formData.heightIn || '0') * 2.54);

    try {
      const patientRef = doc(firestore, `users/${user.uid}/patients/${user.uid}`);
      await setDoc(
        patientRef,
        {
          id: user.uid,
          name: user.displayName,
          email: user.email,
          profileComplete: true, // Mark as complete/updated
          age: parseInt(formData.age),
          weight: parseInt(formData.weight),
          height: heightInCm,
          dateOfBirth: formData.dateOfBirth.toISOString().split('T')[0],
          dateOfDiagnosis: formData.dateOfDiagnosis.toISOString().split('T')[0],
          insulinSelections: formData.insulinSelections,
          glucoseDataImageUrl,
          targetGlucoseMin: formData.targetRange[0],
          targetGlucoseMax: formData.targetRange[1],
          totalDailyDose: parseInt(formData.totalDailyDose),
        },
        { merge: true }
      );

      toast({
        title: 'Profile Saved!',
        description: 'Your health profile has been successfully updated.',
      });
      
      const isInitialSetup = !formData.age;
      if (isInitialSetup) {
          router.push('/');
      }

    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem saving your profile. Please try again.',
      });
    } finally {
        setIsSaving(false);
    }
  };

  if (userLoading || loadingData) {
    return <Loading />;
  }
  
  const isInitialSetup = !formData.age && !formData.weight;

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 bg-background p-4 md:p-8">
            <div className="w-full max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <SettingsIcon className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold tracking-wide">
                            {isInitialSetup ? 'Create Your Health Profile' : 'Health Profile & Settings'}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {isInitialSetup ? 'This will help us personalize your InsuTech experience.' : 'Manage your health data and preferences.'}
                        </p>
                    </div>
                </div>
                
                <div className="space-y-8">
                    {/* Health Profile Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Health Profile</CardTitle>
                            <CardDescription>This information helps us personalize your experience.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="age">Age</Label>
                                    <Input id="age" name="age" type="number" placeholder="e.g., 35" value={formData.age} onChange={(e) => updateFormData({ age: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="weight">Weight (kg)</Label>
                                    <Input id="weight" name="weight" type="number" placeholder="e.g., 70" value={formData.weight} onChange={(e) => updateFormData({ weight: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="heightFt">Height (ft)</Label>
                                    <Input id="heightFt" name="heightFt" type="number" placeholder="e.g., 5" value={formData.heightFt} onChange={(e) => updateFormData({ heightFt: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="heightIn">Height (in)</Label>
                                    <Input id="heightIn" name="heightIn" type="number" placeholder="e.g., 9" value={formData.heightIn} onChange={(e) => updateFormData({ heightIn: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !formData.dateOfBirth && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formData.dateOfBirth ? format(formData.dateOfBirth, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={formData.dateOfBirth}
                                            onSelect={(date) => updateFormData({ dateOfBirth: date || new Date() })}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dateOfDiagnosis">Date of Diagnosis</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !formData.dateOfDiagnosis && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formData.dateOfDiagnosis ? format(formData.dateOfDiagnosis, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={formData.dateOfDiagnosis}
                                            onSelect={(date) => updateFormData({ dateOfDiagnosis: date || new Date() })}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Insulin Details Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Insulin Details</CardTitle>
                            <CardDescription>Select the types and brands of insulin you use.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="space-y-2">
                                <Label htmlFor="totalDailyDose">Total Daily Dose (Units)</Label>
                                <Input id="totalDailyDose" name="totalDailyDose" type="number" placeholder="e.g., 40" value={formData.totalDailyDose} onChange={(e) => updateFormData({ totalDailyDose: e.target.value })} />
                            </div>
                            <Accordion type="multiple" className="w-full" defaultValue={openAccordionItems}>
                                {Object.entries(INSULIN_TYPES).map(([type, brands]) => (
                                <AccordionItem value={type} key={type}>
                                    <AccordionTrigger>{type}</AccordionTrigger>
                                    <AccordionContent>
                                    <div className="space-y-2">
                                        {brands.map((brand) => (
                                        <div key={brand} className="flex items-center space-x-2">
                                            <Checkbox
                                            id={brand}
                                            checked={isSelected(brand)}
                                            onCheckedChange={(checked) => handleInsulinChange(checked, type, brand)}
                                            />
                                            <Label htmlFor={brand} className="font-normal">
                                            {brand}
                                            </Label>
                                        </div>
                                        ))}
                                    </div>
                                    </AccordionContent>
                                </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>

                    {/* Glucose Data Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Upload Glucose Data</CardTitle>
                            <CardDescription>Upload an image (JPG or PNG) of your blood glucose data from the past week.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                             <div className="mt-2 flex justify-center rounded-lg border border-dashed px-6 py-10">
                                <div className="text-center">
                                    {imagePreview ? (
                                        <Image src={imagePreview} alt="Preview" width={200} height={200} className="mx-auto mb-4 rounded-md object-contain" />
                                    ) : (
                                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
                                    )}
                                    <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                                    <label
                                        htmlFor="glucose-upload"
                                        className="relative cursor-pointer rounded-md font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary/80"
                                    >
                                        <span>Upload a file</span>
                                        <Input id="glucose-upload" name="glucose-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/jpeg, image/png" />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs leading-5 text-gray-500">PNG, JPG up to 10MB</p>
                                    {formData.glucoseDataFile && <p className="text-sm mt-2 font-medium">Selected file: {formData.glucoseDataFile.name}</p>}
                                </div>
                                </div>
                        </CardContent>
                    </Card>
                    
                    {/* Target Range Card */}
                    <Card>
                         <CardHeader>
                            <CardTitle>Target Glucose Range</CardTitle>
                            <CardDescription>Set your desired blood glucose range (mg/dL).</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8">
                             <div className="flex justify-between items-center px-2">
                                <span className="text-lg font-bold text-primary">{formData.targetRange[0]}</span>
                                <span className="text-muted-foreground">to</span>
                                <span className="text-lg font-bold text-primary">{formData.targetRange[1]}</span>
                                <span className="text-muted-foreground">mg/dL</span>
                            </div>
                            <Slider
                                value={formData.targetRange}
                                min={50}
                                max={250}
                                step={5}
                                onValueChange={(value) => updateFormData({ targetRange: value as [number, number] })}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground px-2">
                                <span>50 mg/dL</span>
                                <span>250 mg/dL</span>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? 'Saving...' : isInitialSetup ? 'Finish & Go to Dashboard' : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            </div>
        </main>
      </div>
    </div>
  );
}
