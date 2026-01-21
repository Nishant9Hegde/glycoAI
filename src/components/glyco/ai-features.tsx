
'use client';

import { Lightbulb, HelpCircle, Wrench } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonalizedTipsTab } from "@/components/glyco/personalized-tips-tab";
import { ExplainBehaviorTab } from "@/components/glyco/explain-behavior-tab";
import { SuggestSolutionsTab } from "@/components/glyco/suggest-solutions-tab";

export function AIFeatures() {
  return (
    <Tabs defaultValue="tips" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="tips">
          <Lightbulb className="mr-2 h-4 w-4" />
          Personalized Tips
        </TabsTrigger>
        <TabsTrigger value="explain">
          <HelpCircle className="mr-2 h-4 w-4" />
          Explain Behavior
        </TabsTrigger>
        <TabsTrigger value="solutions">
          <Wrench className="mr-2 h-4 w-4" />
          Suggest Solutions
        </TabsTrigger>
      </TabsList>
      <TabsContent value="tips">
        <PersonalizedTipsTab />
      </TabsContent>
      <TabsContent value="explain">
        <ExplainBehaviorTab />
      </TabsContent>
      <TabsContent value="solutions">
        <SuggestSolutionsTab />
      </TabsContent>
    </Tabs>
  );
}
