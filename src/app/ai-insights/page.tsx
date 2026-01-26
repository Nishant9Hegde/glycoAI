'use client';

import { AIFeatures } from '@/components/glyco/ai-features';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';

export default function AiInsightsPage() {
    return (
        <div className="flex min-h-screen w-full">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <AIFeatures />
            </main>
          </div>
        </div>
      );
}
