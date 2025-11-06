
import React from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { compliancePermissions } from '@/permissions/compliance';
import { useAuth } from '@/contexts/AuthContext';
import { ComplianceManagerView } from '@/components/compliance/ComplianceManagerView';
import { ComplianceOfficerView } from '@/components/compliance/ComplianceOfficerView';
import { ComplianceKPIs } from '@/components/compliance/ComplianceKPIs';
import { Shield, AlertTriangle, LogOut } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const ComplianceDashboard = () => {
  const { profile, signOut } = useAuth();
  
  const isManager = profile?.staff_position === 'manager';
  const isOfficer = profile?.staff_position === 'officer';
  const isComplianceStaff = isManager || isOfficer;

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getUserDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile?.first_name) {
      return profile.first_name;
    }
    return profile?.email || 'User';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Compliance {isManager ? 'Management' : 'Assessment'}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">
            Welcome, {getUserDisplayName()}
          </span>
          <Button 
            onClick={handleSignOut}
            variant="outline" 
            size="sm"
            className="flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="space-y-6">
          {/* Access Control */}
          {!isComplianceStaff && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Access restricted to compliance staff only. Contact your system administrator for access.
              </AlertDescription>
            </Alert>
          )}

          {/* KPIs Dashboard */}
          {isComplianceStaff && (
            <ComplianceKPIs />
          )}

          {/* Role-based Views */}
          {isManager && <ComplianceManagerView />}
          {isOfficer && <ComplianceOfficerView />}
        </div>
      </main>
    </div>
  );
};

export default function Compliance() {
  return (
    <ProtectedRoute {...compliancePermissions.officer}>
      <ComplianceDashboard />
    </ProtectedRoute>
  );
}
