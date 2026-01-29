'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Clock, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { SuggestSolutionsTab } from '@/components/glyco/suggest-solutions-tab';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useEffect, useState } from 'react';

interface PredictionData {
  current_bg: number;
  recent_insulin: number;
  recent_carbs: number;
  predictions: {
    times: string[];
    values: number[];
    one_hour: number;
    two_hours: number;
    three_hours: number;
  };
  alert: {
    type: 'warning' | 'success';
    message: string;
    details: string;
  };
}

const PredictionCard = ({ time, value, confidence }: { time: string; value?: number; confidence?: string }) => (
  <div className="flex-1 rounded-lg bg-muted/50 p-4 text-center min-w-[100px]">
    <p className="text-sm text-muted-foreground">{time}</p>
    <p className="mt-2 text-2xl font-bold">{value ? `${value.toFixed(0)}` : '--'}</p>
    <p className="text-sm text-muted-foreground">{confidence || '±--'}</p>
  </div>
);

export default function AiInsightsPage() {
  const router = useRouter();
  const [predictionData, setPredictionData] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch scenario 1 predictions when page loads
    const fetchPredictions = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/scenario1');
        
        if (!response.ok) {
          throw new Error('Failed to fetch predictions');
        }

        const data = await response.json();
        
        if (data.success) {
          setPredictionData(data);
        } else {
          setError(data.error || 'Unknown error occurred');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load predictions');
        console.error('Prediction error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

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

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {predictionData && predictionData.alert && (
              <Alert variant={predictionData.alert.type === 'warning' ? 'destructive' : 'default'}>
                {predictionData.alert.type === 'warning' ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                <AlertTitle>{predictionData.alert.message}</AlertTitle>
                {predictionData.alert.details && (
                  <AlertDescription>{predictionData.alert.details}</AlertDescription>
                )}
              </Alert>
            )}

            {predictionData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    Current Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Current BG</p>
                      <p className="text-2xl font-bold">{predictionData.current_bg.toFixed(0)}</p>
                      <p className="text-xs text-muted-foreground">mg/dL</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Recent Insulin</p>
                      <p className="text-2xl font-bold">{predictionData.recent_insulin.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">units (3h)</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Recent Carbs</p>
                      <p className="text-2xl font-bold">{predictionData.recent_carbs.toFixed(0)}</p>
                      <p className="text-xs text-muted-foreground">grams (3h)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <SuggestSolutionsTab />

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg">
                      {loading ? 'Loading Predictions...' : 'Prediction Horizons'}
                    </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : predictionData ? (
                  <>
                    <div className="flex flex-wrap gap-4">
                      <PredictionCard 
                        time="1 hour" 
                        value={predictionData.predictions.one_hour}
                        confidence="mg/dL"
                      />
                      <PredictionCard 
                        time="2 hours" 
                        value={predictionData.predictions.two_hours}
                        confidence="mg/dL"
                      />
                      <PredictionCard 
                        time="3 hours" 
                        value={predictionData.predictions.three_hours}
                        confidence="mg/dL"
                      />
                    </div>
                    <p className="mt-6 text-center text-sm text-muted-foreground">
                      Predictions based on your recent glucose, insulin, and carb data
                    </p>
                  </>
                ) : (
                  <div className="flex flex-wrap gap-4">
                    <PredictionCard time="1 hour" />
                    <PredictionCard time="2 hours" />
                    <PredictionCard time="3 hours" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
