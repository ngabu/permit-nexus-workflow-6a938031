
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';

interface BasicInformationStepProps {
  data: any;
  onChange: (data: any) => void;
}

export function BasicInformationStep({ data, onChange }: BasicInformationStepProps) {
  const [formData, setFormData] = useState({
    title: data.title || '',
    permit_type: data.permit_type || '',
    description: data.description || '',
  });

  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Step 1: Basic Information</CardTitle>
          <CardDescription>
            Provide the basic details about your permit application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Application Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter a descriptive title for your application"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="permit_type">Permit Type *</Label>
            <Select value={formData.permit_type} onValueChange={(value) => handleChange('permit_type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select permit type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="environmental_permit">Environmental Permit</SelectItem>
                <SelectItem value="development_permit">Development Permit</SelectItem>
                <SelectItem value="mining_permit">Mining Permit</SelectItem>
                <SelectItem value="forestry_permit">Forestry Permit</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Brief Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Provide a brief description of your project"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
