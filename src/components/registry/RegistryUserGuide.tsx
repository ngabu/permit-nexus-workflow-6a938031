import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  FileText,
  Building,
  ClipboardList,
  CheckCircle,
  GitMerge,
  FileEdit,
  ShieldCheck,
  Gavel,
  RotateCw,
  FileX,
  ArrowRightLeft,
  FolderOpen,
  Users,
  BarChart3,
  Bell,
  User,
  Cog,
  ChevronRight,
  BookOpen,
  Target,
  Workflow,
  HelpCircle,
  FileCheck,
  AlertTriangle,
  Clock,
  Search
} from "lucide-react";

interface Section {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

const sections: Section[] = [
  { id: "overview", title: "System Overview", icon: BookOpen },
  { id: "dashboard", title: "Dashboard", icon: LayoutDashboard },
  { id: "listings", title: "Listings", icon: Building },
  { id: "applications", title: "Applications Reviews", icon: FileText },
  { id: "compliance", title: "Compliance Reports", icon: FileCheck },
  { id: "management", title: "Management Tools", icon: Users },
  { id: "account", title: "Account Settings", icon: User },
  { id: "workflows", title: "Key Workflows", icon: Workflow },
  { id: "faq", title: "FAQ & Support", icon: HelpCircle },
];

export function RegistryUserGuide() {
  const [activeSection, setActiveSection] = useState("overview");

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="relative">
      {/* Header - Fixed at top */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-card-foreground flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            Registry Unit User Guide
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive guide for Registry Managers and Officers
          </p>
        </div>
        <Badge variant="secondary" className="w-fit">
          Version 1.0 | Last Updated: December 2025
        </Badge>
      </div>

      {/* Mobile: Table of Contents as horizontal scroll */}
      <div className="lg:hidden mb-4 sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-2 -mx-4 px-4 border-b">
        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-2">
            {sections.map((section) => (
              <Button
                key={section.id}
                variant={activeSection === section.id ? "secondary" : "outline"}
                size="sm"
                className="text-xs whitespace-nowrap flex-shrink-0"
                onClick={() => scrollToSection(section.id)}
              >
                <section.icon className="w-3 h-3 mr-1" />
                {section.title}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="flex gap-6">
        {/* Table of Contents - Sticky Sidebar for Desktop */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-0">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Contents
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="max-h-[70vh]">
                  <nav className="space-y-1 p-4 pt-0">
                    {sections.map((section) => (
                      <Button
                        key={section.id}
                        variant={activeSection === section.id ? "secondary" : "ghost"}
                        className="w-full justify-start text-sm h-9"
                        onClick={() => scrollToSection(section.id)}
                      >
                        <section.icon className="w-4 h-4 mr-2" />
                        {section.title}
                      </Button>
                    ))}
                  </nav>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-8 min-w-0">
          {/* Section 1: System Overview */}
          <Card id="overview">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                System Overview
              </CardTitle>
              <CardDescription>
                Introduction to the CEPA E-Permit Registry Dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-card-foreground">
                The <strong>PNG CEPA E-Permit Registry Dashboard</strong> is the central hub for managing environmental permit applications, entity registrations, and compliance monitoring. This system enables the Registry Unit to efficiently process and track all permit-related activities.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    For Registry Managers
                  </h4>
                  <ul className="mt-2 space-y-1 text-sm text-blue-600 dark:text-blue-400">
                    <li>• Allocate assessments to officers</li>
                    <li>• Monitor team performance</li>
                    <li>• Oversee all application reviews</li>
                    <li>• Access analytics and reports</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-700 dark:text-green-300 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    For Registry Officers
                  </h4>
                  <ul className="mt-2 space-y-1 text-sm text-green-600 dark:text-green-400">
                    <li>• Review assigned applications</li>
                    <li>• Process permit requests</li>
                    <li>• Update application statuses</li>
                    <li>• Generate compliance reports</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Dashboard */}
          <Card id="dashboard">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-primary" />
                Dashboard
              </CardTitle>
              <CardDescription>
                Your central command center for registry operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-card-foreground">
                The Dashboard provides a real-time overview of all registry activities through key performance indicators (KPIs) and recent activity feeds.
              </p>
              
              <h4 className="font-semibold text-card-foreground mt-4">KPI Cards</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="flex items-start gap-3 p-3 rounded-lg border">
                  <Users className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Total Entities</p>
                    <p className="text-xs text-muted-foreground">All registered companies and individuals</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Active Permits</p>
                    <p className="text-xs text-muted-foreground">Currently approved and valid permits</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border">
                  <Clock className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Pending Applications</p>
                    <p className="text-xs text-muted-foreground">Applications awaiting review</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border">
                  <FileText className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Pending Payments</p>
                    <p className="text-xs text-muted-foreground">Invoices awaiting payment confirmation</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Expiring Soon</p>
                    <p className="text-xs text-muted-foreground">Permits expiring within 30 days</p>
                  </div>
                </div>
              </div>

              <h4 className="font-semibold text-card-foreground mt-4">Interactive Map</h4>
              <p className="text-sm text-muted-foreground">
                The dashboard includes an interactive GIS map showing approved permit locations across Papua New Guinea. Toggle layer visibility to view administrative boundaries and protected areas.
              </p>
            </CardContent>
          </Card>

          {/* Section 3: Listings */}
          <Card id="listings">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5 text-primary" />
                Listings
              </CardTitle>
              <CardDescription>
                Manage entities, intents, and permits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-card-foreground">
                The Listings section provides access to three main data categories that form the foundation of the permit management system.
              </p>

              <div className="space-y-4 mt-4">
                <div className="p-4 rounded-lg border">
                  <h4 className="font-semibold flex items-center gap-2 text-card-foreground">
                    <Building className="w-4 h-4 text-blue-500" />
                    Entities
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    View and manage all registered entities (companies and individuals) in the system. Search, filter, and access detailed entity profiles including associated permits and compliance history.
                  </p>
                </div>

                <div className="p-4 rounded-lg border">
                  <h4 className="font-semibold flex items-center gap-2 text-card-foreground">
                    <ClipboardList className="w-4 h-4 text-amber-500" />
                    Intents
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Browse all intent registrations submitted by applicants. Track the status of environmental impact assessments and project proposals before they proceed to permit applications.
                  </p>
                </div>

                <div className="p-4 rounded-lg border">
                  <h4 className="font-semibold flex items-center gap-2 text-card-foreground">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Permits
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Access the complete permit registry. View active, expired, suspended, and revoked permits. Each permit record includes full application history, conditions, and compliance status.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Applications Reviews */}
          <Card id="applications">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Applications Reviews
              </CardTitle>
              <CardDescription>
                Comprehensive application review workflows
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-card-foreground">
                The Applications Reviews section contains all review workflows for different types of permit-related applications. Each review type follows a structured assessment process.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <ClipboardList className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Intent Application Review</p>
                    <p className="text-xs text-muted-foreground">Review initial project intent registrations and EIA requirements</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <FileText className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Permit Application Review</p>
                    <p className="text-xs text-muted-foreground">Process new environmental permit applications</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <GitMerge className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Permit Amalgamation</p>
                    <p className="text-xs text-muted-foreground">Combine multiple permits into a single permit</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <FileEdit className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Permit Amendments</p>
                    <p className="text-xs text-muted-foreground">Review requests to modify existing permit conditions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <ShieldCheck className="w-5 h-5 text-teal-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Permit Compliance</p>
                    <p className="text-xs text-muted-foreground">Review compliance monitoring reports and assessments</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <Gavel className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Permit Enforcement</p>
                    <p className="text-xs text-muted-foreground">Handle enforcement actions and penalty proceedings</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <RotateCw className="w-5 h-5 text-cyan-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Permit Renewal</p>
                    <p className="text-xs text-muted-foreground">Process permit renewal applications before expiry</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <FileX className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Permit Surrender</p>
                    <p className="text-xs text-muted-foreground">Handle voluntary permit surrender requests</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <ArrowRightLeft className="w-5 h-5 text-indigo-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Permit Transfer</p>
                    <p className="text-xs text-muted-foreground">Process ownership transfer between entities</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 mt-4">
                <h4 className="font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Review Process
                </h4>
                <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                  Each application review includes: document verification, fee calculation, assessment scoring, recommendation submission, and status updates. Always ensure all required documents are verified before approving any application.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Compliance Reports */}
          <Card id="compliance">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-primary" />
                Compliance Reports
              </CardTitle>
              <CardDescription>
                Monitor and track compliance reporting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-card-foreground">
                The Compliance Reports section allows you to view and manage compliance reports submitted by permit holders. Monitor environmental monitoring data, audit results, and compliance status across all active permits.
              </p>
              
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-primary" />
                  View submitted compliance reports from permit holders
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-primary" />
                  Track report submission deadlines and overdue reports
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-primary" />
                  Review environmental monitoring data and trends
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-primary" />
                  Flag non-compliant activities for enforcement review
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 6: Management Tools */}
          <Card id="management">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Management Tools
              </CardTitle>
              <CardDescription>
                Administrative and team management features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 rounded-lg border">
                  <h4 className="font-semibold flex items-center gap-2 text-card-foreground">
                    <FolderOpen className="w-4 h-4 text-blue-500" />
                    Documents Management
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Centralized document repository for all permit-related files. Upload, organize, and retrieve documents with version control and audit trails.
                  </p>
                </div>

                <div className="p-4 rounded-lg border">
                  <h4 className="font-semibold flex items-center gap-2 text-card-foreground">
                    <Users className="w-4 h-4 text-green-500" />
                    Team Management
                    <Badge variant="outline" className="text-xs">Manager Only</Badge>
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage registry team members, assign roles, allocate workload, and monitor officer performance. Track application assignments and completion rates.
                  </p>
                </div>

                <div className="p-4 rounded-lg border">
                  <h4 className="font-semibold flex items-center gap-2 text-card-foreground">
                    <BarChart3 className="w-4 h-4 text-purple-500" />
                    Analytics and Reporting
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Generate comprehensive reports on registry operations. View processing times, approval rates, revenue collection, and workload distribution analytics.
                  </p>
                </div>

                <div className="p-4 rounded-lg border">
                  <h4 className="font-semibold flex items-center gap-2 text-card-foreground">
                    <Bell className="w-4 h-4 text-amber-500" />
                    Notifications
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Stay updated with system notifications for new applications, pending reviews, approaching deadlines, and important alerts. Mark notifications as read or take immediate action.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 7: Account Settings */}
          <Card id="account">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Account Settings
              </CardTitle>
              <CardDescription>
                Manage your profile and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border">
                  <h4 className="font-semibold flex items-center gap-2 text-card-foreground">
                    <User className="w-4 h-4 text-blue-500" />
                    Profile
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    View your personal information, contact details, and role assignments. Update your display preferences and contact information.
                  </p>
                </div>

                <div className="p-4 rounded-lg border">
                  <h4 className="font-semibold flex items-center gap-2 text-card-foreground">
                    <Cog className="w-4 h-4 text-gray-500" />
                    Settings
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Configure application settings including notification preferences, display options, and accessibility features.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 8: Key Workflows */}
          <Card id="workflows">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="w-5 h-5 text-primary" />
                Key Workflows
              </CardTitle>
              <CardDescription>
                Step-by-step guides for common tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Workflow 1 */}
              <div className="space-y-3">
                <h4 className="font-semibold text-card-foreground">1. Reviewing a New Permit Application</h4>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Navigate to <strong>Applications Reviews → Permit Application Review</strong></li>
                  <li>Select a pending application from the list</li>
                  <li>Review all submitted documents and verify completeness</li>
                  <li>Check fee calculations and payment status</li>
                  <li>Complete the assessment form with scores and comments</li>
                  <li>Submit your recommendation (Approve/Reject/Request Clarification)</li>
                  <li>The application will be forwarded for final approval</li>
                </ol>
              </div>

              <Separator />

              {/* Workflow 2 */}
              <div className="space-y-3">
                <h4 className="font-semibold text-card-foreground">2. Processing an Intent Registration</h4>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Go to <strong>Applications Reviews → Intent Application Review</strong></li>
                  <li>Open the intent registration requiring review</li>
                  <li>Verify project details and proposed location</li>
                  <li>Review the Area of Interest (AOI) boundary on the map</li>
                  <li>Determine EIA requirements based on activity classification</li>
                  <li>Generate and send the registration invoice</li>
                  <li>Upon payment confirmation, approve the intent</li>
                </ol>
              </div>

              <Separator />

              {/* Workflow 3 */}
              <div className="space-y-3">
                <h4 className="font-semibold text-card-foreground">3. Allocating Work to Officers (Manager Only)</h4>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Access <strong>Management → Team Management</strong></li>
                  <li>Review current workload distribution</li>
                  <li>Click "Allocate Assessment" button</li>
                  <li>Select the application to assign</li>
                  <li>Choose the officer based on expertise and availability</li>
                  <li>Add any special instructions or deadline notes</li>
                  <li>Confirm the allocation - officer will receive notification</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Section 9: FAQ & Support */}
          <Card id="faq">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                FAQ & Support
              </CardTitle>
              <CardDescription>
                Frequently asked questions and help resources
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold text-card-foreground">Q: How do I reset my password?</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    A: Contact the System Administrator or use the "Forgot Password" option on the login page. You will receive a password reset link via email.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold text-card-foreground">Q: Why can't I see certain menu items?</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    A: Some features are restricted based on your role. Team Management is only visible to Registry Managers. Contact your supervisor if you need access to additional features.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold text-card-foreground">Q: How do I report a system issue?</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    A: Document the issue with screenshots and steps to reproduce. Contact the IT Help Desk or System Administrator via the internal support channel.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold text-card-foreground">Q: Can I access the system outside the office?</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    A: Yes, the system is accessible via web browser from any location with internet access. Ensure you are using a secure connection and following CEPA's remote access policies.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 mt-6">
                <h4 className="font-semibold text-primary flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Need More Help?
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  For additional support, contact the CEPA IT Help Desk or your Registry Unit Manager. System documentation and training materials are available on the internal knowledge base.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
