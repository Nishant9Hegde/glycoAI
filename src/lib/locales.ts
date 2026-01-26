
import { ACTIVITY_LEVELS, DIETARY_HABITS, INDIAN_FOODS, MEAL_CONTEXT } from './constants';

export const stringsToTranslate = [
  // Sidebar
  'Dashboard',
  'Log',
  'Calculator',
  'AI Insights',
  'Settings',

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
