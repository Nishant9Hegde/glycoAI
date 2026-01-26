'use server';

import { translateText, type TranslateTextInput } from '@/ai/flows/translate-text';

export async function getTranslation(data: TranslateTextInput) {
  try {
    const result = await translateText(data);
    return { success: true, data: result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: `Failed to get translation. ${errorMessage}` };
  }
}
