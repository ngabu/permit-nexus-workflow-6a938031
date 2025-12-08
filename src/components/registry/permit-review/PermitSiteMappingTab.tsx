import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { IntentBoundaryMapDisplay } from '@/components/registry/read-only/IntentBoundaryMapDisplay';

interface PermitSiteMappingTabProps {
  application: {
    coordinates?: any;
    project_boundary?: any;
    activity_location?: string | null;
    province?: string | null;
    district?: string | null;
    llg?: string | null;
  };
}

export function PermitSiteMappingTab({ application }: PermitSiteMappingTabProps) {
  return (
    <Card>
      <CardHeader className="bg-blue-500/10">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="w-5 h-5 text-blue-600" />
          Site Mapping & Location
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Location Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Province</p>
              <p className="font-medium">{application.province || 'Not specified'}</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">District</p>
              <p className="font-medium">{application.district || 'Not specified'}</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">LLG</p>
              <p className="font-medium">{application.llg || 'Not specified'}</p>
            </div>
          </div>

          {application.activity_location && (
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Activity Location</p>
              <p className="font-medium">{application.activity_location}</p>
            </div>
          )}

          {/* Map Display */}
          <div className="border rounded-lg overflow-hidden">
            <IntentBoundaryMapDisplay projectBoundary={application.project_boundary} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
