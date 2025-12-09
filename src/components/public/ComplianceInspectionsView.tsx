import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, FileText, AlertCircle, CheckCircle2, ClipboardList, Receipt, CreditCard, Eye, Download } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface InspectionInvoice {
  id: string;
  invoice_number: string;
  amount: number;
  status: string;
  due_date: string;
  currency: string;
}

export function ComplianceInspectionsView() {
  const { user } = useAuth();
  const [selectedInspection, setSelectedInspection] = useState<any>(null);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);

  const { data: inspections, isLoading } = useQuery({
    queryKey: ['user-inspections', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Get user's permit applications
      const { data: permits, error: permitsError } = await supabase
        .from('permit_applications')
        .select('id')
        .eq('user_id', user.id);
      
      if (permitsError) throw permitsError;
      
      // Get user's intent registrations
      const { data: intents, error: intentsError } = await supabase
        .from('intent_registrations')
        .select('id')
        .eq('user_id', user.id);
      
      if (intentsError) throw intentsError;
      
      const permitIds = permits?.map(p => p.id) || [];
      const intentIds = intents?.map(i => i.id) || [];
      
      // If user has no permits or intents, return empty
      if (permitIds.length === 0 && intentIds.length === 0) return [];
      
      // Build query for inspections - either by permit_application_id OR intent_registration_id
      let query = supabase
        .from('inspections')
        .select(`
          *,
          permit_applications (
            permit_number,
            title,
            entity_id,
            entities (name)
          ),
          intent_registrations (
            id,
            activity_description,
            entity_id,
            entities (name)
          ),
          invoices (
            id,
            invoice_number,
            amount,
            status,
            due_date,
            currency
          )
        `)
        .order('scheduled_date', { ascending: false });
      
      // Apply OR filter for permit_application_id or intent_registration_id
      const filters: string[] = [];
      if (permitIds.length > 0) {
        filters.push(`permit_application_id.in.(${permitIds.join(',')})`);
      }
      if (intentIds.length > 0) {
        filters.push(`intent_registration_id.in.(${intentIds.join(',')})`);
      }
      
      query = query.or(filters.join(','));
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Scheduled</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">In Progress</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>;
      case 'unpaid':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Unpaid</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Partial</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleViewInvoice = (inspection: any) => {
    setSelectedInspection(inspection);
    setInvoiceDialogOpen(true);
  };

  const handlePayment = async (invoice: InspectionInvoice) => {
    try {
      // Create Stripe checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoice_number,
          amount: invoice.amount,
          currency: invoice.currency || 'PGK',
          description: `Inspection Fee - ${invoice.invoice_number}`
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error('Failed to create payment session');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to initiate payment. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  // Get invoice from inspection (handle array response from Supabase)
  const getInvoice = (inspection: any): InspectionInvoice | null => {
    if (Array.isArray(inspection.invoices) && inspection.invoices.length > 0) {
      return inspection.invoices[0];
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Inspections</h2>
        <p className="text-muted-foreground mt-1">
          View scheduled and completed inspections for your permits
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inspections?.filter(i => i.status === 'scheduled').length || 0}</p>
                <p className="text-sm text-muted-foreground">Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inspections?.filter(i => i.status === 'completed').length || 0}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inspections?.filter(i => i.status === 'in_progress').length || 0}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inspections List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Scheduled Inspections
          </CardTitle>
          <CardDescription>
            Inspections scheduled by compliance officers for your permits and intent registrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!inspections || inspections.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Inspections Yet</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Inspections will appear here once they are scheduled for your permits or intent registrations by compliance officers.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {inspections.map((inspection) => {
                const totalTravelCost = (inspection.accommodation_cost || 0) + 
                  (inspection.transportation_cost || 0) + 
                  (inspection.daily_allowance || 0);
                const invoice = getInvoice(inspection);
                
                return (
                  <div
                    key={inspection.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">
                              {inspection.permit_applications?.title || inspection.intent_registrations?.activity_description || 'Inspection'}
                            </span>
                            {getStatusBadge(inspection.status)}
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              {inspection.permit_applications?.permit_number || (inspection.intent_registration_id ? `Intent: ${inspection.intent_registration_id.slice(0, 8)}...` : 'N/A')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(inspection.scheduled_date), 'PPP')}
                            </span>
                            {inspection.province && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {inspection.province}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {inspection.number_of_days || 1} day(s)
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Type: </span>
                            <span className="capitalize">{inspection.inspection_type.replace(/_/g, ' ')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Travel Costs Section */}
                      {totalTravelCost > 0 && (
                        <div className="p-3 bg-muted/50 rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Receipt className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-sm">Travel Costs</span>
                            </div>
                            {invoice && (
                              <div className="flex items-center gap-2">
                                {getPaymentStatusBadge(invoice.status)}
                              </div>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">Accommodation:</span>
                              <p className="font-medium">K {(inspection.accommodation_cost || 0).toFixed(2)}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Transportation:</span>
                              <p className="font-medium">K {(inspection.transportation_cost || 0).toFixed(2)}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Daily Allowance:</span>
                              <p className="font-medium">K {(inspection.daily_allowance || 0).toFixed(2)}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Total:</span>
                              <p className="font-bold text-primary">K {totalTravelCost.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Invoice Actions */}
                      {invoice && (
                        <div className="flex flex-wrap gap-2 pt-2 border-t">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewInvoice(inspection)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Invoice
                          </Button>
                          {invoice.status !== 'paid' && (
                            <Button 
                              size="sm"
                              onClick={() => handlePayment(invoice)}
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              Pay Now
                            </Button>
                          )}
                        </div>
                      )}

                      {inspection.notes && (
                        <div className="text-sm p-2 bg-muted rounded">
                          <span className="font-medium">Notes: </span>
                          {inspection.notes}
                        </div>
                      )}

                      {inspection.findings && (
                        <div className="text-sm p-2 bg-green-50 border border-green-200 rounded">
                          <span className="font-medium text-green-800">Findings: </span>
                          <span className="text-green-700">{inspection.findings}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Detail Dialog */}
      <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Inspection Invoice
            </DialogTitle>
            <DialogDescription>
              Invoice details for the scheduled inspection
            </DialogDescription>
          </DialogHeader>
          
          {selectedInspection && (
            <div className="space-y-6">
              {/* Header with PNG Emblem */}
              <div className="text-center border-b pb-4">
                <img 
                  src="/images/png-emblem.png" 
                  alt="PNG Emblem" 
                  className="h-20 w-20 mx-auto mb-2"
                />
                <h2 className="text-lg font-bold text-foreground">
                  Conservation and Environment Protection Authority
                </h2>
                <p className="text-sm text-muted-foreground">
                  P.O Box 6601, Boroko, NCD, Papua New Guinea
                </p>
                <p className="text-sm text-muted-foreground">
                  Tel: (675) 3014665/3014614 | Email: revenuemanager@cepa.gov.pg
                </p>
              </div>

              {/* Invoice Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Invoice Number:</p>
                  <p className="font-medium">{getInvoice(selectedInspection)?.invoice_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Invoice Date:</p>
                  <p className="font-medium">{format(new Date(), 'PPP')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Due Date:</p>
                  <p className="font-medium">
                    {getInvoice(selectedInspection)?.due_date 
                      ? format(new Date(getInvoice(selectedInspection)!.due_date), 'PPP')
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status:</p>
                  {getInvoice(selectedInspection) && getPaymentStatusBadge(getInvoice(selectedInspection)!.status)}
                </div>
              </div>

              <Separator />

              {/* Inspection Details */}
              <div className="space-y-2">
                <h3 className="font-semibold">Inspection Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">{selectedInspection.intent_registration_id ? 'Intent Registration:' : 'Permit:'}</p>
                    <p className="font-medium">{selectedInspection.permit_applications?.title || selectedInspection.intent_registrations?.activity_description || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{selectedInspection.intent_registration_id ? 'Reference:' : 'Permit Number:'}</p>
                    <p className="font-medium">{selectedInspection.permit_applications?.permit_number || (selectedInspection.intent_registration_id ? `Intent: ${selectedInspection.intent_registration_id.slice(0, 8)}...` : 'N/A')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Inspection Type:</p>
                    <p className="font-medium capitalize">{selectedInspection.inspection_type.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Scheduled Date:</p>
                    <p className="font-medium">{format(new Date(selectedInspection.scheduled_date), 'PPP')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duration:</p>
                    <p className="font-medium">{selectedInspection.number_of_days || 1} day(s)</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Province:</p>
                    <p className="font-medium">{selectedInspection.province || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Cost Breakdown */}
              <div className="space-y-3">
                <h3 className="font-semibold">Cost Breakdown</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3">Description</th>
                        <th className="text-right p-3">Amount (PGK)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedInspection.accommodation_cost || 0) > 0 && (
                        <tr className="border-t">
                          <td className="p-3">Accommodation</td>
                          <td className="text-right p-3">K {(selectedInspection.accommodation_cost || 0).toFixed(2)}</td>
                        </tr>
                      )}
                      {(selectedInspection.transportation_cost || 0) > 0 && (
                        <tr className="border-t">
                          <td className="p-3">Transportation</td>
                          <td className="text-right p-3">K {(selectedInspection.transportation_cost || 0).toFixed(2)}</td>
                        </tr>
                      )}
                      {(selectedInspection.daily_allowance || 0) > 0 && (
                        <tr className="border-t">
                          <td className="p-3">Daily Allowance ({selectedInspection.number_of_days || 1} day(s))</td>
                          <td className="text-right p-3">K {(selectedInspection.daily_allowance || 0).toFixed(2)}</td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-muted font-semibold">
                      <tr className="border-t">
                        <td className="p-3">Total</td>
                        <td className="text-right p-3">
                          K {((selectedInspection.accommodation_cost || 0) + 
                              (selectedInspection.transportation_cost || 0) + 
                              (selectedInspection.daily_allowance || 0)).toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Actions */}
              {getInvoice(selectedInspection) && getInvoice(selectedInspection)!.status !== 'paid' && (
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button 
                    variant="outline"
                    onClick={() => setInvoiceDialogOpen(false)}
                  >
                    Close
                  </Button>
                  <Button onClick={() => handlePayment(getInvoice(selectedInspection)!)}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay Now
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}