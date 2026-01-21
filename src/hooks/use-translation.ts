'use client';

import { useTranslations } from '@/context/translation-context';

export function useTranslation(textToTranslate: string | undefined | null) {
  const { translations, isLoading } = useTranslations();
  
  if (!textToTranslate) {
    return { translatedText: '', isLoading: false };
  }

  const translatedText = translations[textToTranslate] || textToTranslate;

  return { translatedText, isLoading };
}
