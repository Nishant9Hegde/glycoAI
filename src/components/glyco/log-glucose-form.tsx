'use client';

import { useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUser, useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Droplet } from 'lucide-react';
import { MEAL_CONTEXT } from '@/lib/constants';
import { useTranslation } from '@/hooks/use-translation';

// Schema for form validation
const LogGlucoseSchema = z.object({
  glucoseLevel: z.coerce.number().min(1, 'Glucose level is required.'),
  mealContext: z.string().min(1, 'Meal context is required.'),
  mealTiming: z.string().min(1, 'Time is required.'),
});

type LogGlucoseFormValues = z.infer<typeof LogGlucoseSchema>;

const TranslatedSelectItem = ({ item }: { item: string }) => {
    const { translatedText } = useTranslation(item);
    return <SelectItem value={item}>{translatedText}</SelectItem>;
}

export function LogGlucoseForm() {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<LogGlucoseFormValues>({
    resolver: zodResolver(LogGlucoseSchema),
    defaultValues: {
      glucoseLevel: 120,
      mealContext: 'Other',
      mealTiming: ''
    },
  });
  
  useEffect(() => {
    // Set the current time as the default value for the time input.
    // This runs only on the client, after hydration, to avoid mismatches.
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    form.setValue('mealTiming', currentTime);
  }, [form]);


  const onSubmit = (values: LogGlucoseFormValues) => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to log a reading.',
      });
      return;
    }

    startTransition(async () => {
      try {
        const logCollectionRef = collection(firestore, `users/${user.uid}/patients/${user.uid}/glucoseLogs`);
        await addDoc(logCollectionRef, {
          patientId: user.uid,
          glucoseLevel: values.glucoseLevel,
          mealContext: values.mealContext,
          mealTiming: values.mealTiming,
          timestamp: serverTimestamp(),
        });

        toast({
          title: 'Success!',
          description: 'Your glucose reading has been logged.',
        });
        router.push('/');
      } catch (error: any) {
        console.error('Error logging glucose:', error);
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: error.message || 'There was a problem logging your reading.',
        });
      }
    });
  };

  const { translatedText: logGlucoseTitle } = useTranslation('Log Glucose');
  const { translatedText: recordReadingDesc } = useTranslation('Record your blood glucose reading');
  const { translatedText: backButton } = useTranslation('Back');
  const { translatedText: glucoseLevelLabel } = useTranslation('Blood Glucose Level');
  const { translatedText: mealContextLabel } = useTranslation('Meal Context');
  const { translatedText: timeLabel } = useTranslation('Time');
  const { translatedText: logReadingButton } = useTranslation('Log Reading');
  const { translatedText: selectMealContextPlaceholder } = useTranslation('Select meal context');

  return (
    <div className="w-full max-w-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
            <h1 className="text-3xl font-bold">{logGlucoseTitle}</h1>
            <p className="text-muted-foreground">{recordReadingDesc}</p>
        </div>
        <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backButton}
        </Button>
      </div>
      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="glucoseLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex items-center gap-2'>
                        <Droplet className="h-4 w-4 text-primary" />
                        {glucoseLevelLabel}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type="number" placeholder="120" {...field} className="pr-12 text-lg"/>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
                          mg/dL
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mealTiming"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{timeLabel}</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mealContext"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{mealContextLabel}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={selectMealContextPlaceholder} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MEAL_CONTEXT.map(context => (
                          <TranslatedSelectItem key={context} item={context} />
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isPending} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                {isPending ? 'Logging...' : logReadingButton}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
