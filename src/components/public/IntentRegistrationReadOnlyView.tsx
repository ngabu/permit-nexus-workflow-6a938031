import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building, User, Calendar, MapPin, DollarSign, Users, FileText, Download, ChevronDown, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { IntentRegistration } from '@/hooks/useIntentRegistrations';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { exportIntentRegistrationPDF } from '@/utils/pdfExport';
import { IntentBoundaryMapDisplay } from '@/components/registry/read-only/IntentBoundaryMapDisplay';

interface IntentRegistrationReadOnlyViewProps {
  intent: IntentRegistration;
  showFeedbackWithBlueHeader?: boolean;
}

interface Document {
  id: string;
  filename: string;
  file_path: string;
  uploaded_at: string;
  file_size: number;
}

interface EntityDetails {
  id: string;
  name: string;
  entity_type: string;
  'registered address'?: string;
  postal_address?: string;
  email?: string;
  phone?: string;
  district?: string;
  province?: string;
}

export function IntentRegistrationReadOnlyView({ intent, showFeedbackWithBlueHeader }: IntentRegistrationReadOnlyViewProps) {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [entityDetails, setEntityDetails] = useState<EntityDetails | null>(null);
  const [prescribedActivityDescription, setPrescribedActivityDescription] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState({
    registration: false,
    projectSite: false,
    stakeholder: false,
    financial: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    fetchDocuments();
    fetchEntityDetails();
    fetchPrescribedActivity();
  }, [intent.id, intent.entity_id, intent.prescribed_activity_id]);

  const fetchPrescribedActivity = async () => {
    if (!intent.prescribed_activity_id) return;
    try {
      const { data, error } = await supabase
        .from('prescribed_activities')
        .select('activity_description')
        .eq('id', intent.prescribed_activity_id)
        .maybeSingle();

      if (error) throw error;
      setPrescribedActivityDescription(data?.activity_description || null);
    } catch (error) {
      console.error('Error fetching prescribed activity:', error);
    }
  };

  const fetchEntityDetails = async () => {
    if (!intent.entity_id) return;
    try {
      const { data, error } = await supabase
        .from('entities')
        .select('*')
        .eq('id', intent.entity_id)
        .maybeSingle();

      if (error) throw error;
      setEntityDetails(data);
    } catch (error) {
      console.error('Error fetching entity details:', error);
    }
  };

  const fetchDocuments = async () => {
    try {
      setLoadingDocs(true);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('intent_registration_id', intent.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleDownloadDocument = async (filePath: string, filename: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(filePath);
      
      if (error) throw error;
      
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download Started",
        description: `Downloading ${filename}`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download document",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: 'secondary',
      approved: 'default',
      rejected: 'destructive',
      under_review: 'outline'
    };
    return (
      <Badge variant={variants[status] || 'outline'} className="capitalize">
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const handleExportPDF = () => {
    exportIntentRegistrationPDF(setOpenSections);
  };

  // Get entity address for PDF
  const getEntityAddress = () => {
    if (entityDetails) {
      const parts = [
        entityDetails['registered address'],
        entityDetails.district,
        entityDetails.province
      ].filter(Boolean);
      return parts.length > 0 ? parts.join(', ') : 'N/A';
    }
    return 'N/A';
  };

  // Get attachment list for PDF
  const getAttachmentList = () => {
    if (documents.length === 0) return 'No attachments';
    return documents.map(doc => doc.filename).join(', ');
  };

  return (
    <div className="space-y-6">
      {/* Print-only A4 formatted content */}
      <div className="hidden print:block print:mb-6" style={{ maxWidth: '100%', width: '100%', overflow: 'hidden' }}>
        {/* Header with PNG Emblem and Authority Name */}
        <div className="text-center mb-6">
          <img 
            src="/images/cepa-header-crescent.png" 
            alt="CEPA Header" 
            className="mx-auto h-20 mb-3"
            style={{ maxHeight: '80px' }}
          />
          <h1 className="text-lg font-bold text-gray-800">Conservation & Environment Protection Authority</h1>
          <p className="text-sm text-gray-600">CEPA Registry Division</p>
        </div>

        {/* Title */}
        <h2 className="text-base font-bold mb-3">Intent Registration Record - {intent.entity?.name || 'Unknown Entity'}</h2>

        {/* Date */}
        <div className="mb-3">
          <span className="font-bold text-sm">Date:</span>
          <span className="ml-2 text-sm">{format(new Date(intent.created_at), 'MMMM dd, yyyy')}</span>
        </div>

        {/* Address and Attachment Ref side by side */}
        <div className="flex gap-4 mb-4" style={{ width: '100%', boxSizing: 'border-box' }}>
          <div className="flex items-start flex-1">
            <span className="font-bold mr-3 text-sm" style={{ minWidth: '70px' }}>Address:</span>
            <div className="border border-gray-400 p-2 flex-1 min-h-[50px]">
              <p className="text-xs">{getEntityAddress()}</p>
            </div>
          </div>
          <div className="flex items-start flex-1">
            <span className="font-bold mr-3 text-sm" style={{ minWidth: '100px' }}>Attachment Ref:</span>
            <div className="border border-gray-400 p-2 flex-1 min-h-[50px]">
              <p className="text-xs">{getAttachmentList()}</p>
            </div>
          </div>
        </div>

        {/* Registration Details - Print */}
        <div className="print-section">
          <h3 className="print-section-title">Registration Details</h3>
          {intent.prescribed_activity_id && prescribedActivityDescription && (
            <div className="print-field mt-2">
              <p className="print-field-label">Prescribed Activity</p>
              <p className="print-field-value">{prescribedActivityDescription}</p>
            </div>
          )}
          <div className="print-field mt-2">
            <p className="print-field-label">Project Description</p>
            <p className="print-field-value whitespace-pre-wrap">{intent.activity_description}</p>
          </div>
          <div className="print-field mt-2">
            <p className="print-field-label">Preparatory Work Description</p>
            <p className="print-field-value whitespace-pre-wrap">{intent.preparatory_work_description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="print-field">
              <p className="print-field-label">Commencement Date</p>
              <p className="print-field-value">{format(new Date(intent.commencement_date), 'MMMM dd, yyyy')}</p>
            </div>
            <div className="print-field">
              <p className="print-field-label">Completion Date</p>
              <p className="print-field-value">{format(new Date(intent.completion_date), 'MMMM dd, yyyy')}</p>
            </div>
          </div>
        </div>

        {/* Project Site Information - Print */}
        <div className="print-section">
          <h3 className="print-section-title">Project Site Information</h3>
          <div className="print-field">
            <p className="print-field-label">Project Site Address</p>
            <p className="print-field-value">{intent.project_site_address || 'Not provided'}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="print-field">
              <p className="print-field-label">District</p>
              <p className="print-field-value">{intent.district || 'Not provided'}</p>
            </div>
            <div className="print-field">
              <p className="print-field-label">Province</p>
              <p className="print-field-value">{intent.province || 'Not provided'}</p>
            </div>
          </div>
          <div className="print-field mt-2">
            <p className="print-field-label">Site Description</p>
            <p className="print-field-value whitespace-pre-wrap">{intent.project_site_description || 'Not provided'}</p>
          </div>
          <div className="print-field mt-2">
            <p className="print-field-label">Site Ownership Details</p>
            <p className="print-field-value whitespace-pre-wrap">{intent.site_ownership_details || 'Not provided'}</p>
          </div>
        </div>

        {/* Government & Stakeholder Engagement - Print */}
        <div className="print-section">
          <h3 className="print-section-title">Government & Stakeholder Engagement</h3>
          <div className="print-field">
            <p className="print-field-label">Agreement with Government of PNG</p>
            <p className="print-field-value whitespace-pre-wrap">{intent.government_agreement || 'Not provided'}</p>
          </div>
          <div className="print-field mt-2">
            <p className="print-field-label">Departments/Statutory Bodies Approached</p>
            <p className="print-field-value whitespace-pre-wrap">{intent.departments_approached || 'Not provided'}</p>
          </div>
          <div className="print-field mt-2">
            <p className="print-field-label">Other Formal Government Approvals Required</p>
            <p className="print-field-value whitespace-pre-wrap">{intent.approvals_required || 'Not provided'}</p>
          </div>
          <div className="print-field mt-2">
            <p className="print-field-label">Landowner Negotiation Status</p>
            <p className="print-field-value whitespace-pre-wrap">{intent.landowner_negotiation_status || 'Not provided'}</p>
          </div>
        </div>

        {/* Financial Information - Print */}
        <div className="print-section">
          <h3 className="print-section-title">Project Financial Information</h3>
          <div className="print-field">
            <p className="print-field-label">Estimated Cost of Works</p>
            <p className="print-field-value font-medium">
              {intent.estimated_cost_kina ? `K${intent.estimated_cost_kina.toLocaleString()}` : 'Not provided'}
            </p>
          </div>
        </div>

        {/* Supporting Documents - Print */}
        <div className="print-section">
          <h3 className="print-section-title">Supporting Documents</h3>
          {documents.length === 0 ? (
            <p className="text-sm">No documents attached</p>
          ) : (
            <ul className="list-disc list-inside text-sm space-y-1">
              {documents.map((doc) => (
                <li key={doc.id}>{doc.filename}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Official Feedback - Print */}
        <div className="print-section">
          <h3 className="print-section-title">Official Feedback from CEPA</h3>
          {intent.status !== 'pending' && intent.review_notes ? (
            <>
              {intent.reviewed_at && (
                <p className="text-sm text-gray-600 mb-2">
                  Reviewed on {format(new Date(intent.reviewed_at), 'MMMM dd, yyyy')}
                  {intent.reviewer && ` by ${intent.reviewer.first_name} ${intent.reviewer.last_name}`}
                </p>
              )}
              <div className="print-field">
                <p className="print-field-label">Feedback Notes</p>
                <p className="print-field-value whitespace-pre-wrap">{intent.review_notes}</p>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500 italic">No official feedback provided yet.</p>
          )}
        </div>
      </div>
      <Card className="bg-glass/50 backdrop-blur-sm border-glass print:hidden">
        <CardHeader className="bg-primary/10 print:hidden">
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <CardTitle className="flex items-center gap-2">
                {intent.entity?.entity_type === 'company' ? (
                  <Building className="w-6 h-6" />
                ) : (
                  <User className="w-6 h-6" />
                )}
                {intent.entity?.name}
              </CardTitle>
              <CardDescription>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{intent.activity_level}</Badge>
                  <span>•</span>
                  <span>Submitted {format(new Date(intent.created_at), 'MMMM dd, yyyy')}</span>
                </div>
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(intent.status)}
              <Button variant="outline" size="sm" onClick={handleExportPDF} className="no-print">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 print:space-y-4">
          {/* Registration Details */}
          <Collapsible open={openSections.registration} onOpenChange={() => toggleSection('registration')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded-lg transition-colors print:hidden">
              <h3 className="text-lg font-semibold">Registration Details</h3>
              {openSections.registration ? (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              )}
            </CollapsibleTrigger>
            <div className="hidden print:block mb-2">
              <h3 className="text-lg font-semibold border-b pb-2 mb-3">Registration Details</h3>
            </div>
            <CollapsibleContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Entity</Label>
                  <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                    {intent.entity?.entity_type === 'company' ? (
                      <Building className="w-5 h-5 text-primary" />
                    ) : (
                      <User className="w-5 h-5 text-primary" />
                    )}
                    <div>
                      <p className="font-medium">{intent.entity?.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {intent.entity?.entity_type}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Activity Level</Label>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Badge variant="outline">{intent.activity_level}</Badge>
                  </div>
                </div>
              </div>

              {intent.prescribed_activity_id && prescribedActivityDescription && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Prescribed Activity</Label>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <p className="text-sm">{prescribedActivityDescription}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-muted-foreground">Project Description</Label>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm">{intent.activity_description}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Preparatory Work Description</Label>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{intent.preparatory_work_description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Commencement Date
                  </Label>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <p className="text-sm">{format(new Date(intent.commencement_date), 'MMMM dd, yyyy')}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Completion Date
                  </Label>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <p className="text-sm">{format(new Date(intent.completion_date), 'MMMM dd, yyyy')}</p>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Project Site Information */}
          <Collapsible open={openSections.projectSite} onOpenChange={() => toggleSection('projectSite')} className="pt-6 border-t border-glass print:border-t-0 print:pt-4">
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded-lg transition-colors print:hidden">
              <h3 className="text-lg font-semibold">Project Site Information</h3>
              {openSections.projectSite ? (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              )}
            </CollapsibleTrigger>
            <div className="hidden print:block mb-2">
              <h3 className="text-lg font-semibold border-b pb-2 mb-3">Project Site Information</h3>
            </div>
            <CollapsibleContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Project Site Address</Label>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm">{intent.project_site_address || 'Not provided'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {intent.province && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Province</Label>
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <p className="text-sm">{intent.province}</p>
                    </div>
                  </div>
                )}

                {intent.district && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">District</Label>
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <p className="text-sm">{intent.district}</p>
                    </div>
                  </div>
                )}

                {intent.llg && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">LLG</Label>
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <p className="text-sm">{intent.llg}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Site Description</Label>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{intent.project_site_description || 'Not provided'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Site Ownership Details</Label>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{intent.site_ownership_details || 'Not provided'}</p>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Government & Stakeholder Engagement */}
          <Collapsible open={openSections.stakeholder} onOpenChange={() => toggleSection('stakeholder')} className="pt-6 border-t border-glass print:border-t-0 print:pt-4">
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded-lg transition-colors print:hidden">
                <h3 className="text-lg font-semibold">Government & Stakeholder Engagement</h3>
                {openSections.stakeholder ? (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
              </CollapsibleTrigger>
              <div className="hidden print:block mb-2">
                <h3 className="text-lg font-semibold border-b pb-2 mb-3">Government & Stakeholder Engagement</h3>
              </div>
              <CollapsibleContent className="pt-4 space-y-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Agreement with Government of PNG</Label>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{intent.government_agreement || 'Not provided'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Departments/Statutory Bodies Approached</Label>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{intent.departments_approached || 'Not provided'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Other Formal Government Approvals Required</Label>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{intent.approvals_required || 'Not provided'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Landowner Negotiation Status</Label>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{intent.landowner_negotiation_status || 'Not provided'}</p>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

          {/* Financial Information */}
          <Collapsible open={openSections.financial} onOpenChange={() => toggleSection('financial')} className="pt-6 border-t border-glass print:border-t-0 print:pt-4">
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded-lg transition-colors print:hidden">
                <h3 className="text-lg font-semibold">Project Financial Information</h3>
                {openSections.financial ? (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
              </CollapsibleTrigger>
              <div className="hidden print:block mb-2">
                <h3 className="text-lg font-semibold border-b pb-2 mb-3">Project Financial Information</h3>
              </div>
              <CollapsibleContent className="pt-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Estimated Cost of Works</Label>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <p className="text-sm font-medium">
                      {intent.estimated_cost_kina ? `K${intent.estimated_cost_kina.toLocaleString()}` : 'Not provided'}
                    </p>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

          {/* Official Feedback Section - Only show if flag is true */}
          {showFeedbackWithBlueHeader && intent.status !== 'pending' && intent.review_notes && (
            <div className="space-y-4 pt-6 border-t border-glass print:border-t-0 print:pt-4 print:break-before-page">
              <Card className="bg-muted/30 print:shadow-none print:border">
                <CardHeader className="bg-primary/10 print:bg-transparent">
                  <CardTitle className="text-lg print:border-b print:pb-2">Official Feedback from CEPA</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {intent.reviewed_at && (
                    <div className="text-sm text-muted-foreground">
                      Reviewed on {format(new Date(intent.reviewed_at), 'MMMM dd, yyyy')}
                      {intent.reviewer && ` by ${intent.reviewer.first_name} ${intent.reviewer.last_name}`}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Feedback Notes</Label>
                    <div className="p-3 bg-primary/5 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{intent.review_notes}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {showFeedbackWithBlueHeader && intent.status === 'pending' && (
            <div className="space-y-4 pt-6 border-t border-glass print:border-t-0 print:pt-4 print:hidden">
              <Card className="bg-muted/30 print:shadow-none">
                <CardHeader className="bg-primary/10 print:bg-transparent">
                  <CardTitle className="text-lg print:border-b print:pb-2">Official Feedback from CEPA</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Your submission is currently under review. Any official feedback will be displayed here once the review is complete.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Supporting Documents Section */}
          <div className="space-y-4 pt-6 border-t border-glass print:border-t-0 print:pt-4">
            <div className="flex items-center justify-between print:block">
              <Label className="text-muted-foreground print:text-lg print:font-semibold print:border-b print:pb-2 print:mb-3 print:block">Supporting Documents ({documents.length})</Label>
            </div>
            {loadingDocs ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents attached</p>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{doc.filename}</p>
                        <p className="text-xs text-muted-foreground">
                          {(doc.file_size / 1024).toFixed(2)} KB • {new Date(doc.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadDocument(doc.file_path, doc.filename)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
