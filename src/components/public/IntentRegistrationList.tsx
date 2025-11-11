import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useIntentRegistrations } from '@/hooks/useIntentRegistrations';
import { useAuth } from '@/contexts/AuthContext';
import { useDocuments } from '@/hooks/useDocuments';
import { Building, User, Calendar, FileText, AlertCircle, CheckCircle, XCircle, Clock, Download, Mail, MapPin, DollarSign, Users } from 'lucide-react';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { IntentRegistrationReadOnlyView } from './IntentRegistrationReadOnlyView';

export function IntentRegistrationList() {
  const { user } = useAuth();
  const { intents, loading } = useIntentRegistrations(user?.id);
  const { toast } = useToast();
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('details');
  const { documents, loading: docsLoading } = useDocuments(undefined, selectedIntent || undefined);

  const filteredIntents = statusFilter === 'all' 
    ? intents 
    : intents.filter(intent => intent.status === statusFilter);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-warning" />;
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
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
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download document",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading intent registrations...</div>;
  }

  const selectedIntentData = intents.find(intent => intent.id === selectedIntent);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Existing Intent Registrations</h2>
        <p className="text-muted-foreground mt-2">
          View and manage your submitted intent registrations
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          variant={statusFilter === 'all' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('all')}
          size="sm"
        >
          All ({intents.length})
        </Button>
        <Button
          variant={statusFilter === 'pending' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('pending')}
          size="sm"
        >
          Pending ({intents.filter(i => i.status === 'pending').length})
        </Button>
        <Button
          variant={statusFilter === 'under_review' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('under_review')}
          size="sm"
        >
          Under Review ({intents.filter(i => i.status === 'under_review').length})
        </Button>
        <Button
          variant={statusFilter === 'approved' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('approved')}
          size="sm"
        >
          Approved ({intents.filter(i => i.status === 'approved').length})
        </Button>
        <Button
          variant={statusFilter === 'rejected' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('rejected')}
          size="sm"
        >
          Rejected ({intents.filter(i => i.status === 'rejected').length})
        </Button>
      </div>

      {filteredIntents.length === 0 ? (
        <Card className="bg-glass/50 backdrop-blur-sm border-glass">
          <CardContent className="py-12">
            <div className="text-center space-y-2">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">No intent registrations found</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredIntents.map((intent) => (
            <Card 
              key={intent.id} 
              className={`bg-glass/50 backdrop-blur-sm border-glass cursor-pointer transition-all hover:shadow-md ${
                selectedIntent === intent.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedIntent(selectedIntent === intent.id ? null : intent.id)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {intent.entity?.entity_type === 'company' ? (
                        <Building className="w-5 h-5" />
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                      {intent.entity?.name}
                    </CardTitle>
                    <CardDescription className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline">{intent.activity_level}</Badge>
                        <span>•</span>
                        <span>Submitted {format(new Date(intent.created_at), 'MMM dd, yyyy')}</span>
                      </div>
                      {intent.project_site_address && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{intent.project_site_address}</span>
                        </div>
                      )}
                      {intent.estimated_cost_kina && (
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-3 h-3" />
                          <span>Est. Cost: K{intent.estimated_cost_kina.toLocaleString()}</span>
                        </div>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(intent.status)}
                    {getStatusBadge(intent.status)}
                  </div>
                </div>
              </CardHeader>
              
              {selectedIntent === intent.id && selectedIntentData && (
                <CardContent
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="details">Registration Details</TabsTrigger>
                      <TabsTrigger value="feedback">Official Feedback</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-4 mt-4">
                      <IntentRegistrationReadOnlyView intent={selectedIntentData} />
                      
                      <Separator className="my-6" />

                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Supporting Documents</h3>
                        {docsLoading ? (
                          <p className="text-sm text-muted-foreground">Loading documents...</p>
                        ) : documents.length > 0 ? (
                          <div className="space-y-2">
                            {documents.map((doc) => (
                              <div key={doc.id} className="flex items-center justify-between p-3 bg-glass/30 rounded-lg">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                                  <span className="text-sm truncate">{doc.filename}</span>
                                  <span className="text-xs text-muted-foreground flex-shrink-0">
                                    ({(doc.file_size / 1024).toFixed(1)} KB)
                                  </span>
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
                        ) : (
                          <p className="text-sm text-muted-foreground">No documents uploaded</p>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="feedback" className="space-y-4 mt-4">
                      <div className="space-y-4">
                          {selectedIntentData.status === 'pending' ? (
                            <Alert>
                              <Clock className="h-4 w-4" />
                              <AlertDescription>
                                Your intent registration is pending review by the Registry team. Official feedback will appear here once the review is complete.
                              </AlertDescription>
                            </Alert>
                          ) : (
                            <>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-muted-foreground mb-1">Status</Label>
                                  <div className="mt-1">{getStatusBadge(selectedIntentData.status)}</div>
                                </div>
                                {selectedIntentData.reviewed_at && (
                                  <div>
                                    <Label className="text-muted-foreground mb-1">Review Date</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Calendar className="w-4 h-4 text-muted-foreground" />
                                      <p className="text-sm">{format(new Date(selectedIntentData.reviewed_at), 'PPP p')}</p>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {selectedIntentData.reviewed_by && (
                                <div className="bg-muted/30 p-4 rounded-lg">
                                  <Label className="text-muted-foreground mb-2">Reviewed By</Label>
                                  <div className="space-y-1 mt-2">
                                    <div className="flex items-center gap-2">
                                      <User className="w-4 h-4 text-muted-foreground" />
                                      <p className="text-sm font-medium">
                                        {selectedIntentData.reviewer?.first_name} {selectedIntentData.reviewer?.last_name}
                                      </p>
                                    </div>
                                    {selectedIntentData.reviewer?.email && (
                                      <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">{selectedIntentData.reviewer.email}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {selectedIntentData.review_notes && (
                                <div>
                                  <Label className="text-muted-foreground mb-2">Official Review Notes</Label>
                                  <div className="bg-muted/30 p-4 rounded-lg mt-2">
                                    <p className="text-sm whitespace-pre-wrap">{selectedIntentData.review_notes}</p>
                                  </div>
                                </div>
                              )}

                              {selectedIntentData.official_feedback_attachments && 
                               Array.isArray(selectedIntentData.official_feedback_attachments) && 
                               selectedIntentData.official_feedback_attachments.length > 0 && (
                                <div>
                                  <Label className="text-muted-foreground mb-2">Official Feedback Documents</Label>
                                  <div className="space-y-2 mt-2">
                                    {selectedIntentData.official_feedback_attachments.map((attachment: any, index: number) => (
                                      <div key={index} className="flex items-center justify-between p-3 bg-glass/30 rounded-lg">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                          <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                                          <span className="text-sm truncate">{attachment.filename || `Document ${index + 1}`}</span>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDownloadDocument(attachment.path, attachment.filename)}
                                        >
                                          <Download className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {!selectedIntentData.review_notes && !selectedIntentData.reviewed_by && (
                                <Alert>
                                  <AlertCircle className="h-4 w-4" />
                                  <AlertDescription>
                                    The Registry team has updated the status but has not yet provided detailed feedback.
                                  </AlertDescription>
                                </Alert>
                              )}
                            </>
                          )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={`text-sm font-medium ${className || ''}`}>{children}</label>;
}
