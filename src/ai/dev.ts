import { config } from 'dotenv';
config();

import '@/ai/flows/explain-blood-glucose-behavior.ts';
import '@/ai/flows/suggest-solutions-for-issues.ts';
import '@/ai/flows/translate-text.ts';
import '@/ai/flows/predict-glucose-level.ts';
