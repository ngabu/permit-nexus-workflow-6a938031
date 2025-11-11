import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
interface MenuItem {
  title: string;
  url?: string;
  icon: any;
  subItems?: MenuItem[];
}

interface SidebarMenuItemProps {
  item: MenuItem;
  openMenus: string[];
  toggleMenu: (title: string) => void;
}

export function AppSidebarMenuItem({ item, openMenus, toggleMenu }: SidebarMenuItemProps) {
  const location = useLocation();

  if (item.subItems) {
    const isOpen = openMenus.includes(item.title);
    const hasActiveSubItem = item.subItems.some((subItem: MenuItem) => location.pathname === subItem.url);
    
    return (
      <Collapsible key={item.title} open={isOpen || hasActiveSubItem} onOpenChange={() => toggleMenu(item.title)}>
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton className="flex items-center justify-between w-full text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent p-3 rounded-lg transition-colors font-medium">
              <div className="flex items-center space-x-3">
                <item.icon className="w-5 h-5" />
                <span>{item.title}</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${isOpen || hasActiveSubItem ? 'rotate-180' : ''}`} />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.subItems.map((subItem: MenuItem) => (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton asChild isActive={location.pathname === subItem.url}>
                    <Link 
                      to={subItem.url || '#'}
                      className="flex items-center space-x-3 text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent p-2 rounded transition-colors"
                    >
                      <subItem.icon className="w-4 h-4" />
                      <span>{subItem.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  }

  return (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton asChild isActive={location.pathname === item.url}>
        <Link 
          to={item.url || '#'}
          className="flex items-center space-x-3 text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent p-3 rounded-lg transition-colors font-medium"
        >
          <item.icon className="w-5 h-5" />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}