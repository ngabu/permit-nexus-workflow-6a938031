import { useState } from "react"
import { NavLink } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent, 
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { 
  LayoutDashboard, 
  Building2, 
  FileText, 
  CreditCard, 
  Bell, 
  Upload,
  TreePine,
  User,
  Cog,
  LogOut,
  ChevronDown,
  List,
  FilePlus,
  Merge,
  Edit,
  Shield,
  AlertTriangle,
  RefreshCw,
  UserX,
  ArrowRightLeft
} from "lucide-react"
import { useUserNotifications } from "@/hooks/useUserNotifications"
import { useAuth } from "@/contexts/AuthContext"

interface PublicNavigationItem {
  title: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  subItems?: PublicNavigationItem[]
}

const publicNavigationItems: PublicNavigationItem[] = [
  { title: "Dashboard", value: "dashboard", icon: LayoutDashboard },
  { title: "Entities", value: "entities", icon: Building2 },
  { 
    title: "Intent Registration", 
    value: "intent-registration", 
    icon: FilePlus,
    subItems: [
      { title: "New Intent", value: "intent-registration-new", icon: FilePlus },
      { title: "Existing Intents", value: "intent-registration-existing", icon: List },
    ]
  },
  { 
    title: "Permits Management", 
    value: "permits", 
    icon: FileText,
    subItems: [
      { title: "Permit Listing", value: "permits", icon: List },
      { title: "New Permit Application", value: "permit-application-new", icon: FilePlus },
      { title: "Permit Amalgamation", value: "permit-amalgamation", icon: Merge },
      { title: "Permit Amendment", value: "permit-amendment", icon: Edit },
      { title: "Permit Compliance", value: "permit-compliance", icon: Shield },
      { title: "Permit Enforcement", value: "permit-enforcement", icon: AlertTriangle },
      { title: "Permit Renewal", value: "permit-renewal", icon: RefreshCw },
      { title: "Permit Surrender", value: "permit-surrender", icon: UserX },
      { title: "Permit Transfer", value: "permit-transfer", icon: ArrowRightLeft },
    ]
  },
  { title: "Invoices", value: "invoices", icon: CreditCard },
  { title: "Notifications", value: "notifications", icon: Bell },
  { title: "Documents", value: "documents", icon: Upload },
]

const accountItems: PublicNavigationItem[] = [
  { title: "Profile", value: "profile", icon: User },
  { title: "Settings", value: "settings", icon: Cog },
]

interface PublicSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function PublicSidebar({ activeTab, onTabChange }: PublicSidebarProps) {
  const { user, signOut } = useAuth()
  const { unreadCount } = useUserNotifications(user?.id)
  const { state, isMobile } = useSidebar()
  const [openMenus, setOpenMenus] = useState<string[]>([])

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isCollapsed = state === "collapsed"

  const toggleMenu = (value: string) => {
    setOpenMenus(prev => 
      prev.includes(value) 
        ? prev.filter(v => v !== value)
        : [...prev, value]
    )
  }

  const getNavCls = (isActive: boolean) =>
    isActive 
      ? "bg-gradient-primary text-primary-foreground font-medium shadow-primary" 
      : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"

  return (
    <Sidebar
      className="w-64 border-r border-sidebar-border bg-sidebar"
      collapsible="icon"
    >
      <SidebarContent className="p-4">
        {/* Branding */}
        <div className="mb-8 px-2">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-forest-500 to-nature-600 rounded-lg flex items-center justify-center">
              <TreePine className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-bold text-sidebar-foreground">PNG CEPA E-permit</h2>
                <p className="text-xs text-muted-foreground">Public Portal</p>
              </div>
            )}
          </div>
        </div>
        
        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {publicNavigationItems.map((item) => (
                <SidebarMenuItem key={item.value}>
                  {item.subItems ? (
                    <Collapsible
                      open={openMenus.includes(item.value)}
                      onOpenChange={() => toggleMenu(item.value)}
                    >
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="w-full">
                          <item.icon className="w-5 h-5 shrink-0" />
                          {!isCollapsed && (
                            <>
                              <span className="ml-3 flex-1 text-left">{item.title}</span>
                              <ChevronDown className={`w-4 h-4 transition-transform ${openMenus.includes(item.value) ? 'rotate-180' : ''}`} />
                            </>
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      {!isCollapsed && (
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.subItems.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.value}>
                                <SidebarMenuSubButton asChild>
                                  <button
                                    onClick={() => onTabChange(subItem.value)}
                                    className={`w-full ${getNavCls(activeTab === subItem.value)}`}
                                  >
                                    <subItem.icon className="w-4 h-4 shrink-0" />
                                    <span className="ml-2">{subItem.title}</span>
                                  </button>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      )}
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton asChild>
                      <button
                        onClick={() => onTabChange(item.value)}
                        className={`w-full ${getNavCls(activeTab === item.value)}`}
                      >
                        <item.icon className="w-5 h-5 shrink-0" />
                        {!isCollapsed && (
                          <>
                            <span className="ml-3 flex-1 text-left">{item.title}</span>
                            {item.value === 'notifications' && unreadCount > 0 && (
                              <span className="bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {unreadCount > 99 ? '99+' : unreadCount}
                              </span>
                            )}
                          </>
                        )}
                      </button>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-8">
          {!isCollapsed && <SidebarGroupLabel>Account</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton asChild>
                    <button
                      onClick={() => onTabChange(item.value)}
                      className={`w-full ${getNavCls(activeTab === item.value)}`}
                    >
                      <item.icon className="w-5 h-5 shrink-0" />
                      {!isCollapsed && <span className="ml-3 flex-1 text-left">{item.title}</span>}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={handleSignOut}
                    className="w-full hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200 text-amber-600 hover:bg-amber-500/10"
                  >
                    <LogOut className="w-5 h-5 shrink-0" />
                    {!isCollapsed && <span className="ml-3 flex-1 text-left">Sign Out</span>}
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}