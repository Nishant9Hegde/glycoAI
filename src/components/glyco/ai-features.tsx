'use client';

import { Wrench, BrainCircuit } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SuggestSolutionsTab } from "@/components/glyco/suggest-solutions-tab";
import { useTranslation } from "@/hooks/use-translation";
import { PredictGlucoseTab } from "./predict-glucose-tab";

export function AIFeatures() {
  const { translatedText: solutionsTab } = useTranslation('Suggest Solutions');
  const { translatedText: predictionTab } = useTranslation('AI Prediction');

  return (
    <Tabs defaultValue="solutions" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="solutions">
          <Wrench className="mr-2 h-4 w-4" />
          {solutionsTab}
        </TabsTrigger>
        <TabsTrigger value="prediction">
          <BrainCircuit className="mr-2 h-4 w-4" />
          {predictionTab}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="solutions">
        <SuggestSolutionsTab />
      </TabsContent>
      <TabsContent value="prediction">
        <PredictGlucoseTab />
      </TabsContent>
    </Tabs>
  );
}
