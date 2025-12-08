import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  ClipboardList, 
  Shield, 
  Receipt, 
  Award, 
  Upload, 
  CheckCircle, 
  Loader2, 
  Lock,
  FileSignature,
  Send
} from 'lucide-react';

export interface ReviewConfig {
  applicationId: string;
  applicationType: 'permit_amalgamation' | 'permit_amendment' | 'permit_renewal' | 'permit_surrender' | 'permit_transfer' | 'permit_enforcement' | 'permit_compliance';
  applicationNumber?: string;
  currentStatus?: string;
  onStatusUpdate?: () => void;
}

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export function CEPAInternalReviewTabs({ applicationId, applicationType, applicationNumber, currentStatus, onStatusUpdate }: ReviewConfig) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('registry');
  
  // Registry Review State
  const [registryChecklist, setRegistryChecklist] = useState<ChecklistItem[]>([
    { id: 'documents_complete', label: 'All required documents submitted', checked: false },
    { id: 'application_valid', label: 'Application form properly completed', checked: false },
    { id: 'fees_applicable', label: 'Applicable fees identified', checked: false },
    { id: 'entity_verified', label: 'Entity registration verified', checked: false },
  ]);
  const [registryAssessment, setRegistryAssessment] = useState('');
  const [registryDecision, setRegistryDecision] = useState('');
  const [registryUploading, setRegistryUploading] = useState(false);
  const [registryFiles, setRegistryFiles] = useState<{ name: string; path: string }[]>([]);
  const [registrySubmitting, setRegistrySubmitting] = useState(false);

  // Compliance Review State
  const [complianceChecklist, setComplianceChecklist] = useState<ChecklistItem[]>([
    { id: 'environmental_impact', label: 'Environmental impact assessed', checked: false },
    { id: 'compliance_history', label: 'Compliance history reviewed', checked: false },
    { id: 'mitigation_measures', label: 'Mitigation measures adequate', checked: false },
    { id: 'monitoring_plan', label: 'Monitoring plan reviewed', checked: false },
  ]);
  const [complianceAssessment, setComplianceAssessment] = useState('');
  const [complianceDecision, setComplianceDecision] = useState('');
  const [complianceRecommendations, setComplianceRecommendations] = useState('');
  const [complianceUploading, setComplianceUploading] = useState(false);
  const [complianceFiles, setComplianceFiles] = useState<{ name: string; path: string }[]>([]);
  const [complianceSubmitting, setComplianceSubmitting] = useState(false);

  // Invoice & Payments State
  const [invoiceChecklist, setInvoiceChecklist] = useState<ChecklistItem[]>([
    { id: 'fees_calculated', label: 'Fees correctly calculated', checked: false },
    { id: 'invoice_generated', label: 'Invoice generated', checked: false },
    { id: 'payment_verified', label: 'Payment verified', checked: false },
  ]);
  const [invoiceNotes, setInvoiceNotes] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [invoiceSubmitting, setInvoiceSubmitting] = useState(false);

  // MD Review State
  const [mdChecklist, setMdChecklist] = useState<ChecklistItem[]>([
    { id: 'all_reviews_complete', label: 'All unit reviews completed', checked: false },
    { id: 'recommendations_reviewed', label: 'Recommendations reviewed', checked: false },
    { id: 'decision_ready', label: 'Ready for final decision', checked: false },
  ]);
  const [mdDecision, setMdDecision] = useState('');
  const [mdNotes, setMdNotes] = useState('');
  const [mdSubmitting, setMdSubmitting] = useState(false);
  const [sendingToDocuSign, setSendingToDocuSign] = useState(false);
  const [mdUploading, setMdUploading] = useState(false);
  const [mdUploadedFiles, setMdUploadedFiles] = useState<{ name: string; path: string }[]>([]);

  // Permission checks
  const canEditRegistry = profile?.staff_unit === 'registry' || 
                          profile?.user_type === 'admin' || 
                          profile?.user_type === 'super_admin';
  
  const canEditCompliance = profile?.staff_unit === 'compliance' || 
                            profile?.user_type === 'admin' || 
                            profile?.user_type === 'super_admin';
  
  const canEditInvoice = profile?.staff_unit === 'revenue' || 
                         profile?.staff_unit === 'finance' ||
                         profile?.user_type === 'admin' || 
                         profile?.user_type === 'super_admin';
  
  const canEditMD = profile?.staff_position === 'managing_director' || 
                    profile?.staff_position === 'director' ||
                    profile?.user_type === 'admin' || 
                    profile?.user_type === 'super_admin';

  const updateChecklist = (
    checklist: ChecklistItem[], 
    setChecklist: React.Dispatch<React.SetStateAction<ChecklistItem[]>>, 
    id: string, 
    checked: boolean
  ) => {
    setChecklist(checklist.map(item => 
      item.id === id ? { ...item, checked } : item
    ));
  };

  const handleRegistrySubmit = async () => {
    if (!canEditRegistry) return;
    setRegistrySubmitting(true);
    try {
      // TODO: Save to database
      console.log('Registry review submitted:', { registryChecklist, registryAssessment, registryDecision });
      toast({ title: 'Success', description: 'Registry review submitted successfully' });
      onStatusUpdate?.();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to submit review', variant: 'destructive' });
    } finally {
      setRegistrySubmitting(false);
    }
  };

  const handleComplianceSubmit = async () => {
    if (!canEditCompliance) return;
    setComplianceSubmitting(true);
    try {
      // TODO: Save to database
      console.log('Compliance review submitted:', { complianceChecklist, complianceAssessment, complianceDecision });
      toast({ title: 'Success', description: 'Compliance review submitted successfully' });
      onStatusUpdate?.();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to submit review', variant: 'destructive' });
    } finally {
      setComplianceSubmitting(false);
    }
  };

  const handleInvoiceSubmit = async () => {
    if (!canEditInvoice) return;
    setInvoiceSubmitting(true);
    try {
      // TODO: Save to database
      console.log('Invoice review submitted:', { invoiceChecklist, invoiceNotes, paymentStatus });
      toast({ title: 'Success', description: 'Invoice review submitted successfully' });
      onStatusUpdate?.();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to submit review', variant: 'destructive' });
    } finally {
      setInvoiceSubmitting(false);
    }
  };

  const handleMDSubmit = async () => {
    if (!canEditMD) return;
    setMdSubmitting(true);
    try {
      // TODO: Save to database
      console.log('MD review submitted:', { mdChecklist, mdDecision, mdNotes });
      toast({ title: 'Success', description: 'MD review submitted successfully' });
      onStatusUpdate?.();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to submit review', variant: 'destructive' });
    } finally {
      setMdSubmitting(false);
    }
  };

  const handleSendToDocuSign = async () => {
    if (!canEditMD) return;
    setSendingToDocuSign(true);
    try {
      // TODO: Integrate with DocuSign
      console.log('Sending to DocuSign for signature');
      toast({ title: 'Success', description: 'Document sent to DocuSign for electronic signature' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to send to DocuSign', variant: 'destructive' });
    } finally {
      setSendingToDocuSign(false);
    }
  };

  const renderReadOnlyAlert = (unitName: string) => (
    <Alert className="mb-4">
      <Lock className="h-4 w-4" />
      <AlertDescription>
        This section is read-only. Only {unitName} staff can edit this tab.
      </AlertDescription>
    </Alert>
  );

  const renderChecklist = (
    checklist: ChecklistItem[], 
    setChecklist: React.Dispatch<React.SetStateAction<ChecklistItem[]>>, 
    canEdit: boolean
  ) => (
    <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
      <Label className="text-sm font-semibold">Validation Checklist</Label>
      <div className="space-y-3">
        {checklist.map(item => (
          <div key={item.id} className="flex items-center space-x-3">
            <Checkbox
              id={item.id}
              checked={item.checked}
              onCheckedChange={(checked) => updateChecklist(checklist, setChecklist, item.id, !!checked)}
              disabled={!canEdit}
            />
            <Label htmlFor={item.id} className="text-sm font-normal cursor-pointer">
              {item.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="bg-primary/5">
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-primary" />
          CEPA Internal Review and Assessments
          {applicationNumber && (
            <Badge variant="outline" className="ml-auto">
              {applicationNumber}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="registry" className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              <span className="hidden sm:inline">Registry Review</span>
              <span className="sm:hidden">Registry</span>
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Compliance Review</span>
              <span className="sm:hidden">Compliance</span>
            </TabsTrigger>
            <TabsTrigger value="invoice" className="flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              <span className="hidden sm:inline">Invoice & Payments</span>
              <span className="sm:hidden">Invoice</span>
            </TabsTrigger>
            <TabsTrigger value="md" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span className="hidden sm:inline">MD Review & Approval</span>
              <span className="sm:hidden">MD</span>
            </TabsTrigger>
          </TabsList>

          {/* Registry Review Tab */}
          <TabsContent value="registry" className="space-y-4 mt-4">
            {!canEditRegistry && renderReadOnlyAlert('Registry')}
            
            {renderChecklist(registryChecklist, setRegistryChecklist, canEditRegistry)}

            <div className="space-y-2">
              <Label htmlFor="registryAssessment">Assessment Notes *</Label>
              <Textarea
                id="registryAssessment"
                value={registryAssessment}
                onChange={(e) => setRegistryAssessment(e.target.value)}
                placeholder="Provide detailed assessment of the application..."
                rows={4}
                disabled={!canEditRegistry}
                className={!canEditRegistry ? 'bg-muted cursor-not-allowed' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="registryDecision">Registry Decision *</Label>
              <Select value={registryDecision} onValueChange={setRegistryDecision} disabled={!canEditRegistry}>
                <SelectTrigger className={!canEditRegistry ? 'bg-muted cursor-not-allowed' : ''}>
                  <SelectValue placeholder="Select decision" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approve - Forward to Compliance</SelectItem>
                  <SelectItem value="requires_info">Requires Additional Information</SelectItem>
                  <SelectItem value="rejected">Reject Application</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Supporting Documents</Label>
              <div className={`border-2 border-dashed border-border rounded-lg p-4 ${!canEditRegistry ? 'bg-muted' : ''}`}>
                <Input
                  type="file"
                  multiple
                  disabled={registryUploading || !canEditRegistry}
                  className={`cursor-pointer ${!canEditRegistry ? 'cursor-not-allowed' : ''}`}
                />
                {registryUploading && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </div>
                )}
              </div>
              {registryFiles.length > 0 && (
                <div className="mt-2 space-y-1">
                  {registryFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Upload className="w-4 h-4" />
                      {file.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {canEditRegistry && (
              <Button onClick={handleRegistrySubmit} disabled={registrySubmitting} className="w-full">
                {registrySubmitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                ) : (
                  <><CheckCircle className="w-4 h-4 mr-2" /> Submit Registry Review</>
                )}
              </Button>
            )}
          </TabsContent>

          {/* Compliance Review Tab */}
          <TabsContent value="compliance" className="space-y-4 mt-4">
            {!canEditCompliance && renderReadOnlyAlert('Compliance')}
            
            {renderChecklist(complianceChecklist, setComplianceChecklist, canEditCompliance)}

            <div className="space-y-2">
              <Label htmlFor="complianceAssessment">Technical Assessment *</Label>
              <Textarea
                id="complianceAssessment"
                value={complianceAssessment}
                onChange={(e) => setComplianceAssessment(e.target.value)}
                placeholder="Provide technical and environmental assessment..."
                rows={4}
                disabled={!canEditCompliance}
                className={!canEditCompliance ? 'bg-muted cursor-not-allowed' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="complianceRecommendations">Recommendations</Label>
              <Textarea
                id="complianceRecommendations"
                value={complianceRecommendations}
                onChange={(e) => setComplianceRecommendations(e.target.value)}
                placeholder="Provide recommendations and conditions..."
                rows={3}
                disabled={!canEditCompliance}
                className={!canEditCompliance ? 'bg-muted cursor-not-allowed' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="complianceDecision">Compliance Decision *</Label>
              <Select value={complianceDecision} onValueChange={setComplianceDecision} disabled={!canEditCompliance}>
                <SelectTrigger className={!canEditCompliance ? 'bg-muted cursor-not-allowed' : ''}>
                  <SelectValue placeholder="Select decision" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compliant">Compliant - Forward to Revenue</SelectItem>
                  <SelectItem value="conditional">Conditional Approval</SelectItem>
                  <SelectItem value="requires_inspection">Requires Site Inspection</SelectItem>
                  <SelectItem value="non_compliant">Non-Compliant - Reject</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Supporting Documents</Label>
              <div className={`border-2 border-dashed border-border rounded-lg p-4 ${!canEditCompliance ? 'bg-muted' : ''}`}>
                <Input
                  type="file"
                  multiple
                  disabled={complianceUploading || !canEditCompliance}
                  className={`cursor-pointer ${!canEditCompliance ? 'cursor-not-allowed' : ''}`}
                />
              </div>
            </div>

            {canEditCompliance && (
              <Button onClick={handleComplianceSubmit} disabled={complianceSubmitting} className="w-full">
                {complianceSubmitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                ) : (
                  <><CheckCircle className="w-4 h-4 mr-2" /> Submit Compliance Review</>
                )}
              </Button>
            )}
          </TabsContent>

          {/* Invoice & Payments Tab */}
          <TabsContent value="invoice" className="space-y-4 mt-4">
            {!canEditInvoice && renderReadOnlyAlert('Revenue/Finance')}
            
            {renderChecklist(invoiceChecklist, setInvoiceChecklist, canEditInvoice)}

            <div className="space-y-2">
              <Label htmlFor="paymentStatus">Payment Status *</Label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus} disabled={!canEditInvoice}>
                <SelectTrigger className={!canEditInvoice ? 'bg-muted cursor-not-allowed' : ''}>
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending - Invoice Not Sent</SelectItem>
                  <SelectItem value="invoiced">Invoice Sent - Awaiting Payment</SelectItem>
                  <SelectItem value="partial">Partial Payment Received</SelectItem>
                  <SelectItem value="paid">Fully Paid - Forward to MD</SelectItem>
                  <SelectItem value="waived">Fees Waived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoiceNotes">Invoice Notes</Label>
              <Textarea
                id="invoiceNotes"
                value={invoiceNotes}
                onChange={(e) => setInvoiceNotes(e.target.value)}
                placeholder="Add notes about invoicing or payment..."
                rows={3}
                disabled={!canEditInvoice}
                className={!canEditInvoice ? 'bg-muted cursor-not-allowed' : ''}
              />
            </div>

            {canEditInvoice && (
              <Button onClick={handleInvoiceSubmit} disabled={invoiceSubmitting} className="w-full">
                {invoiceSubmitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                ) : (
                  <><CheckCircle className="w-4 h-4 mr-2" /> Submit Invoice Review</>
                )}
              </Button>
            )}
          </TabsContent>

          {/* MD Review & Approval Tab */}
          <TabsContent value="md" className="space-y-4 mt-4">
            {!canEditMD && renderReadOnlyAlert('Managing Director')}
            
            {renderChecklist(mdChecklist, setMdChecklist, canEditMD)}

            <div className="space-y-2">
              <Label htmlFor="mdDecision">Final Decision *</Label>
              <Select value={mdDecision} onValueChange={setMdDecision} disabled={!canEditMD}>
                <SelectTrigger className={!canEditMD ? 'bg-muted cursor-not-allowed' : ''}>
                  <SelectValue placeholder="Select final decision" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="approved_with_conditions">Approved with Conditions</SelectItem>
                  <SelectItem value="deferred">Deferred - Requires Further Review</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mdNotes">Decision Notes</Label>
              <Textarea
                id="mdNotes"
                value={mdNotes}
                onChange={(e) => setMdNotes(e.target.value)}
                placeholder="Provide notes on the final decision..."
                rows={4}
                disabled={!canEditMD}
                className={!canEditMD ? 'bg-muted cursor-not-allowed' : ''}
              />
            </div>

            {/* Signed Documents / Attachments */}
            <div className="space-y-2">
              <Label>Signed Documents / Attachments</Label>
              <div className={`border-2 border-dashed border-border rounded-lg p-4 ${!canEditMD ? 'bg-muted' : ''}`}>
                <Input
                  type="file"
                  multiple
                  onChange={async (e) => {
                    if (!canEditMD) return;
                    const files = e.target.files;
                    if (!files || files.length === 0) return;

                    setMdUploading(true);
                    try {
                      const newFiles: { name: string; path: string }[] = [];
                      
                      for (const file of Array.from(files)) {
                        const fileName = `${applicationId}/md-review/${Date.now()}-${file.name}`;
                        
                        const { error: uploadError } = await supabase.storage
                          .from('documents')
                          .upload(fileName, file);

                        if (uploadError) throw uploadError;
                        
                        newFiles.push({ name: file.name, path: fileName });
                      }
                      
                      setMdUploadedFiles(prev => [...prev, ...newFiles]);
                      toast({ title: 'Success', description: 'Files uploaded successfully' });
                    } catch (error) {
                      console.error('Error uploading files:', error);
                      toast({ title: 'Error', description: 'Failed to upload files', variant: 'destructive' });
                    } finally {
                      setMdUploading(false);
                    }
                  }}
                  disabled={mdUploading || !canEditMD}
                  className={`cursor-pointer ${!canEditMD ? 'cursor-not-allowed' : ''}`}
                />
                {mdUploading && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </div>
                )}
              </div>
              {mdUploadedFiles.length > 0 && (
                <div className="mt-2 space-y-1">
                  {mdUploadedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Upload className="w-4 h-4" />
                      {file.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* DocuSign Electronic Signature */}
            <div className="space-y-2">
              <Label>DocuSign Electronic Signature</Label>
              <div className="p-4 border rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground mb-3">
                  Send the signed documents for electronic signature via DocuSign.
                </p>
                <Button
                  variant="outline"
                  onClick={async () => {
                    if (!canEditMD) return;
                    
                    setSendingToDocuSign(true);
                    try {
                      const signerEmail = profile?.email || 'md@cepa.gov.pg';
                      const signerName = profile?.first_name && profile?.last_name 
                        ? `${profile.first_name} ${profile.last_name}` 
                        : 'Managing Director';

                      const { data, error } = await supabase.functions.invoke('docusign-send', {
                        body: {
                          applicationId,
                          applicationType,
                          signerEmail,
                          signerName,
                          documentName: `${applicationType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Approval Letter`,
                          documentPath: mdUploadedFiles.length > 0 ? mdUploadedFiles[0].path : null
                        }
                      });

                      if (error) throw error;

                      toast({
                        title: 'DocuSign Request Sent',
                        description: data.message || 'Document sent for electronic signature',
                      });
                    } catch (error) {
                      console.error('DocuSign error:', error);
                      toast({
                        title: 'Error',
                        description: 'Failed to send document to DocuSign',
                        variant: 'destructive'
                      });
                    } finally {
                      setSendingToDocuSign(false);
                    }
                  }}
                  disabled={!canEditMD || sendingToDocuSign}
                  className={`w-full ${!canEditMD ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  {sendingToDocuSign ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending to DocuSign...
                    </>
                  ) : (
                    <>
                      <FileSignature className="w-4 h-4 mr-2" />
                      Send to DocuSign for Signature
                    </>
                  )}
                </Button>
              </div>
            </div>

            {canEditMD && (
              <Button onClick={handleMDSubmit} disabled={mdSubmitting} className="w-full bg-green-600 hover:bg-green-700">
                {mdSubmitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                ) : (
                  <><CheckCircle className="w-4 h-4 mr-2" /> Submit Final Decision</>
                )}
              </Button>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
