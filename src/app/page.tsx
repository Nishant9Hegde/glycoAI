'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Dashboard } from "@/components/glyco/dashboard";
import { Header } from "@/components/layout/header";
import { LanguageProvider } from "@/context/language-context";
import { TranslationProvider } from "@/context/translation-context";
import Loading from './loading';

export default function Home() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <Loading />;
  }

  return (
    <LanguageProvider>
      <TranslationProvider>
        <div className="flex min-h-screen w-full flex-col">
          <Header />
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <Dashboard />
          </main>
        </div>
      </TranslationProvider>
    </LanguageProvider>
  );
}
