import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useIntentRegistrations } from '@/hooks/useIntentRegistrations';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Building, User, FileText, AlertCircle, CheckCircle, XCircle, Clock, MapPin, DollarSign, ChevronsUpDown, ChevronDown, Calendar, Mail, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { IntentRegistrationReadOnlyView } from './IntentRegistrationReadOnlyView';
import { PermitApplicationsMap } from './PermitApplicationsMap';

export function IntentRegistrationList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { intents, loading, refetch } = useIntentRegistrations(user?.id);
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('details');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [intentToDelete, setIntentToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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
      case 'under_review':
        return <AlertCircle className="w-4 h-4 text-info" />;
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

  const handleDeleteClick = (intentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIntentToDelete(intentId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!intentToDelete) return;
    
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('intent_registrations')
        .delete()
        .eq('id', intentToDelete);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Intent registration deleted successfully',
      });

      refetch();
      setSelectedIntent(null);
    } catch (error) {
      console.error('Error deleting intent:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete intent registration',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setIntentToDelete(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading intent registrations...</div>;
  }

  const selectedIntentData = intents.find(intent => intent.id === selectedIntent);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h3 className="text-lg font-semibold">Intent Registrations</h3>
          <p className="text-muted-foreground">View your submitted intent registrations</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap print:hidden">
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
        <Card className="print:hidden">
          <CardContent className="py-8 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h4 className="font-semibold mb-2">No Intent Registrations Found</h4>
            <p className="text-sm text-muted-foreground">
              {statusFilter === 'all' 
                ? 'You have not submitted any intent registrations yet' 
                : `No ${statusFilter.replace('_', ' ')} intent registrations found`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="print:border-none print:shadow-none print:bg-transparent">
            <Table>
              <TableHeader className="print:hidden">
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Activity Level</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIntents.map((intent) => (
                  <>
                    <TableRow
                      key={intent.id}
                      className={`cursor-pointer transition-colors print:hidden ${
                        selectedIntent === intent.id
                          ? 'bg-accent hover:bg-accent/90'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedIntent(selectedIntent === intent.id ? null : intent.id)}
                    >
                      <TableCell>
                        {selectedIntent === intent.id ? (
                          <ChevronDown className="w-4 h-4 text-primary" />
                        ) : (
                          <ChevronsUpDown className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                        )}
                      </TableCell>
                      <TableCell className="flex items-center">
                        {intent.entity?.entity_type === 'company' ? (
                          <Building className="w-4 h-4 mr-2" />
                        ) : (
                          <User className="w-4 h-4 mr-2" />
                        )}
                        <span className="font-medium">{intent.entity?.name}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{intent.activity_level}</Badge>
                      </TableCell>
                      <TableCell>
                        {intent.project_site_address ? (
                          <div className="flex items-center gap-1 max-w-[200px]">
                            <MapPin className="w-3 h-3 flex-shrink-0 text-muted-foreground" />
                            <span className="truncate text-sm">{intent.project_site_address}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(intent.status)}
                          {getStatusBadge(intent.status)}
                        </div>
                      </TableCell>
                      <TableCell>{format(new Date(intent.created_at), 'MMM dd, yyyy')}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {intent.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => handleDeleteClick(intent.id, e)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                    {selectedIntent === intent.id && selectedIntentData && (
                      <TableRow className="bg-glass/50 backdrop-blur-md hover:bg-glass/50">
                        <TableCell colSpan={7} className="p-0">
                          <div className="border-t border-glass/30 bg-white/80 dark:bg-primary/5 backdrop-blur-md p-6 print:border-none print:p-0 print:bg-transparent">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                              <TabsList className="grid w-full grid-cols-2 print:hidden">
                                <TabsTrigger value="mapping">Proposed Project Site Mapping</TabsTrigger>
                                <TabsTrigger value="details">Registration Details</TabsTrigger>
                              </TabsList>

                              <TabsContent value="mapping" className="mt-4 print:hidden">
                                <PermitApplicationsMap
                                  showAllApplications={false}
                                  existingBoundary={selectedIntentData.project_boundary}
                                  onBoundarySave={() => {}}
                                  coordinates={{ 
                                    lat: selectedIntentData.project_boundary?.coordinates?.[0]?.[0]?.[1] || -6.314993, 
                                    lng: selectedIntentData.project_boundary?.coordinates?.[0]?.[0]?.[0] || 147.1494 
                                  }}
                                  onCoordinatesChange={() => {}}
                                  readOnly={true}
                                  district={selectedIntentData.district}
                                  province={selectedIntentData.province}
                                  llg={selectedIntentData.llg}
                                />
                              </TabsContent>

                              <TabsContent value="details" className="space-y-4 mt-4">
                                <IntentRegistrationReadOnlyView intent={selectedIntentData} />
                              </TabsContent>
                            </Tabs>

                            {/* Official Feedback Section - Below Tabs */}
                            <div className="print:hidden">
                              <Separator className="my-6" />
                              <Card className="bg-muted/30">
                                <CardHeader className="bg-primary/10">
                                  <CardTitle className="text-lg">Official Feedback from CEPA</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                   {selectedIntentData.status === 'pending' ? (
                                    <Alert>
                                      <Clock className="h-4 w-4" />
                                      <AlertDescription>
                                        Your submission is pending review. Any feedback from CEPA will be displayed here once the review begins.
                                      </AlertDescription>
                                    </Alert>
                                  ) : selectedIntentData.status === 'under_review' ? (
                                    <Alert>
                                      <AlertCircle className="h-4 w-4" />
                                      <AlertDescription>
                                        Your submission is currently under review. Any feedback from CEPA will be displayed here once the review is complete.
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
                                        <div className="bg-background/50 p-4 rounded-lg">
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
                                          <div className="bg-background/50 p-4 rounded-lg mt-2">
                                            <p className="text-sm whitespace-pre-wrap">{selectedIntentData.review_notes}</p>
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
                                </CardContent>
                              </Card>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Intent Registration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this intent registration? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
