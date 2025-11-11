import { SimpleHeader } from '@/components/SimpleHeader';
import { RevenueChart, PermitsChart, TeamPerformanceChart } from '@/components/analytics-chart';
import { StaffKPIs } from '@/components/staff/StaffKPIs';
import { StaffOperationalSections } from '@/components/staff/StaffOperationalSections';

export default function StaffDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <SimpleHeader />
      <main className="p-6">
        <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">Welcome to the PNG Conservation Management System</p>
        </div>

        {/* Key Performance Indicators */}
        <StaffKPIs />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RevenueChart />
          <PermitsChart />
          <TeamPerformanceChart />
        </div>

        {/* Operational Sections */}
        <StaffOperationalSections />
        </div>
      </main>
    </div>
  );
}
