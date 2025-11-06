import { 
  User, 
  FileText, 
  Users, 
  Settings, 
  Bell, 
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
  Search,
  Archive
} from "lucide-react";

export interface MenuItem {
  title: string;
  url?: string;
  icon: any;
  subItems?: MenuItem[];
}

export const publicMenuItems: MenuItem[] = [
  { title: "Dashboard", url: "/public-dashboard", icon: BarChart3 },
  { title: "Entity Registration", url: "/entity-registration", icon: Building },
  { title: "Submit Application", url: "/submit-application", icon: Plus },
  { title: "My Applications", url: "/applications", icon: ClipboardList },
  { title: "My Permits", url: "/permits", icon: Shield },
  { title: "Documents", url: "/documents", icon: FileText },
  { title: "Payments", url: "/payments", icon: DollarSign },
  { title: "Profile", url: "/profile", icon: User },
];

export const staffMenuItems: MenuItem[] = [
  { 
    title: "Dashboard", 
    url: "/staff-dashboard", 
    icon: BarChart3 
  },
  {
    title: "EIA Assessment",
    icon: TreePine,
    subItems: [
      { title: "Pending EIA Reviews", url: "/eia/pending", icon: Clock },
      { title: "Under Assessment", url: "/eia/assessment", icon: FileCheck },
      { title: "Completed Assessments", url: "/eia/completed", icon: CheckCircle },
      { title: "EIA Workflow", url: "/eia/workflow", icon: AlertTriangle },
    ]
  },
  {
    title: "Application Management",
    icon: ClipboardList,
    subItems: [
      { title: "Pending Applications", url: "/applications/pending", icon: Clock },
      { title: "Under Assessment", url: "/applications/assessment", icon: FileCheck },
      { title: "Approved Applications", url: "/applications/approved", icon: CheckCircle },
      { title: "Rejected Applications", url: "/applications/rejected", icon: XCircle },
      { title: "All Applications", url: "/applications/all", icon: Search },
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
      { title: "Transfer Requests", url: "/permits/transfers", icon: Archive },
    ]
  },
  {
    title: "Compliance & Monitoring",
    icon: FileCheck,
    subItems: [
      { title: "Schedule Assessment", url: "/assessments/schedule", icon: Calendar },
      { title: "Assessment Reports", url: "/assessments/reports", icon: FileText },
      { title: "Compliance Monitoring", url: "/assessments/monitoring", icon: AlertTriangle },
      { title: "Site Inspections", url: "/assessments/inspections", icon: Search },
    ]
  },
  {
    title: "Financial Management",
    icon: DollarSign,
    subItems: [
      { title: "Fee Calculations", url: "/finance/calculations", icon: Receipt },
      { title: "Pending Payments", url: "/finance/pending", icon: Clock },
      { title: "Payment History", url: "/finance/history", icon: History },
      { title: "Fee Configuration", url: "/finance/fees", icon: Settings },
    ]
  },
  {
    title: "Reports & Analytics",
    icon: BarChart3,
    subItems: [
      { title: "Application Reports", url: "/reports/applications", icon: ClipboardList },
      { title: "EIA Reports", url: "/reports/eia", icon: TreePine },
      { title: "Permit Reports", url: "/reports/permits", icon: Shield },
      { title: "Financial Reports", url: "/reports/financial", icon: DollarSign },
      { title: "Compliance Reports", url: "/reports/compliance", icon: FileCheck },
    ]
  }
];

export const adminMenuItems: MenuItem[] = [
  { 
    title: "Admin Dashboard", 
    url: "/admin-dashboard", 
    icon: BarChart3 
  },
  {
    title: "User Management",
    icon: Users,
    subItems: [
      { title: "Public Users", url: "/users/public", icon: User },
      { title: "Staff Users", url: "/users/staff", icon: Building },
      { title: "Role Management", url: "/users/roles", icon: Shield },
      { title: "User Permissions", url: "/users/permissions", icon: Settings },
    ]
  },
  {
    title: "System Configuration",
    icon: Cog,
    subItems: [
      { title: "System Settings", url: "/config/system", icon: Settings },
      { title: "Document Templates", url: "/config/templates", icon: FileText },
      { title: "Notification Settings", url: "/config/notifications", icon: Bell },
      { title: "Fee Structure", url: "/config/fees", icon: DollarSign },
    ]
  },
  // Include all staff menu items for admin
  ...staffMenuItems.filter(item => item.title !== "Dashboard")
];

export const getMenuItemsForRole = (userRole: string | undefined): MenuItem[] => {
  if (!userRole || userRole === 'public') {
    return publicMenuItems;
  }
  
  if (['registry', 'compliance', 'finance', 'revenue', 'directorate', 'officer', 'manager'].includes(userRole)) {
    return staffMenuItems;
  }
  
  // Admin gets full access including admin-specific items
  if (userRole === 'admin') {
    return adminMenuItems;
  }
  
  return publicMenuItems;
};

export const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case 'registry': return 'Registry Staff';
    case 'compliance': return 'Compliance Staff';
    case 'finance': return 'Finance Staff';
    case 'revenue': return 'Revenue Staff';
    case 'directorate': return 'Directorate Staff';
    case 'officer': return 'Officer';
    case 'manager': return 'Manager';
    case 'admin': return 'Administrator';
    case 'public': return 'Public User';
    default: return role?.replace('_', ' ') || 'User';
  }
};
