
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RoleBasedStats } from '@/components/shared/RoleBasedStats';
import { AllocationDialog } from '@/components/shared/AllocationDialog';
import { ReportGenerator } from '@/components/shared/ReportGenerator';
import { Calculator, Users, PieChart, Plus, Settings, TrendingUp } from 'lucide-react';
import { useState } from 'react';

export default function FinanceDashboard() {
  const { profile } = useAuth();
  const [allocationDialogOpen, setAllocationDialogOpen] = useState(false);
  
  const isManager = profile?.staff_position && ['manager', 'director', 'managing_director'].includes(profile.staff_position);
  const userRole = isManager ? 'manager' : 'officer';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-amber-800">
              Finance {isManager ? 'Management' : 'Unit'} Dashboard
            </h1>
            <p className="text-amber-600 mt-1">
              {isManager 
                ? 'Strategic oversight and financial management for operations'
                : 'Financial operations and budget management'
              }
            </p>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 bg-amber-100 rounded-lg">
            <Calculator className="w-5 h-5 text-amber-600" />
            <span className="text-amber-800 font-medium">
              Finance {isManager ? 'Manager' : 'Officer'}
            </span>
          </div>
        </div>

        {/* Role-based Statistics */}
        <RoleBasedStats userRole={userRole} staffUnit="finance" />

        {/* Manager-specific controls */}
        {isManager && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-amber-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-amber-800 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Team Management
                  </CardTitle>
                  <Badge variant="secondary">Manager</Badge>
                </div>
                <CardDescription>Allocate tasks and manage finance team</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setAllocationDialogOpen(true)}
                  className="w-full mb-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Assign Financial Task
                </Button>
                <Button variant="outline" className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Team
                </Button>
              </CardContent>
            </Card>

            <ReportGenerator staffUnit="finance" className="md:col-span-2" />
          </div>
        )}

        {/* Operational cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-amber-200">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Calculator className="w-5 h-5 text-amber-600" />
                <CardTitle className="text-amber-800">
                  {isManager ? 'Budget Overview' : 'Financial Processing'}
                </CardTitle>
              </div>
              <CardDescription>
                {isManager ? 'Monitor budgets and financial planning' : 'Process financial transactions'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-amber-600">
                {isManager 
                  ? 'Budget monitoring and financial planning tools will be implemented here.'
                  : 'Financial transaction processing and validation tools will be available here.'
                }
              </p>
            </CardContent>
          </Card>

          <Card className="border-amber-200">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <PieChart className="w-5 h-5 text-amber-600" />
                <CardTitle className="text-amber-800">
                  {isManager ? 'Financial Analytics' : 'Record Keeping'}
                </CardTitle>
              </div>
              <CardDescription>
                {isManager ? 'Financial performance and analysis' : 'Maintain financial records'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-amber-600">
                {isManager
                  ? 'Advanced financial analytics and performance dashboards coming soon.'
                  : 'Financial record keeping and documentation systems will be available here.'
                }
              </p>
            </CardContent>
          </Card>

          <Card className="border-amber-200">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-amber-600" />
                <CardTitle className="text-amber-800">
                  {isManager ? 'Performance Metrics' : 'Account Reconciliation'}
                </CardTitle>
              </div>
              <CardDescription>
                {isManager ? 'Team performance and KPIs' : 'Reconcile accounts and balances'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-amber-600">
                {isManager
                  ? 'Performance tracking and KPI monitoring tools will be available here.'
                  : 'Account reconciliation tools and procedures coming soon.'
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Allocation Dialog */}
        <AllocationDialog
          open={allocationDialogOpen}
          onOpenChange={setAllocationDialogOpen}
          staffUnit="finance"
        />
      </div>
    </DashboardLayout>
  );
}
