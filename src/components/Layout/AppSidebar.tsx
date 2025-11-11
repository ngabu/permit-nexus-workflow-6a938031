
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { LogOut, Bell, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { getMenuItemsForRole, getRoleDisplayName } from "../sidebar/MenuItems";
import { AppSidebarMenuItem } from "./SidebarMenuItem";

export function AppSidebar() {
  const { user, profile, signOut } = useAuth();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const menuItems = getMenuItemsForRole(profile?.role, profile?.operational_unit);

  const toggleMenu = (title: string) => {
    setOpenMenus(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  return (
    <Sidebar className="bg-sidebar border-sidebar-border">
      <SidebarHeader className="p-6 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src="/lovable-uploads/1c17e20d-e536-4799-8b20-f3c776c58b25.png"
              alt="CEPA Logo"
              className="h-10 w-10 object-contain"
            />
            <div>
              <h2 className="text-xl font-bold text-sidebar-foreground">CEPA</h2>
              <p className="text-sm text-sidebar-foreground">EPemit System</p>
            </div>
          </div>
          <SidebarTrigger className="text-sidebar-foreground hover:text-sidebar-primary" />
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground text-xs uppercase tracking-wider mb-2 font-semibold">
            {['registry', 'compliance', 'finance', 'revenue', 'directorate'].includes(profile?.role || '') ? 'Staff Navigation' :
              profile?.role === 'admin' ? 'Admin Navigation' :
                'Main Navigation'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <AppSidebarMenuItem
                  key={item.title}
                  item={item}
                  openMenus={openMenus}
                  toggleMenu={toggleMenu}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="text-sidebar-foreground text-xs uppercase tracking-wider mb-2 font-semibold">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    to="/notifications"
                    className="flex items-center space-x-3 text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent p-3 rounded-lg transition-colors font-medium"
                  >
                    <Bell className="w-5 h-5" />
                    <span>Notifications</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    to="/settings"
                    className="flex items-center space-x-3 text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent p-3 rounded-lg transition-colors font-medium"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <p className="text-amber-600 font-medium">{user?.email}</p>
            {profile?.role && (
              <p className="text-amber-700 text-xs">
                {getRoleDisplayName(profile.role)}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await signOut();
              window.location.href = '/login'; // ✅ hard redirect avoids React re-render race
            }}
            className="text-amber-600 hover:text-amber-700 hover:bg-amber-500/10"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
