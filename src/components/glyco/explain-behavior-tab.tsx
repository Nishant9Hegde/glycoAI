
'use client';

import React, { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getBloodGlucoseExplanation } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AIResponse } from './ai-response';
import { type ExplainBloodGlucoseBehaviorOutput } from '@/ai/flows/explain-blood-glucose-behavior';
import { useTranslation } from '@/hooks/use-translation';
import { useLanguage } from '@/context/language-context';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { INDIAN_FOODS } from '@/lib/constants';

const ExplainBehaviorSchema = z.object({
  bloodGlucoseLevel: z.coerce.number().min(1, 'Please enter a valid blood glucose level.'),
  activity: z.string().min(1, 'Please describe your activity.'),
  insulinUnits: z.coerce.number().min(0, 'Please enter insulin units (0 if none).'),
  foodIntake: z.string().min(1, 'Please describe your food intake.'),
  otherFactors: z.string().optional(),
});

type ExplainBehaviorFormValues = z.infer<typeof ExplainBehaviorSchema>;

function getLanguageName(code: string): string {
    switch (code) {
      case 'en': return 'English';
      case 'fr': return 'French';
      case 'es': return 'Spanish';
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


export function ExplainBehaviorTab() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [aiResponse, setAiResponse] = useState<ExplainBloodGlucoseBehaviorOutput | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  
  const { language } = useLanguage();

  const { translatedText: title } = useTranslation('Explain Unusual Behavior');
  const { translatedText: description } = useTranslation('Get AI-powered explanations for unexpected blood glucose readings based on your recent activity and intake.');
  const { translatedText: glucoseLabel } = useTranslation('Blood Glucose (mg/dL)');
  const { translatedText: insulinLabel } = useTranslation('Insulin Units Consumed');
  const { translatedText: activityLabel } = useTranslation('Activity Performed');
  const { translatedText: foodLabel } = useTranslation('Food Intake');
  const { translatedText: otherFactorsLabel } = useTranslation('Other Factors (Optional)');
  const { translatedText: buttonText } = useTranslation('Get Explanation');
  const { translatedText: aiTitle } = useTranslation('AI-Generated Explanation');
  const { translatedText: aiDescription } = useTranslation('Here\'s a breakdown of the potential factors.');
  const { translatedText: errorTitle } = useTranslation('Error');
  const { translatedText: explanationTitle } = useTranslation('Explanation');
  const { translatedText: reasonsTitle } = useTranslation('Reasons');
  const { translatedText: suggestionsTitle } = useTranslation('Suggestions');
  const { translatedText: selectFoodPlaceholder } = useTranslation('Select food...');
  const { translatedText: nothingFoundText } = useTranslation('Nothing found.');
  const { translatedText: searchFoodPlaceholder } = useTranslation('Search food...');


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
    setAiResponse(null);
    startTransition(async () => {
      const result = await getBloodGlucoseExplanation({
        ...values,
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
                name="bloodGlucoseLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{glucoseLabel}</FormLabel>
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
              name="otherFactors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{otherFactorsLabel}</FormLabel>
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
                <h3 className="font-bold text-base text-primary">{explanationTitle}</h3>
                <p className="text-foreground/90">{aiResponse.explanation}</p>
              </div>
              <div>
                <h3 className="font-bold text-base text-primary">{reasonsTitle}</h3>
                <p className="text-foreground/90">{aiResponse.reasons}</p>
              </div>
              <div>
                <h3 className="font-bold text-base text-primary">{suggestionsTitle}</h3>
                <p className="text-foreground/90">{aiResponse.suggestions}</p>
              </div>
            </div>
          )}
        </AIResponse>
      )}
    </Card>
  );
}
