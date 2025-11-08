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
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { 
  LayoutDashboard, 
  FileText, 
  CheckCircle,
  Users,
  BarChart3,
  Bell, 
  TreePine,
  User,
  Cog,
  LogOut,
  ClipboardList,
  ChevronDown,
  ChevronRight
} from "lucide-react"
import { useState } from "react"
import { useUnitNotifications } from "@/hooks/useUnitNotifications"
import { useAuth } from "@/contexts/AuthContext"

interface RegistryNavigationItem {
  title: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  managerOnly?: boolean
}

const registryNavigationItems: RegistryNavigationItem[] = [
  { title: "Dashboard", value: "dashboard", icon: LayoutDashboard },
  { title: "Assessments", value: "assessments", icon: ClipboardList },
  { title: "Team Management", value: "team", icon: Users, managerOnly: true },
  { title: "Reports", value: "reports", icon: BarChart3 },
  { title: "Notifications", value: "notifications", icon: Bell },
]

const accountItems: RegistryNavigationItem[] = [
  { title: "Profile", value: "profile", icon: User },
  { title: "Settings", value: "settings", icon: Cog },
]

interface RegistrySidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function RegistrySidebar({ activeTab, onTabChange }: RegistrySidebarProps) {
  const { user, profile, signOut } = useAuth()
  const { notifications } = useUnitNotifications('registry')
  const { state, isMobile } = useSidebar()
  const [applicationsOpen, setApplicationsOpen] = useState(false)
  
  const isManager = profile?.staff_position && ['manager', 'director', 'managing_director'].includes(profile.staff_position)
  const unreadCount = notifications.filter(n => !n.is_read).length

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isCollapsed = state === "collapsed"

  const getNavCls = (isActive: boolean) =>
    isActive 
      ? "bg-gradient-primary text-primary-foreground font-medium shadow-primary" 
      : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"

  const filteredNavItems = registryNavigationItems.filter(item => 
    !item.managerOnly || isManager
  )

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
                <p className="text-xs text-muted-foreground">Registry Unit</p>
              </div>
            )}
          </div>
        </div>
        
        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel>Registry Operations</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavItems.map((item) => (
                <SidebarMenuItem key={item.value}>
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
                </SidebarMenuItem>
              ))}

              {/* Applications Reviews with submenu */}
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setApplicationsOpen(!applicationsOpen)}
                  className="w-full hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
                >
                  <FileText className="w-5 h-5 shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="ml-3 flex-1 text-left">Applications Reviews</span>
                      {applicationsOpen ? 
                        <ChevronDown className="w-4 h-4" /> : 
                        <ChevronRight className="w-4 h-4" />
                      }
                    </>
                  )}
                </SidebarMenuButton>
                {applicationsOpen && !isCollapsed && (
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <button
                          onClick={() => onTabChange('intent-reviews')}
                          className={`w-full ${getNavCls(activeTab === 'intent-reviews')}`}
                        >
                          <ClipboardList className="w-4 h-4 shrink-0" />
                          <span className="ml-2">Intent Application Review</span>
                        </button>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <button
                          onClick={() => onTabChange('permit-reviews')}
                          className={`w-full ${getNavCls(activeTab === 'permit-reviews')}`}
                        >
                          <FileText className="w-4 h-4 shrink-0" />
                          <span className="ml-2">Permit Application Review</span>
                        </button>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
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
