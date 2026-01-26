'use client';

import { AIFeatures } from '@/components/glyco/ai-features';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AiInsightsPage() {
    return (
        <div className="flex min-h-screen w-full flex-col">
          <Header />
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="mx-auto w-full max-w-4xl">
              <div className="mb-4">
                <Button variant="ghost" asChild>
                  <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                  </Link>
                </Button>
              </div>
              <AIFeatures />
            </div>
          </main>
        </div>
      );
}
