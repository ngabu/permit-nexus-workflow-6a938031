import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertTriangle, FileText } from 'lucide-react';
import { usePrescribedActivities } from '@/hooks/usePrescribedActivities';

interface RegistryActivityClassificationFormProps {
  data: any;
  onChange: (data: any) => void;
}

const ACTIVITY_LEVELS = [
  { value: 'Level 1', label: 'Level 1 - Low Impact Activities', description: 'Simple activities with minimal environmental impact' },
  { value: 'Level 2', label: 'Level 2 - Moderate Impact Activities', description: 'Moderate to complex activities requiring environmental assessment and review' },
  { value: 'Level 3', label: 'Level 3 - High Impact Activities', description: 'High-impact activities requiring comprehensive EIA and EIS' }
];

export function RegistryActivityClassificationForm({ data, onChange }: RegistryActivityClassificationFormProps) {
  const { data: prescribedActivities, isLoading: activitiesLoading } = usePrescribedActivities();
  
  const filteredActivities = React.useMemo(() => {
    if (!data.activity_level || !prescribedActivities) return [];
    
    const levelNumber = data.activity_level.includes('Level 1') ? 1 :
                       data.activity_level.includes('Level 2') ? 2 :
                       data.activity_level.includes('Level 3') ? 3 : null;
    
    if (!levelNumber) return [];
    
    return prescribedActivities.filter(activity => activity.level === levelNumber);
  }, [data.activity_level, prescribedActivities]);

  const selectedActivity = prescribedActivities?.find(a => a.id === data.activity_id);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Activity Classification
        </CardTitle>
        <CardDescription>
          Registry Assessment: Classify the activity according to PNG Environment Act 2000
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="activity_level">Activity Level *</Label>
            <Select 
              value={data.activity_level || ''} 
              onValueChange={(value) => onChange({ activity_level: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select activity level" />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{level.label}</span>
                      <span className="text-xs text-muted-foreground">{level.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {data.activity_level && (
            <div className="space-y-2">
              <Label htmlFor="prescribed_activity">Prescribed Activity *</Label>
              <Select 
                value={data.activity_id || ''} 
                onValueChange={(value) => {
                  const selectedActivity = filteredActivities.find(activity => activity.id === value);
                  onChange({ 
                    activity_id: value,
                    activity_category: selectedActivity?.category_type,
                    activity_subcategory: selectedActivity?.sub_category,
                    activity_classification: selectedActivity?.activity_description
                  });
                }}
                disabled={activitiesLoading || filteredActivities.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    activitiesLoading ? "Loading activities..." :
                    filteredActivities.length === 0 ? "No activities available for this level" :
                    "Select prescribed activity"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {filteredActivities.map((activity) => (
                    <SelectItem key={activity.id} value={activity.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{activity.category_number} - {activity.category_type}</span>
                        <span className="text-xs text-muted-foreground">{activity.activity_description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedActivity && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{selectedActivity.category_type}</Badge>
                  <Badge variant="secondary">Category {selectedActivity.category_number}</Badge>
                  <Badge variant="secondary">Level {selectedActivity.level}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Description:</span> {selectedActivity.activity_description}
                </p>
                {selectedActivity.sub_category && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Subcategory:</span> {selectedActivity.sub_category}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
