import { Database } from '@/integrations/supabase/types';

type UserType = Database['public']['Enums']['user_type'];
type StaffUnit = Database['public']['Enums']['staff_unit'];
type StaffPosition = Database['public']['Enums']['staff_position'];

export type RouteAccessConfig = {
  allowedRoles?: UserType[];
  allowedUnits?: StaffUnit[];
  allowedPositions?: StaffPosition[];
};

export function canAccess(profile: any, config: RouteAccessConfig): boolean {
  if (!profile) return false;

  // Super admin has access to everything
  if (profile.user_type === 'super_admin') return true;

  const { allowedRoles, allowedUnits, allowedPositions } = config;

  // Check if user's role is allowed
  if (allowedRoles && !allowedRoles.includes(profile.user_type)) return false;
  
  // Check if user's unit is allowed
  if (allowedUnits && !allowedUnits.includes(profile.staff_unit)) return false;
  
  // Check if user's position is allowed
  if (allowedPositions && !allowedPositions.includes(profile.staff_position)) return false;

  return true;
}
