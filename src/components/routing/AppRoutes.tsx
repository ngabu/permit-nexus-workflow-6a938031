
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import PublicDashboard from "@/pages/PublicDashboard";
import StaffDashboard from "@/pages/StaffDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import SuperAdminDashboard from "@/pages/SuperAdminDashboard";
import RegistryDashboard from "@/pages/RegistryDashboard";
import RevenueDashboard from "@/pages/RevenueDashboard";
import ComplianceDashboard from "@/pages/ComplianceDashboard";
import FinanceDashboard from "@/pages/FinanceDashboard";
import DirectorateDashboard from "@/pages/DirectorateDashboard";
import EntityRegistration from "@/pages/EntityRegistration";
import SubmitApplication from "@/pages/SubmitApplication";
import Applications from "@/pages/Applications";
import PendingApplications from "@/pages/applications/PendingApplications";
import UnderAssessment from "@/pages/applications/UnderAssessment";
import ApprovedApplications from "@/pages/applications/ApprovedApplications";
import RejectedApplications from "@/pages/applications/RejectedApplications";
import Documents from "@/pages/Documents";
import Payments from "@/pages/Payments";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import Notifications from "@/pages/Notifications";
import ApplicationDetailView from '@/pages/ApplicationDetailView';
import UserManagement from "@/pages/UserManagement";
import Jobs from "@/pages/Jobs";
import NotFound from "@/pages/NotFound";
import PermitRenewal from "@/pages/permit-management/PermitRenewal";
import PermitTransfer from "@/pages/permit-management/PermitTransfer";
import PermitSurrender from "@/pages/permit-management/PermitSurrender";
import ComplianceReports from "@/pages/permit-management/ComplianceReports";
import PermitAmalgamation from "@/pages/permit-management/PermitAmalgamation";
import PermitEnforcementInspections from "@/pages/permit-management/PermitEnforcementInspections";
import EIAReviewDetail from "@/pages/eia/EIAReviewDetail";
import RegistryApplicationDetail from "@/pages/RegistryApplicationDetail";
import Inspections from "@/pages/Inspections";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const RoleBasedRoute = ({ 
  children, 
  allowedRoles,
  allowedUnits 
}: { 
  children: React.ReactNode;
  allowedRoles: string[];
  allowedUnits?: string[];
}) => {
  const { profile, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!profile || !allowedRoles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Additional unit-based access control for staff
  if (allowedUnits && allowedUnits.length > 0) {
    if (!profile.operational_unit || !allowedUnits.includes(profile.operational_unit)) {
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  return <>{children}</>;
};

export const AppRoutes = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Index />} />
      <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/dashboard" replace />} />
      
      {/* Dashboard Routes - Main dashboard that redirects to appropriate dashboard */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Role-specific Dashboards */}
      <Route 
        path="/public-dashboard" 
        element={
          <RoleBasedRoute allowedRoles={['public']}>
            <PublicDashboard />
          </RoleBasedRoute>
        } 
      />
      
      <Route 
        path="/staff-dashboard" 
        element={
          <RoleBasedRoute allowedRoles={['registry', 'compliance', 'finance', 'revenue', 'directorate', 'admin']}>
            <StaffDashboard />
          </RoleBasedRoute>
        }
      />
      
      {/* Unit-specific dashboards - restricted by unit */}
      <Route 
        path="/registry-dashboard" 
        element={
          <RoleBasedRoute 
            allowedRoles={['registry', 'admin']}
            allowedUnits={['registry']}
          >
            <RegistryDashboard />
          </RoleBasedRoute>
        } 
      />
      
      <Route 
        path="/revenue-dashboard" 
        element={
          <RoleBasedRoute 
            allowedRoles={['revenue', 'admin']}
            allowedUnits={['revenue']}
          >
            <RevenueDashboard />
          </RoleBasedRoute>
        } 
      />
      
      <Route 
        path="/compliance-dashboard" 
        element={
          <RoleBasedRoute 
            allowedRoles={['compliance', 'admin']}
            allowedUnits={['compliance']}
          >
            <ComplianceDashboard />
          </RoleBasedRoute>
        } 
      />
      
      <Route 
        path="/finance-dashboard" 
        element={
          <RoleBasedRoute 
            allowedRoles={['finance', 'admin']}
            allowedUnits={['finance']}
          >
            <FinanceDashboard />
          </RoleBasedRoute>
        } 
      />
      
      <Route 
        path="/directorate-dashboard" 
        element={
          <RoleBasedRoute 
            allowedRoles={['directorate', 'admin']}
            allowedUnits={['directorate']}
          >
            <DirectorateDashboard />
          </RoleBasedRoute>
        } 
      />
      
      {/* Admin dashboard - only for admin and super_admin */}
      <Route 
        path="/admin-dashboard" 
        element={
          <RoleBasedRoute allowedRoles={['admin', 'super_admin']}>
            <AdminDashboard />
          </RoleBasedRoute>
        }
      />
      
      {/* Super Admin dashboard - only for super_admin */}
      <Route 
        path="/super-admin-dashboard" 
        element={
          <RoleBasedRoute allowedRoles={['super_admin']}>
            <SuperAdminDashboard />
          </RoleBasedRoute>
        }
      />

      {/* Public User Routes - Only accessible by public users */}
      <Route 
        path="/entity-registration" 
        element={
          <RoleBasedRoute allowedRoles={['public']}>
            <EntityRegistration />
          </RoleBasedRoute>
        } 
      />
      <Route 
        path="/submit-application" 
        element={
          <RoleBasedRoute allowedRoles={['public']}>
            <SubmitApplication />
          </RoleBasedRoute>
        } 
      />
      
      {/* Applications - accessible by all authenticated users but with different views */}
      <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
      <Route path="/applications/:id" element={<ProtectedRoute><ApplicationDetailView /></ProtectedRoute>} />
      <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
      <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

      {/* Staff Routes - unit-based access control */}
      <Route 
        path="/applications/pending" 
        element={
          <RoleBasedRoute 
            allowedRoles={['cepa_staff', 'admin', 'system_admin']}
            allowedUnits={['registry', 'compliance']}
          >
            <PendingApplications />
          </RoleBasedRoute>
        } 
      />
      <Route 
        path="/applications/assessment" 
        element={
          <RoleBasedRoute 
            allowedRoles={['cepa_staff', 'admin', 'system_admin']}
            allowedUnits={['registry', 'compliance']}
          >
            <UnderAssessment />
          </RoleBasedRoute>
        } 
      />
      <Route 
        path="/applications/approved" 
        element={
          <RoleBasedRoute 
            allowedRoles={['cepa_staff', 'admin', 'system_admin']}
            allowedUnits={['registry', 'compliance']}
          >
            <ApprovedApplications />
          </RoleBasedRoute>
        } 
      />
      <Route 
        path="/applications/rejected" 
        element={
          <RoleBasedRoute 
            allowedRoles={['cepa_staff', 'admin', 'system_admin']}
            allowedUnits={['registry', 'compliance']}
          >
            <RejectedApplications />
          </RoleBasedRoute>
        } 
      />

      {/* Revenue-specific routes */}
      <Route 
        path="/revenue/collection" 
        element={
          <RoleBasedRoute 
            allowedRoles={['cepa_staff', 'admin', 'system_admin']}
            allowedUnits={['revenue', 'finance']}
          >
            <div>Revenue Collection Page</div>
          </RoleBasedRoute>
        } 
      />
      <Route 
        path="/revenue/reports" 
        element={
          <RoleBasedRoute 
            allowedRoles={['cepa_staff', 'admin', 'system_admin']}
            allowedUnits={['revenue', 'finance', 'directorate']}
          >
            <div>Revenue Reports Page</div>
          </RoleBasedRoute>
        } 
      />
      <Route 
        path="/revenue/outstanding" 
        element={
          <RoleBasedRoute 
            allowedRoles={['cepa_staff', 'admin', 'system_admin']}
            allowedUnits={['revenue', 'finance']}
          >
            <div>Outstanding Payments Page</div>
          </RoleBasedRoute>
        } 
      />

      {/* Admin Routes */}
      <Route 
        path="/user-management" 
        element={
          <RoleBasedRoute allowedRoles={['admin', 'system_admin']}>
            <UserManagement />
          </RoleBasedRoute>
        } 
      />

      {/* Permit Management Routes - accessible by both public and staff but with different functionality */}
      <Route path="/permit-renewal" element={<ProtectedRoute><PermitRenewal /></ProtectedRoute>} />
      <Route path="/permit-transfer" element={<ProtectedRoute><PermitTransfer /></ProtectedRoute>} />
      <Route path="/permit-surrender" element={<ProtectedRoute><PermitSurrender /></ProtectedRoute>} />
      <Route path="/compliance-reports" element={<ProtectedRoute><ComplianceReports /></ProtectedRoute>} />
      <Route path="/permit-amalgamation" element={<ProtectedRoute><PermitAmalgamation /></ProtectedRoute>} />
      <Route path="/permit-management/enforcement-inspections" element={<ProtectedRoute><PermitEnforcementInspections /></ProtectedRoute>} />

      {/* Compliance Routes */}
      <Route 
        path="/Inspections" 
        element={
          <RoleBasedRoute 
            allowedRoles={['cepa_staff', 'admin', 'system_admin']}
            allowedUnits={['compliance']}
          >
            <Inspections />
          </RoleBasedRoute>
        } 
      />

      <Route 
        path="/eia-reviews/:id" 
        element={
          <RoleBasedRoute 
            allowedRoles={['cepa_staff', 'admin', 'system_admin']}
            allowedUnits={['compliance']}
          >
            <EIAReviewDetail />
          </RoleBasedRoute>
        } 
      />

      {/* Registry-specific routes */}
      <Route 
        path="/registry/applications/:id" 
        element={
          <RoleBasedRoute 
            allowedRoles={['registry', 'admin']}
            allowedUnits={['registry']}
          >
            <RegistryApplicationDetail />
          </RoleBasedRoute>
        } 
      />

      <Route path="/jobs" element={<Jobs />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
