'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting solutions to common blood glucose issues.
 *
 * - suggestSolutionsForIssues - A function that suggests solutions for common blood glucose issues like dawn phenomenon or nighttime hypoglycemia.
 * - SuggestSolutionsForIssuesInput - The input type for the suggestSolutionsForIssues function.
 * - SuggestSolutionsForIssuesOutput - The return type for the suggestSolutionsForIssues function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSolutionsForIssuesInputSchema = z.object({
  issue: z
    .string()
    .describe(
      'The specific blood glucose issue the user is experiencing, e.g., dawn phenomenon, nighttime hypoglycemia.'
    ),
  insulinBrand: z.string().describe('The brand of insulin the user is using.'),
  height: z.number().describe('The user height in cm'),
  weight: z.number().describe('The user weight in kg'),
  age: z.number().describe('The user age in years'),
  targetLanguage: z
    .string()
    .describe(
      'The target language for the response (e.g., "Hindi", "English").',
    ),
});
export type SuggestSolutionsForIssuesInput = z.infer<
  typeof SuggestSolutionsForIssuesInputSchema
>;

const SuggestSolutionsForIssuesOutputSchema = z.object({
  solutions: z
    .array(z.string())
    .describe(
      'A list of suggested solutions for the specified blood glucose issue.'
    ),
  explanation: z
    .string()
    .describe(
      'An explanation of why the suggested solutions are relevant to the issue.'
    ),
});
export type SuggestSolutionsForIssuesOutput = z.infer<
  typeof SuggestSolutionsForIssuesOutputSchema
>;

export async function suggestSolutionsForIssues(
  input: SuggestSolutionsForIssuesInput
): Promise<SuggestSolutionsForIssuesOutput> {
  return suggestSolutionsForIssuesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSolutionsForIssuesPrompt',
  input: {schema: SuggestSolutionsForIssuesInputSchema},
  output: {schema: SuggestSolutionsForIssuesOutputSchema},
  prompt: `You are a diabetes management expert with access to the latest medical information. A user has described a problem they are facing. Your task is to provide potential solutions and a clear explanation, tailored to their profile. Your entire response must be in {{targetLanguage}}.

User's Described Issue: {{{issue}}}

Patient's Profile:
- Insulin Brand(s): {{{insulinBrand}}}
- Height: {{{height}}} cm
- Weight: {{{weight}}} kg
- Age: {{{age}}} years

Based on the user's issue and their profile, provide a list of actionable solutions and a detailed explanation for why these solutions are relevant. The solutions should focus on practical lifestyle and insulin dosage adjustments.

Format your response exactly as specified in the output schema.
`
});

const suggestSolutionsForIssuesFlow = ai.defineFlow(
  {
    name: 'suggestSolutionsForIssuesFlow',
    inputSchema: SuggestSolutionsForIssuesInputSchema,
    outputSchema: SuggestSolutionsForIssuesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
