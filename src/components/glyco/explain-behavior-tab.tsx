
'use client';

import React, { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUserData } from '@/context/user-data-context';
import { getBloodGlucoseExplanation } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AIResponse } from './ai-response';
import { type ExplainBloodGlucoseBehaviorOutput } from '@/ai/flows/explain-blood-glucose-behavior';

const ExplainBehaviorSchema = z.object({
  bloodGlucoseLevel: z.coerce.number().min(1, 'Please enter a valid blood glucose level.'),
  activity: z.string().min(1, 'Please describe your activity.'),
  insulinUnits: z.coerce.number().min(0, 'Please enter insulin units (0 if none).'),
  foodIntake: z.string().min(1, 'Please describe your food intake.'),
  otherFactors: z.string().optional(),
});

type ExplainBehaviorFormValues = z.infer<typeof ExplainBehaviorSchema>;

export function ExplainBehaviorTab() {
  const { userData } = useUserData();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [aiResponse, setAiResponse] = useState<ExplainBloodGlucoseBehaviorOutput | null>(null);

  const form = useForm<ExplainBehaviorFormValues>({
    resolver: zodResolver(ExplainBehaviorSchema),
    defaultValues: {
      bloodGlucoseLevel: 120,
      activity: '',
      insulinUnits: 0,
      foodIntake: '',
      otherFactors: '',
    },
  });

  const onSubmit = (values: ExplainBehaviorFormValues) => {
    if (!userData.age || !userData.weight || !userData.height) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please complete your biodata on the left before getting an explanation.',
      });
      return;
    }
    setAiResponse(null);
    startTransition(async () => {
      const result = await getBloodGlucoseExplanation(values);
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
            <CardTitle>Explain Unusual Behavior</CardTitle>
            <CardDescription>Get AI-powered explanations for unexpected blood glucose readings based on your recent activity and intake.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="bloodGlucoseLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blood Glucose (mg/dL)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 180" {...field} />
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
                    <FormLabel>Insulin Units Consumed</FormLabel>
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
                  <FormLabel>Activity Performed</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Intense 30-min run" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="foodIntake"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Food Intake</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., 1 apple and a protein bar before the run" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="otherFactors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Other Factors (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Feeling stressed, poor sleep" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending} className="bg-accent text-accent-foreground hover:bg-accent/90">
              Get Explanation
            </Button>
          </CardFooter>
        </form>
      </Form>
      {(isPending || aiResponse) && (
        <AIResponse
          isLoading={isPending}
          title="AI-Generated Explanation"
          description="Here's a breakdown of the potential factors."
        >
          {aiResponse && (
            <div className="space-y-4 text-sm">
                <div>
                    <h3 className="font-bold text-base text-primary">Explanation</h3>
                    <p className="text-foreground/90">{aiResponse.explanation}</p>
                </div>
                <div>
                    <h3 className="font-bold text-base text-primary">Reasons</h3>
                    <p className="text-foreground/90">{aiResponse.reasons}</p>
                </div>
                <div>
                    <h3 className="font-bold text-base text-primary">Suggestions</h3>
                    <p className="text-foreground/90">{aiResponse.suggestions}</p>
                </div>
            </div>
          )}
        </AIResponse>
      )}
    </Card>
  );
}
