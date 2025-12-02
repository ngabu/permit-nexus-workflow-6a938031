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
  LayoutDashboard,
  Building2,
  FileText,
  Shield,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  FileCheck,
  BarChart3,
} from "lucide-react"
import pngEmblem from "@/assets/png-emblem.png"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface NavigationItem {
  title: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  subItems?: NavigationItem[]
}

const navigationItems: NavigationItem[] = [
  { title: "Dashboard", value: "dashboard", icon: LayoutDashboard },
  {
    title: "Listings",
    value: "listings",
    icon: FileText,
    subItems: [
      { title: "Entities", value: "listings-entities", icon: Building2 },
      { title: "Intents", value: "listings-intents", icon: FileText },
      { title: "Permits", value: "listings-permits", icon: Shield },
    ],
  },
  { title: "Approvals and Signatures", value: "approvals-signatures", icon: FileCheck },
  { title: "Reports and Analysis", value: "reports-analysis", icon: BarChart3 },
]

interface ManagingDirectorSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function ManagingDirectorSidebar({ activeTab, onTabChange }: ManagingDirectorSidebarProps) {
  const { state, isMobile, setOpenMobile } = useSidebar()
  const [openSubMenus, setOpenSubMenus] = useState<string[]>(["listings"])

  const handleTabChange = (tab: string) => {
    onTabChange(tab)
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  const toggleSubMenu = (value: string) => {
    setOpenSubMenus((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

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
                <p className="text-xs text-white/70">Managing Director</p>
              </div>
            )}
          </div>
        </div>

        <div className="px-4">
          <SidebarGroup>
            {!isCollapsed && <SidebarGroupLabel className="text-white/60 text-xs uppercase tracking-wider mb-2">Executive Operations</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) =>
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
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
