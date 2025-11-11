import { RouteAccessConfig } from "@/utils/canAccess";

export const financePermissions: Record<string, RouteAccessConfig> = {
  officer: {
    allowedUnits: ['finance'],
    allowedRoles: ['staff', 'admin'],
    allowedPositions: ['officer'],
  },
  manager: {
    allowedUnits: ['finance'],
    allowedRoles: ['staff', 'admin', 'super_admin'],
    allowedPositions: ['manager', 'director', 'managing_director'],
  },
};