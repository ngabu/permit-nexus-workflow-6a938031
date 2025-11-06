
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { usePermitApplications } from './hooks/usePermitApplications';
import { useComplianceStaff } from './hooks/useComplianceStaff';
import { PermitApplicationCard } from './PermitApplicationCard';

export function PermitApplicationsList() {
  const [assigningTo, setAssigningTo] = useState<string | null>(null);
  const { profile } = useAuth();
  const { toast } = useToast();
  const { applications, loading } = usePermitApplications();
  const { staff } = useComplianceStaff();

  const assignToOfficer = async (permitId: string, officerId: string) => {
    setAssigningTo(permitId);
    try {
      // You'll need to add assigned_officer_id column to permits table
      // For now, this is a placeholder
      toast({
        title: "Feature Coming Soon",
        description: "Assignment feature will be implemented with proper database schema",
      });
    } catch (error) {
      console.error('Error assigning permit:', error);
      toast({
        title: "Error",
        description: "Failed to assign permit",
        variant: "destructive",
      });
    } finally {
      setAssigningTo(null);
    }
  };

  const canAssignOfficer = profile?.operational_unit === 'compliance' && profile?.staff_position === 'manager';

  if (loading) {
    return <div className="flex justify-center p-8">Loading applications...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Permit Applications
        </CardTitle>
        <CardDescription>
          {canAssignOfficer 
            ? "Review and assign permit applications to compliance officers"
            : "View assigned permit applications"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {applications.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No permit applications found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <PermitApplicationCard
                key={application.id}
                application={application}
                isManager={canAssignOfficer}
                staff={staff}
                assigningTo={assigningTo}
                onAssign={assignToOfficer}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
