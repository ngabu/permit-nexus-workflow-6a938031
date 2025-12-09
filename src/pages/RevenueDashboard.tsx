import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, AlertTriangle, BarChart3, Settings, CreditCard, User } from 'lucide-react';
import { StaffManagement } from '@/components/shared/StaffManagement';
import { PaymentVerification } from '@/components/revenue/PaymentVerification';
import { InvoiceManagement } from '@/components/revenue/InvoiceManagement';
import { OutstandingPaymentsManagement } from '@/components/revenue/OutstandingPaymentsManagement';
import { RevenueOfficerOperations } from '@/components/revenue/RevenueOfficerOperations';
import { RevenueItemCodesManagement } from '@/components/revenue/RevenueItemCodesManagement';
import { RevenueReports } from '@/components/revenue/RevenueReports';
import RevenueAnalyticsReportsNew from '@/components/revenue/RevenueAnalyticsReportsNew';
import { RevenueKPIs } from '@/components/revenue/RevenueKPIs';
import { RevenueEntitiesList } from '@/components/revenue/RevenueEntitiesList';
import { RevenuePermitsList } from '@/components/revenue/RevenuePermitsList';
import { RevenueIntentRegistrationsList } from '@/components/revenue/RevenueIntentRegistrationsList';
import { RevenueUserGuide } from '@/components/revenue/RevenueUserGuide';
import { ProfileSettings } from '@/components/public/ProfileSettings';
import { AppSettings } from '@/components/public/AppSettings';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { RevenueSidebar } from '@/components/revenue/RevenueSidebar';

export default function RevenueDashboard() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <RevenueSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <SidebarInset className="flex-1">
          <div className="p-4 md:p-6 bg-background">
            <div className="space-y-4 md:space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <SidebarTrigger className="hover:bg-sidebar-accent mt-1 sm:mt-0 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground truncate">Revenue Unit</h1>
                    <p className="text-sm text-muted-foreground mt-1 truncate">Revenue collection and management operations</p>
                  </div>
                </div>
                <div className="text-left sm:text-right ml-10 sm:ml-0">
                  <p className="text-xs sm:text-sm text-muted-foreground">Logged in as</p>
                  <p className="text-sm sm:text-base font-medium text-foreground truncate">
                    {profile?.first_name && profile?.last_name 
                      ? `${profile.first_name} ${profile.last_name}`
                      : profile?.email}
                  </p>
                </div>
              </div>

              {/* Content controlled by sidebar navigation */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
                <TabsContent value="dashboard" className="space-y-4 md:space-y-6">
                  <RevenueKPIs />
                </TabsContent>

                <TabsContent value="listings-intents" className="space-y-4 md:space-y-6">
                  <RevenueIntentRegistrationsList />
                </TabsContent>

                <TabsContent value="listings-entities" className="space-y-4 md:space-y-6">
                  <RevenueEntitiesList />
                </TabsContent>

                <TabsContent value="listings-permits" className="space-y-4 md:space-y-6">
                  <RevenuePermitsList />
                </TabsContent>

                <TabsContent value="collection" className="space-y-4 md:space-y-6">
                  <Tabs defaultValue="invoices" className="space-y-4">
                    <TabsList className="flex-wrap h-auto gap-1">
                      <TabsTrigger value="invoices" className="text-xs sm:text-sm">Invoice Management</TabsTrigger>
                      <TabsTrigger value="verification" className="text-xs sm:text-sm">Payment Verification</TabsTrigger>
                    </TabsList>
                    <TabsContent value="invoices">
                      <InvoiceManagement />
                    </TabsContent>
                    <TabsContent value="verification">
                      <PaymentVerification />
                    </TabsContent>
                  </Tabs>
                </TabsContent>

                <TabsContent value="outstanding" className="space-y-4 md:space-y-6">
                  <OutstandingPaymentsManagement />
                </TabsContent>

                <TabsContent value="reports" className="space-y-4 md:space-y-6">
                  <RevenueReports />
                </TabsContent>

                <TabsContent value="analytics-reporting" className="space-y-4 md:space-y-6">
                  <RevenueAnalyticsReportsNew />
                </TabsContent>

                <TabsContent value="daily-operations" className="space-y-4 md:space-y-6">
                  <RevenueOfficerOperations />
                </TabsContent>

                <TabsContent value="settings" className="space-y-4 md:space-y-6">
                  <RevenueItemCodesManagement />
                </TabsContent>

                <TabsContent value="profile" className="space-y-4 md:space-y-6">
                  <ProfileSettings readOnly />
                </TabsContent>

                <TabsContent value="app-settings" className="space-y-4 md:space-y-6">
                  <AppSettings />
                </TabsContent>

                <TabsContent value="user-guide" className="space-y-4 md:space-y-6">
                  <RevenueUserGuide />
                </TabsContent>

                <TabsContent value="staff-management" className="space-y-4 md:space-y-6">
                  <StaffManagement unit="revenue" />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
