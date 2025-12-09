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
  CreditCard,
  AlertTriangle,
  DollarSign,
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
  Clock,
  Search,
  Receipt,
  Banknote,
  TrendingUp,
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
  { id: "listings", title: "Listings", icon: Building },
  { id: "collection", title: "Revenue Collection", icon: CreditCard },
  { id: "outstanding", title: "Outstanding Payments", icon: AlertTriangle },
  { id: "management", title: "Management Tools", icon: Users },
  { id: "account", title: "Account Settings", icon: User },
  { id: "workflows", title: "Key Workflows", icon: Workflow },
  { id: "faq", title: "FAQ & Support", icon: HelpCircle },
];

export function RevenueUserGuide() {
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
            Revenue Unit User Guide
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive guide for Revenue Managers and Officers
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
                Introduction to the CEPA E-Permit Revenue Dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-card-foreground">
                The <strong>PNG CEPA E-Permit Revenue Dashboard</strong> is the central hub for managing environmental permit fees, invoice generation, payment verification, and revenue tracking. This system enables the Revenue Unit to efficiently collect and manage all permit-related payments.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    For Revenue Managers
                  </h4>
                  <ul className="mt-2 space-y-1 text-sm text-blue-600 dark:text-blue-400">
                    <li>• Oversee revenue collection operations</li>
                    <li>• Monitor team performance metrics</li>
                    <li>• Verify payment confirmations</li>
                    <li>• Access analytics and financial reports</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-700 dark:text-green-300 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    For Revenue Officers
                  </h4>
                  <ul className="mt-2 space-y-1 text-sm text-green-600 dark:text-green-400">
                    <li>• Generate invoices for applications</li>
                    <li>• Process payment receipts</li>
                    <li>• Follow up on outstanding payments</li>
                    <li>• Update payment records</li>
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
                Your central command center for revenue operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-card-foreground">
                The Dashboard provides a real-time overview of all revenue activities through key performance indicators (KPIs) and financial summaries.
              </p>
              
              <h4 className="font-semibold text-card-foreground mt-4">KPI Cards</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="flex items-start gap-3 p-3 rounded-lg border">
                  <DollarSign className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Total Revenue</p>
                    <p className="text-xs text-muted-foreground">Total collected revenue for the period</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border">
                  <Receipt className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Pending Invoices</p>
                    <p className="text-xs text-muted-foreground">Invoices awaiting payment</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border">
                  <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Overdue Payments</p>
                    <p className="text-xs text-muted-foreground">Payments past their due date</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border">
                  <Banknote className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Today's Collections</p>
                    <p className="text-xs text-muted-foreground">Payments received today</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border">
                  <TrendingUp className="w-5 h-5 text-teal-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Monthly Target</p>
                    <p className="text-xs text-muted-foreground">Progress towards revenue targets</p>
                  </div>
                </div>
              </div>
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
                View entities, intents, and permits for revenue management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-card-foreground">
                The Listings section provides access to financial information for all registered entities, intent registrations, and permits.
              </p>

              <div className="space-y-4 mt-4">
                <div className="p-4 rounded-lg border">
                  <h4 className="font-semibold flex items-center gap-2 text-card-foreground">
                    <FileText className="w-4 h-4 text-amber-500" />
                    Intents
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    View all intent registrations with their associated fees, payment status, and invoice history.
                  </p>
                </div>

                <div className="p-4 rounded-lg border">
                  <h4 className="font-semibold flex items-center gap-2 text-card-foreground">
                    <Building className="w-4 h-4 text-blue-500" />
                    Entities
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Access entity financial profiles including payment history, outstanding balances, and account status.
                  </p>
                </div>

                <div className="p-4 rounded-lg border">
                  <h4 className="font-semibold flex items-center gap-2 text-card-foreground">
                    <FileCheck className="w-4 h-4 text-green-500" />
                    Permits
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    View permit fee structures, annual fees, and renewal payment schedules.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Revenue Collection */}
          <Card id="collection">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Revenue Collection
              </CardTitle>
              <CardDescription>
                Invoice management and payment verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-card-foreground">
                The Collection section handles all invoice generation, payment processing, and verification activities.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <Receipt className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Invoice Management</p>
                    <p className="text-xs text-muted-foreground">Create, view, and manage invoices for all permit-related fees</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <FileCheck className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Payment Verification</p>
                    <p className="text-xs text-muted-foreground">Verify payment receipts and update payment status</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 mt-4">
                <h4 className="font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Payment Verification Process
                </h4>
                <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                  Always verify payment receipts against bank statements before confirming payments. Ensure the receipt number, amount, and date match before updating the payment status.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Outstanding Payments */}
          <Card id="outstanding">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-primary" />
                Outstanding Payments
              </CardTitle>
              <CardDescription>
                Track and follow up on overdue payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-card-foreground">
                The Outstanding Payments section helps you monitor and manage overdue invoices, schedule follow-ups, and track collection efforts.
              </p>
              
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-primary" />
                  View all overdue invoices with aging analysis
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-primary" />
                  Schedule and track follow-up actions
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-primary" />
                  Send payment reminders to entities
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-primary" />
                  Escalate persistent non-payment cases
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
                    <ClipboardList className="w-4 h-4 text-blue-500" />
                    Daily Operations
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Track daily revenue activities, staff workload, and operational metrics for the revenue unit.
                  </p>
                </div>

                <div className="p-4 rounded-lg border">
                  <h4 className="font-semibold flex items-center gap-2 text-card-foreground">
                    <Cog className="w-4 h-4 text-gray-500" />
                    Codes Management
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage revenue item codes, fee categories, and pricing structures used across the system.
                  </p>
                </div>

                <div className="p-4 rounded-lg border">
                  <h4 className="font-semibold flex items-center gap-2 text-card-foreground">
                    <BarChart3 className="w-4 h-4 text-purple-500" />
                    Analytics and Reporting
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Generate comprehensive financial reports, revenue analytics, and collection performance metrics.
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
                <h4 className="font-semibold text-card-foreground">1. Generating an Invoice</h4>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Navigate to <strong>Collection → Invoice Management</strong></li>
                  <li>Click "Generate New Invoice"</li>
                  <li>Select the entity and application type</li>
                  <li>Review the calculated fees and add any additional items</li>
                  <li>Generate and save the invoice</li>
                  <li>Send the invoice to the applicant</li>
                </ol>
              </div>

              <Separator />

              {/* Workflow 2 */}
              <div className="space-y-3">
                <h4 className="font-semibold text-card-foreground">2. Verifying a Payment</h4>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Go to <strong>Collection → Payment Verification</strong></li>
                  <li>Locate the pending payment by invoice number</li>
                  <li>Review the submitted payment receipt</li>
                  <li>Cross-reference with bank statement</li>
                  <li>Confirm payment details match (amount, date, reference)</li>
                  <li>Update payment status to "Verified"</li>
                  <li>The system will automatically update the application status</li>
                </ol>
              </div>

              <Separator />

              {/* Workflow 3 */}
              <div className="space-y-3">
                <h4 className="font-semibold text-card-foreground">3. Following Up on Outstanding Payments</h4>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Access <strong>Outstanding Payments</strong></li>
                  <li>Filter by aging period (30, 60, 90+ days)</li>
                  <li>Review entity contact information</li>
                  <li>Send payment reminder via email or phone</li>
                  <li>Record follow-up action and notes</li>
                  <li>Schedule next follow-up date if needed</li>
                  <li>Escalate to manager if no response after multiple attempts</li>
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
                  <h4 className="font-semibold text-card-foreground">Q: What payment methods are accepted?</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    A: CEPA accepts bank transfers, cheques, and electronic payments. Cash payments must be deposited to the official CEPA bank account.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold text-card-foreground">Q: How do I correct an invoice error?</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    A: Void the incorrect invoice and generate a new one with the correct details. Document the reason for voiding in the system notes.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold text-card-foreground">Q: What is the payment verification timeline?</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    A: Payments should be verified within 24-48 hours of receipt submission. Bank reconciliation is done daily.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold text-card-foreground">Q: How are late payment penalties calculated?</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    A: Late payment penalties are calculated according to CEPA fee regulations. Contact your manager for specific penalty rates.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 mt-6">
                <h4 className="font-semibold text-primary flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Need More Help?
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  For additional support, contact the CEPA IT Help Desk or your Revenue Unit Manager. System documentation and training materials are available on the internal knowledge base.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
