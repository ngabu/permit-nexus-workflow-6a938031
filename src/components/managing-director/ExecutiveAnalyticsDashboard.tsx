import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Download, 
  Printer, 
  TrendingUp, 
  TrendingDown, 
  Target,
  Globe,
  Building2,
  FileCheck,
  DollarSign,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  MapPin,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Calendar,
  FileText,
  Leaf,
  Factory,
  Loader2
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useMemo } from "react";
import { format, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear, subYears } from "date-fns";
import { exportReportToDocx } from "@/utils/exportReportToDocx";
import { toast } from "sonner";

const EXECUTIVE_COLORS = [
  'hsl(142, 76%, 36%)',   // Green - success
  'hsl(221, 83%, 53%)',   // Blue - primary
  'hsl(45, 93%, 47%)',    // Yellow/Gold - warning
  'hsl(0, 84%, 60%)',     // Red - danger
  'hsl(262, 83%, 58%)',   // Purple - accent
  'hsl(173, 80%, 40%)',   // Teal
  'hsl(30, 100%, 50%)',   // Orange
  'hsl(280, 65%, 60%)',   // Violet
];

const SECTOR_COLORS: Record<string, string> = {
  'Mining': 'hsl(45, 93%, 47%)',
  'Forestry': 'hsl(142, 76%, 36%)',
  'Agriculture': 'hsl(82, 70%, 45%)',
  'Manufacturing': 'hsl(221, 83%, 53%)',
  'Oil & Gas': 'hsl(30, 100%, 50%)',
  'Fisheries': 'hsl(195, 83%, 50%)',
  'Construction': 'hsl(25, 75%, 55%)',
  'Tourism': 'hsl(280, 65%, 60%)',
  'Other': 'hsl(220, 14%, 50%)',
};

export function ExecutiveAnalyticsDashboard() {
  const [dateRange, setDateRange] = useState<string>("ytd");
  const [activeTab, setActiveTab] = useState("executive-summary");
  const [investmentYearFilter, setInvestmentYearFilter] = useState<number>(new Date().getFullYear());

  // Calculate date ranges
  const dateFilters = useMemo(() => {
    const now = new Date();
    switch (dateRange) {
      case "mtd":
        return { start: startOfMonth(now), end: now };
      case "ytd":
        return { start: startOfYear(now), end: now };
      case "last-year":
        return { start: startOfYear(subYears(now, 1)), end: endOfYear(subYears(now, 1)) };
      case "all-time":
        return { start: new Date(2020, 0, 1), end: now };
      default:
        return { start: startOfYear(now), end: now };
    }
  }, [dateRange]);

  // Fetch permit applications
  const { data: permitApplications = [] } = useQuery({
    queryKey: ['executive-permits', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permit_applications')
        .select('id, status, permit_type, created_at, updated_at, province, district, entity_name, title')
        .gte('created_at', dateFilters.start.toISOString())
        .lte('created_at', dateFilters.end.toISOString());
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch entities
  const { data: entities = [] } = useQuery({
    queryKey: ['executive-entities', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('entities')
        .select('id, entity_type, province, created_at, is_suspended');
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch fee payments (revenue)
  const { data: feePayments = [] } = useQuery({
    queryKey: ['executive-revenue', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fee_payments')
        .select('id, total_fee, payment_status, created_at, payment_method')
        .gte('created_at', dateFilters.start.toISOString())
        .lte('created_at', dateFilters.end.toISOString());
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch inspections
  const { data: inspections = [] } = useQuery({
    queryKey: ['executive-inspections', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inspections')
        .select('id, status, inspection_type, province, scheduled_date, completed_date, findings')
        .gte('created_at', dateFilters.start.toISOString())
        .lte('created_at', dateFilters.end.toISOString());
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch compliance assessments
  const { data: complianceAssessments = [] } = useQuery({
    queryKey: ['executive-compliance', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compliance_assessments')
        .select('id, assessment_status, compliance_score, created_at')
        .gte('created_at', dateFilters.start.toISOString())
        .lte('created_at', dateFilters.end.toISOString());
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch intent registrations (all for investment value by year)
  const { data: intentRegistrations = [] } = useQuery({
    queryKey: ['executive-intents-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('intent_registrations')
        .select('id, status, province, created_at, estimated_cost_kina, activity_level');
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch compliance reports
  const { data: complianceReports = [] } = useQuery({
    queryKey: ['executive-compliance-reports', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compliance_reports')
        .select('id, status, created_at, permit_id')
        .gte('created_at', dateFilters.start.toISOString())
        .lte('created_at', dateFilters.end.toISOString());
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch permit applications with sector info for compliance tab
  const { data: permitsWithSector = [] } = useQuery({
    queryKey: ['executive-permits-sector', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permit_applications')
        .select('id, status, permit_type, title, entity_name, province, created_at')
        .gte('created_at', dateFilters.start.toISOString())
        .lte('created_at', dateFilters.end.toISOString());
      if (error) throw error;
      return data || [];
    },
  });

  // Generate available years for investment filter
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    const currentYear = new Date().getFullYear();
    years.add(currentYear);
    intentRegistrations.forEach(intent => {
      if (intent.created_at) {
        years.add(new Date(intent.created_at).getFullYear());
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [intentRegistrations]);

  // Calculate investment values by activity level for selected year (only approved/active permits)
  const investmentByLevel = useMemo(() => {
    const yearStart = new Date(investmentYearFilter, 0, 1);
    const yearEnd = new Date(investmentYearFilter, 11, 31, 23, 59, 59);
    
    // Filter for active (approved) intent registrations within the selected year
    const activeYearIntents = intentRegistrations.filter(intent => {
      const createdDate = new Date(intent.created_at);
      return createdDate >= yearStart && createdDate <= yearEnd && intent.status === 'approved';
    });

    const level2Intents = activeYearIntents.filter(i => i.activity_level === 'Level 2' || i.activity_level === '2');
    const level3Intents = activeYearIntents.filter(i => i.activity_level === 'Level 3' || i.activity_level === '3');

    const level2Value = level2Intents.reduce((sum, i) => sum + Number(i.estimated_cost_kina || 0), 0);
    const level3Value = level3Intents.reduce((sum, i) => sum + Number(i.estimated_cost_kina || 0), 0);
    
    return {
      level2: {
        value: level2Value,
        count: level2Intents.length,
      },
      level3: {
        value: level3Value,
        count: level3Intents.length,
      },
      total: level2Value + level3Value,
      totalCount: level2Intents.length + level3Intents.length,
    };
  }, [intentRegistrations, investmentYearFilter]);

  // Compliance tab data
  const complianceTabData = useMemo(() => {
    const totalPermits = permitApplications.length;
    const totalComplianceReports = complianceReports.length;
    
    // Permits by sector/permit type
    const sectorMap = new Map<string, number>();
    permitsWithSector.forEach(permit => {
      const sector = permit.permit_type || 'Other';
      sectorMap.set(sector, (sectorMap.get(sector) || 0) + 1);
    });
    const permitsBySector = Array.from(sectorMap.entries())
      .map(([sector, count]) => ({ sector, count }))
      .sort((a, b) => b.count - a.count);

    // Total inspections carried out (completed)
    const totalInspectionsCarried = inspections.filter(i => i.status === 'completed').length;
    
    // Violations - inspections with findings
    const violationInspections = inspections.filter(i => i.findings && i.findings.trim() !== '');
    const violationsReported = violationInspections.length;
    
    return {
      totalPermits,
      totalComplianceReports,
      permitsBySector,
      totalInspectionsCarried,
      violationsReported,
      violationInspections,
    };
  }, [permitApplications, complianceReports, permitsWithSector, inspections]);

  // Calculate Executive Summary KPIs
  const executiveKPIs = useMemo(() => {
    const totalApplications = permitApplications.length;
    const approvedApplications = permitApplications.filter(a => a.status === 'approved' || a.status === 'issued').length;
    const pendingApplications = permitApplications.filter(a => ['pending', 'submitted', 'under_review', 'under_initial_review', 'under_technical_review'].includes(a.status)).length;
    const rejectedApplications = permitApplications.filter(a => a.status === 'rejected' || a.status === 'denied').length;
    
    const totalRevenue = feePayments.reduce((sum, p) => sum + Number(p.total_fee || 0), 0);
    const collectedRevenue = feePayments.filter(p => p.payment_status === 'paid').reduce((sum, p) => sum + Number(p.total_fee || 0), 0);
    const pendingRevenue = feePayments.filter(p => p.payment_status === 'pending').reduce((sum, p) => sum + Number(p.total_fee || 0), 0);
    
    const completedInspections = inspections.filter(i => i.status === 'completed').length;
    const scheduledInspections = inspections.filter(i => i.status === 'scheduled').length;
    
    const avgComplianceScore = complianceAssessments.filter(c => c.compliance_score).length > 0
      ? Math.round(complianceAssessments.reduce((sum, c) => sum + (c.compliance_score || 0), 0) / complianceAssessments.filter(c => c.compliance_score).length)
      : 0;
    
    const approvalRate = totalApplications > 0 ? Math.round((approvedApplications / totalApplications) * 100) : 0;
    const collectionRate = totalRevenue > 0 ? Math.round((collectedRevenue / totalRevenue) * 100) : 0;
    
    const totalProjectValue = intentRegistrations.reduce((sum, i) => sum + Number(i.estimated_cost_kina || 0), 0);
    
    return {
      totalApplications,
      approvedApplications,
      pendingApplications,
      rejectedApplications,
      totalRevenue,
      collectedRevenue,
      pendingRevenue,
      totalInspections: inspections.length,
      completedInspections,
      scheduledInspections,
      avgComplianceScore,
      approvalRate,
      collectionRate,
      totalEntities: entities.length,
      activeEntities: entities.filter(e => !e.is_suspended).length,
      totalProjectValue,
      totalIntents: intentRegistrations.length,
    };
  }, [permitApplications, feePayments, inspections, complianceAssessments, entities, intentRegistrations]);

  // Provincial distribution data - shows active permits per province
  const provincialData = useMemo(() => {
    const provinceMap = new Map<string, number>();
    
    // Filter for active permits only (approved, active, issued)
    const activeStatuses = ['approved', 'active', 'issued'];
    const activePermits = permitApplications.filter(app => 
      activeStatuses.includes(app.status?.toLowerCase() || '')
    );
    
    activePermits.forEach(app => {
      const province = app.province || 'Unknown';
      provinceMap.set(province, (provinceMap.get(province) || 0) + 1);
    });
    
    // Get all PNG provinces and include those with 0 permits
    const pngProvinces = [
      'Western Province', 'Gulf Province', 'Central Province', 'National Capital District',
      'Milne Bay Province', 'Oro Province', 'Southern Highlands Province', 'Hela Province',
      'Enga Province', 'Western Highlands Province', 'Jiwaka Province', 'Chimbu Province',
      'Eastern Highlands Province', 'Morobe Province', 'Madang Province', 'East Sepik Province',
      'Sandaun Province', 'Manus Province', 'New Ireland Province', 'East New Britain Province',
      'West New Britain Province', 'Autonomous Region of Bougainville'
    ];
    
    return pngProvinces
      .map(province => ({ 
        province, 
        activePermits: provinceMap.get(province) || 0 
      }))
      .sort((a, b) => b.activePermits - a.activePermits);
  }, [permitApplications]);

  // Monthly trends data
  const monthlyTrends = useMemo(() => {
    const months: { month: string; applications: number; approvals: number; revenue: number }[] = [];
    
    for (let i = 11; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      const monthLabel = format(date, 'MMM yyyy');
      
      const monthApps = permitApplications.filter(a => {
        const created = new Date(a.created_at);
        return created >= monthStart && created <= monthEnd;
      });
      
      const monthApprovals = monthApps.filter(a => a.status === 'approved' || a.status === 'issued').length;
      
      const monthRevenue = feePayments.filter(p => {
        const created = new Date(p.created_at);
        return created >= monthStart && created <= monthEnd && p.payment_status === 'paid';
      }).reduce((sum, p) => sum + Number(p.total_fee || 0), 0);
      
      months.push({
        month: monthLabel,
        applications: monthApps.length,
        approvals: monthApprovals,
        revenue: monthRevenue,
      });
    }
    
    return months;
  }, [permitApplications, feePayments]);

  // Permit type distribution
  const permitTypeDistribution = useMemo(() => {
    const typeMap = new Map<string, number>();
    permitApplications.forEach(app => {
      const type = app.permit_type || 'Unknown';
      typeMap.set(type, (typeMap.get(type) || 0) + 1);
    });
    return Array.from(typeMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [permitApplications]);

  // Status distribution - show Pending, Approved, Rejected only
  const statusDistribution = useMemo(() => {
    const statusCategories = {
      'Pending': ['pending', 'submitted', 'under_review', 'under_technical_review', 'under_compliance_review'],
      'Approved': ['approved', 'active', 'issued'],
      'Rejected': ['rejected', 'declined', 'cancelled']
    };
    
    const result: { name: string; value: number }[] = [];
    
    Object.entries(statusCategories).forEach(([category, statuses]) => {
      const count = permitApplications.filter(app => 
        statuses.includes(app.status?.toLowerCase() || '')
      ).length;
      if (count > 0) {
        result.push({ name: category, value: count });
      }
    });
    
    return result;
  }, [permitApplications]);

  // Entity type distribution
  const entityTypeDistribution = useMemo(() => {
    const typeMap = new Map<string, number>();
    entities.forEach(ent => {
      const type = ent.entity_type || 'Unknown';
      typeMap.set(type, (typeMap.get(type) || 0) + 1);
    });
    return Array.from(typeMap.entries()).map(([name, value]) => ({ name, value }));
  }, [entities]);

  // Performance radar data
  const performanceRadar = useMemo(() => [
    { metric: 'Approval Rate', value: executiveKPIs.approvalRate, fullMark: 100 },
    { metric: 'Collection Rate', value: executiveKPIs.collectionRate, fullMark: 100 },
    { metric: 'Compliance Score', value: executiveKPIs.avgComplianceScore, fullMark: 100 },
    { metric: 'Inspection Rate', value: executiveKPIs.totalInspections > 0 ? Math.round((executiveKPIs.completedInspections / executiveKPIs.totalInspections) * 100) : 0, fullMark: 100 },
    { metric: 'Entity Activity', value: executiveKPIs.totalEntities > 0 ? Math.round((executiveKPIs.activeEntities / executiveKPIs.totalEntities) * 100) : 0, fullMark: 100 },
  ], [executiveKPIs]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PG', { style: 'currency', currency: 'PGK', maximumFractionDigits: 0 }).format(amount);
  };

  const handlePrint = () => window.print();

  const [isExporting, setIsExporting] = useState(false);

  const handleExportDocx = async () => {
    setIsExporting(true);
    try {
      const dateRangeLabel = dateRange === 'mtd' ? 'Month to Date' 
        : dateRange === 'ytd' ? 'Year to Date' 
        : dateRange === 'last-year' ? 'Last Year' 
        : 'All Time';

      await exportReportToDocx({
        dateRange: dateRangeLabel,
        executiveKPIs,
        investmentByLevel,
        investmentYear: investmentYearFilter,
        provincialData,
        permitTypeDistribution,
        statusDistribution,
        entityTypeDistribution,
        complianceTabData,
        monthlyTrends,
      });
      
      toast.success("Report exported successfully", {
        description: "The Word document has been downloaded to your device.",
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast.error("Export failed", {
        description: "There was an error generating the report. Please try again.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Executive Branding */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-glow">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Reports and Analytics</h1>
              <p className="text-muted-foreground">Executive Intelligence Dashboard for Strategic Decision Making</p>
            </div>
          </div>
          <Badge variant="outline" className="mt-2">
            <Calendar className="w-3 h-3 mr-1" />
            Data as of {format(new Date(), 'dd MMMM yyyy, HH:mm')}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mtd">Month to Date</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
              <SelectItem value="last-year">Last Year</SelectItem>
              <SelectItem value="all-time">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button size="sm" onClick={handleExportDocx} disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {isExporting ? 'Exporting...' : 'Export for Briefing'}
          </Button>
        </div>
      </div>

      {/* Executive Summary Cards - Top Level KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="col-span-1 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Total Applications</p>
                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{executiveKPIs.totalApplications}</p>
              </div>
              <FileText className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-3 h-3" />
              <span>{executiveKPIs.pendingApplications} pending</span>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Approval Rate</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{executiveKPIs.approvalRate}%</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-blue-500" />
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-blue-600 dark:text-blue-400">
              <span>{executiveKPIs.approvedApplications} approved</span>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Revenue Collected</p>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{formatCurrency(executiveKPIs.collectedRevenue)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-amber-500" />
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-amber-600 dark:text-amber-400">
              <span>{executiveKPIs.collectionRate}% collection rate</span>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950/30 dark:to-violet-900/20 border-violet-200 dark:border-violet-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-violet-600 dark:text-violet-400 font-medium">Compliance Score</p>
                <p className="text-2xl font-bold text-violet-900 dark:text-violet-100">{executiveKPIs.avgComplianceScore}%</p>
              </div>
              <Shield className="w-8 h-8 text-violet-500" />
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-violet-600 dark:text-violet-400">
              <span>Avg across all permits</span>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/30 dark:to-teal-900/20 border-teal-200 dark:border-teal-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">Registered Entities</p>
                <p className="text-2xl font-bold text-teal-900 dark:text-teal-100">{executiveKPIs.totalEntities}</p>
              </div>
              <Building2 className="w-8 h-8 text-teal-500" />
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-teal-600 dark:text-teal-400">
              <span>{executiveKPIs.activeEntities} active</span>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950/30 dark:to-rose-900/20 border-rose-200 dark:border-rose-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">Inspections</p>
                <p className="text-2xl font-bold text-rose-900 dark:text-rose-100">{executiveKPIs.completedInspections}</p>
              </div>
              <Activity className="w-8 h-8 text-rose-500" />
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-rose-600 dark:text-rose-400">
              <span>{executiveKPIs.scheduledInspections} scheduled</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Investment Value Section with Year Filter */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/30">
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-glow">
                <Factory className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>Total Estimated Project Investment Value</CardTitle>
                <CardDescription>Investment values by activity level</CardDescription>
              </div>
            </div>
            <Select value={investmentYearFilter.toString()} onValueChange={(val) => setInvestmentYearFilter(parseInt(val))}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Level 2 Activities */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Level 2 Activities</p>
                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{formatCurrency(investmentByLevel.level2.value)}</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                      From {investmentByLevel.level2.count} currently active permits
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Building2 className="w-7 h-7 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Level 3 Activities */}
            <Card className="bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950/30 dark:to-violet-900/20 border-violet-200 dark:border-violet-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-violet-600 dark:text-violet-400 font-medium">Level 3 Activities</p>
                    <p className="text-3xl font-bold text-violet-900 dark:text-violet-100">{formatCurrency(investmentByLevel.level3.value)}</p>
                    <p className="text-sm text-violet-600 dark:text-violet-400 mt-1">
                      From {investmentByLevel.level3.count} currently active permits
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-violet-500/20 flex items-center justify-center">
                    <Factory className="w-7 h-7 text-violet-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Total Summary */}
          <div className="mt-6 pt-6 border-t border-primary/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Investment Value for {investmentYearFilter}</p>
              <p className="text-4xl font-bold text-foreground">{formatCurrency(investmentByLevel.total)}</p>
              <p className="text-sm text-muted-foreground mt-1">
                From a total of {investmentByLevel.totalCount} currently active permits
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Avg Project Value</p>
                <p className="text-xl font-bold text-foreground">
                  {investmentByLevel.totalCount > 0 ? formatCurrency(investmentByLevel.total / investmentByLevel.totalCount) : 'K0'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Revenue Potential</p>
                <p className="text-xl font-bold text-primary">
                  {formatCurrency(executiveKPIs.pendingRevenue)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="executive-summary">Executive Overview</TabsTrigger>
          <TabsTrigger value="geographic">Geographic Analysis</TabsTrigger>
          <TabsTrigger value="compliance">Compliance & Enforcement</TabsTrigger>
          <TabsTrigger value="financial">Financial Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends & Forecasting</TabsTrigger>
        </TabsList>

        {/* Executive Summary Tab */}
        <TabsContent value="executive-summary" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance Radar */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Performance Scorecard
                </CardTitle>
                <CardDescription>Key performance indicators at a glance</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={performanceRadar}>
                    <PolarGrid strokeDasharray="3 3" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Radar
                      name="Performance"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Application Status Distribution */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-primary" />
                  Application Status Distribution
                </CardTitle>
                <CardDescription>Current status breakdown of all applications</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={EXECUTIVE_COLORS[index % EXECUTIVE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Entity Types */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Registered Entities by Type
                </CardTitle>
                <CardDescription>Distribution of entity registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={entityTypeDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {entityTypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={EXECUTIVE_COLORS[index % EXECUTIVE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Permit Types Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-primary" />
                Applications by Permit Type
              </CardTitle>
              <CardDescription>Distribution of applications across different permit categories</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={permitTypeDistribution.slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={200} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Applications" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Geographic Analysis Tab */}
        <TabsContent value="geographic" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Provincial Distribution of Active Permits
                </CardTitle>
                <CardDescription>Total number of active permits per province of Papua New Guinea</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={500}>
                  <BarChart data={provincialData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis dataKey="province" type="category" width={220} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="activePermits" fill="hsl(var(--primary))" name="Active Permits" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Financial Performance Tab */}
        <TabsContent value="financial" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">Total Revenue</p>
                    <p className="text-3xl font-bold text-green-900 dark:text-green-100">{formatCurrency(executiveKPIs.totalRevenue)}</p>
                  </div>
                  <DollarSign className="w-12 h-12 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Collected</p>
                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{formatCurrency(executiveKPIs.collectedRevenue)}</p>
                  </div>
                  <CheckCircle2 className="w-12 h-12 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 border-amber-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">Outstanding</p>
                    <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">{formatCurrency(executiveKPIs.pendingRevenue)}</p>
                  </div>
                  <Clock className="w-12 h-12 text-amber-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Monthly Revenue Collection Trend
              </CardTitle>
              <CardDescription>Revenue collected over the past 12 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={monthlyTrends}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(value) => `K${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(142, 76%, 36%)" 
                    fill="url(#colorRevenue)" 
                    name="Revenue Collected"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance & Enforcement Tab */}
        <TabsContent value="compliance" className="space-y-6 mt-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Total Permits</p>
                    <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">{complianceTabData.totalPermits}</p>
                  </div>
                  <FileCheck className="w-10 h-10 text-emerald-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Compliance Reports</p>
                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{complianceTabData.totalComplianceReports}</p>
                  </div>
                  <FileText className="w-10 h-10 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/30 dark:to-teal-900/20 border-teal-200 dark:border-teal-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-teal-600 dark:text-teal-400 font-medium">Inspections Carried Out</p>
                    <p className="text-3xl font-bold text-teal-900 dark:text-teal-100">{complianceTabData.totalInspectionsCarried}</p>
                  </div>
                  <Activity className="w-10 h-10 text-teal-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950/30 dark:to-rose-900/20 border-rose-200 dark:border-rose-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-rose-600 dark:text-rose-400 font-medium">Violations Reported</p>
                    <p className="text-3xl font-bold text-rose-900 dark:text-rose-100">{complianceTabData.violationsReported}</p>
                  </div>
                  <AlertTriangle className="w-10 h-10 text-rose-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Permits by Sector */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-primary" />
                Total Permits by Sector
              </CardTitle>
              <CardDescription>Distribution of permits across different sectors/permit types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={complianceTabData.permitsBySector.slice(0, 10)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis dataKey="sector" type="category" width={180} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Permits" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  <div className="grid grid-cols-3 gap-2 font-medium text-sm text-muted-foreground border-b pb-2">
                    <span>Sector</span>
                    <span className="text-right">Count</span>
                    <span className="text-right">%</span>
                  </div>
                  {complianceTabData.permitsBySector.map((item, index) => (
                    <div key={index} className="grid grid-cols-3 gap-2 text-sm py-1 border-b border-border/50">
                      <span className="truncate">{item.sector}</span>
                      <span className="text-right font-medium">{item.count}</span>
                      <span className="text-right text-muted-foreground">
                        {complianceTabData.totalPermits > 0 
                          ? `${((item.count / complianceTabData.totalPermits) * 100).toFixed(1)}%`
                          : '0%'
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Violations List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                Violations Reported
              </CardTitle>
              <CardDescription>List of permits with reported violations from inspections</CardDescription>
            </CardHeader>
            <CardContent>
              {complianceTabData.violationInspections.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  <div className="grid grid-cols-4 gap-4 font-medium text-sm text-muted-foreground border-b pb-2">
                    <span>Inspection Type</span>
                    <span>Province</span>
                    <span>Date</span>
                    <span>Findings</span>
                  </div>
                  {complianceTabData.violationInspections.map((inspection, index) => (
                    <div key={inspection.id || index} className="grid grid-cols-4 gap-4 text-sm py-2 border-b border-border/50">
                      <span className="font-medium">{inspection.inspection_type || 'N/A'}</span>
                      <span>{inspection.province || 'N/A'}</span>
                      <span>{inspection.completed_date ? format(new Date(inspection.completed_date), 'dd MMM yyyy') : 'Pending'}</span>
                      <span className="truncate text-rose-600 dark:text-rose-400" title={inspection.findings || ''}>
                        {inspection.findings || 'No details'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500 opacity-50" />
                  <p className="text-lg font-medium">No Violations Reported</p>
                  <p className="text-sm mt-2">All inspections have been completed without violations</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends & Forecasting Tab */}
        <TabsContent value="trends" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                12-Month Application & Approval Trends
              </CardTitle>
              <CardDescription>Historical trends and patterns in permit processing</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" allowDecimals={false} />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `K${(value / 1000).toFixed(0)}k`} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="applications" fill="hsl(var(--primary))" name="Applications" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="left" dataKey="approvals" fill="hsl(142, 76%, 36%)" name="Approvals" radius={[4, 4, 0, 0]} />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(45, 93%, 47%)" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(45, 93%, 47%)', strokeWidth: 2 }}
                    name="Revenue (PGK)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Key Insights for PM Briefing */}
          <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Executive Insights for Stakeholder Briefing
              </CardTitle>
              <CardDescription>Key takeaways for Prime Minister and stakeholder presentations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Positive Indicators
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                      {executiveKPIs.approvalRate}% approval rate demonstrates effective regulatory framework
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                      {formatCurrency(executiveKPIs.collectedRevenue)} revenue collected supports government initiatives
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                      {executiveKPIs.totalEntities} registered entities contributing to economic development
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Areas Requiring Attention
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      {executiveKPIs.pendingApplications} applications pending review require expedited processing
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      {formatCurrency(executiveKPIs.pendingRevenue)} in outstanding revenue to be collected
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      {executiveKPIs.scheduledInspections} inspections scheduled - ensure adequate resources
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
