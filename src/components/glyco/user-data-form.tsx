'use client';

import { useUserData } from '@/context/user-data-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { INSULIN_BRANDS } from '@/lib/constants';
import { useTranslation } from '@/hooks/use-translation';
import { ClipboardList } from 'lucide-react';

export function UserDataForm() {
  const { userData, setUserData } = useUserData();

  const { translatedText: title } = useTranslation('Your Health Profile');
  const { translatedText: description } = useTranslation('Tell us a bit about you to unlock personalized AI insights for your health journey. This data stays on your device.');
  const { translatedText: ageLabel } = useTranslation('Age');
  const { translatedText: weightLabel } = useTranslation('Weight (kg)');
  const { translatedText: heightFtLabel } = useTranslation('Height (ft)');
  const { translatedText: heightInLabel } = useTranslation('Height (in)');
  const { translatedText: insulinBrandLabel } = useTranslation('Insulin Brand');
  const { translatedText: selectBrandPlaceholder } = useTranslation('Select brand');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value, 10);
    setUserData(prev => ({ ...prev, [name]: isNaN(numValue) ? undefined : numValue }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start gap-4">
        <div className="bg-primary/10 p-3 rounded-full">
          <ClipboardList className="h-6 w-6 text-primary" />
        </div>
        <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="age">{ageLabel}</Label>
            <Input id="age" name="age" type="number" placeholder="e.g., 35" value={userData.age ?? ''} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">{weightLabel}</Label>
            <Input id="weight" name="weight" type="number" placeholder="e.g., 70" value={userData.weight ?? ''} onChange={handleChange} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="heightFt">{heightFtLabel}</Label>
            <Input id="heightFt" name="heightFt" type="number" placeholder="e.g., 5" value={userData.heightFt ?? ''} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="heightIn">{heightInLabel}</Label>
            <Input id="heightIn" name="heightIn" type="number" placeholder="e.g., 9" value={userData.heightIn ?? ''} onChange={handleChange} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="insulinBrand">{insulinBrandLabel}</Label>
          <Select name="insulinBrand" onValueChange={handleSelectChange('insulinBrand')} value={userData.insulinBrand}>
            <SelectTrigger id="insulinBrand">
              <SelectValue placeholder={selectBrandPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {INSULIN_BRANDS.map(brand => (
                <SelectItem key={brand} value={brand}>{brand}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
