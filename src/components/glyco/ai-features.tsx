'use client';

import { HelpCircle, Wrench, BrainCircuit } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExplainBehaviorTab } from "@/components/glyco/explain-behavior-tab";
import { SuggestSolutionsTab } from "@/components/glyco/suggest-solutions-tab";
import { useTranslation } from "@/hooks/use-translation";
import { PredictGlucoseTab } from "./predict-glucose-tab";

export function AIFeatures() {
  const { translatedText: explainTab } = useTranslation('Explain Behavior');
  const { translatedText: solutionsTab } = useTranslation('Suggest Solutions');
  const { translatedText: predictionTab } = useTranslation('AI Prediction');

  return (
    <Tabs defaultValue="explain" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="explain">
          <HelpCircle className="mr-2 h-4 w-4" />
          {explainTab}
        </TabsTrigger>
        <TabsTrigger value="solutions">
          <Wrench className="mr-2 h-4 w-4" />
          {solutionsTab}
        </TabsTrigger>
        <TabsTrigger value="prediction">
          <BrainCircuit className="mr-2 h-4 w-4" />
          {predictionTab}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="explain">
        <ExplainBehaviorTab />
      </TabsContent>
      <TabsContent value="solutions">
        <SuggestSolutionsTab />
      </TabsContent>
      <TabsContent value="prediction">
        <PredictGlucoseTab />
      </TabsContent>
    </Tabs>
  );
}
