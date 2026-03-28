
'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getGlucosePrediction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AIResponse } from './ai-response';
import { type PredictGlucoseLevelOutput } from '@/ai/flows/predict-glucose-level';
import { useTranslation } from '@/hooks/use-translation';
import { useLanguage } from '@/context/language-context';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { INDIAN_FOODS } from '@/lib/constants';
import { Progress } from '../ui/progress';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Skeleton } from '../ui/skeleton';

const PredictGlucoseSchema = z.object({
  currentGlucoseLevel: z.coerce.number().min(1, 'Please enter a valid blood glucose level.'),
  insulinUnits: z.coerce.number().min(0, 'Please enter insulin units (0 if none).'),
  foodIntake: z.string().min(1, 'Please describe your food intake.'),
  activity: z.string().min(1, 'Please describe your activity.'),
  timeSinceLastMeal: z.coerce.number().min(0, 'Please enter time since last meal.'),
});

type PredictGlucoseFormValues = z.infer<typeof PredictGlucoseSchema>;

function getLanguageName(code: string): string {
    switch (code) {
      case 'en': return 'English';
      case 'hi': return 'Hindi';
      default: return 'English';
    }
}

const FoodCommandItem = ({ food, currentFieldValue, onValueChange }: { food: { value: string, label: string }, currentFieldValue: string, onValueChange: (value: string) => void }) => {
    const { translatedText } = useTranslation(food.label);
    return (
        <CommandItem
            key={food.value}
            value={food.label}
            onSelect={(currentValue) => {
                onValueChange(currentValue === currentFieldValue ? "" : currentValue);
            }}
        >
            <Check
                className={cn(
                    "mr-2 h-4 w-4",
                    currentFieldValue === food.label ? "opacity-100" : "opacity-0"
                )}
            />
            {translatedText}
        </CommandItem>
    );
};

const DisplaySelectedFood = ({ value }: { value: string }) => {
    const { translatedText } = useTranslation(INDIAN_FOODS.find(
        (food) => food.label.toLowerCase() === value.toLowerCase()
    )?.label);
    return <>{translatedText || value}</>;
}


export function PredictGlucoseTab() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [aiResponse, setAiResponse] = useState<PredictGlucoseLevelOutput | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  
  const { language } = useLanguage();
  const { user } = useUser();
  const firestore = useFirestore();
  const [patientData, setPatientData] = useState<any>(null);
  const [loadingPatientData, setLoadingPatientData] = useState(true);

  const { translatedText: title } = useTranslation('AI Glucose Prediction');
  const { translatedText: description } = useTranslation('Predict your future blood glucose levels based on your current data.');
  const { translatedText: currentGlucoseLabel } = useTranslation('Current Glucose (mg/dL)');
  const { translatedText: insulinLabel } = useTranslation('Insulin Units Consumed');
  const { translatedText: activityLabel } = useTranslation('Activity Performed');
  const { translatedText: foodLabel } = useTranslation('Food Intake');
  const { translatedText: timeSinceMealLabel } = useTranslation('Time Since Last Meal (hours)');
  const { translatedText: buttonText } = useTranslation('Predict Glucose');
  const { translatedText: aiTitle } = useTranslation('AI-Generated Prediction');
  const { translatedText: aiDescription } = useTranslation('Here is your predicted glucose level for the next 2 hours.');
  const { translatedText: errorTitle } = useTranslation('Error');
  const { translatedText: predictedLevelTitle } = useTranslation('Predicted Glucose Level');
  const { translatedText: reasoningTitle } = useTranslation('Reasoning');
  const { translatedText: confidenceTitle } = useTranslation('Confidence Score');
  const { translatedText: selectFoodPlaceholder } = useTranslation('Select food...');
  const { translatedText: nothingFoundText } = useTranslation('Nothing found.');
  const { translatedText: searchFoodPlaceholder } = useTranslation('Search food...');


  useEffect(() => {
    if (user && firestore) {
      const fetchPatientData = async () => {
        setLoadingPatientData(true);
        const patientDocRef = doc(firestore, `users/${user.uid}/patients/${user.uid}`);
        const patientDoc = await getDoc(patientDocRef);
        if (patientDoc.exists()) {
          setPatientData(patientDoc.data());
        }
        setLoadingPatientData(false);
      };
      fetchPatientData();
    }
  }, [user, firestore]);

  const form = useForm<PredictGlucoseFormValues>({
    resolver: zodResolver(PredictGlucoseSchema),
    defaultValues: {
      currentGlucoseLevel: 120,
      insulinUnits: 0,
      foodIntake: '',
      activity: '',
      timeSinceLastMeal: 0,
    },
  });

  const onSubmit = (values: PredictGlucoseFormValues) => {
    if (!patientData) {
        toast({
            variant: 'destructive',
            title: "Profile not loaded",
            description: "Please wait for your profile to load before getting a prediction.",
        });
        return;
    }
    setAiResponse(null);
    startTransition(async () => {
      const result = await getGlucosePrediction({
        ...values,
        height: patientData.height,
        weight: patientData.weight,
        age: patientData.age,
        targetLanguage: getLanguageName(language),
      });
      if (result.success) {
        setAiResponse(result.data);
      } else {
        toast({
          variant: 'destructive',
          title: errorTitle,
          description: result.error,
        });
      }
    });
  };

  if (loadingPatientData) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-24" />
            </CardFooter>
        </Card>
    )
}

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="currentGlucoseLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{currentGlucoseLabel}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 120" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="insulinUnits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{insulinLabel}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="activity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{activityLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Light walk for 15 mins" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="foodIntake"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{foodLabel}</FormLabel>
                  <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? <DisplaySelectedFood value={field.value} /> : selectFoodPlaceholder}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
                      <Command>
                        <CommandInput placeholder={searchFoodPlaceholder} />
                        <CommandList>
                            <CommandEmpty>{nothingFoundText}</CommandEmpty>
                            <CommandGroup>
                            {INDIAN_FOODS.map((food) => (
                                <FoodCommandItem 
                                    key={food.value}
                                    food={food}
                                    currentFieldValue={field.value}
                                    onValueChange={(value) => {
                                        field.onChange(INDIAN_FOODS.find(f => f.label === value)?.value || value);
                                        setPopoverOpen(false);
                                    }}
                                />
                            ))}
                            </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="timeSinceLastMeal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{timeSinceMealLabel}</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 2.5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {buttonText}
            </Button>
          </CardFooter>
        </form>
      </Form>
      {(isPending || aiResponse) && (
        <AIResponse
          isLoading={isPending && !aiResponse}
          title={aiTitle}
          description={aiDescription}
        >
          {aiResponse && (
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-bold text-base text-primary">{predictedLevelTitle}</h3>
                <p className="text-3xl font-bold text-foreground/90">{aiResponse.predictedGlucoseLevel} <span className="text-lg font-medium text-muted-foreground">mg/dL</span></p>
              </div>
              <div>
                <h3 className="font-bold text-base text-primary">{reasoningTitle}</h3>
                <p className="text-foreground/90">{aiResponse.predictionReasoning}</p>
              </div>
              <div>
                <h3 className="font-bold text-base text-primary">{confidenceTitle}</h3>
                <div className='flex items-center gap-2'>
                    <Progress value={aiResponse.confidenceScore * 100} className="w-1/2" />
                    <span className="font-semibold text-foreground/90">{(aiResponse.confidenceScore * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          )}
        </AIResponse>
      )}
    </Card>
  );
}
