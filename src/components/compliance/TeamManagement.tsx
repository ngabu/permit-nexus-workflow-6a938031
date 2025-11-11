import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, Mail } from 'lucide-react';
import { useComplianceStaff } from './hooks/useComplianceStaff';
import { useComplianceAssessments } from './hooks/useComplianceAssessments';

export function TeamManagement() {
  const { staff } = useComplianceStaff();
  const { assessments } = useComplianceAssessments();

  const officers = staff.filter(s => s.staff_position === 'officer');
  
  // Calculate workload for each officer
  const getOfficerWorkload = (officerId: string) => {
    return assessments.filter(a => a.assessed_by === officerId && a.assessment_status === 'in_progress').length;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Compliance Team Management
        </CardTitle>
        <CardDescription>
          Active compliance officers and their current workload
        </CardDescription>
      </CardHeader>
      <CardContent>
        {officers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No active compliance officers found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {officers.map((officer) => {
              const workload = getOfficerWorkload(officer.id);
              return (
                <div
                  key={officer.id}
                  className="flex items-center justify-between p-3 bg-background border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">
                        {officer.full_name || 'No name provided'}
                      </h4>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="w-3 h-3 mr-1" />
                        {officer.email}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      Compliance Officer
                    </Badge>
                    <div className="flex items-center space-x-1">
                      <Badge 
                        variant={workload > 3 ? "destructive" : workload > 1 ? "secondary" : "default"}
                      >
                        {workload} active
                      </Badge>
                      <Badge 
                        variant={officer.is_active ? "default" : "outline"}
                      >
                        {officer.is_active ? "Active" : "Suspended"}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
