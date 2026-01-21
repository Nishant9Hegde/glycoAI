
'use client';

import { UserDataProvider } from '@/context/user-data-context';
import { UserDataForm } from '@/components/glyco/user-data-form';
import { AIFeatures } from '@/components/glyco/ai-features';

export function Dashboard() {
  return (
    <UserDataProvider>
      <div className="mx-auto grid w-full max-w-7xl flex-1 items-start gap-6 md:grid-cols-[300px_1fr] lg:grid-cols-[350px_1fr]">
        <div className="sticky top-24 flex flex-col gap-6">
          <UserDataForm />
        </div>
        <div className="flex flex-col gap-6">
          <AIFeatures />
        </div>
      </div>
    </UserDataProvider>
  );
}
