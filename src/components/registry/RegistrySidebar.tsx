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
  User,
  Cog,
  LogOut,
  ClipboardList,
  ChevronDown,
  ChevronRight,
  GitMerge,
  FileEdit,
  ShieldCheck,
  Gavel,
  RotateCw,
  FileX,
  ArrowRightLeft,
  Building,
  FileCheck,
  FolderOpen
} from "lucide-react"
import { useState } from "react"
import { useUnitNotifications } from "@/hooks/useUnitNotifications"
import { useAuth } from "@/contexts/AuthContext"
import pngEmblem from "@/assets/png-emblem.png"

interface RegistryNavigationItem {
  title: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  managerOnly?: boolean
}

const registryNavigationItems: RegistryNavigationItem[] = [
  { title: "Dashboard", value: "dashboard", icon: LayoutDashboard },
]

const managementItems: RegistryNavigationItem[] = [
  { title: "Documents Management", value: "documents-management", icon: FolderOpen },
  { title: "Team Management", value: "team", icon: Users, managerOnly: true },
  { title: "Analytics and Reporting", value: "reports", icon: BarChart3 },
]

const endMenuItems: RegistryNavigationItem[] = [
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
  const [entitiesPermitsOpen, setEntitiesPermitsOpen] = useState(false)
  
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
      ? "bg-white/20 text-white font-medium shadow-glow backdrop-blur-sm" 
      : "text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200"

  const filteredNavItems = registryNavigationItems.filter(item => 
    !item.managerOnly || isManager
  )

  return (
    <Sidebar
      className="border-r border-white/30 bg-primary/95 backdrop-blur-2xl shadow-xl"
      collapsible="icon"
    >
      <SidebarContent className="p-0 bg-gradient-to-b from-primary/90 to-primary/80 backdrop-blur-2xl">
        {/* Branding */}
        <div className="p-4 md:p-6 pb-6 md:pb-8 bg-primary-glow/90 backdrop-blur-xl rounded-br-[3rem] md:rounded-br-[4rem] mb-4 shadow-glow">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-glow-accent p-1">
              <img src={pngEmblem} alt="PNG Emblem" className="w-full h-full object-contain" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-bold text-white text-base md:text-lg">PNG CEPA E-permit</h2>
                <p className="text-xs text-white/70">Registry Unit</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="px-4">
          <SidebarGroup>
            {!isCollapsed && <SidebarGroupLabel className="text-white/60 text-xs uppercase tracking-wider mb-2">Registry Operations</SidebarGroupLabel>}
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
                            <span className="bg-white/30 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center backdrop-blur-sm">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Listings with submenu */}
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setEntitiesPermitsOpen(!entitiesPermitsOpen)}
                  className="w-full text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200"
                >
                  <Building className="w-5 h-5 shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="ml-3 flex-1 text-left">Listings</span>
                      {entitiesPermitsOpen ? 
                        <ChevronDown className="w-4 h-4" /> : 
                        <ChevronRight className="w-4 h-4" />
                      }
                    </>
                  )}
                </SidebarMenuButton>
                {entitiesPermitsOpen && !isCollapsed && (
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <button
                          onClick={() => onTabChange('entities')}
                          className={`w-full ${getNavCls(activeTab === 'entities')}`}
                        >
                          <Building className="w-4 h-4 shrink-0" />
                          <span className="ml-2">Entities</span>
                        </button>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <button
                          onClick={() => onTabChange('intents')}
                          className={`w-full ${getNavCls(activeTab === 'intents')}`}
                        >
                          <ClipboardList className="w-4 h-4 shrink-0" />
                          <span className="ml-2">Intents</span>
                        </button>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <button
                          onClick={() => onTabChange('permits')}
                          className={`w-full ${getNavCls(activeTab === 'permits')}`}
                        >
                          <CheckCircle className="w-4 h-4 shrink-0" />
                          <span className="ml-2">Permits</span>
                        </button>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>

              {/* Applications Reviews with submenu */}
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setApplicationsOpen(!applicationsOpen)}
                  className="w-full text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200"
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
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <button
                          onClick={() => onTabChange('permit-amalgamation')}
                          className={`w-full ${getNavCls(activeTab === 'permit-amalgamation')}`}
                        >
                          <GitMerge className="w-4 h-4 shrink-0" />
                          <span className="ml-2">Permit Amalgamation</span>
                        </button>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <button
                          onClick={() => onTabChange('permit-amendments')}
                          className={`w-full ${getNavCls(activeTab === 'permit-amendments')}`}
                        >
                          <FileEdit className="w-4 h-4 shrink-0" />
                          <span className="ml-2">Permit Amendments</span>
                        </button>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <button
                          onClick={() => onTabChange('permit-compliance')}
                          className={`w-full ${getNavCls(activeTab === 'permit-compliance')}`}
                        >
                          <ShieldCheck className="w-4 h-4 shrink-0" />
                          <span className="ml-2">Permit Compliance</span>
                        </button>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <button
                          onClick={() => onTabChange('permit-enforcement')}
                          className={`w-full ${getNavCls(activeTab === 'permit-enforcement')}`}
                        >
                          <Gavel className="w-4 h-4 shrink-0" />
                          <span className="ml-2">Permit Enforcement</span>
                        </button>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <button
                          onClick={() => onTabChange('permit-renewal')}
                          className={`w-full ${getNavCls(activeTab === 'permit-renewal')}`}
                        >
                          <RotateCw className="w-4 h-4 shrink-0" />
                          <span className="ml-2">Permit Renewal</span>
                        </button>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <button
                          onClick={() => onTabChange('permit-surrender')}
                          className={`w-full ${getNavCls(activeTab === 'permit-surrender')}`}
                        >
                          <FileX className="w-4 h-4 shrink-0" />
                          <span className="ml-2">Permit Surrender</span>
                        </button>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <button
                          onClick={() => onTabChange('permit-transfer')}
                          className={`w-full ${getNavCls(activeTab === 'permit-transfer')}`}
                        >
                          <ArrowRightLeft className="w-4 h-4 shrink-0" />
                          <span className="ml-2">Permit Transfer</span>
                        </button>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>

              {/* Compliance Reports */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={() => onTabChange('compliance-reporting')}
                    className={`w-full ${getNavCls(activeTab === 'compliance-reporting')}`}
                  >
                    <FileCheck className="w-5 h-5 shrink-0" />
                    {!isCollapsed && <span className="ml-3 flex-1 text-left">Compliance Reports</span>}
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* End Menu Items - Notifications */}
              {endMenuItems
                .filter(item => !item.managerOnly || isManager)
                .map((item) => (
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
                              <span className="bg-white/30 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center backdrop-blur-sm">
                                {unreadCount > 99 ? '99+' : unreadCount}
                              </span>
                            )}
                          </>
                        )}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

          {/* Management Section */}
          <SidebarGroup className="mt-4">
            {!isCollapsed && <SidebarGroupLabel className="text-white/60 text-xs uppercase tracking-wider mb-2">Management</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {managementItems
                  .filter(item => !item.managerOnly || isManager)
                  .map((item) => (
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
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="mt-6">
            {!isCollapsed && <SidebarGroupLabel className="text-white/60 text-xs uppercase tracking-wider mb-2">Account</SidebarGroupLabel>}
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
                      className="w-full text-white/80 hover:bg-red-500/20 hover:text-white transition-all duration-200 backdrop-blur-sm"
                    >
                      <LogOut className="w-5 h-5 shrink-0" />
                      {!isCollapsed && <span className="ml-3 flex-1 text-left">Sign Out</span>}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
