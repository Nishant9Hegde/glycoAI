'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Clock, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // User inputs
  const [currentBG, setCurrentBG] = useState(120);
  const [recentInsulin, setRecentInsulin] = useState(5);
  const [recentCarbs, setRecentCarbs] = useState(45);
  const [timeOfDay, setTimeOfDay] = useState('12:00');

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('https://unsignalised-idella-devotionally.ngrok-free.dev/api/scenario1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_bg: currentBG,
          recent_insulin: recentInsulin,
          recent_carbs: recentCarbs,
          time_of_day: timeOfDay,
        }),
      });
      
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

            {/* Input Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Enter Current Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="timeOfDay">Time of Day</Label>
                    <Input
                      id="timeOfDay"
                      type="time"
                      value={timeOfDay}
                      onChange={(e) => setTimeOfDay(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentBG">Current BG (mg/dL)</Label>
                    <Input
                      id="currentBG"
                      type="number"
                      value={currentBG}
                      onChange={(e) => setCurrentBG(Number(e.target.value))}
                      min={40}
                      max={400}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recentInsulin">Recent Insulin (units, last 3h)</Label>
                    <Input
                      id="recentInsulin"
                      type="number"
                      value={recentInsulin}
                      onChange={(e) => setRecentInsulin(Number(e.target.value))}
                      min={0}
                      max={50}
                      step={0.5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recentCarbs">Recent Carbs (grams, last 3h)</Label>
                    <Input
                      id="recentCarbs"
                      type="number"
                      value={recentCarbs}
                      onChange={(e) => setRecentCarbs(Number(e.target.value))}
                      min={0}
                      max={200}
                    />
                  </div>
                </div>
                <Button onClick={fetchPredictions} disabled={loading} className="w-full">
                  {loading ? 'Predicting...' : 'Predict Next 3 Hours'}
                </Button>
              </CardContent>
            </Card>

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
