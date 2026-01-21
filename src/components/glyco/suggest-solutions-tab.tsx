'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUserData } from '@/context/user-data-context';
import { getSolutionsForIssues, getTranslation } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COMMON_ISSUES } from '@/lib/constants';
import { AIResponse } from './ai-response';
import { type SuggestSolutionsForIssuesOutput } from '@/ai/flows/suggest-solutions-for-issues';
import { useTranslation } from '@/hooks/use-translation';
import { useLanguage } from '@/context/language-context';

const SolutionsSchema = z.object({
  issue: z.string().min(1, 'Please select an issue.'),
});

type SolutionsFormValues = z.infer<typeof SolutionsSchema>;

const TranslatedSelectItem = ({ item }: { item: string }) => {
  const { translatedText } = useTranslation(item);
  return <SelectItem value={item}>{translatedText}</SelectItem>;
}

function getLanguageName(code: string): string {
    switch (code) {
      case 'en': return 'English';
      case 'hi': return 'Hindi';
      case 'kn': return 'Kannada';
      default: return 'English';
    }
}

export function SuggestSolutionsTab() {
  const { userData } = useUserData();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [aiResponse, setAiResponse] = useState<SuggestSolutionsForIssuesOutput | null>(null);
  const [translatedResponse, setTranslatedResponse] = useState<(SuggestSolutionsForIssuesOutput & { solutions: string[] }) | null>(null);

  const { language } = useLanguage();

  const form = useForm<SolutionsFormValues>({
    resolver: zodResolver(SolutionsSchema),
    defaultValues: {
      issue: '',
    },
  });

  const issue = form.watch('issue');

  const { translatedText: title } = useTranslation('Solutions for Common Issues');
  const { translatedText: description } = useTranslation('Select a common diabetes-related issue to get AI-powered solutions and explanations.');
  const { translatedText: issueLabel } = useTranslation('Common Issue');
  const { translatedText: issuePlaceholder } = useTranslation('Select an issue you are facing');
  const { translatedText: buttonText } = useTranslation('Find Solutions');
  const { translatedText: aiTitle } = useTranslation('AI-Suggested Solutions');
  const { translatedText: missingInfoTitle } = useTranslation('Missing Information');
  const { translatedText: missingInfoDesc } = useTranslation('Please complete your biodata on the left before getting solutions.');
  const { translatedText: errorTitle } = useTranslation('Error');
  const { translatedText: explanationTitle } = useTranslation('Explanation');
  const { translatedText: solutionsTitle } = useTranslation('Solutions');
  const { translatedText: translatedIssue } = useTranslation(issue);
  const { translatedText: aiDescriptionPrefix } = useTranslation('For the issue:');
  const aiDescription = issue ? `${aiDescriptionPrefix} ${translatedIssue}` : '';


  const onSubmit = (values: SolutionsFormValues) => {
    if (!userData.age || !userData.weight || !userData.height || !userData.insulinBrand) {
      toast({
        variant: 'destructive',
        title: missingInfoTitle,
        description: missingInfoDesc,
      });
      return;
    }
    setAiResponse(null);
    setTranslatedResponse(null);
    startTransition(async () => {
      const dataForAI = {
        ...userData,
        ...values,
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

  useEffect(() => {
    if (!aiResponse) {
      setTranslatedResponse(null);
      return;
    }
    if (language === 'en') {
      setTranslatedResponse(aiResponse);
      return;
    }

    const translateResponse = async () => {
      startTransition(async () => {
        const textsToTranslate = [aiResponse.explanation, ...aiResponse.solutions];
        const langName = getLanguageName(language);
        const result = await getTranslation({ texts: textsToTranslate, targetLanguage: langName });

        if (result.success) {
          const [translatedExplanation, ...translatedSolutions] = result.data.translatedTexts;
          setTranslatedResponse({
            explanation: translatedExplanation,
            solutions: translatedSolutions,
          });
        } else {
          setTranslatedResponse(aiResponse);
        }
      });
    };

    translateResponse();
  }, [aiResponse, language]);


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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={issuePlaceholder} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COMMON_ISSUES.map(issue => (
                        <TranslatedSelectItem key={issue} item={issue} />
                      ))}
                    </SelectContent>
                  </Select>
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
      {(isPending || translatedResponse) && (
        <AIResponse
          isLoading={isPending && !translatedResponse}
          title={aiTitle}
          description={aiDescription}
        >
          {translatedResponse && (
            <div className="space-y-4 text-sm">
                <div>
                    <h3 className="font-bold text-base text-primary">{solutionsTitle}</h3>
                    <ul className="list-disc space-y-2 pl-5 text-foreground/90">
                        {translatedResponse.solutions.map((solution, index) => (
                            <li key={index}>{solution}</li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h3 className="font-bold text-base text-primary">{explanationTitle}</h3>
                    <p className="text-foreground/90">{translatedResponse.explanation}</p>
                </div>
            </div>
          )}
        </AIResponse>
      )}
    </Card>
  );
}
