'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { SuggestSolutionsTab } from '@/components/glyco/suggest-solutions-tab';

const PredictionCard = ({ time }: { time: string }) => (
  <div className="flex-1 rounded-lg bg-muted/50 p-4 text-center min-w-[100px]">
    <p className="text-sm text-muted-foreground">{time}</p>
    <p className="mt-2 text-2xl font-bold">--</p>
    <p className="text-sm text-muted-foreground">±--</p>
  </div>
);

export default function AiInsightsPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 bg-background p-4 md:p-8">
          <div className="mx-auto max-w-4xl space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-primary" />
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">AI Insights</h1>
                    <p className="text-muted-foreground">Personalized predictions and recommendations</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>

            <SuggestSolutionsTab />

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg">Prediction Horizons (Preview)</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-4">
                  <PredictionCard time="15 min" />
                  <PredictionCard time="30 min" />
                  <PredictionCard time="60 min" />
                  <PredictionCard time="3 hours" />
                </div>
                <p className="mt-6 text-center text-sm text-muted-foreground">
                  Predictions will appear once you have sufficient glucose data
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
