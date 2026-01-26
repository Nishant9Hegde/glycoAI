'use client';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { UploadCloud } from 'lucide-react';
import Image from 'next/image';
import type { HealthProfileData } from '@/app/health-profile/page';

interface Step3Props {
    formData: HealthProfileData;
    updateFormData: (data: Partial<HealthProfileData>) => void;
}

export function Step3({ formData, updateFormData }: Step3Props) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      updateFormData({ glucoseDataFile: event.target.files[0] });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Upload Glucose Data</h2>
        <p className="text-muted-foreground">Upload an image (JPG or PNG) of your blood glucose data from the past week.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="glucose-upload">Glucose Data Image</Label>
        <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
          <div className="text-center">
            {formData.glucoseDataFile ? (
                <Image src={URL.createObjectURL(formData.glucoseDataFile)} alt="Preview" width={200} height={200} className="mx-auto mb-4 rounded-md object-contain" />
            ) : (
                <UploadCloud className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
            )}
            <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
              <label
                htmlFor="glucose-upload"
                className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary/80"
              >
                <span>Upload a file</span>
                <Input id="glucose-upload" name="glucose-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/jpeg, image/png" />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs leading-5 text-gray-600">PNG, JPG up to 10MB</p>
            {formData.glucoseDataFile && <p className="text-sm mt-2 font-medium text-gray-900">Selected file: {formData.glucoseDataFile.name}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
