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
  Building
} from "lucide-react"

export const getNavigationItems = (role?: string) => {
  const baseItems = [
    { title: "Analytics", url: "/analytics", icon: Database },
    { title: "Reports", url: "/reports", icon: FileText },
    { title: "Permits", url: "/permits", icon: FolderOpen },
  ]

  const roleSpecificItems = []

  if (role === 'public') {
    roleSpecificItems.push({ title: "Dashboard", url: "/dashboard", icon: ChartBar })
  } else if (role === 'registry') {
    roleSpecificItems.push({ title: "Registry", url: "/registry", icon: Database })
  } else if (role === 'compliance') {
    roleSpecificItems.push({ title: "Compliance", url: "/compliance", icon: Shield })
  } else if (role === 'revenue') {
    roleSpecificItems.push({ title: "Revenue", url: "/revenue", icon: DollarSign })
  } else if (role === 'finance') {
    roleSpecificItems.push({ title: "Finance", url: "/finance", icon: AlertTriangle })
  } else if (role === 'directorate') {
    roleSpecificItems.push({ title: "Directorate", url: "/directorate", icon: Building })
  } else if (role === 'admin') {
    // Admin users get access to all dashboards
    roleSpecificItems.push(
      { title: "Admin", url: "/admin", icon: ChartBar },
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

export const getUnitName = (role?: string) => {
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

export const getOperationsLabel = (role?: string) => {
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
