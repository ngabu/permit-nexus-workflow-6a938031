
import { useAuth } from "@/contexts/AuthContext"
import {
  Sidebar,
  SidebarContent,
  useSidebar,
} from "@/components/ui/sidebar"
import { SidebarBranding } from "./sidebar/sidebar-branding"
import { NavigationSection } from "./sidebar/navigation-section"
import { 
  getNavigationItems, 
  secondaryItems, 
  getUnitName, 
  getOperationsLabel 
} from "./sidebar/navigation-config"

export function AppSidebar() {
  const { profile } = useAuth()

  const unitName = getUnitName(profile?.role)
  const operationsLabel = getOperationsLabel(profile?.role)
  const navigationItems = getNavigationItems(profile?.role)

  return (
    <Sidebar
      className="w-64 border-r border-white/30 bg-primary/95 backdrop-blur-2xl shadow-xl"
      collapsible="none"
    >
      <SidebarContent className="p-0 bg-gradient-to-b from-primary/90 to-primary/80 backdrop-blur-2xl">
        <div className="p-6 pb-8 bg-primary-glow/90 backdrop-blur-xl rounded-br-[4rem] mb-4 shadow-glow">
          <SidebarBranding collapsed={false} unitName={unitName} />
        </div>
        
        <div className="px-4">
          <NavigationSection
            title={operationsLabel}
            items={navigationItems}
            collapsed={false}
            className="mb-4"
          />

          <NavigationSection
            title="Management"
            items={secondaryItems}
            collapsed={false}
            className="mb-4"
          />
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
