import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';

type UserType = Database['public']['Enums']['user_type'];
type StaffUnit = Database['public']['Enums']['staff_unit'];
type StaffPosition = Database['public']['Enums']['staff_position'];

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserType[];
  allowedUnits?: StaffUnit[];
  allowedPositions?: StaffPosition[]; // Changed from allowedPosition to allowedPositions for consistency
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles = ['public'],
  allowedUnits,
  allowedPositions,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !profile) return;

    // User check
    if (!user) {
      navigate(redirectTo);
      return;
    }

    // Role check
    const hasAllowedRole = allowedRoles.includes(profile.user_type);
    if (!hasAllowedRole) {
      navigate('/unauthorized');
      return;
    }

    // Staff-specific checks
    if (profile.user_type === 'staff') {
      // Unit check
      if (allowedUnits?.length && !allowedUnits.includes(profile.staff_unit)) {
        navigate('/unauthorized');
        return;
      }

      // Position check
      if (allowedPositions?.length && !allowedPositions.includes(profile.staff_position)) {
        navigate('/unauthorized');
        return;
      }
    }
  }, [user, profile, loading, navigate, redirectTo, allowedRoles, allowedUnits, allowedPositions]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" />
      </div>
    );
  }

  // Only render children if all checks pass
  return user ? <>{children}</> : null;
}