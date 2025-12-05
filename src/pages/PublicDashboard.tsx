
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { PublicSidebar } from '@/components/public/PublicSidebar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { EntityManagement } from '@/components/public/EntityManagement';
import { PermitManagement } from '@/components/public/PermitManagement';
import { InvoiceManagement } from '@/components/public/InvoiceManagement';
import { PaymentSummary } from '@/components/public/PaymentSummary';
import { NotificationCenter } from '@/components/public/NotificationCenter';
import { DocumentManagement } from '@/components/public/DocumentManagement';
import { ApplicationDetailDialog } from '@/components/public/ApplicationDetailDialog';
import { ProfileSettings } from '@/components/public/ProfileSettings';
import { AppSettings } from '@/components/public/AppSettings';
import { ComprehensivePermitForm } from '@/components/public/ComprehensivePermitForm';
import { PermitApplicationsMap } from '@/components/public/PermitApplicationsMap';
import PermitAmalgamation from '@/pages/permit-management/PermitAmalgamation';
import PermitAmendment from '@/pages/permit-management/PermitAmendment';
import PermitCompliance from '@/pages/permit-management/PermitCompliance';
import PermitRenewal from '@/pages/permit-management/PermitRenewal';
import PermitSurrender from '@/pages/permit-management/PermitSurrender';
import PermitTransfer from '@/pages/permit-management/PermitTransfer';
import { useUserNotifications } from '@/hooks/useUserNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { IntentRegistrationNew } from '@/components/public/IntentRegistrationNew';
import { IntentRegistrationList } from '@/components/public/IntentRegistrationList';
import { ComplianceInspectionsView } from '@/components/public/ComplianceInspectionsView';
import { ComplianceReportSubmissionsView } from '@/components/public/ComplianceReportSubmissionsView';
import { ApplicationGuide } from '@/components/public/ApplicationGuide';
import ActivityOverview from '@/pages/ActivityOverview';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function PublicDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [showApplicationDetail, setShowApplicationDetail] = useState(false);
  const { user, profile } = useAuth();
  const { unreadCount } = useUserNotifications(user?.id);
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  // Handle payment verification after Stripe redirect
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const paymentStatus = searchParams.get('payment');
    const invoiceNumber = searchParams.get('invoice_number');

    if (sessionId && paymentStatus === 'success') {
      // Verify payment and update invoice
      const verifyPayment = async () => {
        try {
          console.log('Verifying payment for session:', sessionId);
          
          const { data, error } = await supabase.functions.invoke('stripe-webhook', {
            body: { sessionId }
          });

          console.log('Payment verification response:', data, error);

          if (error) {
            throw new Error(error.message);
          }

          if (data?.success) {
            // Dispatch event for InvoiceManagement to update local state
            const paymentEvent = new CustomEvent('payment-success', {
              detail: {
                invoiceNumber: data.invoiceNumber || invoiceNumber,
                receiptUrl: data.receiptUrl
              }
            });
            window.dispatchEvent(paymentEvent);
            
            toast({
              title: "Payment Successful",
              description: `Invoice ${data.invoiceNumber || invoiceNumber} has been paid. You can view your receipt in the Invoices section.`,
            });
            // Navigate to invoices tab
            setActiveTab('invoices');
          } else {
            toast({
              title: "Payment Verification",
              description: data?.message || "Payment status is being processed.",
              variant: "default"
            });
          }
        } catch (error: any) {
          console.error('Payment verification error:', error);
          toast({
            title: "Payment Verification Issue",
            description: "Your payment may have been processed. Please check your invoices.",
            variant: "default"
          });
        }

        // Clear the URL parameters
        setSearchParams({});
      };

      verifyPayment();
    } else if (paymentStatus === 'cancelled') {
      toast({
        title: "Payment Cancelled",
        description: "Your payment was cancelled. You can try again from the Invoices section.",
        variant: "default"
      });
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, toast]);

  useEffect(() => {
    // Listen for navigation events from notifications
    const handleNavigateToPermits = (event: CustomEvent) => {
      setActiveTab('permits');
    };

    window.addEventListener('navigate-to-permits', handleNavigateToPermits as EventListener);
    
    return () => {
      window.removeEventListener('navigate-to-permits', handleNavigateToPermits as EventListener);
    };
  }, []);


  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <PublicSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 flex flex-col">
          {/* Header - Mobile Responsive */}
          <header className="border-b border-sidebar-border bg-background px-4 py-4 sm:px-6 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
              <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <SidebarTrigger className="hover:bg-sidebar-accent mt-1 sm:mt-0 shrink-0" />
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-forest-800 truncate">My Applications</h1>
                  <p className="text-sm sm:text-base text-forest-600 mt-0.5 sm:mt-1">Manage your permit applications and documents</p>
                </div>
              </div>
              {profile && (
                <div className="text-left sm:text-right pl-11 sm:pl-0">
                  <p className="text-xs sm:text-sm text-muted-foreground">Logged in as</p>
                  <p className="text-sm sm:text-base font-semibold text-forest-800 truncate">
                    {profile.full_name || profile.first_name || profile.last_name || user?.email || 'User'}
                  </p>
                </div>
              )}
            </div>
          </header>

          <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto">
            {activeTab === 'dashboard' && (
              <div className="space-y-4 sm:space-y-6">
                {/* Application Guide - Before You Begin */}
                <ApplicationGuide />
              </div>
            )}

            {activeTab === 'activity-overview' && <ActivityOverview onNavigate={setActiveTab} />}

            {activeTab === 'entities' && (
              <div className="max-w-7xl mx-auto">
                <EntityManagement />
              </div>
            )}
            {activeTab === 'intent-registration-new' && (
              <div className="max-w-7xl mx-auto">
                <IntentRegistrationNew />
              </div>
            )}
            {activeTab === 'intent-registration-existing' && (
              <div className="max-w-7xl mx-auto">
                <IntentRegistrationList />
              </div>
            )}
            {activeTab === 'permits' && (
              <div className="max-w-7xl mx-auto">
                <PermitManagement 
                  onNavigateToNewApplication={() => {
                    setSelectedApplicationId(null);
                    setActiveTab('permit-application-new');
                  }}
                  onNavigateToEditApplication={(permitId) => {
                    setSelectedApplicationId(permitId);
                    setActiveTab('permit-application-new');
                  }}
                />
              </div>
            )}
            {activeTab === 'permit-application-new' && (
              <div className="max-w-7xl mx-auto">
                <ComprehensivePermitForm
                  permitId={selectedApplicationId || undefined}
                  onSuccess={() => {
                    setActiveTab('permits');
                    setSelectedApplicationId(null);
                  }}
                  onCancel={() => {
                    setActiveTab('permits');
                    setSelectedApplicationId(null);
                  }}
                  isStandalone={false}
                />
              </div>
            )}
            {activeTab === 'permit-amalgamation' && (
              <div className="max-w-7xl mx-auto">
                <PermitAmalgamation />
              </div>
            )}
            {activeTab === 'permit-amendment' && (
              <div className="max-w-7xl mx-auto">
                <PermitAmendment />
              </div>
            )}
            {activeTab === 'permit-compliance' && (
              <div className="max-w-7xl mx-auto">
                <PermitCompliance />
              </div>
            )}
            {activeTab === 'permit-renewal' && (
              <div className="max-w-7xl mx-auto">
                <PermitRenewal />
              </div>
            )}
            {activeTab === 'permit-surrender' && (
              <div className="max-w-7xl mx-auto">
                <PermitSurrender />
              </div>
            )}
            {activeTab === 'permit-transfer' && (
              <div className="max-w-7xl mx-auto">
                <PermitTransfer />
              </div>
            )}
            {activeTab === 'invoices' && (
              <div className="max-w-7xl mx-auto">
                <InvoiceManagement />
              </div>
            )}
            {activeTab === 'payment-summary' && (
              <div className="max-w-7xl mx-auto">
                <PaymentSummary />
              </div>
            )}
            {activeTab === 'notifications' && (
              <div className="max-w-7xl mx-auto">
                <NotificationCenter 
                  onViewApplication={(permitId) => {
                    setSelectedApplicationId(permitId);
                    setShowApplicationDetail(true);
                  }} 
                />
              </div>
            )}
            {activeTab === 'documents' && (
              <div className="max-w-7xl mx-auto">
                <DocumentManagement />
              </div>
            )}
            {activeTab === 'compliance-inspections' && (
              <div className="max-w-7xl mx-auto">
                <ComplianceInspectionsView />
              </div>
            )}
            {activeTab === 'compliance-reports' && (
              <div className="max-w-7xl mx-auto">
                <ComplianceReportSubmissionsView />
              </div>
            )}
            {activeTab === 'profile' && (
              <div className="max-w-4xl mx-auto">
                <ProfileSettings />
              </div>
            )}
            {activeTab === 'settings' && (
              <div className="max-w-4xl mx-auto">
                <AppSettings />
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Application Detail Dialog */}
      {selectedApplicationId && (
        <ApplicationDetailDialog
          open={showApplicationDetail}
          onOpenChange={setShowApplicationDetail}
          permitApplicationId={selectedApplicationId}
        />
      )}
    </SidebarProvider>
  );
}
