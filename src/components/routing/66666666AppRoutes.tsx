
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ResetPassword from "@/pages/ResetPassword";
import Dashboard from "@/pages/Dashboard";
import PublicDashboard from "@/pages/PublicDashboard";
import StaffDashboard from "@/pages/StaffDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import RevenueDashboard from "@/pages/RevenueDashboard";
import RegistryDashboard from "@/pages/RegistryDashboard";
import ComplianceDashboard from "@/pages/ComplianceDashboard";
import FinanceDashboard from "@/pages/FinanceDashboard";
import DirectorateDashboard from "@/pages/DirectorateDashboard";
import Applications from "@/pages/Applications";
import PendingApplications from "@/pages/applications/PendingApplications";
import UnderAssessment from "@/pages/applications/UnderAssessment";
import ApprovedApplications from "@/pages/applications/ApprovedApplications";
import RejectedApplications from "@/pages/applications/RejectedApplications";
import SubmitApplication from "@/pages/SubmitApplication";
import EntityRegistration from "@/pages/EntityRegistration";
import Documents from "@/pages/Documents";
import Jobs from "@/pages/Jobs";
import Payments from "@/pages/Payments";
import Notifications from "@/pages/Notifications";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import UserManagement from "@/pages/UserManagement";
import PermitRenewal from "@/pages/permit-management/PermitRenewal";
import PermitTransfer from "@/pages/permit-management/PermitTransfer";
import PermitSurrender from "@/pages/permit-management/PermitSurrender";
import PermitAmalgamation from "@/pages/permit-management/PermitAmalgamation";
import ComplianceReports from "@/pages/permit-management/ComplianceReports";
import EIAReviewDetail from "@/pages/eia/EIAReviewDetail";
import NotFound from "@/pages/NotFound";
import Permits from "@/pages/Permits";
import Inspections from "@/pages/Inspections";
import Unauthorized from "@/pages/Unauthorized";
import RegistryApplicationDetail from "@/pages/RegistryApplicationDetail";

export function AppRoutes() {
  const { profile, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const getDashboardByRole = () => {
    if (!profile) return <PublicDashboard />;
    
    switch (profile.user_type) {
      case 'super_admin':
      case 'admin':
        return <AdminDashboard />;
      case 'staff':
        switch (profile.staff_unit) {
          case 'revenue':
            return <RevenueDashboard />;
          case 'registry':
            return <RegistryDashboard />;
          case 'compliance':
            return <ComplianceDashboard />;
          case 'finance':
            return <FinanceDashboard />;
          case 'directorate':
            return <DirectorateDashboard />;
          default:
            return <StaffDashboard />;
        }
      case 'public':
      default:
        return <PublicDashboard />;
    }
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            {getDashboardByRole()}
          </ProtectedRoute>
        }
      />

      {/* Application routes */}
      <Route
        path="/applications"
        element={
          <ProtectedRoute>
            <Applications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/applications/pending"
        element={
          <ProtectedRoute>
            <PendingApplications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/applications/under-assessment"
        element={
          <ProtectedRoute>
            <UnderAssessment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/applications/approved"
        element={
          <ProtectedRoute>
            <ApprovedApplications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/applications/rejected"
        element={
          <ProtectedRoute>
            <RejectedApplications />
          </ProtectedRoute>
        }
      />

      {/* Permit management routes */}
      <Route
        path="/permit-renewal"
        element={
          <ProtectedRoute>
            <PermitRenewal />
          </ProtectedRoute>
        }
      />
      <Route
        path="/permit-transfer"
        element={
          <ProtectedRoute>
            <PermitTransfer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/permit-surrender"
        element={
          <ProtectedRoute>
            <PermitSurrender />
          </ProtectedRoute>
        }
      />
      <Route
        path="/permit-amalgamation"
        element={
          <ProtectedRoute>
            <PermitAmalgamation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/compliance-reports"
        element={
          <ProtectedRoute>
            <ComplianceReports />
          </ProtectedRoute>
        }
      />

      {/* EIA routes */}
      <Route
        path="/eia-review/:id"
        element={
          <ProtectedRoute>
            <EIAReviewDetail />
          </ProtectedRoute>
        }
      />

      {/* Other protected routes */}
      <Route
        path="/submit-application"
        element={
          <ProtectedRoute>
            <SubmitApplication />
          </ProtectedRoute>
        }
      />
      <Route
        path="/entity-registration"
        element={
          <ProtectedRoute>
            <EntityRegistration />
          </ProtectedRoute>
        }
      />
      <Route
        path="/documents"
        element={
          <ProtectedRoute>
            <Documents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs"
        element={
          <ProtectedRoute>
            <Jobs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments"
        element={
          <ProtectedRoute>
            <Payments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* Missing routes for navigation */}
      <Route
        path="/permits"
        element={
          <ProtectedRoute>
            <Permits />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inspections"
        element={
          <ProtectedRoute>
            <Inspections />
          </ProtectedRoute>
        }
      />

      {/* Staff specific routes */}
      <Route
        path="/applications/assessment"
        element={
          <ProtectedRoute>
            <UnderAssessment />
          </ProtectedRoute>
        }
      />

      {/* Revenue routes */}
      <Route
        path="/revenue"
        element={
          <ProtectedRoute allowedUnits={["revenue"]} allowedRoles={["super_admin"]}>
            <RevenueDashboard />
          </ProtectedRoute>
        }
      />

      {/* Registry routes */}
      <Route
        path="/registry"
        element={
          <ProtectedRoute allowedUnits={["registry"]} allowedRoles={["super_admin"]}>
            <RegistryDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/registry/applications/:permitId"
        element={
          <ProtectedRoute allowedUnits={["registry"]} allowedRoles={["super_admin"]}>
            <RegistryApplicationDetail />
          </ProtectedRoute>
        }
      />

      {/* Compliance routes */}
      <Route
        path="/compliance"
        element={
          <ProtectedRoute allowedUnits={["compliance"]} allowedRoles={["super_admin"]}>
            <ComplianceDashboard />
          </ProtectedRoute>
        }
      />

      {/* Finance routes */}
      <Route
        path="/finance"
        element={
          <ProtectedRoute allowedUnits={["finance"]} allowedRoles={["super_admin"]}>
            <FinanceDashboard />
          </ProtectedRoute>
        }
      />

      {/* Directorate routes */}
      <Route
        path="/directorate"
        element={
          <ProtectedRoute allowedUnits={["directorate"]} allowedRoles={["super_admin"]}>
            <DirectorateDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/user-management"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <UserManagement />
          </ProtectedRoute>
        }
      />

      {/* Catch all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
