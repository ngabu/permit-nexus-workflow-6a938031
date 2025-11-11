import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { 
  SidebarMenuItem as BaseSidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface MenuItemProps {
  item: {
    title: string;
    url?: string;
    icon: React.ComponentType<{ className?: string }>;
    subItems?: Array<{
      title: string;
      url: string;
      icon: React.ComponentType<{ className?: string }>;
    }>;
  };
  isOpen?: boolean;
  onToggle?: () => void;
}

export const SidebarMenuItem = ({ item, isOpen, onToggle }: MenuItemProps) => {
  const location = useLocation();

  if (item.subItems) {
    return (
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <BaseSidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton className="flex items-center justify-between w-full text-sidebar-foreground hover:text-sidebar-primary-foreground hover:bg-sidebar-accent p-3 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <item.icon className="w-5 h-5" />
                <span>{item.title}</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.subItems.map((subItem) => (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton asChild isActive={location.pathname === subItem.url}>
                    <Link 
                      to={subItem.url}
                      className="flex items-center space-x-3 text-muted-foreground hover:text-sidebar-primary-foreground hover:bg-sidebar-accent p-2 rounded transition-colors"
                    >
                      <subItem.icon className="w-4 h-4" />
                      <span>{subItem.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </BaseSidebarMenuItem>
      </Collapsible>
    );
  }

  return (
    <BaseSidebarMenuItem>
      <SidebarMenuButton asChild isActive={location.pathname === item.url}>
        <Link 
          to={item.url!}
          className="flex items-center space-x-3 text-sidebar-foreground hover:text-sidebar-primary-foreground hover:bg-sidebar-accent p-3 rounded-lg transition-colors"
        >
          <item.icon className="w-5 h-5" />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </BaseSidebarMenuItem>
  );
};