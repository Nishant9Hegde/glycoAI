'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Cable } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const CGMProviderCard = ({ name, logoId, description }: { name: string, logoId: string, description: string }) => {
    const image = PlaceHolderImages.find(img => img.id === logoId);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                {image && <Image src={image.imageUrl} alt={`${name} logo`} width={40} height={40} data-ai-hint={image.imageHint} className="rounded-md" />}
                <CardTitle className="text-xl">{name}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-4">{description}</p>
                <Button>Connect</Button>
            </CardContent>
        </Card>
    );
}

export default function CgmIntegrationPage() {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 bg-background p-4 md:p-8">
            <div className="w-full max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <Cable className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold tracking-wide">
                            CGM Integration
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Connect your Continuous Glucose Monitor to automatically sync your data.
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                    <CGMProviderCard 
                        name="Dexcom" 
                        logoId="dexcom-logo"
                        description="Connect your Dexcom account to sync your glucose readings in real-time."
                    />
                    <CGMProviderCard 
                        name="FreeStyle Libre" 
                        logoId="libre-logo"
                        description="Connect your LibreView account to import your glucose history."
                    />
                </div>
            </div>
        </main>
      </div>
    </div>
  );
}
