import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Building, 
  User, 
  Calendar, 
  MapPin, 
  DollarSign, 
  FileText, 
  Download, 
  ChevronDown, 
  ChevronRight, 
  Eye,
  Activity,
  Shield,
  Users,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { IntentBoundaryMapDisplay } from './IntentBoundaryMapDisplay';

interface PermitApplicationData {
  id: string;
  user_id: string;
  entity_id: string;
  title: string;
  description?: string | null;
  permit_type: string;
  status: string;
  application_number?: string | null;
  created_at: string;
  updated_at: string;
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
  coordinates?: any;
  project_boundary?: any;
  environmental_impact?: string | null;
  mitigation_measures?: string | null;
  compliance_checks?: any;
  uploaded_files?: any;
  project_description?: string | null;
  project_start_date?: string | null;
  project_end_date?: string | null;
  district?: string | null;
  province?: string | null;
  llg?: string | null;
  permit_specific_fields?: any;
  entity?: {
    id: string;
    name: string;
    entity_type: string;
    email?: string;
    phone?: string;
    contact_person?: string;
    'registered address'?: string;
    postal_address?: string;
  };
}

interface PermitApplicationExpandedViewProps {
  application: PermitApplicationData;
}

interface Document {
  id: string;
  filename: string;
  file_path: string;
  uploaded_at: string;
  file_size: number;
  document_type: string | null;
}

export function PermitApplicationExpandedView({ application }: PermitApplicationExpandedViewProps) {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [entityDetails, setEntityDetails] = useState<any>(null);
  const [openSections, setOpenSections] = useState({
    basicInfo: false,
    projectDetails: false,
    location: false,
    siteMapping: false,
    environmental: false,
    compliance: false,
    documents: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    fetchDocuments();
    fetchEntityDetails();
  }, [application.id, application.entity_id]);

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

  const handleViewDocument = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 3600);
      
      if (error) throw error;
      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('View error:', error);
      toast({
        title: "View Failed",
        description: "Failed to open document",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: 'secondary',
      submitted: 'outline',
      under_review: 'outline',
      approved: 'default',
      rejected: 'destructive',
      requires_clarification: 'secondary'
    };
    return (
      <Badge variant={variants[status] || 'outline'} className="capitalize">
        {status.replace(/_/g, ' ')}
      </Badge>
    );
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'Not specified';
    return `K${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    try {
      return format(new Date(dateString), 'MMMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  // Parse permit specific fields
  const permitSpecificFields = application.permit_specific_fields 
    ? (typeof application.permit_specific_fields === 'string' 
      ? JSON.parse(application.permit_specific_fields) 
      : application.permit_specific_fields)
    : {};

  return (
    <div className="space-y-6">
      {/* Application Header Card */}
      <Card className="bg-glass/50 backdrop-blur-sm border-glass">
        <CardHeader className="bg-primary/10">
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <CardTitle className="flex items-center gap-2">
                {application.entity_type === 'COMPANY' ? (
                  <Building className="w-6 h-6" />
                ) : (
                  <User className="w-6 h-6" />
                )}
                {application.title}
              </CardTitle>
              <CardDescription>
                <div className="flex items-center gap-2 flex-wrap">
                  {application.application_number && (
                    <Badge variant="outline">{application.application_number}</Badge>
                  )}
                  {application.activity_level && (
                    <Badge variant="outline">Level {application.activity_level}</Badge>
                  )}
                  <span>•</span>
                  <span>Submitted {formatDate(application.created_at)}</span>
                </div>
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(application.status)}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Basic Information Section */}
          <Collapsible open={openSections.basicInfo} onOpenChange={() => toggleSection('basicInfo')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded-lg transition-colors">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Building className="w-5 h-5 text-primary" />
                Basic Information
              </h3>
              {openSections.basicInfo ? (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Entity</Label>
                  <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                    {application.entity_type === 'COMPANY' ? (
                      <Building className="w-5 h-5 text-primary" />
                    ) : (
                      <User className="w-5 h-5 text-primary" />
                    )}
                    <div>
                      <p className="font-medium">{application.entity_name || application.entity?.name || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {application.entity_type || application.entity?.entity_type || 'Individual'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Permit Type</Label>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <p className="font-medium">{application.permit_type || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {entityDetails && (
                <>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {entityDetails.email && (
                      <div className="space-y-1">
                        <Label className="text-muted-foreground text-sm">Email</Label>
                        <p className="font-medium">{entityDetails.email}</p>
                      </div>
                    )}
                    {entityDetails.phone && (
                      <div className="space-y-1">
                        <Label className="text-muted-foreground text-sm">Phone</Label>
                        <p className="font-medium">{entityDetails.phone}</p>
                      </div>
                    )}
                    {entityDetails.contact_person && (
                      <div className="space-y-1">
                        <Label className="text-muted-foreground text-sm">Contact Person</Label>
                        <p className="font-medium">{entityDetails.contact_person}</p>
                      </div>
                    )}
                    {entityDetails['registered address'] && (
                      <div className="space-y-1">
                        <Label className="text-muted-foreground text-sm">Registered Address</Label>
                        <p className="font-medium">{entityDetails['registered address']}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Project Details Section */}
          <Collapsible open={openSections.projectDetails} onOpenChange={() => toggleSection('projectDetails')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded-lg transition-colors">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Project Details
              </h3>
              {openSections.projectDetails ? (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Project Description</Label>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="whitespace-pre-wrap">{application.project_description || application.description || 'No description provided'}</p>
                  </div>
                </div>

                {(application.activity_classification || application.activity_category) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {application.activity_classification && (
                      <div className="space-y-1">
                        <Label className="text-muted-foreground text-sm">Activity Classification</Label>
                        <p className="font-medium">{application.activity_classification}</p>
                      </div>
                    )}
                    {application.activity_category && (
                      <div className="space-y-1">
                        <Label className="text-muted-foreground text-sm">Activity Category</Label>
                        <p className="font-medium">{application.activity_category}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Start Date</p>
                      <p className="font-medium">{formatDate(application.project_start_date || application.commencement_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">End Date</p>
                      <p className="font-medium">{formatDate(application.project_end_date || application.completion_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Estimated Cost</p>
                      <p className="font-medium">{formatCurrency(application.estimated_cost_kina)}</p>
                    </div>
                  </div>
                </div>

                {/* Permit Specific Fields */}
                {Object.keys(permitSpecificFields).length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Permit Specific Information</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(permitSpecificFields).map(([key, value]) => (
                          <div key={key} className="space-y-1">
                            <Label className="text-muted-foreground text-sm capitalize">
                              {key.replace(/_/g, ' ')}
                            </Label>
                            <p className="font-medium">{String(value) || 'N/A'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Location Section */}
          <Collapsible open={openSections.location} onOpenChange={() => toggleSection('location')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded-lg transition-colors">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Location Details
              </h3>
              {openSections.location ? (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Activity Location</Label>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p>{application.activity_location || 'Not specified'}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Province</Label>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p>{application.province || 'Not specified'}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">District</Label>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p>{application.district || 'Not specified'}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">LLG</Label>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p>{application.llg || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {application.coordinates && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Coordinates</Label>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p>
                      Latitude: {application.coordinates.lat}, 
                      Longitude: {application.coordinates.lng}
                    </p>
                  </div>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Site Mapping Section */}
          <Collapsible open={openSections.siteMapping} onOpenChange={() => toggleSection('siteMapping')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded-lg transition-colors">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Site Mapping
              </h3>
              {openSections.siteMapping ? (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              <IntentBoundaryMapDisplay
                projectBoundary={application.project_boundary}
                activityLocation={application.activity_location || undefined}
                province={application.province || undefined}
                district={application.district || undefined}
                llg={application.llg || undefined}
              />
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Environmental Section */}
          <Collapsible open={openSections.environmental} onOpenChange={() => toggleSection('environmental')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded-lg transition-colors">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Environmental Information
              </h3>
              {openSections.environmental ? (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Environmental Impact</Label>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="whitespace-pre-wrap">{application.environmental_impact || 'Not provided'}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Mitigation Measures</Label>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="whitespace-pre-wrap">{application.mitigation_measures || 'Not provided'}</p>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Compliance Section */}
          <Collapsible open={openSections.compliance} onOpenChange={() => toggleSection('compliance')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded-lg transition-colors">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Compliance Status
              </h3>
              {openSections.compliance ? (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 space-y-4">
              {application.compliance_checks && typeof application.compliance_checks === 'object' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(application.compliance_checks).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      {value ? (
                        <Badge variant="default" className="bg-green-500">Complete</Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No compliance data available</p>
              )}
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Documents Section */}
          <Collapsible open={openSections.documents} onOpenChange={() => toggleSection('documents')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded-lg transition-colors">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Supporting Documents ({documents.length})
              </h3>
              {openSections.documents ? (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              {loadingDocs ? (
                <div className="flex items-center justify-center py-8">
                  <Clock className="w-5 h-5 mr-2 animate-spin" />
                  Loading documents...
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No documents attached to this application</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.filename}</p>
                          <p className="text-sm text-muted-foreground">
                            {doc.document_type || 'Document'} • Uploaded {formatDate(doc.uploaded_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDocument(doc.file_path)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadDocument(doc.file_path, doc.filename)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
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
    </div>
  );
}
