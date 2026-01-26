'use client';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import type { HealthProfileData } from '@/app/health-profile/page';

interface Step1Props {
    formData: HealthProfileData;
    updateFormData: (data: Partial<HealthProfileData>) => void;
}

export function Step1({ formData, updateFormData }: Step1Props) {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateFormData({ [e.target.name]: e.target.value });
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Your Health Profile</h2>
                <p className="text-muted-foreground">This information will help us personalize your experience.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input id="age" name="age" type="number" placeholder="e.g., 35" value={formData.age} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input id="weight" name="weight" type="number" placeholder="e.g., 70" value={formData.weight} onChange={handleInputChange} />
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="heightFt">Height (ft)</Label>
                    <Input id="heightFt" name="heightFt" type="number" placeholder="e.g., 5" value={formData.heightFt} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="heightIn">Height (in)</Label>
                    <Input id="heightIn" name="heightIn" type="number" placeholder="e.g., 9" value={formData.heightIn} onChange={handleInputChange} />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="dateOfDiagnosis">Date of Diagnosis</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !formData.dateOfDiagnosis && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.dateOfDiagnosis ? format(formData.dateOfDiagnosis, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={formData.dateOfDiagnosis}
                            onSelect={(date) => updateFormData({ dateOfDiagnosis: date || new Date() })}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}