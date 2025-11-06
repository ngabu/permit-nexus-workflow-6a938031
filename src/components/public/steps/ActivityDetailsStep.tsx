
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { usePrescribedActivities } from '@/hooks/usePrescribedActivities';

interface ActivityDetailsStepProps {
  data: any;
  onChange: (data: any) => void;
}

export function ActivityDetailsStep({ data, onChange }: ActivityDetailsStepProps) {
  const { data: prescribedActivities, isLoading } = usePrescribedActivities();
  const [formData, setFormData] = useState({
    proposed_works_description: data.proposed_works_description || '',
    activity_location: data.activity_location || '',
    estimated_cost_kina: data.estimated_cost_kina || '',
    commencement_date: data.commencement_date || '',
    completion_date: data.completion_date || '',
    activity_classification: data.activity_classification || '',
    activity_category: data.activity_category || '',
    activity_subcategory: data.activity_subcategory || '',
  });

  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedActivity = prescribedActivities?.find(
    activity => activity.id === formData.activity_classification
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Step 3: Details of the Activity</CardTitle>
          <CardDescription>
            Provide detailed information about your proposed activity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="proposed_works_description">3.1 Brief Description of the Proposed Works</Label>
            <Textarea
              id="proposed_works_description"
              value={formData.proposed_works_description}
              onChange={(e) => handleChange('proposed_works_description', e.target.value)}
              placeholder="Provide a brief description of the proposed works"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity_location">3.2 Location of Activity</Label>
            <Textarea
              id="activity_location"
              value={formData.activity_location}
              onChange={(e) => handleChange('activity_location', e.target.value)}
              placeholder="Provide detailed location information including coordinates if available"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimated_cost_kina">3.3 Estimated Cost of Works in Kina</Label>
            <Input
              id="estimated_cost_kina"
              type="number"
              value={formData.estimated_cost_kina}
              onChange={(e) => handleChange('estimated_cost_kina', e.target.value)}
              placeholder="Enter estimated cost in PGK"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="commencement_date">3.4(a) Commencement Date</Label>
              <Input
                id="commencement_date"
                type="date"
                value={formData.commencement_date}
                onChange={(e) => handleChange('commencement_date', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="completion_date">3.4(b) Completion Date</Label>
              <Input
                id="completion_date"
                type="date"
                value={formData.completion_date}
                onChange={(e) => handleChange('completion_date', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity_classification">3.5 Classification of Activity</Label>
            <Select 
              value={formData.activity_classification} 
              onValueChange={(value) => {
                const activity = prescribedActivities?.find(a => a.id === value);
                handleChange('activity_classification', value);
                if (activity) {
                  handleChange('activity_category', activity.category_type);
                  handleChange('activity_subcategory', activity.category_number.toString());
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select prescribed activity" />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="loading" disabled>Loading activities...</SelectItem>
                ) : (
                  prescribedActivities?.map((activity) => (
                    <SelectItem key={activity.id} value={activity.id}>
                      {activity.category_number} - {activity.activity_description}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedActivity && (
            <div className="p-4 bg-forest-50 rounded-lg border border-forest-200">
              <h4 className="font-medium text-forest-800 mb-2">Selected Activity Details:</h4>
              <p><strong>Category:</strong> {selectedActivity.category_type}</p>
              <p><strong>Sub-category:</strong> {selectedActivity.sub_category}</p>
              <p><strong>Level:</strong> Level {selectedActivity.level}</p>
              <p><strong>Description:</strong> {selectedActivity.activity_description}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
