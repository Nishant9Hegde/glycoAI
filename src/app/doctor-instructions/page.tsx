'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export default function DoctorInstructionsPage() {
  const { translatedText: title } = useTranslation('Doctor Instructions');

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 bg-background p-4 md:p-8">
          <div className="w-full max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <ClipboardList className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold tracking-wide">
                  {title}
                </h1>
                <p className="text-muted-foreground mt-1">
                  View and manage clinical advice from your healthcare provider.
                </p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Medical Notes</CardTitle>
                <CardDescription>Keep track of instructions, prescriptions, and advice.</CardDescription>
              </CardHeader>
              <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                <div className="bg-muted rounded-full p-6 mb-4">
                  <ClipboardList className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No instructions yet</h3>
                <p className="text-muted-foreground max-w-sm">
                  This space will hold the advice and instructions shared by your doctor for managing your Type 1 diabetes.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
