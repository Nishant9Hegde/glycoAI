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
      case 'fr':
        return 'French';
      case 'es':
        return 'Spanish';
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
      const chunkSize = 10;
      const MAX_RETRIES = 3;
      const RETRY_DELAY_MS = 1000;
      let allTranslatedTexts: string[] = [];
      
      for (let i = 0; i < stringsToTranslate.length; i += chunkSize) {
        const chunk = stringsToTranslate.slice(i, i + chunkSize);
        
        let chunkSuccess = false;
        let retries = 0;
        let result;

        while (!chunkSuccess && retries < MAX_RETRIES) {
            result = await getTranslation({
              texts: chunk,
              targetLanguage: getLanguageName(lang),
            });

            if (result.success && result.data.translatedTexts.length === chunk.length) {
              allTranslatedTexts.push(...result.data.translatedTexts);
              chunkSuccess = true;
            } else {
              retries++;
              console.error(`Translation chunk failed (attempt ${retries}/${MAX_RETRIES})`, result.error);
              if (retries < MAX_RETRIES) {
                // Exponential backoff: 1s, 2s, 4s
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, retries - 1)));
              }
            }
        }

        if (!chunkSuccess) {
            console.error('Translation chunk failed after all retries. Falling back to original text for this chunk.', result?.error);
            allTranslatedTexts.push(...chunk);
        }

        if (stringsToTranslate.length > chunkSize) {
            // Increased delay between chunks to be safer
            await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      if (allTranslatedTexts.length === stringsToTranslate.length) {
        const newTranslations = stringsToTranslate.reduce((acc, originalText, index) => {
          acc[originalText] = allTranslatedTexts[index];
          return acc;
        }, {} as TranslationDict);
        translationCache.set(lang, newTranslations);
        setTranslations(newTranslations);
      } else {
        console.error('Final translated texts length does not match original length. Falling back to no translations.');
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
