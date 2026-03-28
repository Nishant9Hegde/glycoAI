'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLanguage, type Language } from './language-context';
import { getTranslation } from '@/app/actions';
import { stringsToTranslate } from '@/lib/locales';

type TranslationDict = { [key: string]: string };

interface TranslationContextProps {
  translations: TranslationDict;
  isLoading: boolean;
}

const TranslationContext = createContext<TranslationContextProps | undefined>(undefined);

function getLanguageName(code: string): string {
    switch (code) {
      case 'en':
        return 'English';
      case 'hi':
        return 'Hindi';
      default:
        return 'English';
    }
}

const translationCache = new Map<Language, TranslationDict>();

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();
  const [translations, setTranslations] = useState<TranslationDict>({});
  const [isLoading, setIsLoading] = useState(false);

  const fetchTranslations = useCallback(async (lang: Language) => {
    const identityMap = stringsToTranslate.reduce((acc, str) => {
      acc[str] = str;
      return acc;
    }, {} as TranslationDict);

    if (lang === 'en') {
      setTranslations(identityMap);
      return;
    }

    if (translationCache.has(lang)) {
        setTranslations(translationCache.get(lang)!);
        return;
    }

    setIsLoading(true);
    try {
      const MAX_RETRIES = 3;
      const RETRY_DELAY_MS = 2000;
      
      let success = false;
      let retries = 0;
      let result;

      while (!success && retries < MAX_RETRIES) {
          result = await getTranslation({
            texts: stringsToTranslate,
            targetLanguage: getLanguageName(lang),
          });

          if (result.success && result.data.translatedTexts.length === stringsToTranslate.length) {
            const newTranslations = stringsToTranslate.reduce((acc, originalText, index) => {
              acc[originalText] = result.data.translatedTexts[index];
              return acc;
            }, {} as TranslationDict);
            translationCache.set(lang, newTranslations);
            setTranslations(newTranslations);
            success = true;
          } else {
            retries++;
            console.error(`Translation failed (attempt ${retries}/${MAX_RETRIES})`, result.error);
            if (retries < MAX_RETRIES) {
              await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, retries - 1)));
            }
          }
      }

      if (!success) {
          console.error('Translation failed after all retries. Falling back to original text.', result?.error);
          setTranslations(identityMap);
      }
    } catch (error) {
      console.error('Failed to fetch translations', error);
      setTranslations(identityMap);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTranslations(language);
  }, [language, fetchTranslations]);

  return (
    <TranslationContext.Provider value={{ translations, isLoading }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslations() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslations must be used within a TranslationProvider');
  }
  return context;
}
