'use server';

/**
 * @fileOverview Predicts future blood glucose levels based on user data.
 *
 * - predictGlucoseLevel - A function that handles blood glucose prediction.
 * - PredictGlucoseLevelInput - The input type for the predictGlucoseLevel function.
 * - PredictGlucoseLevelOutput - The return type for the predictGlucoseLevel function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictGlucoseLevelInputSchema = z.object({
  height: z.number().describe('The height of the patient in cm.'),
  weight: z.number().describe('The weight of the patient in kg.'),
  age: z.number().describe('The age of the patient in years.'),
  insulinUnits: z.number().describe('The units of insulin consumed.'),
  foodIntake: z.string().describe('Description of food intake.'),
  activity: z.string().describe('The activity performed by the patient.'),
  currentGlucoseLevel: z.number().describe('Current blood glucose level in mg/dL.'),
  timeSinceLastMeal: z.number().describe('Time since last meal in hours.'),
  targetLanguage: z
    .string()
    .describe(
      'The target language for the response (e.g., "Hindi", "English").',
    ),
});
export type PredictGlucoseLevelInput = z.infer<typeof PredictGlucoseLevelInputSchema>;

const PredictGlucoseLevelOutputSchema = z.object({
  predictedGlucoseLevel: z.number().describe('The predicted blood glucose level in mg/dL for the next 2 hours.'),
  predictionReasoning: z.string().describe('The reasoning behind the prediction.'),
  confidenceScore: z.number().min(0).max(1).describe('A confidence score for the prediction (0 to 1).'),
});
export type PredictGlucoseLevelOutput = z.infer<typeof PredictGlucoseLevelOutputSchema>;

export async function predictGlucoseLevel(
  input: PredictGlucoseLevelInput
): Promise<PredictGlucoseLevelOutput> {
  return predictGlucoseLevelFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictGlucoseLevelPrompt',
  input: {schema: PredictGlucoseLevelInputSchema},
  output: {schema: PredictGlucoseLevelOutputSchema},
  prompt: `You are an advanced AI for predicting blood glucose levels for type 1 diabetics.
You will use a sophisticated glucose-insulin model to predict the blood glucose level for the next 2 hours.
Provide a prediction, reasoning, and a confidence score. Your entire response should be in {{targetLanguage}}.

Patient Data:
- Height: {{height}} cm
- Weight: {{weight}} kg
- Age: {{age}} years
- Current Glucose: {{currentGlucoseLevel}} mg/dL
- Insulin Units: {{insulinUnits}} units
- Food Intake: {{foodIntake}}
- Activity: {{activity}}
- Time Since Last Meal: {{timeSinceLastMeal}} hours

Based on this data, predict the glucose level, explain your reasoning, and provide a confidence score.
`,
});

const predictGlucoseLevelFlow = ai.defineFlow(
  {
    name: 'predictGlucoseLevelFlow',
    inputSchema: PredictGlucoseLevelInputSchema,
    outputSchema: PredictGlucoseLevelOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
