import { KPICard } from '@/components/kpi-card';
import { DollarSign, TrendingUp, CreditCard, AlertTriangle } from 'lucide-react';
import { useInvoices } from './hooks/useInvoices';
import { useMemo } from 'react';

export function RevenueKPIs() {
  const { invoices, loading } = useInvoices();

  const metrics = useMemo(() => {
    if (loading || !invoices.length) {
      return {
        newInvoices: 0,
        pendingPayments: 0,
        totalOutstanding: 0,
        totalOverdue: 0
      };
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Calculate new invoices (created in last 7 days)
    const newInvoices = invoices.filter(invoice => {
      const createdDate = new Date(invoice.created_at);
      return createdDate >= sevenDaysAgo;
    }).length;

    // Count pending payment processes
    const pendingPayments = invoices.filter(invoice => invoice.payment_status === 'pending').length;

    // Calculate total outstanding (pending + overdue amounts)
    const totalOutstanding = invoices
      .filter(invoice => invoice.payment_status === 'pending' || invoice.payment_status === 'overdue')
      .reduce((sum, invoice) => sum + invoice.amount, 0);

    // Calculate total overdue amount
    const totalOverdue = invoices
      .filter(invoice => invoice.payment_status === 'overdue')
      .reduce((sum, invoice) => sum + invoice.amount, 0);

    return {
      newInvoices,
      pendingPayments,
      totalOutstanding,
      totalOverdue
    };
  }, [invoices, loading]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-32"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <KPICard
        title="New Invoices"
        value={metrics.newInvoices.toString()}
        icon={<DollarSign className="w-5 h-5" />}
      />
      <KPICard
        title="Pending Payment Process"
        value={metrics.pendingPayments.toString()}
        icon={<TrendingUp className="w-5 h-5" />}
      />
      <KPICard
        title="Total Outstanding"
        value={`K${metrics.totalOutstanding.toLocaleString()}`}
        icon={<CreditCard className="w-5 h-5" />}
      />
      <KPICard
        title="Total Overdue"
        value={`K${metrics.totalOverdue.toLocaleString()}`}
        icon={<AlertTriangle className="w-5 h-5" />}
      />
    </div>
  );
}