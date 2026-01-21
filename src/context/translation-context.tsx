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
      case 'kn':
        return 'Kannada';
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
    if (lang === 'en') {
      const identityMap = stringsToTranslate.reduce((acc, str) => {
        acc[str] = str;
        return acc;
      }, {} as TranslationDict);
      setTranslations(identityMap);
      return;
    }

    if (translationCache.has(lang)) {
        setTranslations(translationCache.get(lang)!);
        return;
    }

    setIsLoading(true);
    try {
      const result = await getTranslation({
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
      } else {
        console.error('Translation failed or mismatch in length', result.error);
        const identityMap = stringsToTranslate.reduce((acc, str) => {
          acc[str] = str;
          return acc;
        }, {} as TranslationDict);
        setTranslations(identityMap);
      }
    } catch (error) {
      console.error('Failed to fetch translations', error);
      const identityMap = stringsToTranslate.reduce((acc, str) => {
          acc[str] = str;
          return acc;
        }, {} as TranslationDict);
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
