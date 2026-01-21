
'use client';

import { Bot, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AIResponseProps {
  isLoading: boolean;
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

export function AIResponse({ isLoading, title, description, children, className }: AIResponseProps) {
  return (
    <Card className={cn("mt-4", className)}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Generating response...</span>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
