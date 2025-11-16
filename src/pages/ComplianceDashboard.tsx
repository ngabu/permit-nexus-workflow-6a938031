import { useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { compliancePermissions } from "@/permissions/compliance";
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ComplianceSidebar } from "@/components/compliance/ComplianceSidebar";
import { EnvironmentAssessmentDashboard } from "@/components/compliance/EnvironmentAssessmentDashboard";
import { ComplianceApplicationsList } from "@/components/compliance/ComplianceApplicationsList";
import { ProfileSettings } from "@/components/public/ProfileSettings";
import { AppSettings } from "@/components/public/AppSettings";
import ComplianceReports from "@/components/compliance/ComplianceReports";
import { TeamManagement } from "@/components/compliance/TeamManagement";
import { IntentRegistrationComplianceReview } from "@/components/compliance/IntentRegistrationComplianceReview";
import { PermitRenewalComplianceReview } from "@/components/compliance/PermitRenewalComplianceReview";
import { PermitTransferComplianceReview } from "@/components/compliance/PermitTransferComplianceReview";
import { PermitSurrenderComplianceReview } from "@/components/compliance/PermitSurrenderComplianceReview";
import { PermitAmendmentComplianceReview } from "@/components/compliance/PermitAmendmentComplianceReview";
import { PermitAmalgamationComplianceReview } from "@/components/compliance/PermitAmalgamationComplianceReview";
import { PermitComplianceReportReview } from "@/components/compliance/PermitComplianceReportReview";
import { PermitEnforcementComplianceReview } from "@/components/compliance/PermitEnforcementComplianceReview";
import { InspectionsManagement } from "@/components/compliance/InspectionsManagement";
import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ComplianceDashboardView = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const isManager = profile?.staff_position && ['manager', 'director', 'managing_director'].includes(profile.staff_position);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <ComplianceSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b border-sidebar-border bg-background p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-sidebar-accent" />
                <div>
                  <h1 className="text-3xl font-bold text-card-foreground">
                    Environment Technical Assessment System
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isManager 
                      ? 'Assign and monitor environmental permit assessments under PNG Environment Act 2000'
                      : 'Conduct structured technical assessments for environmental permits'
                    }
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="px-4 py-2">
                <Shield className="w-4 h-4 mr-2" />
                Compliance {isManager ? 'Manager' : 'Officer'}
              </Badge>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            {activeTab === 'dashboard' && <EnvironmentAssessmentDashboard isManager={isManager} />}
            {activeTab === 'inspections' && <InspectionsManagement />}
            {activeTab === 'permit-applications' && <ComplianceApplicationsList />}
            {activeTab === 'team' && isManager && <TeamManagement />}
            {activeTab === 'reports' && <ComplianceReports />}
            {activeTab === 'profile' && <ProfileSettings />}
            {activeTab === 'settings' && <AppSettings />}
            {/* Assessment submenu views with Registry + Compliance review sections */}
            {activeTab === 'intent-reviews' && <IntentRegistrationComplianceReview />}
            {activeTab === 'permit-amalgamation' && <PermitAmalgamationComplianceReview />}
            {activeTab === 'permit-amendments' && <PermitAmendmentComplianceReview />}
            {activeTab === 'permit-compliance' && <PermitComplianceReportReview />}
            {activeTab === 'permit-enforcement' && <PermitEnforcementComplianceReview />}
            {activeTab === 'permit-renewal' && <PermitRenewalComplianceReview />}
            {activeTab === 'permit-surrender' && <PermitSurrenderComplianceReview />}
            {activeTab === 'permit-transfer' && <PermitTransferComplianceReview />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default function ComplianceDashboard() {
  return (
    <ProtectedRoute {...compliancePermissions.manager}>
      <ComplianceDashboardView />
    </ProtectedRoute>
  );
}
