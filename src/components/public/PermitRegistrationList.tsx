import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Building, User, FileText, AlertCircle, CheckCircle, XCircle, Clock, MapPin, ChevronsUpDown, ChevronDown, Calendar, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { PermitDetailsReadOnlyView } from './PermitDetailsReadOnlyView';
import { PermitApplicationsMap } from './PermitApplicationsMap';

interface Permit {
  id: string;
  permit_number?: string;
  permit_type: string;
  title: string;
  description?: string;
  status: string;
  application_date?: string;
  approval_date?: string;
  expiry_date?: string;
  entity_id?: string;
  entity_name?: string;
  entity_type?: string;
  province?: string;
  district?: string;
  coordinates?: any;
  activity_level?: string;
  created_at: string;
}

interface PermitRegistrationListProps {
  onNavigateToNewApplication?: () => void;
  onNavigateToEditApplication?: (permitId: string) => void;
}

export function PermitRegistrationList({ onNavigateToNewApplication, onNavigateToEditApplication }: PermitRegistrationListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [permits, setPermits] = useState<Permit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPermit, setSelectedPermit] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('details');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [permitToDelete, setPermitToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPermits = async () => {
    if (!user) return;

    try {
      const { data, error } = await (supabase as any)
        .from('permit_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPermits((data as Permit[]) || []);
    } catch (error) {
      console.error('Error fetching permits:', error);
      toast({
        title: "Error",
        description: "Failed to load permits",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermits();
  }, [user]);

  const filteredPermits = statusFilter === 'all' 
    ? permits 
    : permits.filter(permit => permit.status === statusFilter);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'draft':
      case 'pending':
        return <Clock className="w-4 h-4 text-warning" />;
      case 'submitted':
      case 'under_initial_review':
      case 'under_technical_review':
        return <AlertCircle className="w-4 h-4 text-info" />;
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: 'secondary',
      pending: 'secondary',
      submitted: 'outline',
      under_initial_review: 'outline',
      under_technical_review: 'outline',
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

  const canDelete = (status: string) => {
    return ['draft', 'rejected', 'requires_clarification'].includes(status);
  };

  const canEdit = (status: string) => {
    return ['draft', 'requires_clarification'].includes(status);
  };

  const handleDeleteClick = (permitId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPermitToDelete(permitId);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (permitId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onNavigateToEditApplication) {
      onNavigateToEditApplication(permitId);
    }
  };

  const handleConfirmDelete = async () => {
    if (!permitToDelete) return;
    
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('permit_applications')
        .delete()
        .eq('id', permitToDelete);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Permit application deleted successfully',
      });

      fetchPermits();
      setSelectedPermit(null);
    } catch (error) {
      console.error('Error deleting permit:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete permit application.',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setPermitToDelete(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading permit applications...</div>;
  }

  const selectedPermitData = permits.find(permit => permit.id === selectedPermit);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Existing Permits</h3>
          <p className="text-muted-foreground">View your submitted permit applications</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          variant={statusFilter === 'all' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('all')}
          size="sm"
        >
          All ({permits.length})
        </Button>
        <Button
          variant={statusFilter === 'draft' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('draft')}
          size="sm"
        >
          Draft ({permits.filter(p => p.status === 'draft').length})
        </Button>
        <Button
          variant={statusFilter === 'submitted' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('submitted')}
          size="sm"
        >
          Submitted ({permits.filter(p => p.status === 'submitted').length})
        </Button>
        <Button
          variant={statusFilter === 'approved' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('approved')}
          size="sm"
        >
          Approved ({permits.filter(p => p.status === 'approved').length})
        </Button>
        <Button
          variant={statusFilter === 'rejected' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('rejected')}
          size="sm"
        >
          Rejected ({permits.filter(p => p.status === 'rejected').length})
        </Button>
      </div>

      {filteredPermits.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h4 className="font-semibold mb-2">No Permit Applications Found</h4>
            <p className="text-sm text-muted-foreground">
              {statusFilter === 'all' 
                ? 'You have not submitted any permit applications yet' 
                : `No ${statusFilter.replace(/_/g, ' ')} permit applications found`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Permit Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPermits.map((permit) => (
                  <React.Fragment key={permit.id}>
                    <TableRow
                      className={`cursor-pointer transition-colors ${
                        selectedPermit === permit.id
                          ? 'bg-accent hover:bg-accent/90'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedPermit(selectedPermit === permit.id ? null : permit.id)}
                    >
                      <TableCell>
                        {selectedPermit === permit.id ? (
                          <ChevronDown className="w-4 h-4 text-primary" />
                        ) : (
                          <ChevronsUpDown className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{permit.title}</TableCell>
                      <TableCell>
                        {permit.permit_number || <span className="text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{permit.permit_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(permit.status)}
                          {getStatusBadge(permit.status)}
                        </div>
                      </TableCell>
                      <TableCell>{format(new Date(permit.created_at), 'MMM dd, yyyy')}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1">
                          {canEdit(permit.status) && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-primary hover:text-primary hover:bg-primary/10"
                              onClick={(e) => handleEditClick(permit.id, e)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          {canDelete(permit.status) && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={(e) => handleDeleteClick(permit.id, e)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    {selectedPermit === permit.id && selectedPermitData && (
                      <TableRow className="bg-glass/50 backdrop-blur-md hover:bg-glass/50">
                        <TableCell colSpan={7} className="p-0">
                          <div className="border-t border-glass/30 bg-white/80 dark:bg-primary/5 backdrop-blur-md p-6">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                              <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="details">Application Details</TabsTrigger>
                                <TabsTrigger value="mapping">Project Site Mapping</TabsTrigger>
                              </TabsList>

                              <TabsContent value="details" className="space-y-4 mt-4">
                                <PermitDetailsReadOnlyView permit={selectedPermitData as any} />
                              </TabsContent>

                              <TabsContent value="mapping" className="mt-4">
                                <PermitApplicationsMap
                                  key={`map-${selectedPermitData.id}`}
                                  showAllApplications={false}
                                  existingBoundary={selectedPermitData.coordinates}
                                  onBoundarySave={() => {}}
                                  coordinates={{ 
                                    lat: selectedPermitData.coordinates?.lat || -6.314993, 
                                    lng: selectedPermitData.coordinates?.lng || 147.1494 
                                  }}
                                  onCoordinatesChange={() => {}}
                                  readOnly={true}
                                  district={selectedPermitData.district}
                                  province={selectedPermitData.province}
                                />
                              </TabsContent>
                            </Tabs>

                            {/* Status Information */}
                            <Separator className="my-6" />
                            <Card className="bg-muted/30">
                              <CardHeader className="bg-primary/10">
                                <CardTitle className="text-lg">Application Status</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4 pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <Label className="text-muted-foreground mb-1">Current Status</Label>
                                    <div className="mt-1">{getStatusBadge(selectedPermitData.status)}</div>
                                  </div>
                                  {selectedPermitData.application_date && (
                                    <div>
                                      <Label className="text-muted-foreground mb-1">Application Date</Label>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                        <p className="text-sm">{format(new Date(selectedPermitData.application_date), 'PPP')}</p>
                                      </div>
                                    </div>
                                  )}
                                  {selectedPermitData.approval_date && (
                                    <div>
                                      <Label className="text-muted-foreground mb-1">Approval Date</Label>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                        <p className="text-sm">{format(new Date(selectedPermitData.approval_date), 'PPP')}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {selectedPermitData.status === 'draft' && (
                                  <Alert>
                                    <Clock className="h-4 w-4" />
                                    <AlertDescription>
                                      This application is still in draft. Complete and submit it to begin the review process.
                                    </AlertDescription>
                                  </Alert>
                                )}

                                {selectedPermitData.status === 'submitted' && (
                                  <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                      Your application has been submitted and is awaiting initial review.
                                    </AlertDescription>
                                  </Alert>
                                )}
                              </CardContent>
                            </Card>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Permit Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this permit application? This action cannot be undone.
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