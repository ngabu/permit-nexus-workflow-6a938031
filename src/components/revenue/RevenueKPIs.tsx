import { KPICard } from '@/components/kpi-card';
import { DollarSign, TrendingUp, CreditCard, AlertTriangle } from 'lucide-react';
import { useInvoices } from './hooks/useInvoices';
import { useMemo } from 'react';

export function RevenueKPIs() {
  const { invoices, loading } = useInvoices();

  const metrics = useMemo(() => {
    if (loading || !invoices.length) {
      return {
        monthlyRevenue: 0,
        collectionsRate: 0,
        outstandingFees: 0,
        overduePayments: 0
      };
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Calculate monthly revenue (paid invoices this month)
    const monthlyRevenue = invoices
      .filter(invoice => {
        if (!invoice.paid_date) return false;
        const paidDate = new Date(invoice.paid_date);
        return paidDate.getMonth() === currentMonth && paidDate.getFullYear() === currentYear;
      })
      .reduce((sum, invoice) => sum + invoice.amount, 0);

    // Calculate collections rate (paid vs total)
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter(invoice => invoice.payment_status === 'paid').length;
    const collectionsRate = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0;

    // Calculate outstanding fees (pending + overdue)
    const outstandingFees = invoices
      .filter(invoice => invoice.payment_status === 'pending' || invoice.payment_status === 'overdue')
      .reduce((sum, invoice) => sum + invoice.amount, 0);

    // Count overdue payments
    const overduePayments = invoices.filter(invoice => invoice.payment_status === 'overdue').length;

    return {
      monthlyRevenue,
      collectionsRate,
      outstandingFees,
      overduePayments
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
        title="Monthly Revenue"
        value={`K${metrics.monthlyRevenue.toLocaleString()}`}
        change={8.5}
        trend="up"
        icon={<DollarSign className="w-5 h-5" />}
      />
      <KPICard
        title="Collections Rate"
        value={`${metrics.collectionsRate.toFixed(1)}%`}
        change={3.2}
        trend="up"
        icon={<TrendingUp className="w-5 h-5" />}
      />
      <KPICard
        title="Outstanding Fees"
        value={`K${metrics.outstandingFees.toLocaleString()}`}
        change={-12}
        trend="down"
        icon={<CreditCard className="w-5 h-5" />}
      />
      <KPICard
        title="Overdue Payments"
        value={metrics.overduePayments.toString()}
        change={-5}
        trend="down"
        icon={<AlertTriangle className="w-5 h-5" />}
      />
    </div>
  );
}