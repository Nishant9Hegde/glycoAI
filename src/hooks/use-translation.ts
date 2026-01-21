'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/language-context';
import { getTranslation } from '@/app/actions';

const cache = new Map<string, string>();

function getLanguageName(code: string): string {
  switch (code) {
    case 'en':
      return 'English';
    case 'hi':
      return 'Hindi';
    case 'kn':
      return 'Kannada';
    default:
      return 'English';
  }
}

export function useTranslation(textToTranslate: string | undefined | null) {
  const { language } = useLanguage();
  const [translatedText, setTranslatedText] = useState(textToTranslate || '');
  const [isLoading, setIsLoading] = useState(false);

  const translate = useCallback(async () => {
    if (!textToTranslate) {
      setTranslatedText('');
      return;
    }
    
    if (language === 'en') {
      setTranslatedText(textToTranslate);
      return;
    }

    const targetLanguageName = getLanguageName(language);
    const cacheKey = `${targetLanguageName}:${textToTranslate}`;

    if (cache.has(cacheKey)) {
      setTranslatedText(cache.get(cacheKey)!);
      return;
    }

    setIsLoading(true);
    try {
      const result = await getTranslation({ text: textToTranslate, targetLanguage: targetLanguageName });

      if (result.success) {
        const newTranslatedText = result.data.translatedText;
        cache.set(cacheKey, newTranslatedText);
        setTranslatedText(newTranslatedText);
      } else {
        setTranslatedText(textToTranslate);
        console.error(result.error);
      }
    } catch (error) {
        setTranslatedText(textToTranslate);
        console.error('Translation failed:', error);
    } finally {
        setIsLoading(false);
    }
  }, [textToTranslate, language]);

  useEffect(() => {
    translate();
  }, [translate]);

  return { translatedText, isLoading };
}
