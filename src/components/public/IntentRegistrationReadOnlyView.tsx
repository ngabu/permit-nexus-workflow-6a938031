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

interface IntentRegistrationReadOnlyViewProps {
  intent: IntentRegistration;
}

interface Document {
  id: string;
  filename: string;
  file_path: string;
  uploaded_at: string;
  file_size: number;
}

export function IntentRegistrationReadOnlyView({ intent }: IntentRegistrationReadOnlyViewProps) {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [openSections, setOpenSections] = useState({
    registration: true,
    projectSite: true,
    stakeholder: true,
    financial: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    fetchDocuments();
  }, [intent.id]);

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
    window.print();
  };

  return (
    <div className="space-y-6">
      <Card className="bg-glass/50 backdrop-blur-sm border-glass">
        <CardHeader>
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

        <CardContent className="space-y-6">
          {/* Registration Details */}
          <Collapsible open={openSections.registration} onOpenChange={() => toggleSection('registration')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded-lg transition-colors">
              <h3 className="text-lg font-semibold">Registration Details</h3>
              {openSections.registration ? (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Entity</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
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
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <Badge variant="outline">{intent.activity_level}</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Activity Description</Label>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm">{intent.activity_description}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Preparatory Work Description</Label>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{intent.preparatory_work_description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Commencement Date
                  </Label>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm">{format(new Date(intent.commencement_date), 'MMMM dd, yyyy')}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Completion Date
                  </Label>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm">{format(new Date(intent.completion_date), 'MMMM dd, yyyy')}</p>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Project Site Information */}
          {(intent.project_site_address || intent.project_site_description || intent.site_ownership_details) && (
            <Collapsible open={openSections.projectSite} onOpenChange={() => toggleSection('projectSite')} className="pt-6 border-t border-glass">
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded-lg transition-colors">
                <h3 className="text-lg font-semibold">Project Site Information</h3>
                {openSections.projectSite ? (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4 space-y-4">
                {intent.project_site_address && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Project Site Address</Label>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm">{intent.project_site_address}</p>
                    </div>
                  </div>
                )}

                {intent.project_site_description && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Site Description</Label>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{intent.project_site_description}</p>
                    </div>
                  </div>
                )}

                {intent.site_ownership_details && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Site Ownership Details</Label>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{intent.site_ownership_details}</p>
                    </div>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Government & Stakeholder Engagement */}
          {(intent.government_agreement || intent.departments_approached || intent.approvals_required || intent.landowner_negotiation_status) && (
            <Collapsible open={openSections.stakeholder} onOpenChange={() => toggleSection('stakeholder')} className="pt-6 border-t border-glass">
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded-lg transition-colors">
                <h3 className="text-lg font-semibold">Government & Stakeholder Engagement</h3>
                {openSections.stakeholder ? (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4 space-y-4">
                {intent.government_agreement && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Agreement with Government of PNG</Label>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{intent.government_agreement}</p>
                    </div>
                  </div>
                )}

                {intent.departments_approached && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Departments/Statutory Bodies Approached</Label>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{intent.departments_approached}</p>
                    </div>
                  </div>
                )}

                {intent.approvals_required && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Other Formal Government Approvals Required</Label>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{intent.approvals_required}</p>
                    </div>
                  </div>
                )}

                {intent.landowner_negotiation_status && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Landowner Negotiation Status</Label>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{intent.landowner_negotiation_status}</p>
                    </div>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Financial Information */}
          {intent.estimated_cost_kina && (
            <Collapsible open={openSections.financial} onOpenChange={() => toggleSection('financial')} className="pt-6 border-t border-glass">
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded-lg transition-colors">
                <h3 className="text-lg font-semibold">Project Financial Information</h3>
                {openSections.financial ? (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Estimated Cost of Works</Label>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <p className="text-2xl font-bold text-primary">
                      K{intent.estimated_cost_kina.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Supporting Documents Section */}
          <div className="space-y-4 pt-6 border-t border-glass">
            <div className="flex items-center justify-between">
              <Label className="text-muted-foreground">Supporting Documents ({documents.length})</Label>
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
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
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

          {/* Review Information (if available) */}
          {intent.reviewed_by && (
            <>
              <Separator />
              <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                <h3 className="text-lg font-semibold">Review Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Reviewed By</Label>
                    <p className="text-sm mt-1">
                      {intent.reviewer?.first_name} {intent.reviewer?.last_name}
                    </p>
                    {intent.reviewer?.email && (
                      <p className="text-sm text-muted-foreground">{intent.reviewer.email}</p>
                    )}
                  </div>
                  
                  {intent.reviewed_at && (
                    <div>
                      <Label>Review Date</Label>
                      <p className="text-sm mt-1">
                        {format(new Date(intent.reviewed_at), 'MMMM dd, yyyy h:mm a')}
                      </p>
                    </div>
                  )}
                </div>

                {intent.review_notes && (
                  <div>
                    <Label>Official Review Notes</Label>
                    <p className="text-sm mt-2 text-muted-foreground whitespace-pre-wrap">
                      {intent.review_notes}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
