import React, { useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertTriangle, FileText } from 'lucide-react';
import { usePrescribedActivities } from '@/hooks/usePrescribedActivities';

interface ActivityClassificationStepProps {
  data: any;
  onChange: (data: any) => void;
}

const ACTIVITY_LEVELS = [
  { value: 'Level 1', label: 'Level 1 - Low Impact Activities', description: 'Simple activities with minimal environmental impact' },
  { value: 'Level 2', label: 'Level 2 - Moderate Impact Activities', description: 'Moderate to complex activities requiring environmental assessment and review' },
  { value: 'Level 3', label: 'Level 3 - High Impact Activities', description: 'High-impact activities requiring comprehensive EIA and EIS' }
];


export function ActivityClassificationStep({ data, onChange }: ActivityClassificationStepProps) {
  const selectedLevel = ACTIVITY_LEVELS.find(level => level.value === data.activity_level);
  const { data: prescribedActivities, isLoading: activitiesLoading } = usePrescribedActivities();

  // Filter prescribed activities based on selected activity level
  const filteredActivities = useMemo(() => {
    if (!data.activity_level || !prescribedActivities) return [];
    
    const levelNumber = data.activity_level.includes('Level 1') ? 1 :
                       data.activity_level.includes('Level 2') ? 2 :
                       data.activity_level.includes('Level 3') ? 3 : null;
    
    if (!levelNumber) return [];
    
    return prescribedActivities.filter(activity => activity.level === levelNumber);
  }, [data.activity_level, prescribedActivities]);
  
  useEffect(() => {
    // Auto-update EIA/EIS requirements based on activity level
    const updates: any = {
      eia_required: ['Level 2', 'Level 3'].includes(data.activity_level),
      eis_required: data.activity_level === 'Level 3'
    };
    
    onChange(updates);
  }, [data.activity_level, onChange]);

  const getLevelColor = (level: string) => {
    const colors = {
      'Level 1': 'bg-green-100 text-green-800 border-green-200',
      'Level 2': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Level 3': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[level] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getRequirements = (level: string) => {
    const requirements = {
      'Level 1': [
        'Basic environmental screening',
        'Standard compliance documentation',
        'Processing: 30-45 days'
      ],
      'Level 2': [
        'Environmental Impact Assessment (EIA)',
        'Technical review and analysis',
        'Public consultation may be required',
        'Processing: 60-120 days'
      ],
      'Level 3': [
        'Comprehensive Environmental Impact Statement (EIS)',
        'Extensive public consultation process',
        'Multiple specialist assessments',
        'Independent technical review',
        'Processing: 120-180 days'
      ]
    };
    return requirements[level] || [];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Activity Classification
        </CardTitle>
        <CardDescription>
          Select the activity level and prescribed activity according to PNG Environment Act 2000
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="activity_level">Activity Level *</Label>
            <Select value={data.activity_level || ''} onValueChange={(value) => {
              console.log('📊 ActivityClassificationStep - activity_level selected:', value);
              onChange({ activity_level: value });
            }}>
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

          {/* Prescribed Activities Dropdown */}
          {data.activity_level && (
            <div className="space-y-2">
              <Label htmlFor="prescribed_activity">Prescribed Activity *</Label>
              <Select 
                value={data.prescribed_activity_id || ''} 
                onValueChange={(value) => {
                  const selectedActivity = filteredActivities.find(activity => activity.id === value);
                  console.log('📊 ActivityClassificationStep - prescribed_activity selected:', { value, selectedActivity });
                  const updates = { 
                    prescribed_activity_id: value,
                    activity_category: selectedActivity?.category_type,
                    activity_subcategory: selectedActivity?.sub_category,
                    activity_description: selectedActivity?.activity_description
                  };
                  console.log('📊 ActivityClassificationStep - sending updates:', updates);
                  onChange(updates);
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
        </div>

        {/* Activity Level Information */}
        {selectedLevel && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border ${getLevelColor(data.activity_level)}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold">{selectedLevel.label}</h4>
                  <p className="text-sm mt-1">{selectedLevel.description}</p>
                </div>
                <Badge variant="outline" className="border-current">
                  {data.activity_level}
                </Badge>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Assessment Requirements
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                {getRequirements(data.activity_level).map((requirement, index) => (
                  <li key={index}>• {requirement}</li>
                ))}
              </ul>
            </div>

            {/* Specific Requirements Notice */}
            {(['Level 2', 'Level 3'].includes(data.activity_level)) && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800">
                      {data.activity_level === 'Level 3' ? 'Public Consultation Required' : 'Assessment Requirements'}
                    </h4>
                    <p className="text-sm text-amber-700 mt-1">
                      {data.activity_level === 'Level 3' 
                        ? 'Extensive public consultation and Environmental Impact Statement (EIS) required.'
                        : 'Environmental Impact Assessment (EIA) required. Public consultation may be required depending on the specific activity and potential impacts.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {data.activity_level === 'Level 3' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-800">Environmental Impact Statement (EIS) Required</h4>
                    <p className="text-sm text-red-700 mt-1">
                      A comprehensive Environmental Impact Statement must be prepared and submitted. 
                      This includes detailed assessments of all environmental impacts, mitigation measures, 
                      and monitoring plans.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </CardContent>
    </Card>
  );
}