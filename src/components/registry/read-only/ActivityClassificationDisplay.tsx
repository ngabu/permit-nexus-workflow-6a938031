import { Badge } from '@/components/ui/badge';
import { usePrescribedActivities } from '@/hooks/usePrescribedActivities';

interface ActivityClassificationDisplayProps {
  activityId: string;
  activityLevel?: string | null;
  getLevelColor: (level: string) => string;
}

export function ActivityClassificationDisplay({ 
  activityId, 
  activityLevel, 
  getLevelColor 
}: ActivityClassificationDisplayProps) {
  const { data: activities, isLoading } = usePrescribedActivities();

  const getActivityInfo = (id: string) => {
    if (!activities) return null;
    return activities.find(activity => activity.id === id);
  };

  if (isLoading) {
    return <Badge variant="outline">Loading...</Badge>;
  }

  const activityInfo = getActivityInfo(activityId);
  
  if (!activityInfo) {
    return <Badge variant="outline">Activity not found</Badge>;
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge variant="outline" className="font-medium">
        {activityInfo.category_type}
      </Badge>
      <Badge variant="secondary" className="text-xs">
        Category {activityInfo.category_number}
      </Badge>
      <Badge variant="secondary" className="text-xs">
        Level {activityInfo.level}
      </Badge>
      {activityLevel && (
        <Badge className={getLevelColor(activityLevel)}>
          {activityLevel}
        </Badge>
      )}
      <div className="w-full mt-2">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">Description:</span> {activityInfo.activity_description}
        </p>
        {activityInfo.sub_category && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Subcategory:</span> {activityInfo.sub_category}
          </p>
        )}
      </div>
    </div>
  );
}