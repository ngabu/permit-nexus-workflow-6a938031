import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, Building2, Briefcase } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function OrganizationalManagement() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [orgData, setOrgData] = useState<any>({
    staff: [],
    units: [],
    summary: {},
  });

  useEffect(() => {
    fetchOrganizationalData();
  }, []);

  const fetchOrganizationalData = async () => {
    try {
      setLoading(true);

      // Fetch all staff profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'staff')
        .order('staff_unit', { ascending: true });

      // Process organizational data
      const staffList = profiles || [];
      const unitsSummary = calculateUnitsSummary(staffList);
      const overallSummary = calculateOverallSummary(staffList);

      setOrgData({
        staff: staffList,
        units: unitsSummary,
        summary: overallSummary,
      });
    } catch (error) {
      console.error('Error fetching organizational data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch organizational data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateUnitsSummary = (staff: any[]) => {
    const units = ['registry', 'compliance', 'revenue', 'finance', 'directorate'];
    return units.map(unit => {
      const unitStaff = staff.filter(s => s.staff_unit === unit);
      const managers = unitStaff.filter(s => s.staff_position === 'manager').length;
      const officers = unitStaff.filter(s => s.staff_position === 'officer').length;
      const directors = unitStaff.filter(s => s.staff_position === 'director').length;

      return {
        unit,
        total: unitStaff.length,
        managers,
        officers,
        directors,
        staff: unitStaff,
      };
    });
  };

  const calculateOverallSummary = (staff: any[]) => {
    return {
      totalStaff: staff.length,
      totalManagers: staff.filter(s => s.staff_position === 'manager').length,
      totalOfficers: staff.filter(s => s.staff_position === 'officer').length,
      totalDirectors: staff.filter(s => s.staff_position === 'director').length,
      activeUsers: staff.filter(s => s.email).length,
    };
  };

  const getPositionBadgeVariant = (position: string) => {
    switch (position) {
      case 'director':
      case 'managing_director':
        return 'default';
      case 'manager':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Organizational Management</h1>
          <p className="text-muted-foreground mt-1">
            Staff structure, resource allocation, and organizational insights
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{orgData.summary.totalStaff || 0}</span>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Directors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{orgData.summary.totalDirectors || 0}</span>
                <Briefcase className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Managers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{orgData.summary.totalManagers || 0}</span>
                <UserCheck className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Officers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{orgData.summary.totalOfficers || 0}</span>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{orgData.summary.activeUsers || 0}</span>
                <UserCheck className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="units" className="w-full">
          <TabsList>
            <TabsTrigger value="units">By Unit</TabsTrigger>
            <TabsTrigger value="positions">By Position</TabsTrigger>
            <TabsTrigger value="directory">Staff Directory</TabsTrigger>
          </TabsList>

          <TabsContent value="units" className="space-y-4">
            {orgData.units.map((unit: any) => (
              <Card key={unit.unit}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-6 h-6 text-primary" />
                      <div>
                        <CardTitle className="capitalize">{unit.unit} Unit</CardTitle>
                        <CardDescription>{unit.total} staff members</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      {unit.directors > 0 && (
                        <Badge variant="default">{unit.directors} Director{unit.directors !== 1 ? 's' : ''}</Badge>
                      )}
                      {unit.managers > 0 && (
                        <Badge variant="secondary">{unit.managers} Manager{unit.managers !== 1 ? 's' : ''}</Badge>
                      )}
                      {unit.officers > 0 && (
                        <Badge variant="outline">{unit.officers} Officer{unit.officers !== 1 ? 's' : ''}</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {unit.staff.map((staff: any) => (
                      <div key={staff.user_id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="font-medium">{staff.full_name || 'Unknown'}</div>
                          <Badge variant={getPositionBadgeVariant(staff.staff_position)}>
                            {staff.staff_position}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">{staff.email || 'No email'}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="positions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Staff by Position</CardTitle>
                <CardDescription>Organizational hierarchy and structure</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Directors */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      Directors & Managing Director
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {orgData.staff
                        .filter((s: any) => s.staff_position === 'director' || s.staff_position === 'managing_director')
                        .map((staff: any) => (
                          <div key={staff.user_id} className="p-4 border rounded-lg bg-purple-50 dark:bg-purple-950/20">
                            <div className="font-medium">{staff.full_name || 'Unknown'}</div>
                            <div className="text-sm text-muted-foreground capitalize">{staff.staff_unit} Unit</div>
                            <div className="text-sm text-muted-foreground">{staff.email}</div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Managers */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <UserCheck className="w-5 h-5" />
                      Managers
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {orgData.staff
                        .filter((s: any) => s.staff_position === 'manager')
                        .map((staff: any) => (
                          <div key={staff.user_id} className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                            <div className="font-medium">{staff.full_name || 'Unknown'}</div>
                            <div className="text-sm text-muted-foreground capitalize">{staff.staff_unit} Unit</div>
                            <div className="text-sm text-muted-foreground">{staff.email}</div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Officers */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Officers
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {orgData.staff
                        .filter((s: any) => s.staff_position === 'officer')
                        .map((staff: any) => (
                          <div key={staff.user_id} className="p-3 border rounded-lg">
                            <div className="font-medium text-sm">{staff.full_name || 'Unknown'}</div>
                            <div className="text-xs text-muted-foreground capitalize">{staff.staff_unit}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="directory" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Complete Staff Directory</CardTitle>
                <CardDescription>Alphabetical listing of all staff members</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {orgData.staff
                    .sort((a: any, b: any) => (a.full_name || '').localeCompare(b.full_name || ''))
                    .map((staff: any) => (
                      <div key={staff.user_id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="font-semibold text-primary">
                              {(staff.full_name || 'U')[0].toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{staff.full_name || 'Unknown'}</div>
                            <div className="text-sm text-muted-foreground">{staff.email || 'No email'}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="capitalize">{staff.staff_unit}</Badge>
                          <Badge variant={getPositionBadgeVariant(staff.staff_position)}>
                            {staff.staff_position}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
