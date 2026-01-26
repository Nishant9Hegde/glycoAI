
import { ACTIVITY_LEVELS, DIETARY_HABITS, INDIAN_FOODS, MEAL_CONTEXT } from './constants';

export const stringsToTranslate = [
  // Sidebar
  'Dashboard',
  'Log',
  'Calculator',
  'AI Insights',
  'Settings',

  // from ai-features.tsx
  'Suggest Solutions',
  'AI Prediction',

  // from suggest-solutions-tab.tsx
  'Solutions for Common Issues',
  'Describe a diabetes-related issue to get AI-powered solutions and explanations.',
  'Describe your issue',
  "e.g., 'High blood sugar in the mornings'",
  'Find Solutions',
  'AI-Suggested Solutions',
  'Please complete your biodata on the left before getting solutions.',
  'Error',
  'Explanation',
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
  'Support',
  'Logout',

  // from predict-glucose-tab.tsx
  'AI Glucose Prediction',
  'Predict your future blood glucose levels based on your current data.',
  'Current Glucose (mg/dL)',
  'Insulin Units Consumed',
  'Activity Performed',
  'Food Intake',
  'Time Since Last Meal (hours)',
  'Predict Glucose',
  'AI-Generated Prediction',
  'Here is your predicted glucose level for the next 2 hours.',
  'Please complete your biodata on the left before getting a prediction.',
  'Predicted Glucose Level',
  'Reasoning',
  'Confidence Score',
  'Select food...',
  'Search food...',
  'Nothing found.',

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
  ...INDIAN_FOODS.map(food => food.label),
  ...MEAL_CONTEXT,
].filter((v, i, a) => a.indexOf(v) === i); // Ensure unique strings
