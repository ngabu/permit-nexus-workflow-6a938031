
import { NavLink, useLocation } from "react-router-dom"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface NavigationItem {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
}

interface NavigationSectionProps {
  title: string
  items: NavigationItem[]
  collapsed: boolean
  className?: string
}

export function NavigationSection({ title, items, collapsed, className }: NavigationSectionProps) {
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (path: string) => currentPath === path
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-white/25 text-white font-semibold rounded-2xl shadow-lg backdrop-blur-xl border border-white/40 shadow-glow" 
      : "text-white/75 hover:bg-white/15 hover:text-white transition-all duration-200 rounded-2xl backdrop-blur-md hover:border hover:border-white/20"

  return (
    <SidebarGroup className={className}>
      <SidebarGroupLabel className={collapsed ? "sr-only" : "text-white/50 text-xs uppercase tracking-widest mb-3 px-4 font-semibold"}>
        {title}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="space-y-2">
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild className="h-14 px-4">
                <NavLink 
                  to={item.url} 
                  end 
                  className={getNavCls}
                  title={collapsed ? item.title : undefined}
                >
                  <item.icon className="w-6 h-6 shrink-0" />
                  <span className="ml-4 font-medium text-base">{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
