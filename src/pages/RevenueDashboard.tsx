import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { RevenueKPIs } from "@/components/revenue/RevenueKPIs";
import { InvoicesList } from "@/components/revenue/InvoicesList";
import { OutstandingPaymentsCard } from "@/components/revenue/OutstandingPaymentsCard";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RoleBasedStats } from "@/components/shared/RoleBasedStats";
import { AllocationDialog } from "@/components/shared/AllocationDialog";
import { ReportGenerator } from "@/components/shared/ReportGenerator";
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle, CreditCard, FileText, Users, Plus, Settings, Calculator } from "lucide-react";
import { useState } from "react";

const RevenueDashboard = () => {
  const { profile } = useAuth();
  const [allocationDialogOpen, setAllocationDialogOpen] = useState(false);
  
  const isManager = profile?.staff_position && ['manager', 'director', 'managing_director'].includes(profile.staff_position);
  const userRole = isManager ? 'manager' : 'officer';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-forest-800">
              Revenue {isManager ? 'Management' : 'Unit'} Dashboard
            </h1>
            <p className="text-forest-600">
              {isManager 
                ? 'Strategic revenue oversight and financial performance management'
                : 'Permit fee management and revenue tracking'
              }
            </p>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 bg-forest-100 rounded-lg">
            <DollarSign className="w-5 h-5 text-forest-600" />
            <span className="text-forest-800 font-medium">
              Revenue {isManager ? 'Manager' : 'Officer'}
            </span>
          </div>
        </div>

        {/* Role-based Statistics */}
        <RoleBasedStats userRole={userRole} staffUnit="revenue" />

        {/* Manager-specific controls */}
        {isManager && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-forest-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-forest-800 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Team Management
                  </CardTitle>
                  <Badge variant="secondary">Manager</Badge>
                </div>
                <CardDescription>Allocate revenue tasks and manage collection team</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setAllocationDialogOpen(true)}
                  className="w-full mb-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Assign Revenue Task
                </Button>
                <Button variant="outline" className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Team
                </Button>
              </CardContent>
            </Card>

            <ReportGenerator staffUnit="revenue" className="md:col-span-2" />
          </div>
        )}

        {/* KPIs */}
        <RevenueKPIs />

        {/* Revenue Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-forest-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-forest-800 text-sm">
                <TrendingUp className="w-4 h-4 mr-2" />
                Monthly Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-forest-800">K45,250</div>
              <p className="text-xs text-green-600">+12% from last month</p>
            </CardContent>
          </Card>
          
          <Card className="border-forest-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-forest-800 text-sm">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Outstanding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">K12,800</div>
              <p className="text-xs text-forest-600">23 overdue invoices</p>
            </CardContent>
          </Card>
          
          <Card className="border-forest-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-forest-800 text-sm">
                <CheckCircle className="w-4 h-4 mr-2" />
                Collected Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">K3,450</div>
              <p className="text-xs text-forest-600">8 payments received</p>
            </CardContent>
          </Card>
          
          <Card className="border-forest-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-forest-800 text-sm">
                <CreditCard className="w-4 h-4 mr-2" />
                Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">K2,100</div>
              <p className="text-xs text-forest-600">5 payments pending</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <InvoicesList />
          </div>
          <div>
            <OutstandingPaymentsCard />
          </div>
        </div>

        {/* Recent Transactions */}
        <Card className="border-forest-200">
          <CardHeader>
            <CardTitle className="text-forest-800">Recent Payment Activity</CardTitle>
            <CardDescription>Latest payment transactions and fee collections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium text-green-800">Payment Received</p>
                  <p className="text-sm text-green-600">Mining Permit fee - K2,500 (Bank Transfer)</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-800">K2,500</p>
                  <span className="text-xs text-green-500">Just now</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <p className="font-medium text-blue-800">Invoice Generated</p>
                  <p className="text-sm text-blue-600">Development Permit fee - Due in 30 days</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-800">K1,800</p>
                  <span className="text-xs text-blue-500">2 hours ago</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div className="flex-1">
                  <p className="font-medium text-red-800">Payment Overdue</p>
                  <p className="text-sm text-red-600">Forestry Permit fee - 15 days overdue</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-800">K3,200</p>
                  <span className="text-xs text-red-500">Follow-up required</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Allocation Dialog */}
        <AllocationDialog
          open={allocationDialogOpen}
          onOpenChange={setAllocationDialogOpen}
          staffUnit="revenue"
        />
      </div>
    </DashboardLayout>
  );
};

export default RevenueDashboard;