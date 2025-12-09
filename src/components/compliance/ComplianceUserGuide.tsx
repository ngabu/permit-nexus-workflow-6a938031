import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  FileText,
  Shield,
  ClipboardCheck,
  Users,
  BarChart3,
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
  Search,
  Eye,
  GitMerge,
  FileEdit,
  ShieldCheck,
  Gavel,
  RotateCw,
  FileX,
  ArrowRightLeft,
  ClipboardList
} from "lucide-react";

interface Section {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

const sections: Section[] = [
  { id: "overview", title: "System Overview", icon: BookOpen },
  { id: "dashboard", title: "Dashboard", icon: LayoutDashboard },
  { id: "assessments", title: "Technical Assessments", icon: FileText },
  { id: "compliance", title: "Compliance Monitoring", icon: Shield },
  { id: "inspections", title: "Inspections", icon: Eye },
  { id: "management", title: "Management Tools", icon: Users },
  { id: "account", title: "Account Settings", icon: User },
  { id: "workflows", title: "Key Workflows", icon: Workflow },
  { id: "faq", title: "FAQ & Support", icon: HelpCircle },
];

export function ComplianceUserGuide() {
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-card-foreground flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            Compliance Unit User Guide
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive guide for Compliance Managers and Officers
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
        {/* Table of Contents - Sidebar for Desktop */}
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
                Introduction to the CEPA Environment Technical Assessment System
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-card-foreground">
                The <strong>PNG CEPA Environment Technical Assessment System</strong> enables structured technical assessments for environmental permits under the PNG Environment Act 2000. This system supports the Compliance Unit in monitoring environmental performance and enforcing permit conditions.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    For Compliance Managers
                  </h4>
                  <ul className="mt-2 space-y-1 text-sm text-blue-600 dark:text-blue-400">
                    <li>• Assign assessments to officers</li>
                    <li>• Monitor team performance</li>
                    <li>• Oversee inspection schedules</li>
                    <li>• Access analytics and reports</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-700 dark:text-green-300 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    For Compliance Officers
                  </h4>
                  <ul className="mt-2 space-y-1 text-sm text-green-600 dark:text-green-400">
                    <li>• Conduct technical assessments</li>
                    <li>• Perform site inspections</li>
                    <li>• Review compliance reports</li>
                    <li>• Process enforcement actions</li>
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
                Your central command center for compliance operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-card-foreground">
                The Dashboard provides a real-time overview of all compliance activities through key performance indicators (KPIs) and assessment status summaries.
              </p>
              
              <h4 className="font-semibold text-card-foreground mt-4">KPI Cards</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="flex items-start gap-3 p-3 rounded-lg border">
                  <ClipboardCheck className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Pending Assessments</p>
                    <p className="text-xs text-muted-foreground">Applications awaiting technical review</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border">
                  <Eye className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Scheduled Inspections</p>
                    <p className="text-xs text-muted-foreground">Upcoming site inspections</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border">
                  <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Non-Compliant</p>
                    <p className="text-xs text-muted-foreground">Permits with compliance issues</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border">
                  <FileCheck className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Completed Reviews</p>
                    <p className="text-xs text-muted-foreground">Assessments completed this month</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border">
                  <Clock className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Overdue Reports</p>
                    <p className="text-xs text-muted-foreground">Compliance reports past deadline</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Technical Assessments */}
          <Card id="assessments">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Technical Assessments
              </CardTitle>
              <CardDescription>
                Environmental permit application reviews
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-card-foreground">
                The Assessments section contains all technical review workflows for different types of permit-related applications under the Environment Act 2000.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <ClipboardList className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Intent Application Review</p>
                    <p className="text-xs text-muted-foreground">Review project intent and EIA requirements</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <FileText className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Permit Application Review</p>
                    <p className="text-xs text-muted-foreground">Conduct technical assessment of permit applications</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <GitMerge className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Permit Amalgamation</p>
                    <p className="text-xs text-muted-foreground">Review requests to combine permits</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <FileEdit className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Permit Amendments</p>
                    <p className="text-xs text-muted-foreground">Assess proposed permit condition changes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <RotateCw className="w-5 h-5 text-cyan-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Permit Renewal</p>
                    <p className="text-xs text-muted-foreground">Review permit renewal applications</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <FileX className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Permit Surrender</p>
                    <p className="text-xs text-muted-foreground">Process voluntary permit surrenders</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <ArrowRightLeft className="w-5 h-5 text-indigo-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Permit Transfer</p>
                    <p className="text-xs text-muted-foreground">Review permit ownership transfers</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 mt-4">
                <h4 className="font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Assessment Process
                </h4>
                <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                  Each technical assessment includes: environmental impact evaluation, mitigation measures review, compliance scoring, technical recommendations, and status updates according to Environment Act 2000 requirements.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Compliance Monitoring */}
          <Card id="compliance">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Compliance Monitoring
              </CardTitle>
              <CardDescription>
                Monitor permit holder compliance and reporting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-card-foreground">
                The Compliance section enables monitoring of permit holder performance and enforcement of permit conditions.
              </p>

              <div className="space-y-4 mt-4">
                <div className="p-4 rounded-lg border">
                  <h4 className="font-semibold flex items-center gap-2 text-card-foreground">
                    <FileCheck className="w-4 h-4 text-green-500" />
                    Compliance Reports
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Review periodic compliance reports submitted by permit holders. Track environmental monitoring data and assess compliance status.
                  </p>
                </div>

                <div className="p-4 rounded-lg border">
                  <h4 className="font-semibold flex items-center gap-2 text-card-foreground">
                    <Gavel className="w-4 h-4 text-red-500" />
                    Enforcement Actions
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Process enforcement actions for non-compliant permit holders including warnings, penalties, and permit suspensions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Inspections */}
          <Card id="inspections">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Inspections
              </CardTitle>
              <CardDescription>
                Site inspection management and scheduling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-card-foreground">
                The Inspections section helps you manage site visits, schedule inspections, and document findings.
              </p>
              
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-primary" />
                  Schedule and plan site inspections
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-primary" />
                  Record inspection findings and observations
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-primary" />
                  Upload photos and supporting documents
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-primary" />
                  Generate inspection reports
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-primary" />
                  Track follow-up actions and remediation
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
                    <Users className="w-4 h-4 text-blue-500" />
                    Team Management
                    <Badge variant="outline" className="text-xs">Manager Only</Badge>
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage compliance team members, assign assessments, and monitor officer performance and workload.
                  </p>
                </div>

                <div className="p-4 rounded-lg border">
                  <h4 className="font-semibold flex items-center gap-2 text-card-foreground">
                    <BarChart3 className="w-4 h-4 text-purple-500" />
                    Analytics and Reporting
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Generate comprehensive reports on compliance operations, inspection statistics, and enforcement metrics.
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
                    View your personal information, contact details, and role assignments.
                  </p>
                </div>

                <div className="p-4 rounded-lg border">
                  <h4 className="font-semibold flex items-center gap-2 text-card-foreground">
                    <Cog className="w-4 h-4 text-gray-500" />
                    Settings
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Configure application settings including notification preferences and display options.
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
                <h4 className="font-semibold text-card-foreground">1. Conducting a Technical Assessment</h4>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Navigate to <strong>Assessments → Permit Application Review</strong></li>
                  <li>Select an assigned application from your queue</li>
                  <li>Review all submitted documents and EIA reports</li>
                  <li>Evaluate environmental impacts and mitigation measures</li>
                  <li>Complete the technical assessment form</li>
                  <li>Submit your recommendation with detailed findings</li>
                </ol>
              </div>

              <Separator />

              {/* Workflow 2 */}
              <div className="space-y-3">
                <h4 className="font-semibold text-card-foreground">2. Scheduling and Conducting an Inspection</h4>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Go to <strong>Compliance → Inspections</strong></li>
                  <li>Click "Schedule New Inspection"</li>
                  <li>Select the permit and site to inspect</li>
                  <li>Set the inspection date and notify the permit holder</li>
                  <li>Conduct the site visit and document findings</li>
                  <li>Upload photos and evidence</li>
                  <li>Generate and submit the inspection report</li>
                </ol>
              </div>

              <Separator />

              {/* Workflow 3 */}
              <div className="space-y-3">
                <h4 className="font-semibold text-card-foreground">3. Processing an Enforcement Action</h4>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Access <strong>Compliance → Permit Enforcement</strong></li>
                  <li>Review the non-compliance case details</li>
                  <li>Assess the severity and history of violations</li>
                  <li>Determine appropriate enforcement action</li>
                  <li>Document findings and recommendations</li>
                  <li>Submit for manager approval if required</li>
                  <li>Issue enforcement notice to the permit holder</li>
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
                  <h4 className="font-semibold text-card-foreground">Q: What is the difference between Level 1, 2, and 3 activities?</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    A: Activity levels are determined by environmental impact. Level 1 has minimal impact, Level 2 moderate, and Level 3 significant impact requiring full EIA. Refer to the Environment Act 2000 Schedule for classifications.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold text-card-foreground">Q: How do I assign an assessment to another officer?</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    A: Only Compliance Managers can assign or reassign assessments. Use the Team Management section to allocate assessments based on officer workload and expertise.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold text-card-foreground">Q: What happens after I submit my technical assessment?</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    A: Your assessment is forwarded to the Compliance Manager for review, then proceeds through the approval workflow including Registry review and Director decision.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold text-card-foreground">Q: How do I report an environmental emergency?</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    A: Contact your supervisor immediately and use the emergency reporting protocol. Document all details including location, nature of incident, and immediate actions taken.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 mt-6">
                <h4 className="font-semibold text-primary flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Need More Help?
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  For additional support, contact the CEPA IT Help Desk or your Compliance Unit Manager. System documentation and training materials are available on the internal knowledge base.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
