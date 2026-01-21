
'use client';

import React, { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUserData } from '@/context/user-data-context';
import { getSolutionsForIssues } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COMMON_ISSUES } from '@/lib/constants';
import { AIResponse } from './ai-response';
import { type SuggestSolutionsForIssuesOutput } from '@/ai/flows/suggest-solutions-for-issues';

const SolutionsSchema = z.object({
  issue: z.string().min(1, 'Please select an issue.'),
});

type SolutionsFormValues = z.infer<typeof SolutionsSchema>;

export function SuggestSolutionsTab() {
  const { userData } = useUserData();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [aiResponse, setAiResponse] = useState<SuggestSolutionsForIssuesOutput | null>(null);

  const form = useForm<SolutionsFormValues>({
    resolver: zodResolver(SolutionsSchema),
    defaultValues: {
      issue: '',
    },
  });

  const onSubmit = (values: SolutionsFormValues) => {
    if (!userData.age || !userData.weight || !userData.height || !userData.insulinBrand) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please complete your biodata on the left before getting solutions.',
      });
      return;
    }
    setAiResponse(null);
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
            <CardTitle>Solutions for Common Issues</CardTitle>
            <CardDescription>Select a common diabetes-related issue to get AI-powered solutions and explanations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="issue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Common Issue</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an issue you are facing" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COMMON_ISSUES.map(issue => (
                        <SelectItem key={issue} value={issue}>{issue}</SelectItem>
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
              Find Solutions
            </Button>
          </CardFooter>
        </form>
      </Form>
      {(isPending || aiResponse) && (
        <AIResponse
          isLoading={isPending}
          title="AI-Suggested Solutions"
          description={`For the issue: ${form.getValues('issue')}`}
        >
          {aiResponse && (
            <div className="space-y-4 text-sm">
                <div>
                    <h3 className="font-bold text-base text-primary">Solutions</h3>
                    <ul className="list-disc space-y-2 pl-5 text-foreground/90">
                        {aiResponse.solutions.map((solution, index) => (
                            <li key={index}>{solution}</li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h3 className="font-bold text-base text-primary">Explanation</h3>
                    <p className="text-foreground/90">{aiResponse.explanation}</p>
                </div>
            </div>
          )}
        </AIResponse>
      )}
    </Card>
  );
}
