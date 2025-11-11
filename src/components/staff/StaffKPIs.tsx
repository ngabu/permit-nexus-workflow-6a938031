import { useState, useEffect } from 'react';
import { KPICard } from '@/components/kpi-card';
import { Clock, CheckCircle, DollarSign, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export function StaffKPIs() {
  const [stats, setStats] = useState({
    pendingApplications: 0,
    approvedThisMonth: 0,
    revenueCollected: 0,
    complianceIssues: 0,
    pendingChange: 0,
    approvedChange: 0,
    revenueChange: 0,
    complianceChange: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch permit applications
        const { data: applications } = await supabase
          .from('permit_applications')
          .select('status, created_at, approval_date');

        // Fetch financial transactions
        const { data: transactions } = await supabase
          .from('financial_transactions')
          .select('amount, status, created_at');

        // Fetch compliance assessments
        const { data: assessments } = await supabase
          .from('permit_assessments')
          .select('requires_eia, assessment_date');

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        // Calculate stats
        const pendingApplications = applications?.filter(app => 
          ['submitted', 'under_review'].includes(app.status)
        ).length || 0;

        const approvedThisMonth = applications?.filter(app => {
          if (!app.approval_date) return false;
          const approvalDate = new Date(app.approval_date);
          return approvalDate.getMonth() === currentMonth && 
                 approvalDate.getFullYear() === currentYear &&
                 app.status === 'approved';
        }).length || 0;

        const approvedLastMonth = applications?.filter(app => {
          if (!app.approval_date) return false;
          const approvalDate = new Date(app.approval_date);
          return approvalDate.getMonth() === lastMonth && 
                 approvalDate.getFullYear() === lastMonthYear &&
                 app.status === 'approved';
        }).length || 0;

        const revenueCollected = transactions?.filter(t => t.status === 'completed')
          .reduce((sum, t) => sum + (parseFloat(t.amount?.toString() || '0') || 0), 0) || 0;

        const complianceIssues = assessments?.filter(a => a.requires_eia).length || 0;

        setStats({
          pendingApplications,
          approvedThisMonth,
          revenueCollected,
          complianceIssues,
          pendingChange: 0, // Could calculate week-over-week change
          approvedChange: approvedThisMonth - approvedLastMonth,
          revenueChange: 0, // Could calculate month-over-month change
          complianceChange: 0 // Could calculate trend
        });
      } catch (error) {
        console.error('Error fetching staff KPIs:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <KPICard
        title="Pending Applications"
        value={stats.pendingApplications.toString()}
        change={stats.pendingChange}
        trend={stats.pendingChange >= 0 ? "up" : "down"}
        icon={<Clock className="w-5 h-5" />}
      />
      <KPICard
        title="Approved This Month"
        value={stats.approvedThisMonth.toString()}
        change={stats.approvedChange}
        trend={stats.approvedChange >= 0 ? "up" : "down"}
        icon={<CheckCircle className="w-5 h-5" />}
      />
      <KPICard
        title="Revenue Collected"
        value={`K${Math.round(stats.revenueCollected / 1000)}`}
        change={stats.revenueChange}
        trend={stats.revenueChange >= 0 ? "up" : "down"}
        icon={<DollarSign className="w-5 h-5" />}
      />
      <KPICard
        title="Compliance Issues"
        value={stats.complianceIssues.toString()}
        change={stats.complianceChange}
        trend={stats.complianceChange >= 0 ? "up" : "down"}
        icon={<AlertTriangle className="w-5 h-5" />}
      />
    </div>
  );
}