
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ComplianceStaff {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  operational_unit: string | null;
  staff_position: string | null;
  is_active: boolean | null;
  created_at: string | null;
}

export function ComplianceStaffList() {
  const [staff, setStaff] = useState<ComplianceStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchComplianceStaff();
  }, []);

  const fetchComplianceStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, user_type, staff_unit, staff_position, is_active, created_at')
        .eq('user_type', 'staff')
        .eq('staff_unit', 'compliance')
        .order('first_name');

      if (error) throw error;
      
      // Transform data to match expected interface
      const transformedData = (data || []).map(item => ({
        ...item,
        full_name: item.first_name && item.last_name 
          ? `${item.first_name} ${item.last_name}` 
          : item.first_name || item.last_name,
        role: item.user_type,
        operational_unit: item.staff_unit
      }));
      
      setStaff(transformedData);
    } catch (error) {
      console.error('Error fetching compliance staff:', error);
      toast({
        title: "Error",
        description: "Failed to load compliance staff",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading staff...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Compliance Team
        </CardTitle>
        <CardDescription>Manage compliance officers and their assignments</CardDescription>
      </CardHeader>
      <CardContent>
        {staff.length === 0 ? (
          <div className="text-center py-8">
            <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No compliance staff found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {staff.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-forest-50 rounded-lg">
                <div>
                  <p className="font-medium text-forest-800">
                    {member.full_name || member.email}
                  </p>
                  <p className="text-sm text-forest-600">{member.email}</p>
                  <p className="text-xs text-forest-500">
                    Created: {member.created_at ? new Date(member.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {member.staff_position && (
                    <Badge variant="outline">
                      {member.staff_position}
                    </Badge>
                  )}
                  <Badge variant={member.is_active ? "default" : "secondary"}>
                    {member.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
