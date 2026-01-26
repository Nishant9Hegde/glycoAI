'use client';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { INSULIN_TYPES } from '@/lib/insulin-brands';
import type { HealthProfileData } from '@/app/health-profile/page';
import { Checkbox } from '../ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface Step2Props {
  formData: HealthProfileData;
  updateFormData: (data: Partial<HealthProfileData>) => void;
}

export function Step2({ formData, updateFormData }: Step2Props) {
  const { toast } = useToast();

  const handleInsulinChange = (checked: boolean | 'indeterminate', type: string, brand: string) => {
    const newSelection = { type, brand };
    const currentSelections = formData.insulinSelections || [];

    let updatedSelections;

    if (checked) {
      if (currentSelections.length >= 2) {
        toast({
          title: 'Limit Reached',
          description: 'You can select a maximum of 2 insulin brands.',
          variant: 'destructive',
        });
        return;
      }
      updatedSelections = [...currentSelections, newSelection];
    } else {
      updatedSelections = currentSelections.filter(
        (selection) => !(selection.brand === brand && selection.type === type)
      );
    }
    updateFormData({ insulinSelections: updatedSelections });
  };

  const isSelected = (brand: string) => {
    return formData.insulinSelections.some((selection) => selection.brand === brand);
  };

  const openAccordionItems = formData.insulinSelections.map(s => s.type).filter((v, i, a) => a.indexOf(v) === i);


  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Insulin Details</h2>
        <p className="text-muted-foreground">Select up to two types and brands of insulin you use.</p>
      </div>

      <Accordion type="multiple" className="w-full" defaultValue={openAccordionItems}>
        {Object.entries(INSULIN_TYPES).map(([type, brands]) => (
          <AccordionItem value={type} key={type}>
            <AccordionTrigger>{type}</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {brands.map((brand) => (
                  <div key={brand} className="flex items-center space-x-2">
                    <Checkbox
                      id={brand}
                      checked={isSelected(brand)}
                      onCheckedChange={(checked) => handleInsulinChange(checked, type, brand)}
                      disabled={formData.insulinSelections.length >= 2 && !isSelected(brand)}
                    />
                    <Label htmlFor={brand} className="font-normal">
                      {brand}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
