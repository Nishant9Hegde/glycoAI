
import { ACTIVITY_LEVELS, COMMON_ISSUES, DIETARY_HABITS, INDIAN_FOODS, MEAL_CONTEXT } from './constants';

export const stringsToTranslate = [
  // Sidebar
  'Dashboard',
  'Log',
  'Calculator',
  'Settings',

  // from ai-features.tsx
  'Personalized Tips',
  'Explain Behavior',
  'Suggest Solutions',
  'AI Prediction',

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
  'Select food...',
  'Search food...',
  'Nothing found.',

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
  'Your Health Profile',
  'Tell us a bit about you to unlock personalized AI insights for your health journey. This data stays on your device.',
  'Age',
  'Weight (kg)',
  'Height (ft)',
  'Height (in)',
  'Insulin Brand',
  'Select brand',

  // from header.tsx
  'My Account',
  'Settings',
  'Support',
  'Logout',

  // from predict-glucose-tab.tsx
  'AI Glucose Prediction',
  'Predict your future blood glucose levels based on your current data.',
  'Current Glucose (mg/dL)',
  'Time Since Last Meal (hours)',
  'Predict Glucose',
  'AI-Generated Prediction',
  'Here is your predicted glucose level for the next 2 hours.',
  'Please complete your biodata on the left before getting a prediction.',
  'Predicted Glucose Level',
  'Reasoning',
  'Confidence Score',

  // from log-glucose-form.tsx
  'Log Glucose',
  'Record your blood glucose reading',
  'Back',
  'Blood Glucose Level',
  'Meal Context',
  'Time',
  'Log Reading',
  'Select meal context',

  // from constants.ts
  ...ACTIVITY_LEVELS,
  ...DIETARY_HABITS,
  ...COMMON_ISSUES,
  ...INDIAN_FOODS.map(food => food.label),
  ...MEAL_CONTEXT,
].filter((v, i, a) => a.indexOf(v) === i); // Ensure unique strings
