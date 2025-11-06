import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, Mail } from 'lucide-react';
import { useRegistryStaff } from './hooks/useRegistryStaff';
import { usePermitsForAssessment } from './hooks/usePermitsForAssessment';

export function TeamManagement() {
  const { staff, loading } = useRegistryStaff();
  const { permits } = usePermitsForAssessment();

  if (loading) {
    return <div className="flex justify-center p-8">Loading team...</div>;
  }

  const officers = staff.filter(s => s.staff_position === 'officer');
  
  // Calculate workload for each officer
  const getOfficerWorkload = (officerId: string) => {
    return permits.filter(p => p.assigned_officer_id === officerId && p.status === 'under_initial_review').length;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Registry Team Management
        </CardTitle>
        <CardDescription>
          Active registry officers and their current workload
        </CardDescription>
      </CardHeader>
      <CardContent>
        {officers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No active registry officers found</p>
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
                      Registry Officer
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