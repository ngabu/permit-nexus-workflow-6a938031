import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, AlertTriangle, BarChart3, Settings, CreditCard, User } from 'lucide-react';
import { PaymentVerification } from '@/components/revenue/PaymentVerification';
import { InvoiceManagement } from '@/components/revenue/InvoiceManagement';
import { OutstandingPaymentsManagement } from '@/components/revenue/OutstandingPaymentsManagement';
import { RevenueOfficerOperations } from '@/components/revenue/RevenueOfficerOperations';
import { RevenueItemCodesManagement } from '@/components/revenue/RevenueItemCodesManagement';
import { RevenueReports } from '@/components/revenue/RevenueReports';
import RevenueAnalyticsReports from '@/components/revenue/RevenueAnalyticsReports';
import { RevenueKPIs } from '@/components/revenue/RevenueKPIs';
import { RevenueEntitiesList } from '@/components/revenue/RevenueEntitiesList';
import { RevenuePermitsList } from '@/components/revenue/RevenuePermitsList';
import { RevenueIntentRegistrationsList } from '@/components/revenue/RevenueIntentRegistrationsList';
import { ProfileSettings } from '@/components/public/ProfileSettings';
import { AppSettings } from '@/components/public/AppSettings';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { RevenueSidebar } from '@/components/revenue/RevenueSidebar';

export default function RevenueDashboard() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <RevenueSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <SidebarInset className="flex-1">
          <div className="p-6 bg-background">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Revenue Unit</h1>
                  <p className="text-muted-foreground mt-1">Revenue collection and management operations</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Logged in as</p>
                  <p className="text-base font-medium text-foreground">
                    {profile?.first_name && profile?.last_name 
                      ? `${profile.first_name} ${profile.last_name}`
                      : profile?.email}
                  </p>
                </div>
              </div>

              {/* Content controlled by sidebar navigation */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsContent value="dashboard" className="space-y-6">
                  <RevenueKPIs />
                  <RevenueOfficerOperations />
                </TabsContent>

                <TabsContent value="listings-intents" className="space-y-6">
                  <RevenueIntentRegistrationsList />
                </TabsContent>

                <TabsContent value="listings-entities" className="space-y-6">
                  <RevenueEntitiesList />
                </TabsContent>

                <TabsContent value="listings-permits" className="space-y-6">
                  <RevenuePermitsList />
                </TabsContent>

                <TabsContent value="collection" className="space-y-6">
                  <Tabs defaultValue="invoices" className="space-y-4">
                    <TabsList>
                      <TabsTrigger value="invoices">Invoice Management</TabsTrigger>
                      <TabsTrigger value="verification">Payment Verification</TabsTrigger>
                    </TabsList>
                    <TabsContent value="invoices">
                      <InvoiceManagement />
                    </TabsContent>
                    <TabsContent value="verification">
                      <PaymentVerification />
                    </TabsContent>
                  </Tabs>
                </TabsContent>

                <TabsContent value="outstanding" className="space-y-6">
                  <OutstandingPaymentsManagement />
                </TabsContent>

                <TabsContent value="reports" className="space-y-6">
                  <RevenueReports />
                </TabsContent>

                <TabsContent value="analytics-reporting" className="space-y-6">
                  <RevenueAnalyticsReports />
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                  <RevenueItemCodesManagement />
                </TabsContent>

                <TabsContent value="profile" className="space-y-6">
                  <ProfileSettings readOnly />
                </TabsContent>

                <TabsContent value="app-settings" className="space-y-6">
                  <AppSettings />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
