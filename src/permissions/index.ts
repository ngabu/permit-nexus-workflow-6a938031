import { registryPermissions } from './registry';
import { compliancePermissions } from './compliance';
import { revenuePermissions } from './revenue';
import { financePermissions } from './finance';
import { directoratePermissions } from './directorate';

export const permissions = {
  registry: registryPermissions,
  compliance: compliancePermissions,
  revenue: revenuePermissions,
  finance: financePermissions,
  directorate: directoratePermissions,
};

export {
  registryPermissions,
  compliancePermissions,
  revenuePermissions,
  financePermissions,
  directoratePermissions,
};
