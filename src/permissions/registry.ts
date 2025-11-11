import { RouteAccessConfig } from "@/utils/canAccess";

export const registryPermissions: Record<string, RouteAccessConfig> = {
  officer: {
    allowedUnits: ['registry'],
    allowedRoles: ['staff', 'admin'],
    allowedPositions: ['officer'],
  },
  manager: {
    allowedUnits: ['registry'],
    allowedRoles: ['admin', 'super_admin'],
    allowedPositions: ['manager', 'director', 'managing_director'],
  },
};
