import { Badge } from '@/components/ui/badge';

interface AssessmentStatusBadgeProps {
  status: string;
  score?: number | null;
}

export function AssessmentStatusBadge({ status, score }: AssessmentStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { 
          label: 'Pending Assignment', 
          variant: 'info' as const
        };
      case 'in_progress':
        return { 
          label: 'In Progress', 
          variant: 'warning' as const
        };
      case 'passed':
        return { 
          label: 'Passed', 
          variant: 'success' as const
        };
      case 'failed':
        return { 
          label: 'Failed', 
          variant: 'destructive' as const
        };
      case 'requires_clarification':
        return { 
          label: 'Requires Clarification', 
          variant: 'outline' as const
        };
      default:
        return { 
          label: status, 
          variant: 'secondary' as const
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className="flex items-center gap-2">
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
      {score !== null && score !== undefined && (
        <Badge variant="outline">
          Score: {score}%
        </Badge>
      )}
    </div>
  );
}