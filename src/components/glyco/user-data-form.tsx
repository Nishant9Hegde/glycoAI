
'use client';

import { useUserData } from '@/context/user-data-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { INSULIN_BRANDS } from '@/lib/constants';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useTranslation } from '@/hooks/use-translation';

export function UserDataForm() {
  const { userData, setUserData } = useUserData();
  const avatarImage = PlaceHolderImages.find(img => img.id === 'user-avatar');

  const { translatedText: title } = useTranslation('Your Biodata');
  const { translatedText: description } = useTranslation('This information helps the AI provide personalized advice. It is not stored anywhere.');
  const { translatedText: ageLabel } = useTranslation('Age');
  const { translatedText: weightLabel } = useTranslation('Weight (kg)');
  const { translatedText: heightLabel } = useTranslation('Height (cm)');
  const { translatedText: insulinBrandLabel } = useTranslation('Insulin Brand');
  const { translatedText: selectBrandPlaceholder } = useTranslation('Select brand');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value ? parseInt(value, 10) : '' }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-16 w-16">
          {avatarImage && <AvatarImage src={avatarImage.imageUrl} alt={avatarImage.description} data-ai-hint={avatarImage.imageHint}/>}
          <AvatarFallback>YOU</AvatarFallback>
        </Avatar>
        <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="age">{ageLabel}</Label>
            <Input id="age" name="age" type="number" placeholder="e.g., 35" value={userData.age || ''} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">{weightLabel}</Label>
            <Input id="weight" name="weight" type="number" placeholder="e.g., 70" value={userData.weight || ''} onChange={handleChange} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="height">{heightLabel}</Label>
          <Input id="height" name="height" type="number" placeholder="e.g., 175" value={userData.height || ''} onChange={handleChange} />
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
