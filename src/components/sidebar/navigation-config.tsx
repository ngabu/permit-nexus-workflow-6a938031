import { 
  ChartBar, 
  Database, 
  FileText, 
  FolderOpen, 
  User, 
  Calendar,
  Bell,
  Cog,
  Shield,
  DollarSign,
  AlertTriangle,
  Building,
  FileCheck,
  TrendingUp,
  Users,
  BarChart3,
  ClipboardList
} from "lucide-react"

export const getNavigationItems = (role?: string, staffPosition?: string) => {
  const roleSpecificItems = []

  if (staffPosition === 'managing_director') {
    // Managing Director specific navigation
    roleSpecificItems.push(
      { title: "Dashboard", url: "/managing-director-dashboard", icon: ChartBar },
      { title: "Notifications", url: "/md/notifications", icon: Bell },
      { title: "Approvals", url: "/md/approvals", icon: FileCheck },
      { title: "Digital Signatures", url: "/md/signatures", icon: FileText },
      { title: "Enforcement", url: "/md/enforcement", icon: AlertTriangle },
      { title: "Reports", url: "/md/reports", icon: TrendingUp }
    )
    return roleSpecificItems
  }

  const baseItems = [
    { title: "Analytics", url: "/analytics", icon: Database },
    { title: "Reports", url: "/reports", icon: FileText },
    { title: "Permits", url: "/permits", icon: FolderOpen },
  ]

  if (role === 'public') {
    roleSpecificItems.push({ title: "Dashboard", url: "/dashboard", icon: ChartBar })
  } else if (role === 'registry') {
    roleSpecificItems.push({ title: "Registry", url: "/registry", icon: Database })
  } else if (role === 'compliance') {
    roleSpecificItems.push({ title: "Compliance", url: "/compliance", icon: Shield })
  } else if (role === 'revenue') {
    roleSpecificItems.push(
      { title: "Dashboard", url: "/revenue", icon: ChartBar },
      { title: "Collection", url: "/revenue/collection", icon: DollarSign },
      { title: "Outstanding", url: "/revenue/outstanding", icon: AlertTriangle },
      { title: "Reports", url: "/revenue/reports", icon: FileText },
      { title: "Revenue Item Codes", url: "/revenue/item-codes", icon: Database }
    )
  } else if (role === 'finance') {
    roleSpecificItems.push({ title: "Finance", url: "/finance", icon: AlertTriangle })
  } else if (role === 'directorate') {
    roleSpecificItems.push({ title: "Directorate", url: "/directorate", icon: Building })
  } else if (role === 'admin') {
    // Admin users get access to all dashboards
    roleSpecificItems.push(
      { title: "Admin", url: "/admin", icon: ChartBar },
      { title: "Approvals & Signatures", url: "/admin/approvals-signatures", icon: FileCheck },
      { title: "Registry", url: "/registry", icon: Database },
      { title: "Compliance", url: "/compliance", icon: Shield },
      { title: "Revenue", url: "/revenue", icon: DollarSign },
      { title: "Finance", url: "/finance", icon: AlertTriangle },
      { title: "Directorate", url: "/directorate", icon: Building }
    )
  }

  return [...roleSpecificItems, ...baseItems]
}

export const secondaryItems = [
  { title: "Team", url: "/team", icon: User },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Settings", url: "/settings", icon: Cog },
]

export const getUnitName = (role?: string, staffPosition?: string) => {
  if (staffPosition === 'managing_director') {
    return 'Managing Director Office'
  }
  
  switch (role) {
    case 'public': return 'Applicant Portal'
    case 'registry': return 'Registry Unit'
    case 'compliance': return 'Compliance Unit'
    case 'revenue': return 'Revenue Unit'
    case 'finance': return 'Finance Unit'
    case 'directorate': return 'Directorate'
    case 'admin': return 'Admin Portal'
    default: return 'Operations Dashboard'
  }
}

export const getOperationsLabel = (role?: string, staffPosition?: string) => {
  if (staffPosition === 'managing_director') {
    return 'Executive Operations'
  }
  
  switch (role) {
    case 'public': return 'Applications'
    case 'registry': return 'Registry Operations'
    case 'compliance': return 'Compliance Monitoring'
    case 'revenue': return 'Revenue Management'
    case 'finance': return 'Financial Operations'
    case 'directorate': return 'Strategic Planning'
    case 'admin': return 'Administration'
    default: return 'Operations'
  }
}
