import { useState } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent, 
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { 
  Activity, 
  CreditCard, 
  AlertTriangle, 
  BarChart3, 
  Settings,
  LogOut,
  User,
  Database,
  Cog,
  List,
  Building2,
  FileText,
  ChevronDown,
  ChevronRight
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import pngEmblem from "@/assets/png-emblem.png"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface RevenueNavigationItem {
  title: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  subItems?: RevenueNavigationItem[]
}

const revenueNavigationItems: RevenueNavigationItem[] = [
  { title: "Dashboard", value: "dashboard", icon: Activity },
  { 
    title: "Listings", 
    value: "listings", 
    icon: List,
    subItems: [
      { title: "Entities", value: "listings-entities", icon: Building2 },
      { title: "Permits", value: "listings-permits", icon: FileText },
    ]
  },
  { title: "Collection", value: "collection", icon: CreditCard },
  { title: "Outstanding", value: "outstanding", icon: AlertTriangle },
  { title: "Analytics and Reporting", value: "analytics-reporting", icon: BarChart3 },
]

const managementItems: RevenueNavigationItem[] = [
  { title: "Codes Management", value: "settings", icon: Database },
]

const accountItems: RevenueNavigationItem[] = [
  { title: "Profile", value: "profile", icon: User },
  { title: "Settings", value: "app-settings", icon: Cog },
]

interface RevenueSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function RevenueSidebar({ activeTab, onTabChange }: RevenueSidebarProps) {
  const { user, signOut, profile } = useAuth()
  const { state, isMobile, setOpenMobile } = useSidebar()
  const [openSubMenus, setOpenSubMenus] = useState<string[]>([])

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    // Auto-hide sidebar on mobile after selection
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const toggleSubMenu = (value: string) => {
    setOpenSubMenus(prev => 
      prev.includes(value) 
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  const isCollapsed = state === "collapsed"

  const getNavCls = (isActive: boolean) =>
    isActive 
      ? "bg-white/20 text-white font-medium shadow-glow backdrop-blur-sm" 
      : "text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200"

  return (
    <Sidebar
      className="border-r border-white/30 bg-primary/95 backdrop-blur-2xl shadow-xl"
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
                <p className="text-xs text-white/70">Revenue Unit</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="px-4">
          <SidebarGroup>
            {!isCollapsed && <SidebarGroupLabel className="text-white/60 text-xs uppercase tracking-wider mb-2">Revenue Operations</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {revenueNavigationItems.map((item) => (
                  item.subItems ? (
                    <Collapsible 
                      key={item.value} 
                      open={openSubMenus.includes(item.value)}
                      onOpenChange={() => toggleSubMenu(item.value)}
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton className={`w-full ${getNavCls(activeTab.startsWith(item.value))}`}>
                            <item.icon className="w-5 h-5 shrink-0" />
                            {!isCollapsed && (
                              <>
                                <span className="ml-3 flex-1 text-left">{item.title}</span>
                                {openSubMenus.includes(item.value) ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </>
                            )}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="ml-4 mt-1 space-y-1">
                            {item.subItems.map((subItem) => (
                              <SidebarMenuButton
                                key={subItem.value}
                                onClick={() => handleTabChange(subItem.value)}
                                className={`w-full ${getNavCls(activeTab === subItem.value)}`}
                              >
                                <subItem.icon className="w-4 h-4 shrink-0" />
                                {!isCollapsed && <span className="ml-3 flex-1 text-left">{subItem.title}</span>}
                              </SidebarMenuButton>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  ) : (
                    <SidebarMenuItem key={item.value}>
                      <SidebarMenuButton asChild>
                        <button
                          onClick={() => handleTabChange(item.value)}
                          className={`w-full ${getNavCls(activeTab === item.value)}`}
                        >
                          <item.icon className="w-5 h-5 shrink-0" />
                          {!isCollapsed && <span className="ml-3 flex-1 text-left">{item.title}</span>}
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="mt-6">
            {!isCollapsed && <SidebarGroupLabel className="text-white/60 text-xs uppercase tracking-wider mb-2">Management</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {managementItems.map((item) => (
                  <SidebarMenuItem key={item.value}>
                    <SidebarMenuButton asChild>
                      <button
                        onClick={() => handleTabChange(item.value)}
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
                        onClick={() => handleTabChange(item.value)}
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