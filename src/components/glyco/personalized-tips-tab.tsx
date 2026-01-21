
'use client';

import React, { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUserData } from '@/context/user-data-context';
import { getPersonalizedTips } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ACTIVITY_LEVELS, DIETARY_HABITS } from '@/lib/constants';
import { AIResponse } from './ai-response';
import { type PersonalizedTipsOutput } from '@/ai/flows/provide-personalized-tips';

const TipsSchema = z.object({
  unitsConsumed: z.coerce.number().min(0, 'Please enter units consumed.'),
  recentGlucoseLevels: z.string().refine(val => val.split(',').every(v => !isNaN(parseInt(v, 10))), {
    message: 'Please enter a comma-separated list of numbers.',
  }),
  activityLevels: z.string().min(1, 'Please select an activity level.'),
  dietaryHabits: z.string().min(1, 'Please select a dietary habit.'),
});

type TipsFormValues = z.infer<typeof TipsSchema>;

export function PersonalizedTipsTab() {
  const { userData } = useUserData();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [aiResponse, setAiResponse] = useState<PersonalizedTipsOutput | null>(null);

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
        title: 'Missing Information',
        description: 'Please complete your biodata on the left before getting tips.',
      });
      return;
    }
    setAiResponse(null);
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
          title: 'Error',
          description: result.error,
        });
      }
    });
  };

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Personalized Tips & Suggestions</CardTitle>
            <CardDescription>Provide your recent data to receive AI-generated tips for naturally maintaining your blood glucose levels.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <FormField
              control={form.control}
              name="unitsConsumed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Insulin Units (Last 24h)</FormLabel>
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
                  <FormLabel>Recent Glucose Levels (mg/dL)</FormLabel>
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
                    <FormLabel>Activity Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select activity level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ACTIVITY_LEVELS.map(level => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
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
                    <FormLabel>Dietary Habits</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select dietary habit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DIETARY_HABITS.map(habit => (
                          <SelectItem key={habit} value={habit}>{habit}</SelectItem>
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
              Generate Tips
            </Button>
          </CardFooter>
        </form>
      </Form>
      {(isPending || aiResponse) && (
        <AIResponse
          isLoading={isPending}
          title="Your Personalized Health Tips"
          description="Here are some suggestions based on your data."
        >
          {aiResponse && (
            <ul className="list-disc space-y-2 pl-5 text-sm text-foreground/90">
              {aiResponse.tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          )}
        </AIResponse>
      )}
    </Card>
  );
}
