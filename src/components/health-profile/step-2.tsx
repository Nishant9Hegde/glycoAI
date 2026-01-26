'use client';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { INSULIN_TYPES } from '@/lib/insulin-brands';
import type { HealthProfileData } from '@/app/health-profile/page';

interface Step2Props {
  formData: HealthProfileData;
  updateFormData: (data: Partial<HealthProfileData>) => void;
}

export function Step2({ formData, updateFormData }: Step2Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Insulin Details</h2>
        <p className="text-muted-foreground">Select the type and brand of insulin you use.</p>
      </div>

      <Accordion type="single" collapsible className="w-full" value={formData.insulinType} onValueChange={(value) => updateFormData({ insulinType: value })}>
        {Object.entries(INSULIN_TYPES).map(([type, brands]) => (
          <AccordionItem value={type} key={type}>
            <AccordionTrigger>{type}</AccordionTrigger>
            <AccordionContent>
              <RadioGroup value={formData.insulinBrand} onValueChange={(value) => updateFormData({ insulinBrand: value, insulinType: type })}>
                <div className="space-y-2">
                  {brands.map((brand) => (
                    <div key={brand} className="flex items-center space-x-2">
                      <RadioGroupItem value={brand} id={brand} />
                      <Label htmlFor={brand} className="font-normal">{brand}</Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
