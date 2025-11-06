import { ProtectedRoute } from "@/components/ProtectedRoute";
import { registryPermissions } from "@/permissions/registry";
import { useAuth } from "@/contexts/AuthContext";

import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { RegistryKPIs } from "@/components/registry/RegistryKPIs";
import { PermitApplicationsList } from "@/components/registry/PermitApplicationsList";
import { AssessmentSummaryCard } from "@/components/registry/AssessmentSummaryCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Database,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const RegistryDashboard = () => {
  const { profile } = useAuth();
  const isManager = profile?.staff_position && ['manager', 'director', 'managing_director'].includes(profile.staff_position);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-forest-800">Registry Dashboard</h1>
            <p className="text-forest-600">
              {isManager 
                ? "Manage permit applications and assign officers for assessment"
                : "View assigned applications and monitor your assessment progress"
              }
            </p>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 bg-forest-100 rounded-lg">
            <Database className="w-5 h-5 text-forest-600" />
            <span className="text-forest-800 font-medium">
              Registry {isManager ? 'Manager' : 'Officer'}
            </span>
          </div>
        </div>

        {/* KPIs */}
        <RegistryKPIs />

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-forest-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-forest-800 text-sm">
                <FileText className="w-4 h-4 mr-2" />
                {isManager ? "All New Applications" : "Your New Applications"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-forest-800">12</div>
              <p className="text-xs text-forest-600">
                {isManager ? "Pending assignment" : "Assigned this week"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-forest-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-forest-800 text-sm">
                <Clock className="w-4 h-4 mr-2" />
                Pending Assessments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">7</div>
              <p className="text-xs text-forest-600">Due by end of week</p>
            </CardContent>
          </Card>

          <Card className="border-forest-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-forest-800 text-sm">
                <CheckCircle className="w-4 h-4 mr-2" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">18</div>
              <p className="text-xs text-forest-600">Assessments completed</p>
            </CardContent>
          </Card>

          <Card className="border-forest-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-forest-800 text-sm">
                <AlertCircle className="w-4 h-4 mr-2" />
                Issues Logged
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">3</div>
              <p className="text-xs text-forest-600">Sent back to applicants</p>
            </CardContent>
          </Card>
        </div>

        {/* Assessment Summary */}
        <AssessmentSummaryCard />

        {/* Applications List - Different views for managers vs officers */}
        <PermitApplicationsList />
      </div>
    </DashboardLayout>
  );
};

export default function Registry() {
  return (
    <ProtectedRoute {...registryPermissions.officer}>
      <RegistryDashboard />
    </ProtectedRoute>
  );
}
