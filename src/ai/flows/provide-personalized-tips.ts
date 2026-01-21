'use server';

/**
 * @fileOverview A flow to provide personalized tips and suggestions for maintaining blood glucose levels naturally.
 *
 * - providePersonalizedTips - A function that provides personalized tips and suggestions.
 * - PersonalizedTipsInput - The input type for the providePersonalizedTips function.
 * - PersonalizedTipsOutput - The return type for the providePersonalizedTips function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedTipsInputSchema = z.object({
  height: z.number().describe('The height of the patient in cm.'),
  weight: z.number().describe('The weight of the patient in kg.'),
  age: z.number().describe('The age of the patient in years.'),
  insulinBrand: z.string().describe('The brand of insulin the patient takes.'),
  unitsConsumed: z.number().describe('The amount of insulin units consumed by the patient.'),
  recentGlucoseLevels: z.array(z.number()).describe('An array of recent blood glucose levels of the patient.'),
  activityLevels: z.string().describe('The activity levels of the patient (e.g., sedentary, moderate, active).'),
  dietaryHabits: z.string().describe('The dietary habits of the patient (e.g., low carb, high protein).'),
  targetLanguage: z
    .string()
    .describe(
      'The target language for the response (e.g., "Hindi", "English").'
    ),
});
export type PersonalizedTipsInput = z.infer<typeof PersonalizedTipsInputSchema>;

const PersonalizedTipsOutputSchema = z.object({
  tips: z.array(z.string()).describe('An array of personalized tips and suggestions for maintaining blood glucose levels naturally.'),
});
export type PersonalizedTipsOutput = z.infer<typeof PersonalizedTipsOutputSchema>;

export async function providePersonalizedTips(input: PersonalizedTipsInput): Promise<PersonalizedTipsOutput> {
  return providePersonalizedTipsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedTipsPrompt',
  input: {schema: PersonalizedTipsInputSchema},
  output: {schema: PersonalizedTipsOutputSchema},
  prompt: `You are an expert health advisor specializing in type 1 diabetes.

  Based on the patient's biodata, insulin brand, units consumed, recent glucose levels, activity levels and dietary habits, provide personalized tips and suggestions for maintaining blood glucose levels naturally.

  Biodata:
  - Height: {{height}} cm
  - Weight: {{weight}} kg
  - Age: {{age}} years
  - Insulin Brand: {{insulinBrand}}
  - Units Consumed: {{unitsConsumed}}
  - Recent Glucose Levels: {{recentGlucoseLevels}}
  - Activity Levels: {{activityLevels}}
  - Dietary Habits: {{dietaryHabits}}

  Provide the tips in a concise and easy-to-understand manner, in the {{targetLanguage}} language.
  `, // the tips will be returned in the tips field
});

const providePersonalizedTipsFlow = ai.defineFlow(
  {
    name: 'providePersonalizedTipsFlow',
    inputSchema: PersonalizedTipsInputSchema,
    outputSchema: PersonalizedTipsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
