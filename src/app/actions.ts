
'use server';

import { suggestSolutionsForIssues, type SuggestSolutionsForIssuesInput } from '@/ai/flows/suggest-solutions-for-issues';
import { translateText, type TranslateTextInput } from '@/ai/flows/translate-text';
import { predictGlucoseLevel, type PredictGlucoseLevelInput } from '@/ai/flows/predict-glucose-level';

export async function getSolutionsForIssues(data: SuggestSolutionsForIssuesInput) {
  try {
    const result = await suggestSolutionsForIssues(data);
    return { success: true, data: result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: `Failed to get solutions. ${errorMessage}` };
  }
}

export async function getTranslation(data: TranslateTextInput) {
  try {
    const result = await translateText(data);
    return { success: true, data: result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: `Failed to get translation. ${errorMessage}` };
  }
}

export async function getGlucosePrediction(data: PredictGlucoseLevelInput) {
  try {
    const result = await predictGlucoseLevel(data);
    return { success: true, data: result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: `Failed to get prediction. ${errorMessage}` };
  }
}
