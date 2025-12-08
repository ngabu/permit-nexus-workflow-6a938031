import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FileText, ChevronDown, ChevronRight, Building, User, Calendar, MapPin, DollarSign, Shield, Download, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface PermitRegistrationDetailsTabProps {
  application: {
    id: string;
    title: string;
    description?: string | null;
    permit_type: string;
    status: string;
    application_number?: string | null;
    created_at: string;
    activity_location?: string | null;
    estimated_cost_kina?: number | null;
    activity_classification?: string | null;
    activity_category?: string | null;
    activity_subcategory?: string | null;
    activity_level?: string | null;
    permit_period?: string | null;
    commencement_date?: string | null;
    completion_date?: string | null;
    entity_name?: string | null;
    entity_type?: string | null;
    province?: string | null;
    district?: string | null;
    llg?: string | null;
    project_description?: string | null;
    project_start_date?: string | null;
    project_end_date?: string | null;
    environmental_impact?: string | null;
    mitigation_measures?: string | null;
    permit_specific_fields?: any;
    entity_id: string;
    entity?: {
      id: string;
      name: string;
      entity_type: string;
    };
  };
}

interface Document {
  id: string;
  filename: string;
  file_path: string;
  uploaded_at: string;
  document_type?: string;
}

export function PermitRegistrationDetailsTab({ application }: PermitRegistrationDetailsTabProps) {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [entityDetails, setEntityDetails] = useState<any>(null);
  const [openSections, setOpenSections] = useState({
    basic: true,
    entity: false,
    activity: false,
    project: false,
    compliance: false,
    documents: false,
    permitSpecific: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    fetchDocuments();
    fetchEntityDetails();
  }, [application.id]);

  const fetchDocuments = async () => {
    try {
      setLoadingDocs(true);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('permit_id', application.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoadingDocs(false);
    }
  };

  const fetchEntityDetails = async () => {
    if (!application.entity_id) return;
    try {
      const { data, error } = await supabase
        .from('entities')
        .select('*')
        .eq('id', application.entity_id)
        .maybeSingle();

      if (error) throw error;
      setEntityDetails(data);
    } catch (error) {
      console.error('Error fetching entity details:', error);
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
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to download document', variant: 'destructive' });
    }
  };

  const handleViewDocument = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 3600);
      
      if (error) throw error;
      window.open(data.signedUrl, '_blank');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to view document', variant: 'destructive' });
    }
  };

  const renderField = (label: string, value: any) => (
    <div className="p-3 bg-muted/30 rounded-lg">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value || 'Not provided'}</p>
    </div>
  );

  return (
    <Card>
      <CardHeader className="bg-primary/5">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="w-5 h-5 text-primary" />
          Registration Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {/* Basic Information */}
        <Collapsible open={openSections.basic} onOpenChange={() => toggleSection('basic')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded-lg transition-colors border">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span className="font-medium">Basic Information</span>
            </div>
            {openSections.basic ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4 pl-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Application Title', application.title)}
              {renderField('Application Number', application.application_number)}
              {renderField('Permit Type', application.permit_type)}
              {renderField('Status', application.status?.replace(/_/g, ' '))}
              {renderField('Submitted Date', application.created_at ? format(new Date(application.created_at), 'MMMM dd, yyyy') : null)}
            </div>
            {application.description && (
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium whitespace-pre-wrap">{application.description}</p>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Entity Details */}
        <Collapsible open={openSections.entity} onOpenChange={() => toggleSection('entity')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded-lg transition-colors border">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-primary" />
              <span className="font-medium">Entity Details</span>
            </div>
            {openSections.entity ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4 pl-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Entity Name', application.entity?.name || application.entity_name)}
              {renderField('Entity Type', application.entity?.entity_type || application.entity_type)}
              {entityDetails && (
                <>
                  {renderField('Registration Number', entityDetails.registration_number)}
                  {renderField('Email', entityDetails.email)}
                  {renderField('Phone', entityDetails.phone)}
                  {renderField('Registered Address', entityDetails['registered address'])}
                </>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Activity Classification */}
        <Collapsible open={openSections.activity} onOpenChange={() => toggleSection('activity')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded-lg transition-colors border">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-orange-600" />
              <span className="font-medium">Activity Classification</span>
            </div>
            {openSections.activity ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4 pl-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Activity Level', application.activity_level ? `Level ${application.activity_level}` : null)}
              {renderField('Activity Classification', application.activity_classification)}
              {renderField('Activity Category', application.activity_category)}
              {renderField('Activity Subcategory', application.activity_subcategory)}
              {renderField('Permit Period', application.permit_period)}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Project Details */}
        <Collapsible open={openSections.project} onOpenChange={() => toggleSection('project')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded-lg transition-colors border">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="font-medium">Project Details</span>
            </div>
            {openSections.project ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4 pl-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Project Start Date', application.project_start_date ? format(new Date(application.project_start_date), 'MMMM dd, yyyy') : application.commencement_date ? format(new Date(application.commencement_date), 'MMMM dd, yyyy') : null)}
              {renderField('Project End Date', application.project_end_date ? format(new Date(application.project_end_date), 'MMMM dd, yyyy') : application.completion_date ? format(new Date(application.completion_date), 'MMMM dd, yyyy') : null)}
              {renderField('Estimated Cost', application.estimated_cost_kina ? `K${application.estimated_cost_kina.toLocaleString()}` : null)}
              {renderField('Location', application.activity_location)}
            </div>
            {application.project_description && (
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">Project Description</p>
                <p className="font-medium whitespace-pre-wrap">{application.project_description}</p>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Compliance & Environmental */}
        <Collapsible open={openSections.compliance} onOpenChange={() => toggleSection('compliance')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded-lg transition-colors border">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="font-medium">Compliance & Environmental</span>
            </div>
            {openSections.compliance ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4 pl-4">
            {application.environmental_impact && (
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">Environmental Impact</p>
                <p className="font-medium whitespace-pre-wrap">{application.environmental_impact}</p>
              </div>
            )}
            {application.mitigation_measures && (
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">Mitigation Measures</p>
                <p className="font-medium whitespace-pre-wrap">{application.mitigation_measures}</p>
              </div>
            )}
            {!application.environmental_impact && !application.mitigation_measures && (
              <p className="text-muted-foreground text-sm">No compliance information provided</p>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Permit Specific Fields */}
        {application.permit_specific_fields && Object.keys(application.permit_specific_fields).length > 0 && (
          <Collapsible open={openSections.permitSpecific} onOpenChange={() => toggleSection('permitSpecific')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded-lg transition-colors border">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <span className="font-medium">Permit-Specific Details</span>
              </div>
              {openSections.permitSpecific ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 space-y-4 pl-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(application.permit_specific_fields).map(([key, value]) => (
                  <div key={key} className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">{key.replace(/_/g, ' ')}</p>
                    <p className="font-medium">{String(value) || 'Not provided'}</p>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Documents */}
        <Collapsible open={openSections.documents} onOpenChange={() => toggleSection('documents')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded-lg transition-colors border">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span className="font-medium">Supporting Documents ({documents.length})</span>
            </div>
            {openSections.documents ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4 pl-4">
            {loadingDocs ? (
              <p className="text-muted-foreground">Loading documents...</p>
            ) : documents.length === 0 ? (
              <p className="text-muted-foreground">No documents uploaded</p>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{doc.filename}</p>
                        {doc.document_type && (
                          <p className="text-xs text-muted-foreground">{doc.document_type}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDocument(doc.file_path)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadDocument(doc.file_path, doc.filename)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
