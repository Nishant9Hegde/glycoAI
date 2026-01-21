'use server';

/**
 * @fileOverview Explains unusual blood glucose behaviors, such as high blood glucose after an intense workout.
 *
 * - explainBloodGlucoseBehavior - A function that handles the explanation of blood glucose behavior.
 * - ExplainBloodGlucoseBehaviorInput - The input type for the explainBloodGlucoseBehavior function.
 * - ExplainBloodGlucoseBehaviorOutput - The return type for the explainBloodGlucoseBehavior function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainBloodGlucoseBehaviorInputSchema = z.object({
  bloodGlucoseLevel: z
    .number()
    .describe('The blood glucose level of the patient (mg/dL).'),
  activity: z.string().describe('The activity performed by the patient.'),
  insulinUnits: z.number().describe('The units of insulin consumed.'),
  foodIntake: z.string().describe('Description of food intake.'),
  otherFactors: z.string().optional().describe('Any other relevant factors.'),
  targetLanguage: z
    .string()
    .describe(
      'The target language for the response (e.g., "French", "Spanish").'
    ),
});
export type ExplainBloodGlucoseBehaviorInput = z.infer<
  typeof ExplainBloodGlucoseBehaviorInputSchema
>;

const ExplainBloodGlucoseBehaviorOutputSchema = z.object({
  explanation: z.string().describe('Explanation of the blood glucose behavior.'),
  suggestions: z.string().describe('Suggestions to manage the blood glucose.'),
  reasons: z.string().describe('Reasons for the blood glucose behavior.'),
});
export type ExplainBloodGlucoseBehaviorOutput = z.infer<
  typeof ExplainBloodGlucoseBehaviorOutputSchema
>;

export async function explainBloodGlucoseBehavior(
  input: ExplainBloodGlucoseBehaviorInput
): Promise<ExplainBloodGlucoseBehaviorOutput> {
  return explainBloodGlucoseBehaviorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainBloodGlucoseBehaviorPrompt',
  input: {schema: ExplainBloodGlucoseBehaviorInputSchema},
  output: {schema: ExplainBloodGlucoseBehaviorOutputSchema},
  prompt: `You are a medical expert specialized in diabetes.
You will use this information to explain the unusual blood glucose behavior, provide suggestions to manage it, and state the reasons for the behavior, all in {{targetLanguage}}.

Blood Glucose Level: {{bloodGlucoseLevel}} mg/dL
Activity: {{activity}}
Insulin Units: {{insulinUnits}}
Food Intake: {{foodIntake}}
Other Factors: {{otherFactors}}

Explanation:
Suggestions:
Reasons:`,
});

const explainBloodGlucoseBehaviorFlow = ai.defineFlow(
  {
    name: 'explainBloodGlucoseBehaviorFlow',
    inputSchema: ExplainBloodGlucoseBehaviorInputSchema,
    outputSchema: ExplainBloodGlucoseBehaviorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
