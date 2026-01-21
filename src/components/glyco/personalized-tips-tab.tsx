'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUserData } from '@/context/user-data-context';
import { getPersonalizedTips, getTranslation } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ACTIVITY_LEVELS, DIETARY_HABITS } from '@/lib/constants';
import { AIResponse } from './ai-response';
import { type PersonalizedTipsOutput } from '@/ai/flows/provide-personalized-tips';
import { useTranslation } from '@/hooks/use-translation';
import { useLanguage } from '@/context/language-context';

const TipsSchema = z.object({
  unitsConsumed: z.coerce.number().min(0, 'Please enter units consumed.'),
  recentGlucoseLevels: z.string().refine(val => val.split(',').every(v => !isNaN(parseInt(v, 10))), {
    message: 'Please enter a comma-separated list of numbers.',
  }),
  activityLevels: z.string().min(1, 'Please select an activity level.'),
  dietaryHabits: z.string().min(1, 'Please select a dietary habit.'),
});

type TipsFormValues = z.infer<typeof TipsSchema>;

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

export function PersonalizedTipsTab() {
  const { userData } = useUserData();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [aiResponse, setAiResponse] = useState<PersonalizedTipsOutput | null>(null);
  const [translatedTips, setTranslatedTips] = useState<string[] | null>(null);

  const { language } = useLanguage();

  const { translatedText: title } = useTranslation('Personalized Tips & Suggestions');
  const { translatedText: description } = useTranslation('Provide your recent data to receive AI-generated tips for naturally maintaining your blood glucose levels.');
  const { translatedText: unitsLabel } = useTranslation('Total Insulin Units (Last 24h)');
  const { translatedText: glucoseLabel } = useTranslation('Recent Glucose Levels (mg/dL)');
  const { translatedText: activityLabel } = useTranslation('Activity Level');
  const { translatedText: dietLabel } = useTranslation('Dietary Habits');
  const { translatedText: activityPlaceholder } = useTranslation('Select activity level');
  const { translatedText: dietPlaceholder } = useTranslation('Select dietary habit');
  const { translatedText: buttonText } = useTranslation('Generate Tips');
  const { translatedText: aiTitle } = useTranslation('Your Personalized Health Tips');
  const { translatedText: aiDescription } = useTranslation('Here are some suggestions based on your data.');
  const { translatedText: missingInfoTitle } = useTranslation('Missing Information');
  const { translatedText: missingInfoDesc } = useTranslation('Please complete your biodata on the left before getting tips.');
  const { translatedText: errorTitle } = useTranslation('Error');

  const form = useForm<TipsFormValues>({
    resolver: zodResolver(TipsSchema),
    defaultValues: {
      unitsConsumed: 0,
      recentGlucoseLevels: '',
      activityLevels: '',
      dietaryHabits: '',
    },
  });

  const onSubmit = (values: TipsFormValues) => {
    if (!userData.age || !userData.weight || !userData.height || !userData.insulinBrand) {
      toast({
        variant: 'destructive',
        title: missingInfoTitle,
        description: missingInfoDesc,
      });
      return;
    }
    setAiResponse(null);
    setTranslatedTips(null);
    startTransition(async () => {
      const dataForAI = {
        ...userData,
        ...values,
        recentGlucoseLevels: values.recentGlucoseLevels.split(',').map(v => parseInt(v.trim(), 10)),
      };
      const result = await getPersonalizedTips(dataForAI);
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
      setTranslatedTips(null);
      return;
    }
    if (language === 'en') {
      setTranslatedTips(aiResponse.tips);
      return;
    }

    const translateResponse = async () => {
      startTransition(async () => {
        const langName = getLanguageName(language);
        const chunkSize = 10;
        let allTranslatedTexts: string[] = [];

        for (let i = 0; i < aiResponse.tips.length; i += chunkSize) {
            const chunk = aiResponse.tips.slice(i, i + chunkSize);
            const result = await getTranslation({ texts: chunk, targetLanguage: langName });
            if (result.success && result.data.translatedTexts.length === chunk.length) {
                allTranslatedTexts.push(...result.data.translatedTexts);
            } else {
                console.error('Failed to translate tips chunk', result.error);
                allTranslatedTexts.push(...chunk);
            }
            if (aiResponse.tips.length > chunkSize) {
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }
        setTranslatedTips(allTranslatedTexts);
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
              name="unitsConsumed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{unitsLabel}</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 25" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="recentGlucoseLevels"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{glucoseLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 110, 145, 95" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="activityLevels"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{activityLabel}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={activityPlaceholder} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ACTIVITY_LEVELS.map(level => (
                          <TranslatedSelectItem key={level} item={level} />
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dietaryHabits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dietLabel}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={dietPlaceholder} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DIETARY_HABITS.map(habit => (
                          <TranslatedSelectItem key={habit} item={habit} />
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {buttonText}
            </Button>
          </CardFooter>
        </form>
      </Form>
      {(isPending || translatedTips) && (
        <AIResponse
          isLoading={isPending && !translatedTips}
          title={aiTitle}
          description={aiDescription}
        >
          {translatedTips && (
            <ul className="list-disc space-y-2 pl-5 text-sm text-foreground/90">
              {translatedTips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          )}
        </AIResponse>
      )}
    </Card>
  );
}
