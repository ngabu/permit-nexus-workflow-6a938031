import { 
  User, 
  FileText, 
  Users, 
  Settings, 
  ClipboardList,
  Shield,
  DollarSign,
  BarChart3,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Receipt,
  History,
  FileCheck,
  Building,
  Cog,
  TreePine,
  Calculator,
  TrendingUp,
  Target
} from "lucide-react";

export const publicMenuItems = [
  { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
  { title: "Entity Registration", url: "/entity-registration", icon: Building },
  { title: "Submit Application", url: "/submit-application", icon: Plus },
  { title: "My Applications", url: "/applications", icon: ClipboardList },
  { title: "My Permits", url: "/permits", icon: Shield },
  { title: "Documents", url: "/documents", icon: FileText },
  { title: "Payments", url: "/payments", icon: DollarSign },
  { title: "Profile", url: "/profile", icon: User },
];

export const staffMenuItems = [
  { 
    title: "Dashboard", 
    url: "/dashboard", 
    icon: BarChart3 
  },
  {
    title: "Application Management",
    icon: ClipboardList,
    subItems: [
      { title: "Pending Applications", url: "/applications/pending", icon: Clock },
      { title: "Under Assessment", url: "/applications/assessment", icon: FileCheck },
      { title: "Approved Applications", url: "/applications/approved", icon: CheckCircle },
      { title: "Rejected Applications", url: "/applications/rejected", icon: XCircle },
    ]
  },
  {
    title: "Permit Management",
    icon: Shield,
    subItems: [
      { title: "Active Permits", url: "/permits/active", icon: CheckCircle },
      { title: "Expired Permits", url: "/permits/expired", icon: Clock },
      { title: "Revoked Permits", url: "/permits/revoked", icon: XCircle },
      { title: "Renewal Requests", url: "/permits/renewals", icon: AlertTriangle },
    ]
  },
  {
    title: "Compliance & Assessments",
    icon: FileCheck,
    subItems: [
      { title: "Schedule Assessment", url: "/assessments/schedule", icon: Calendar },
      { title: "Assessment Reports", url: "/assessments/reports", icon: FileText },
      { title: "Compliance Monitoring", url: "/assessments/monitoring", icon: AlertTriangle },
    ]
  },
  {
    title: "Financial Management",
    icon: DollarSign,
    subItems: [
      { title: "Pending Payments", url: "/finance/pending", icon: Clock },
      { title: "Payment History", url: "/finance/history", icon: History },
      { title: "Fee Configuration", url: "/finance/fees", icon: Settings },
    ]
  },
  {
    title: "User Management",
    icon: Users,
    subItems: [
      { title: "Public Users", url: "/users/public", icon: User },
      { title: "Staff Users", url: "/users/staff", icon: Building },
      { title: "Role Management", url: "/users/roles", icon: Shield },
    ]
  },
  {
    title: "Reports & Analytics",
    icon: BarChart3,
    subItems: [
      { title: "Application Reports", url: "/reports/applications", icon: ClipboardList },
      { title: "Permit Reports", url: "/reports/permits", icon: Shield },
      { title: "Financial Reports", url: "/reports/financial", icon: DollarSign },
      { title: "Compliance Reports", url: "/reports/compliance", icon: FileCheck },
    ]
  },
  {
    title: "System Configuration",
    icon: Cog,
    subItems: [
      { title: "User Management", url: "/user-management", icon: Users },
      { title: "System Settings", url: "/config/system", icon: Settings },
      { title: "Document Templates", url: "/config/templates", icon: FileText },
      { title: "Notification Settings", url: "/config/notifications", icon: Settings },
    ]
  }
];

export const getUnitSpecificMenuItems = (cepaUnit: string | undefined) => {
  const baseItems = [
    { title: "Dashboard", url: "/dashboard", icon: BarChart3 }
  ];

  switch (cepaUnit) {
    case 'registry':
      return [
        ...baseItems,
        {
          title: "Application Management",
          icon: ClipboardList,
          subItems: [
            { title: "Pending Applications", url: "/applications/pending", icon: Clock },
            { title: "Under Assessment", url: "/applications/assessment", icon: FileCheck },
            { title: "Approved Applications", url: "/applications/approved", icon: CheckCircle },
            { title: "Rejected Applications", url: "/applications/rejected", icon: XCircle },
          ]
        },
        {
          title: "Permit Management",
          icon: Shield,
          subItems: [
            { title: "Active Permits", url: "/permits/active", icon: CheckCircle },
            { title: "Expired Permits", url: "/permits/expired", icon: Clock },
            { title: "Renewal Requests", url: "/permits/renewals", icon: AlertTriangle },
          ]
        },
        {
          title: "Reports",
          icon: BarChart3,
          subItems: [
            { title: "Application Reports", url: "/reports/applications", icon: ClipboardList },
            { title: "Permit Reports", url: "/reports/permits", icon: Shield },
          ]
        }
      ];

    case 'compliance':
      return [
        ...baseItems,
        {
          title: "Compliance & Assessments",
          icon: FileCheck,
          subItems: [
            { title: "Schedule Assessment", url: "/assessments/schedule", icon: Calendar },
            { title: "Assessment Reports", url: "/assessments/reports", icon: FileText },
            { title: "Compliance Monitoring", url: "/assessments/monitoring", icon: AlertTriangle },
            { title: "EIA Reviews", url: "/eia-reviews", icon: TreePine },
          ]
        },
        {
          title: "Permit Monitoring",
          icon: Shield,
          subItems: [
            { title: "Active Permits", url: "/permits/active", icon: CheckCircle },
            { title: "Compliance Reports", url: "/compliance-reports", icon: FileCheck },
          ]
        }
      ];

    case 'revenue':
      return [
        ...baseItems,
        {
          title: "Revenue Management",
          icon: DollarSign,
          subItems: [
            { title: "Fee Collection", url: "/revenue/collection", icon: Receipt },
            { title: "Revenue Reports", url: "/revenue/reports", icon: BarChart3 },
            { title: "Outstanding Payments", url: "/revenue/outstanding", icon: AlertTriangle },
          ]
        }
      ];

    case 'finance':
      return [
        ...baseItems,
        {
          title: "Financial Management",
          icon: DollarSign,
          subItems: [
            { title: "Pending Payments", url: "/finance/pending", icon: Clock },
            { title: "Payment History", url: "/finance/history", icon: History },
            { title: "Financial Reports", url: "/finance/reports", icon: BarChart3 },
            { title: "Budget Planning", url: "/finance/budget", icon: Calculator },
          ]
        }
      ];

    case 'directorate':
      return [
        ...baseItems,
        {
          title: "Executive Overview",
          icon: BarChart3,
          subItems: [
            { title: "Performance Dashboard", url: "/executive/performance", icon: TrendingUp },
            { title: "Strategic Reports", url: "/executive/reports", icon: FileText },
            { title: "Unit Performance", url: "/executive/units", icon: Building },
          ]
        },
        {
          title: "Policy & Planning",
          icon: Cog,
          subItems: [
            { title: "Policy Management", url: "/policy/management", icon: FileText },
            { title: "Strategic Planning", url: "/policy/planning", icon: Target },
          ]
        }
      ];

    default:
      return baseItems;
  }
};

export const getMenuItemsForRole = (userRole: string | undefined, operationalUnit: string | undefined) => {
  if (!userRole || userRole === 'public') {
    return publicMenuItems;
  }
  
  // Use operational_unit for staff roles
  if (['registry', 'compliance', 'revenue', 'finance', 'directorate'].includes(userRole)) {
    return getUnitSpecificMenuItems(userRole);
  }
  
  // Admin gets full access
  if (userRole === 'admin') {
    return staffMenuItems;
  }
  
  return publicMenuItems;
};

export const getRoleDisplayName = (role: string) => {
  const roleNames = {
    public: 'Public User',
    registry: 'Registry Officer',
    compliance: 'Compliance Officer', 
    revenue: 'Revenue Officer',
    finance: 'Finance Officer',
    directorate: 'Director',
    admin: 'Administrator',
    officer: 'Officer',
    manager: 'Manager'
  };
  return roleNames[role as keyof typeof roleNames] || role;
};