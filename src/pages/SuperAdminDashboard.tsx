import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Shield, Users, Settings, FileText, Building2, DollarSign, Layers, Activity } from 'lucide-react';
import { UserManagementPanel } from '@/components/super-admin/UserManagementPanel';
import { EnumManagementPanel } from '@/components/super-admin/EnumManagementPanel';
import { TableManagementPanel } from '@/components/super-admin/TableManagementPanel';
import { SystemConfigPanel } from '@/components/super-admin/SystemConfigPanel';

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Super Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Complete database and system management interface
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" />
                Database Tables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45+</div>
              <p className="text-xs text-muted-foreground">Active tables</p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                Enums
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">System enums</p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">All</div>
              <p className="text-xs text-muted-foreground">User management</p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Active</div>
              <p className="text-xs text-muted-foreground">All systems operational</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="tables" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Tables
            </TabsTrigger>
            <TabsTrigger value="enums" className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Enums
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Access Control
                  </CardTitle>
                  <CardDescription>Manage system-wide permissions and roles</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: 'User Types', count: 4, icon: Users },
                    { name: 'Staff Units', count: 6, icon: Building2 },
                    { name: 'Staff Positions', count: 4, icon: Shield },
                  ].map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <item.icon className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{item.count} types</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Database Modules
                  </CardTitle>
                  <CardDescription>Core system modules and tables</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: 'Registry', tables: 12, icon: FileText },
                    { name: 'Compliance', tables: 8, icon: Shield },
                    { name: 'Revenue', tables: 6, icon: DollarSign },
                    { name: 'Finance', tables: 5, icon: DollarSign },
                  ].map((module) => (
                    <div key={module.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <module.icon className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{module.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{module.tables} tables</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <UserManagementPanel />
          </TabsContent>

          <TabsContent value="tables" className="space-y-4">
            <TableManagementPanel />
          </TabsContent>

          <TabsContent value="enums" className="space-y-4">
            <EnumManagementPanel />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
