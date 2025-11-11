import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ThemeProvider } from "next-themes";

// Public pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

// Protected pages
import PublicDashboard from "./pages/PublicDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import RegistryDashboard from "./pages/RegistryDashboard";
import ComplianceDashboard from "./pages/ComplianceDashboard";
import RevenueDashboard from "./pages/RevenueDashboard";
import FinanceDashboard from "./pages/FinanceDashboard";
import DirectorateDashboard from "./pages/DirectorateDashboard";
import Revenue from "./pages/Revenue";
import Finance from "./pages/Finance";
import Compliance from "./pages/Compliance";
import UserManagement from "./pages/UserManagement";
import RegistryApplicationDetail from "./pages/RegistryApplicationDetail";
import SubmitApplication from "./pages/SubmitApplication";
import ComplianceAssessmentDetail from "./pages/ComplianceAssessmentDetail";

const queryClient = new QueryClient();

// Route configuration constants
// Type-safe route configuration based on Supabase enums
const ROUTE_CONFIG = {
  PUBLIC: {
    allowedRoles: ['public' as const],
    allowedUnits: [],
    allowedPositions: []
  },
  STAFF: {
    allowedRoles: ['staff' as const, 'admin' as const, 'super_admin' as const],
    allowedUnits: [],
    allowedPositions: []
  },
  ADMIN: {
    allowedRoles: ['admin' as const, 'super_admin' as const],
    allowedUnits: [],
    allowedPositions: []
  },
  REGISTRY_OFFICER: {
    allowedRoles: ['staff' as const, 'admin' as const, 'super_admin' as const],
    allowedUnits: ['registry' as const],
    allowedPositions: ['officer' as const]
  },
  REGISTRY_MANAGEMENT: {
    allowedRoles: ['staff' as const, 'admin' as const, 'super_admin' as const],
    allowedUnits: ['registry' as const],
    allowedPositions: ['manager' as const, 'director' as const, 'managing_director' as const]
  },
  COMPLIANCE_OFFICER: {
    allowedRoles: ['staff' as const, 'admin' as const, 'super_admin' as const],
    allowedUnits: ['compliance' as const],
    allowedPositions: ['officer' as const]
  },
  COMPLIANCE_MANAGEMENT: {
    allowedRoles: ['staff' as const, 'admin' as const, 'super_admin' as const],
    allowedUnits: ['compliance' as const],
    allowedPositions: ['manager' as const, 'director' as const, 'managing_director' as const]
  },
  REVENUE: {
    allowedRoles: ['staff' as const, 'admin' as const, 'super_admin' as const],
    allowedUnits: ['revenue' as const],
    allowedPositions: []
  },
  FINANCE: {
    allowedRoles: ['staff' as const, 'admin' as const, 'super_admin' as const],
    allowedUnits: ['finance' as const],
    allowedPositions: []
  },
  DIRECTORATE: {
    allowedRoles: ['staff' as const, 'admin' as const, 'super_admin' as const],
    allowedUnits: ['directorate' as const],
    allowedPositions: []
  }
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute {...ROUTE_CONFIG.PUBLIC}>
                    <PublicDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/submit-application"
                element={
                  <ProtectedRoute {...ROUTE_CONFIG.PUBLIC}>
                    <SubmitApplication />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/registry"
                element={
                  <ProtectedRoute {...ROUTE_CONFIG.REGISTRY_OFFICER}>
                    <RegistryDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/RegistryDashboard"
                element={
                  <ProtectedRoute {...ROUTE_CONFIG.REGISTRY_MANAGEMENT}>
                    <RegistryDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/registry/applications/:id"
                element={
                  <ProtectedRoute 
                    allowedRoles={['staff', 'admin', 'super_admin']}
                    allowedUnits={['registry']}
                    allowedPositions={[]}
                  >
                    <RegistryApplicationDetail />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/compliance"
                element={
                  <ProtectedRoute {...ROUTE_CONFIG.COMPLIANCE_OFFICER}>
                    <Compliance />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/FinanceDashboard"
                element={
                  <ProtectedRoute {...ROUTE_CONFIG.FINANCE}>
                    <FinanceDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/revenue"
                element={
                  <ProtectedRoute 
                    allowedRoles={['staff', 'admin', 'super_admin']}
                    allowedUnits={['revenue']}
                    allowedPositions={['officer']}
                  >
                    <Revenue />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/RevenueDashboard"
                element={
                  <ProtectedRoute {...ROUTE_CONFIG.REVENUE}>
                    <RevenueDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/finance"
                element={
                  <ProtectedRoute 
                    allowedRoles={['staff', 'admin', 'super_admin']}
                    allowedUnits={['finance']}
                    allowedPositions={['officer']}
                  >
                    <Finance />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/directorate"
                element={
                  <ProtectedRoute {...ROUTE_CONFIG.DIRECTORATE}>
                    <DirectorateDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/ComplianceDashboard"
                element={
                  <ProtectedRoute {...ROUTE_CONFIG.COMPLIANCE_MANAGEMENT}>
                    <ComplianceDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/compliance/assessments/:assessmentId"
                element={
                  <ProtectedRoute 
                    allowedRoles={['staff', 'admin', 'super_admin']}
                    allowedUnits={['compliance']}
                    allowedPositions={[]}
                  >
                    <ComplianceAssessmentDetail />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin"
                element={
                  <ProtectedRoute {...ROUTE_CONFIG.ADMIN}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/user-management"
                element={
                  <ProtectedRoute {...ROUTE_CONFIG.ADMIN}>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute {...ROUTE_CONFIG.PUBLIC}>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;