import { RouteAccessConfig } from "@/utils/canAccess";

export const compliancePermissions: Record<string, RouteAccessConfig> = {
  officer: {
    allowedUnits: ['compliance'],
    allowedRoles: ['staff', 'admin'],
    allowedPositions: ['officer'],
  },
  manager: {
    allowedUnits: ['compliance'],
    allowedRoles: ['staff','admin', 'super_admin'],
    allowedPositions: ['manager', 'director', 'managing_director'],
  },
};
