
import { SimpleHeader } from '@/components/SimpleHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KPICard } from '@/components/kpi-card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Settings, Shield, Database, Activity, TrendingUp, UserCheck, AlertCircle, BarChart3, FileText, Monitor, Globe, Server, Lock, Gauge, Building } from 'lucide-react';
import { StaffManagement } from '@/components/staff-management';
import { AuditLogs } from '@/components/audit-logs';
import { SystemMetrics } from '@/components/system-metrics';
import { UserManagement } from '@/components/admin/UserManagement';
import { EntityManagement } from '@/components/admin/EntityManagement';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminStats } from '@/hooks/useAdminStats';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const { stats, loading } = useAdminStats();

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
            <Button variant="outline" className="border-forest-200 text-forest-700">
              <Monitor className="w-4 h-4 mr-2" />
              System Health
            </Button>
            <Button className="bg-gradient-to-r from-forest-600 to-nature-600 hover:from-forest-700 hover:to-nature-700">
              <Shield className="w-4 h-4 mr-2" />
              Security Dashboard
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
            title="Active Applications"
            value={loading ? "..." : (stats.submittedApplications + stats.underReviewApplications).toString()}
            change={stats.approvedApplications}
            trend="up"
            icon={<Activity className="w-5 h-5" />}
          />
          <KPICard
            title="Total Entities"
            value={loading ? "..." : stats.totalEntities.toString()}
            change={stats.totalEntities}
            trend="up"
            icon={<Building className="w-5 h-5" />}
          />
          <KPICard
            title="Security Alerts"
            value={loading ? "..." : stats.suspendedUsers.toString()}
            change={-stats.suspendedUsers}
            trend="down"
            icon={<AlertCircle className="w-5 h-5" />}
          />
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Card className="border-forest-200 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-forest-800">User Management</h3>
                  <p className="text-sm text-forest-600">Manage users, roles & permissions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-forest-200 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-forest-800">Application Overview</h3>
                  <p className="text-sm text-forest-600">Monitor all permit applications</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-forest-200 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Database className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-forest-800">Database Admin</h3>
                  <p className="text-sm text-forest-600">Database maintenance & backup</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-forest-200 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Lock className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-forest-800">Security Center</h3>
                  <p className="text-sm text-forest-600">Security policies & monitoring</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Admin Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="staff" className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="entities" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              Entity Management
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Audit & Security
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              System Metrics
            </TabsTrigger>
            <TabsTrigger value="operations" className="flex items-center gap-2">
              <Gauge className="w-4 h-4" />
              Operations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Access Matrix */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-forest-800 flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Unit Access Overview
                  </CardTitle>
                  <CardDescription>Access permissions across organizational units</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { unit: 'Registry Unit', staff: stats.staffUsers, access: 'Full Application Processing', status: 'Active' },
                    { unit: 'Compliance Unit', staff: Math.floor(stats.staffUsers * 0.3), access: 'Compliance Review & Monitoring', status: 'Active' },
                    { unit: 'Revenue Unit', staff: Math.floor(stats.staffUsers * 0.2), access: 'Financial Processing & Invoicing', status: 'Active' },
                    { unit: 'Finance Unit', staff: Math.floor(stats.staffUsers * 0.15), access: 'Payment & Financial Reconciliation', status: 'Active' },
                    { unit: 'Directorate', staff: stats.adminUsers + stats.superAdminUsers, access: 'Executive Oversight & Reporting', status: 'Active' },
                  ].map((unitData) => (
                    <div key={unitData.unit} className="p-4 border border-forest-100 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-forest-800">{unitData.unit}</h4>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">{unitData.status}</span>
                      </div>
                      <p className="text-sm text-forest-600 mb-1">{unitData.access}</p>
                      <p className="text-xs text-forest-500">{unitData.staff} active staff members</p>
                    </div>
                  ))}
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
                  <Button asChild variant="outline" className="w-full justify-start h-auto p-4">
                    <Link to="/user-management">
                      <div className="flex items-center space-x-3">
                        <Users className="w-5 h-5 text-forest-600" />
                        <div className="text-left">
                          <div className="font-medium">User & Role Management</div>
                          <div className="text-sm text-forest-500">Create, edit, and manage user accounts and permissions</div>
                        </div>
                      </div>
                    </Link>
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start h-auto p-4">
                    <div className="flex items-center space-x-3">
                      <Database className="w-5 h-5 text-forest-600" />
                      <div className="text-left">
                        <div className="font-medium">Database Administration</div>
                        <div className="text-sm text-forest-500">Database maintenance, backups, and optimization</div>
                      </div>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start h-auto p-4">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-forest-600" />
                      <div className="text-left">
                        <div className="font-medium">Security Configuration</div>
                        <div className="text-sm text-forest-500">Security policies, authentication, and access control</div>
                      </div>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start h-auto p-4">
                    <div className="flex items-center space-x-3">
                      <Monitor className="w-5 h-5 text-forest-600" />
                      <div className="text-left">
                        <div className="font-medium">System Monitoring</div>
                        <div className="text-sm text-forest-500">Performance monitoring and system health checks</div>
                      </div>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="staff" className="space-y-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="entities" className="space-y-6">
            <EntityManagement />
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <AuditLogs />
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <SystemMetrics />
          </TabsContent>

          <TabsContent value="operations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Permit Applications Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-forest-800 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Permit Applications
                  </CardTitle>
                  <CardDescription>Overview of permit processing across all units</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { unit: 'Registry', pending: stats.draftApplications, processed: stats.approvedApplications, rejected: stats.rejectedApplications },
                    { unit: 'Revenue', pending: stats.pendingTransactions, processed: stats.completedTransactions, rejected: 0 },
                    { unit: 'Compliance', pending: stats.underReviewApplications, processed: stats.approvedApplications, rejected: stats.rejectedApplications },
                    { unit: 'Finance', pending: Math.floor(stats.pendingTransactions * 0.4), processed: Math.floor(stats.completedTransactions * 0.4), rejected: 0 },
                  ].map((unitData) => (
                    <div key={unitData.unit} className="p-4 border border-forest-100 rounded-lg">
                      <h4 className="font-semibold text-forest-800 mb-2">{unitData.unit} Unit</h4>
                      <div className="flex justify-between text-sm">
                        <span className="text-amber-600">Pending: {unitData.pending}</span>
                        <span className="text-green-600">Processed: {unitData.processed}</span>
                        <span className="text-red-600">Rejected: {unitData.rejected}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* System Health Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-forest-800 flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    System Health
                  </CardTitle>
                  <CardDescription>Critical system components status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { service: 'Database Server', status: 'Healthy', uptime: '99.98%', color: 'text-green-600' },
                    { service: 'Authentication Service', status: 'Healthy', uptime: '99.95%', color: 'text-green-600' },
                    { service: 'File Storage', status: 'Warning', uptime: '98.12%', color: 'text-yellow-600' },
                    { service: 'Email Service', status: 'Healthy', uptime: '99.87%', color: 'text-green-600' },
                  ].map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-forest-100 rounded-lg">
                      <div>
                        <p className="font-medium text-forest-800">{service.service}</p>
                        <p className="text-sm text-forest-600">Uptime: {service.uptime}</p>
                      </div>
                      <div className={`font-medium ${service.color}`}>
                        {service.status}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </main>
    </div>
  );
}
