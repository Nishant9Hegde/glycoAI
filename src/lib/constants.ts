
export const INSULIN_BRANDS: string[] = [
  'Humalog',
  'Novolog',
  'Apidra',
  'Fiasp',
  'Lantus',
  'Levemir',
  'Tresiba',
  'Toujeo',
];

export const ACTIVITY_LEVELS: string[] = [
  'Sedentary (little or no exercise)',
  'Lightly Active (light exercise/sports 1-3 days/week)',
  'Moderately Active (moderate exercise/sports 3-5 days/week)',
  'Very Active (hard exercise/sports 6-7 days a week)',
  'Super Active (very hard exercise/physical job)',
];

export const DIETARY_HABITS: string[] = [
  'Balanced',
  'Low Carb',
  'High Protein',
  'Keto',
  'Vegan',
  'Vegetarian',
  'Paleo',
];

export const INDIAN_FOODS: { value: string; label: string; carbs: number }[] = [
  { value: 'roti', label: 'Roti', carbs: 25 },
  { value: 'naan', label: 'Naan', carbs: 45 },
  { value: 'paratha', label: 'Paratha', carbs: 35 },
  { value: 'dal makhani', label: 'Dal Makhani', carbs: 30 },
  { value: 'paneer butter masala', label: 'Paneer Butter Masala', carbs: 15 },
  { value: 'chole bhature', label: 'Chole Bhature', carbs: 80 },
  { value: 'samosa', label: 'Samosa', carbs: 25 },
  { value: 'idli', label: 'Idli', carbs: 15 },
  { value: 'dosa', label: 'Dosa', carbs: 30 },
  { value: 'vada pav', label: 'Vada Pav', carbs: 45 },
  { value: 'biryani', label: 'Biryani', carbs: 70 },
  { value: 'palak paneer', label: 'Palak Paneer', carbs: 10 },
  { value: 'aloo gobi', label: 'Aloo Gobi', carbs: 20 },
  { value: 'rajma', label: 'Rajma', carbs: 40 },
  { value: 'dhokla', label: 'Dhokla', carbs: 10 },
  { value: 'gulab jamun', label: 'Gulab Jamun', carbs: 30 },
  { value: 'jalebi', label: 'Jalebi', carbs: 40 },
  { value: 'rasgulla', label: 'Rasgulla', carbs: 20 },
  { value: 'masala dosa', label: 'Masala Dosa', carbs: 50 },
  { value: 'upma', label: 'Upma', carbs: 50 },
  { value: 'poha', label: 'Poha', carbs: 45 },
];

export const MEAL_CONTEXT = [
    'Before Meal',
    'After Meal',
    'Fasting',
    'Bedtime',
    'Other'
];
