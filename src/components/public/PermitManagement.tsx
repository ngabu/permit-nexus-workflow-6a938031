
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, FileText, Calendar, Activity, Edit, Trash2, ChevronsUpDown, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ComprehensivePermitForm } from './ComprehensivePermitForm';
import { PermitActivities } from './PermitActivities';
import { PermitDetailsReadOnlyView } from './PermitDetailsReadOnlyView';

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
  entity_id: string;
  entity_name?: string;
  entity_type?: string;
}

interface PermitManagementProps {
  onNavigateToNewApplication?: () => void;
  onNavigateToEditApplication?: (permitId: string) => void;
}

export function PermitManagement({ onNavigateToNewApplication, onNavigateToEditApplication }: PermitManagementProps) {
  const [permits, setPermits] = useState<Permit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);
  const [selectedPermitForPreview, setSelectedPermitForPreview] = useState<Permit | null>(null);
  const [showActivities, setShowActivities] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchPermits = async () => {
    if (!user) return;

    try {
      const { data, error } = await (supabase as any)
        .from('permit_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPermits((data as any) || []);
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

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      under_initial_review: 'bg-yellow-100 text-yellow-800',
      under_technical_review: 'bg-orange-100 text-orange-800',
      requires_clarification: 'bg-amber-100 text-amber-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-orange-100 text-orange-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleEditApplication = (permit: Permit) => {
    if (onNavigateToEditApplication) {
      onNavigateToEditApplication(permit.id);
    } else {
      navigate(`/edit-permit/${permit.id}`);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    fetchPermits();
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  const handleDeleteApplication = async (permit: Permit) => {
    const allowedStatuses = ['draft', 'rejected', 'requires_clarification'];
    if (!allowedStatuses.includes(permit.status)) {
      toast({
        title: "Error",
        description: "Cannot delete application in current status",
        variant: "destructive",
      });
      return;
    }

    if (!confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('permit_applications')
        .delete()
        .eq('id', permit.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Application deleted successfully",
      });
      
      fetchPermits();
    } catch (error) {
      console.error('Error deleting application:', error);
      toast({
        title: "Error",
        description: "Failed to delete application",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading permits...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-forest-800">Permit Management</h2>
          <p className="text-forest-600">Apply for and manage your environmental permits</p>
        </div>
        <Button 
          variant="gradient"
          onClick={() => onNavigateToNewApplication?.()}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Application
        </Button>
      </div>

      {permits.length === 0 ? (
        <Card className="border-forest-200">
          <CardContent className="py-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-forest-400" />
            <h3 className="text-lg font-semibold mb-2 text-forest-800">No Permits Found</h3>
            <p className="text-forest-600 mb-4">Start your first permit application</p>
            <Button 
              onClick={() => onNavigateToNewApplication?.()}
              variant="gradient"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Application
            </Button>
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
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permits.map((permit) => (
                  <React.Fragment key={permit.id}>
                    <TableRow 
                      className={`cursor-pointer transition-colors ${
                        selectedPermitForPreview?.id === permit.id 
                          ? 'bg-accent hover:bg-accent/90' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedPermitForPreview(selectedPermitForPreview?.id === permit.id ? null : permit)}
                    >
                      <TableCell>
                        {selectedPermitForPreview?.id === permit.id ? (
                          <ChevronDown className="w-4 h-4 text-primary" />
                        ) : (
                          <ChevronsUpDown className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{permit.title}</div>
                          {permit.permit_number && (
                            <div className="text-sm text-muted-foreground">#{permit.permit_number}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{permit.permit_type}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(permit.status)}>
                          {permit.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {permit.application_date ? new Date(permit.application_date).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {(permit.status === 'draft' || permit.status === 'requires_clarification') ? (
                            <>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditApplication(permit);
                                }}
                              >
                                <Edit className="w-4 h-4 text-primary" />
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteApplication(permit);
                                }}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </>
                          ) : permit.status === 'rejected' ? (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteApplication(permit);
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          ) : permit.status !== 'under_technical_review' ? (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPermit(permit);
                                setShowActivities(true);
                              }}
                            >
                              <Activity className="w-4 h-4 text-primary" />
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                    {selectedPermitForPreview?.id === permit.id && (
                      <TableRow className="bg-glass/50 backdrop-blur-md hover:bg-glass/50">
                        <TableCell colSpan={6} className="p-0">
                          <div className="border-t border-glass/30 bg-white/80 dark:bg-primary/5 backdrop-blur-md p-6">
                            <PermitDetailsReadOnlyView permit={selectedPermitForPreview} />
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

      <Dialog open={showActivities} onOpenChange={setShowActivities}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Permit Activities - {selectedPermit?.title}</DialogTitle>
          </DialogHeader>
          {selectedPermit && (
            <PermitActivities
              permitId={selectedPermit.id}
              onClose={() => setShowActivities(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
