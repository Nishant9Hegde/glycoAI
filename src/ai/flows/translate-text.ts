'use server';

/**
 * @fileOverview A flow to translate text from one language to another.
 *
 * - translateText - A function that translates text.
 * - TranslateTextInput - The input type for the translateText function.
 * - TranslateTextOutput - The return type for the translateText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateTextInputSchema = z.object({
  texts: z.array(z.string()).describe('The texts to be translated.'),
  targetLanguage: z.string().describe('The target language for translation (e.g., "French", "Spanish").'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const TranslateTextOutputSchema = z.object({
  translatedTexts: z.array(z.string()).describe('The translated texts in the same order as the input.'),
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;

export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
  return translateTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateTextPrompt',
  input: {schema: TranslateTextInputSchema},
  output: {schema: TranslateTextOutputSchema},
  prompt: `Translate each string in the following JSON array of strings to {{targetLanguage}}.
  
Texts: {{{json texts}}}

Return only the translated texts in the 'translatedTexts' field as a JSON array of strings, maintaining the original order.`,
});

const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async input => {
    if (input.targetLanguage.toLowerCase() === 'english') {
      return { translatedTexts: input.texts };
    }
    const {output} = await prompt(input);
    
    if (output && output.translatedTexts.length === input.texts.length) {
      return output;
    }

    // Fallback if the model fails to return a valid response
    return { translatedTexts: input.texts };
  }
);
