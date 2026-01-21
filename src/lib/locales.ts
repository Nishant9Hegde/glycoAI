import { ACTIVITY_LEVELS, COMMON_ISSUES, DIETARY_HABITS } from './constants';

export const stringsToTranslate = [
  // from ai-features.tsx
  'Personalized Tips',
  'Explain Behavior',
  'Suggest Solutions',

  // from explain-behavior-tab.tsx
  'Explain Unusual Behavior',
  'Get AI-powered explanations for unexpected blood glucose readings based on your recent activity and intake.',
  'Blood Glucose (mg/dL)',
  'Insulin Units Consumed',
  'Activity Performed',
  'Food Intake',
  'Other Factors (Optional)',
  'Get Explanation',
  'AI-Generated Explanation',
  'Here\'s a breakdown of the potential factors.',
  'Missing Information',
  'Please complete your biodata on the left before getting an explanation.',
  'Error',
  'Explanation',
  'Reasons',
  'Suggestions',

  // from personalized-tips-tab.tsx
  'Personalized Tips & Suggestions',
  'Provide your recent data to receive AI-generated tips for naturally maintaining your blood glucose levels.',
  'Total Insulin Units (Last 24h)',
  'Recent Glucose Levels (mg/dL)',
  'Activity Level',
  'Dietary Habits',
  'Select activity level',
  'Select dietary habit',
  'Generate Tips',
  'Your Personalized Health Tips',
  'Here are some suggestions based on your data.',
  'Please complete your biodata on the left before getting tips.',

  // from suggest-solutions-tab.tsx
  'Solutions for Common Issues',
  'Select a common diabetes-related issue to get AI-powered solutions and explanations.',
  'Common Issue',
  'Select an issue you are facing',
  'Find Solutions',
  'AI-Suggested Solutions',
  'Please complete your biodata on the left before getting solutions.',
  'Solutions',
  'For the issue:',

  // from user-data-form.tsx
  'Your Biodata',
  'This information helps the AI provide personalized advice. It is not stored anywhere.',
  'Age',
  'Weight (kg)',
  'Height (cm)',
  'Insulin Brand',
  'Select brand',

  // from header.tsx
  'My Account',
  'Settings',
  'Support',
  'Logout',

  // from constants.ts
  ...ACTIVITY_LEVELS,
  ...DIETARY_HABITS,
  ...COMMON_ISSUES
].filter((v, i, a) => a.indexOf(v) === i); // Ensure unique strings
