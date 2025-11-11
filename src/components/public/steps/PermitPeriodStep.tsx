
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';

interface PermitPeriodStepProps {
  data: any;
  onChange: (data: any) => void;
}

export function PermitPeriodStep({ data, onChange }: PermitPeriodStepProps) {
  const [formData, setFormData] = useState({
    permit_period: data.permit_period || '',
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
          <CardTitle>Step 4: Permit Period</CardTitle>
          <CardDescription>
            Specify the period for which the permit is required
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="permit_period">4. Period for which permit is required</Label>
            <Select value={formData.permit_period} onValueChange={(value) => handleChange('permit_period', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select permit period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6_months">6 Months</SelectItem>
                <SelectItem value="1_year">1 Year</SelectItem>
                <SelectItem value="2_years">2 Years</SelectItem>
                <SelectItem value="3_years">3 Years</SelectItem>
                <SelectItem value="5_years">5 Years</SelectItem>
                <SelectItem value="10_years">10 Years</SelectItem>
                <SelectItem value="permanent">Permanent</SelectItem>
                <SelectItem value="other">Other (specify in description)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.permit_period === 'other' && (
            <div className="space-y-2">
              <Label htmlFor="permit_period_details">Specify Permit Period</Label>
              <Textarea
                id="permit_period_details"
                placeholder="Please specify the required permit period and justification"
                rows={3}
              />
            </div>
          )}

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">Important Information:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Permit periods are subject to approval and may be adjusted based on activity type</li>
              <li>• Some activities may require periodic reviews and permit renewals</li>
              <li>• Environmental monitoring may be required throughout the permit period</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
