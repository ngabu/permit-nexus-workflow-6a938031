
import { SimpleHeader } from '@/components/SimpleHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KPICard } from '@/components/kpi-card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Settings, Shield, Database, Activity, TrendingUp, UserCheck, AlertCircle, BarChart3, FileText, Monitor, Globe, Server, Lock, Building } from 'lucide-react';
import { UserManagement } from '@/components/admin/UserManagement';
import { EntityManagement } from '@/components/admin/EntityManagement';
import { PrescribedActivitiesManagement } from '@/components/admin/PrescribedActivitiesManagement';
import { ActivityLevelsManagement } from '@/components/admin/ActivityLevelsManagement';
import { PermitTypesManagement } from '@/components/admin/PermitTypesManagement';
import { FeeManagement } from '@/components/admin/FeeManagement';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminStats } from '@/hooks/useAdminStats';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { PermitApplicationsMap } from '@/components/public/PermitApplicationsMap';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const { stats, loading } = useAdminStats();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-background">
      <SimpleHeader />
      <main className="p-6">
        <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-forest-800">Systems Administration</h1>
            <p className="text-forest-600 mt-1">Comprehensive system management and oversight panel</p>
            <p className="text-sm text-forest-500 mt-1">
              Logged in as: {profile?.first_name} {profile?.last_name} ({profile?.user_type})
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link to="/system-health">
                <Monitor className="w-4 h-4 mr-2" />
                System Health
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/security-dashboard">
                <Shield className="w-4 h-4 mr-2" />
                Security Dashboard
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/audit-logs">
                <Shield className="w-4 h-4 mr-2" />
                Audit Logs
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/database-administration">
                <Database className="w-4 h-4 mr-2" />
                Database Administration
              </Link>
            </Button>
          </div>
        </div>

        {/* System Overview KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KPICard
            title="Total Users"
            value={loading ? "..." : stats.totalUsers.toString()}
            change={stats.activeUsers - stats.suspendedUsers}
            trend="up"
            icon={<Users className="w-5 h-5" />}
          />
          <KPICard
            title="Entities"
            value={loading ? "..." : stats.totalEntities.toString()}
            change={stats.totalEntities > 0 ? Math.round(stats.totalEntities * 0.1) : 0}
            trend="up"
            icon={<Building className="w-5 h-5" />}
          />
          <KPICard
            title="System Logs"
            value={loading ? "..." : "Active"}
            change={100}
            trend="up"
            icon={<Activity className="w-5 h-5" />}
          />
          <KPICard
            title="Security Alerts"
            value={loading ? "..." : stats.suspendedUsers.toString()}
            change={-stats.suspendedUsers}
            trend="down"
            icon={<AlertCircle className="w-5 h-5" />}
          />
        </div>


        {/* Main Admin Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 h-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="entities" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              Entities
            </TabsTrigger>
            <TabsTrigger value="activities" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Activities
            </TabsTrigger>
            <TabsTrigger value="levels" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Levels
            </TabsTrigger>
            <TabsTrigger value="permit-types" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Permit Types
            </TabsTrigger>
            <TabsTrigger value="fees" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Fees
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Approved Permits Map */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-forest-800 flex items-center">
                    <Globe className="w-5 h-5 mr-2" />
                    Approved Permits Map
                  </CardTitle>
                  <CardDescription>Geospatial view of all approved permits with GIS layers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[500px]">
                    <PermitApplicationsMap 
                      showAllApplications={true}
                      defaultStatuses={['approved']}
                      hideDrawingTools={true}
                      customTitle="Approved Permits"
                      customDescription="View all approved permits on the map with filtering options"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Administrative Functions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-forest-800 flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Administrative Functions
                  </CardTitle>
                  <CardDescription>Core administrative capabilities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-auto p-4 hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={() => setActiveTab('users')}
                  >
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-forest-600" />
                      <div className="text-left">
                        <div className="font-medium">User & Role Management</div>
                        <div className="text-sm text-forest-500">Create, edit, and manage user accounts and permissions</div>
                      </div>
                    </div>
                  </Button>
                  
                  <Button asChild variant="outline" className="w-full justify-start h-auto p-4 hover:bg-accent hover:text-accent-foreground transition-colors">
                    <Link to="/database-administration">
                      <div className="flex items-center space-x-3">
                        <Database className="w-5 h-5 text-forest-600" />
                        <div className="text-left">
                          <div className="font-medium">Database Administration</div>
                          <div className="text-sm text-forest-500">Database maintenance, backups, and optimization</div>
                        </div>
                      </div>
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="w-full justify-start h-auto p-4 hover:bg-accent hover:text-accent-foreground transition-colors">
                    <Link to="/security-dashboard">
                      <div className="flex items-center space-x-3">
                        <Shield className="w-5 h-5 text-forest-600" />
                        <div className="text-left">
                          <div className="font-medium">Security Configuration</div>
                          <div className="text-sm text-forest-500">Security policies, authentication, and access control</div>
                        </div>
                      </div>
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="w-full justify-start h-auto p-4 hover:bg-accent hover:text-accent-foreground transition-colors">
                    <Link to="/system-health">
                      <div className="flex items-center space-x-3">
                        <Monitor className="w-5 h-5 text-forest-600" />
                        <div className="text-left">
                          <div className="font-medium">System Monitoring</div>
                          <div className="text-sm text-forest-500">Performance monitoring and system health checks</div>
                        </div>
                      </div>
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="entities" className="space-y-6">
            <EntityManagement />
          </TabsContent>

          <TabsContent value="activities" className="space-y-6">
            <PrescribedActivitiesManagement />
          </TabsContent>

          <TabsContent value="levels" className="space-y-6">
            <ActivityLevelsManagement />
          </TabsContent>

          <TabsContent value="permit-types" className="space-y-6">
            <PermitTypesManagement />
          </TabsContent>

          <TabsContent value="fees" className="space-y-6">
            <FeeManagement />
          </TabsContent>
        </Tabs>
        </div>
      </main>
    </div>
  );
}
