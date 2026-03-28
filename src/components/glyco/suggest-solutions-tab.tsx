
'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getSolutionsForIssues } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AIResponse } from './ai-response';
import { type SuggestSolutionsForIssuesInput, type SuggestSolutionsForIssuesOutput } from '@/ai/flows/suggest-solutions-for-issues';
import { useTranslation } from '@/hooks/use-translation';
import { useLanguage } from '@/context/language-context';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Skeleton } from '../ui/skeleton';

const SolutionsSchema = z.object({
  issue: z.string().min(1, 'Please describe the issue you are facing.'),
});

type SolutionsFormValues = z.infer<typeof SolutionsSchema>;

function getLanguageName(code: string): string {
    switch (code) {
      case 'en': return 'English';
      case 'hi': return 'Hindi';
      default: return 'English';
    }
}

export function SuggestSolutionsTab() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [aiResponse, setAiResponse] = useState<SuggestSolutionsForIssuesOutput | null>(null);
  const { language } = useLanguage();
  const { user } = useUser();
  const firestore = useFirestore();
  const [patientData, setPatientData] = useState<any>(null);
  const [loadingPatientData, setLoadingPatientData] = useState(true);

  const form = useForm<SolutionsFormValues>({
    resolver: zodResolver(SolutionsSchema),
    defaultValues: {
      issue: '',
    },
  });

  const issue = form.watch('issue');

  const { translatedText: title } = useTranslation('Solutions for Common Issues');
  const { translatedText: description } = useTranslation('Describe a diabetes-related issue to get AI-powered solutions and explanations.');
  const { translatedText: issueLabel } = useTranslation('Describe your issue');
  const { translatedText: issuePlaceholder } = useTranslation("e.g., 'High blood sugar in the mornings'");
  const { translatedText: buttonText } = useTranslation('Find Solutions');
  const { translatedText: aiTitle } = useTranslation('AI-Suggested Solutions');
  const { translatedText: errorTitle } = useTranslation('Error');
  const { translatedText: explanationTitle } = useTranslation('Explanation');
  const { translatedText: solutionsTitle } = useTranslation('Solutions');
  const { translatedText: aiDescriptionPrefix } = useTranslation('For the issue:');
  const aiDescription = issue ? `${aiDescriptionPrefix} "${issue}"` : '';

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

  const onSubmit = (values: SolutionsFormValues) => {
    if (!patientData) {
        toast({
            variant: 'destructive',
            title: "Profile not loaded",
            description: "Please wait for your profile to load before getting solutions.",
        });
        return;
    }
    setAiResponse(null);
    startTransition(async () => {
      const dataForAI: SuggestSolutionsForIssuesInput = {
        height: patientData.height,
        weight: patientData.weight,
        age: patientData.age,
        insulinBrand: (patientData.insulinSelections || []).map((s: any) => s.brand).join(', '),
        ...values,
        targetLanguage: getLanguageName(language),
      };
      const result = await getSolutionsForIssues(dataForAI);
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
            <FormField
              control={form.control}
              name="issue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{issueLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder={issuePlaceholder} {...field} />
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
                    <h3 className="font-bold text-base text-primary">{solutionsTitle}</h3>
                    <ul className="list-disc space-y-2 pl-5 text-foreground/90">
                        {aiResponse.solutions.map((solution, index) => (
                            <li key={index}>{solution}</li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h3 className="font-bold text-base text-primary">{explanationTitle}</h3>
                    <p className="text-foreground/90">{aiResponse.explanation}</p>
                </div>
            </div>
          )}
        </AIResponse>
      )}
    </Card>
  );
}
