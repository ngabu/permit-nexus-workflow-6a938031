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
  Shield,
  ClipboardCheck,
  Users,
  BarChart3,
  Bell, 
  User,
  Cog,
  LogOut,
  ChevronDown,
  ChevronRight,
  GitMerge,
  FileEdit,
  ShieldCheck,
  Gavel,
  RotateCw,
  FileX,
  ArrowRightLeft,
  ClipboardList
} from "lucide-react"
import { useState } from "react"
import { useUnitNotifications } from "@/hooks/useUnitNotifications"
import { useAuth } from "@/contexts/AuthContext"
import pngEmblem from "@/assets/png-emblem.png"

interface ComplianceNavigationItem {
  title: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  managerOnly?: boolean
}

const complianceNavigationItems: ComplianceNavigationItem[] = [
  { title: "Dashboard", value: "dashboard", icon: LayoutDashboard },
  { title: "Inspections", value: "inspections", icon: ClipboardCheck },
  { title: "Team Management", value: "team", icon: Users, managerOnly: true },
  { title: "Reports", value: "reports", icon: BarChart3 },
  { title: "Notifications", value: "notifications", icon: Bell },
]

const accountItems: ComplianceNavigationItem[] = [
  { title: "Profile", value: "profile", icon: User },
  { title: "Settings", value: "settings", icon: Cog },
]

interface ComplianceSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function ComplianceSidebar({ activeTab, onTabChange }: ComplianceSidebarProps) {
  const { user, profile, signOut } = useAuth()
  const { notifications } = useUnitNotifications('compliance')
  const { state, isMobile } = useSidebar()
  const [assessmentsOpen, setAssessmentsOpen] = useState(false)
  
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

  const filteredNavItems = complianceNavigationItems.filter(item => 
    !item.managerOnly || isManager
  )

  return (
    <Sidebar
      className="w-64 border-r border-white/30 bg-primary/95 backdrop-blur-2xl shadow-xl"
      collapsible="icon"
    >
      <SidebarContent className="p-0 bg-gradient-to-b from-primary/90 to-primary/80 backdrop-blur-2xl">
        {/* Branding */}
        <div className="p-6 pb-8 bg-primary-glow/90 backdrop-blur-xl rounded-br-[4rem] mb-4 shadow-glow">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-glow-accent p-1">
              <img src={pngEmblem} alt="PNG Emblem" className="w-full h-full object-contain" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-bold text-white text-lg">PNG CEPA E-permit</h2>
                <p className="text-xs text-white/70">Compliance Unit</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="px-4">
          <SidebarGroup>
            {!isCollapsed && <SidebarGroupLabel className="text-white/60 text-xs uppercase tracking-wider mb-2">Compliance Operations</SidebarGroupLabel>}
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

              {/* Assessments with submenu */}
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setAssessmentsOpen(!assessmentsOpen)}
                  className="w-full text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200"
                >
                  <FileText className="w-5 h-5 shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="ml-3 flex-1 text-left">Assessments</span>
                      {assessmentsOpen ? 
                        <ChevronDown className="w-4 h-4" /> : 
                        <ChevronRight className="w-4 h-4" />
                      }
                    </>
                  )}
                </SidebarMenuButton>
                {assessmentsOpen && !isCollapsed && (
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
                          onClick={() => onTabChange('permit-applications')}
                          className={`w-full ${getNavCls(activeTab === 'permit-applications')}`}
                        >
                          <FileText className="w-4 h-4 shrink-0" />
                          <span className="ml-2">Permit Applications</span>
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
