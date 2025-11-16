import { BarChart3, ClipboardList, Eye } from "lucide-react";

export interface MenuItem {
  icon: any;
  label: string;
  path: string;
}

export const complianceMenuItems: MenuItem[] = [
  {
    icon: BarChart3,
    label: "Dashboard",
    path: "/ComplianceDashboard"
  },
  {
    icon: ClipboardList,
    label: "Applications",
    path: "/Compliance"
  },
  {
    icon: Eye,
    label: "Inspections",
    path: "/Inspections"
  }
];
