
'use server';

import { providePersonalizedTips, type PersonalizedTipsInput } from '@/ai/flows/provide-personalized-tips';
import { suggestSolutionsForIssues, type SuggestSolutionsForIssuesInput } from '@/ai/flows/suggest-solutions-for-issues';
import { explainBloodGlucoseBehavior, type ExplainBloodGlucoseBehaviorInput } from '@/ai/flows/explain-blood-glucose-behavior';

export async function getPersonalizedTips(data: PersonalizedTipsInput) {
  try {
    const result = await providePersonalizedTips(data);
    return { success: true, data: result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: `Failed to get personalized tips. ${errorMessage}` };
  }
}

export async function getSolutionsForIssues(data: SuggestSolutionsForIssuesInput) {
  try {
    const result = await suggestSolutionsForIssues(data);
    return { success: true, data: result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: `Failed to get solutions. ${errorMessage}` };
  }
}

export async function getBloodGlucoseExplanation(data: ExplainBloodGlucoseBehaviorInput) {
  try {
    const result = await explainBloodGlucoseBehavior(data);
    return { success: true, data: result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: `Failed to get an explanation. ${errorMessage}` };
  }
}
