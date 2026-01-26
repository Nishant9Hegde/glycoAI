'use client';

import { DoseCalculator } from '@/components/glyco/dose-calculator';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';

export default function CalculatorPage() {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex flex-1 flex-col items-center justify-center bg-background p-4 sm:p-6">
            <DoseCalculator />
        </main>
      </div>
    </div>
  );
}
