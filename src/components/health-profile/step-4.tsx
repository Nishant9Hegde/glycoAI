'use client';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import type { HealthProfileData } from '@/app/health-profile/page';


interface Step4Props {
    formData: HealthProfileData;
    updateFormData: (data: Partial<HealthProfileData>) => void;
}

export function Step4({ formData, updateFormData }: Step4Props) {
  return (
    <div className="space-y-6">
        <div>
            <h2 className="text-2xl font-bold">Target Glucose Range</h2>
            <p className="text-muted-foreground">Set your desired blood glucose range (mg/dL).</p>
        </div>
        <div className="space-y-4 pt-8">
            <div className="flex justify-between items-center px-2">
                <span className="text-lg font-bold text-primary">{formData.targetRange[0]}</span>
                <span className="text-muted-foreground">to</span>
                <span className="text-lg font-bold text-primary">{formData.targetRange[1]}</span>
                 <span className="text-muted-foreground">mg/dL</span>
            </div>
            <Slider
                value={formData.targetRange}
                min={50}
                max={250}
                step={5}
                onValueChange={(value) => updateFormData({ targetRange: value as [number, number] })}
            />
            <div className="flex justify-between text-xs text-muted-foreground px-2">
                <span>50 mg/dL</span>
                <span>250 mg/dL</span>
            </div>
        </div>
    </div>
  );
}
