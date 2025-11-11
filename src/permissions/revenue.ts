import { RouteAccessConfig } from "@/utils/canAccess";

export const revenuePermissions: Record<string, RouteAccessConfig> = {
  officer: {
    allowedUnits: ['revenue'],
    allowedRoles: ['staff', 'admin'],
    allowedPositions: ['officer'],
  },
  manager: {
    allowedUnits: ['revenue'],
    allowedRoles: ['staff', 'admin', 'super_admin'],
    allowedPositions: ['manager', 'director', 'managing_director'],
  },
};