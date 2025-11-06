import { RouteAccessConfig } from "@/utils/canAccess";

export const directoratePermissions: Record<string, RouteAccessConfig> = {
  staff: {
    allowedUnits: ['directorate'],
    allowedRoles: ['staff', 'admin', 'super_admin'],
    allowedPositions: ['officer', 'manager', 'director', 'managing_director'],
  },
};