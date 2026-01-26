'use client';

import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { LogGlucoseForm } from '@/components/glyco/log-glucose-form';

export default function LogPage() {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex flex-1 flex-col items-center justify-center bg-background p-4 sm:p-6">
          <LogGlucoseForm />
        </main>
      </div>
    </div>
  );
}
