
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Building, User, Clock } from 'lucide-react';
import { PermitApplication, ComplianceStaff } from './types';

interface PermitApplicationCardProps {
  application: PermitApplication;
  isManager: boolean;
  staff: ComplianceStaff[];
  assigningTo: string | null;
  onAssign: (permitId: string, officerId: string) => void;
}

export function PermitApplicationCard({
  application,
  isManager,
  staff,
  assigningTo,
  onAssign
}: PermitApplicationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg text-forest-800">{application.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {application.permit_number || 'No permit number'}
            </p>
          </div>
          <Badge className={getStatusColor(application.status)}>
            {application.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Building className="w-4 h-4 text-forest-600" />
            <div>
              <p className="text-sm font-medium">{application.entity.name}</p>
              <p className="text-xs text-muted-foreground">{application.entity.entity_type}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-forest-600" />
            <div>
              <p className="text-sm font-medium">Applied</p>
              <p className="text-xs text-muted-foreground">
                {application.application_date 
                  ? new Date(application.application_date).toLocaleDateString()
                  : 'N/A'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-forest-600" />
          <div>
            <p className="text-sm font-medium">
              {application.assigned_officer_name ? (
                <>Assigned to: {application.assigned_officer_name}</>
              ) : (
                'Unassigned'
              )}
            </p>
            {application.assigned_officer_email && (
              <p className="text-xs text-muted-foreground">{application.assigned_officer_email}</p>
            )}
          </div>
        </div>

        {isManager && (
          <div className="pt-3 border-t">
            <div className="flex items-center space-x-2">
              <Select onValueChange={(value) => onAssign(application.id, value)}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Assign to officer..." />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((officer) => (
                    <SelectItem key={officer.id} value={officer.id}>
                      {officer.full_name || officer.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {assigningTo === application.id && (
                <Clock className="w-4 h-4 animate-spin text-forest-600" />
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
