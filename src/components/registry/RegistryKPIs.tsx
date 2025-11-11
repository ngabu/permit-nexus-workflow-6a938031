
import { KPICard } from '@/components/kpi-card';
import { FileCheck, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export function RegistryKPIs() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <KPICard
        title="Pending Assessments"
        value="23"
        change={5}
        trend="up"
        icon={<Clock className="w-5 h-5" />}
      />
      <KPICard
        title="Assessed Today"
        value="12"
        change={3}
        trend="up"
        icon={<FileCheck className="w-5 h-5" />}
      />
      <KPICard
        title="Passed Initial Review"
        value="18"
        change={7}
        trend="up"
        icon={<CheckCircle className="w-5 h-5" />}
      />
      <KPICard
        title="Requires Clarification"
        value="8"
        change={-2}
        trend="down"
        icon={<AlertTriangle className="w-5 h-5" />}
      />
    </div>
  );
}
