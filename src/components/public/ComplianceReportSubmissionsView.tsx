import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Plus, Calendar, Clock, CheckCircle2, AlertCircle, XCircle, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export function ComplianceReportSubmissionsView() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPermitId, setSelectedPermitId] = useState('');
  const [description, setDescription] = useState('');

  // Get user's approved permits
  const { data: permits } = useQuery({
    queryKey: ['user-approved-permits', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('permit_applications')
        .select('id, permit_number, title')
        .eq('user_id', user.id)
        .eq('status', 'approved');
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Get compliance reports
  const { data: reports, isLoading } = useQuery({
    queryKey: ['user-compliance-reports', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('compliance_reports')
        .select(`
          *,
          permit_applications (
            permit_number,
            title
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Submit new report
  const submitReport = useMutation({
    mutationFn: async () => {
      if (!user?.id || !selectedPermitId) throw new Error('Missing required fields');
      
      const { error } = await supabase
        .from('compliance_reports')
        .insert({
          user_id: user.id,
          permit_id: selectedPermitId,
          description,
          status: 'submitted',
          report_date: new Date().toISOString(),
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-compliance-reports'] });
      setIsDialogOpen(false);
      setSelectedPermitId('');
      setDescription('');
      toast.success('Compliance report submitted successfully');
    },
    onError: (error) => {
      toast.error('Failed to submit report: ' + error.message);
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Submitted</Badge>;
      case 'under_review':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Under Review</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Report Submissions</h2>
          <p className="text-muted-foreground mt-1">
            Submit and track your compliance reports
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Submit New Report
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Compliance Report</DialogTitle>
              <DialogDescription>
                Submit a compliance report for one of your approved permits
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="permit">Select Permit</Label>
                <Select value={selectedPermitId} onValueChange={setSelectedPermitId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a permit" />
                  </SelectTrigger>
                  <SelectContent>
                    {permits?.map((permit) => (
                      <SelectItem key={permit.id} value={permit.id}>
                        {permit.permit_number || 'Draft'} - {permit.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Report Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your compliance activities and any relevant updates..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
              <Button 
                onClick={() => submitReport.mutate()} 
                disabled={!selectedPermitId || !description || submitReport.isPending}
                className="w-full"
              >
                {submitReport.isPending ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reports?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reports?.filter(r => r.status === 'submitted' || r.status === 'under_review').length || 0}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
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
                <p className="text-2xl font-bold">{reports?.filter(r => r.status === 'approved').length || 0}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reports?.filter(r => r.status === 'rejected').length || 0}</p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Your Reports
          </CardTitle>
          <CardDescription>
            All compliance reports you have submitted
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!reports || reports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Reports Yet</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mb-4">
                Submit your first compliance report to track your permit compliance status.
              </p>
              <Button onClick={() => setIsDialogOpen(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Submit Your First Report
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {report.permit_applications?.title || 'Compliance Report'}
                        </span>
                        {getStatusBadge(report.status)}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {report.permit_applications?.permit_number || 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Submitted: {format(new Date(report.report_date), 'PPP')}
                        </span>
                      </div>
                      {report.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {report.description}
                        </p>
                      )}
                      {report.review_notes && (
                        <div className="text-sm mt-2 p-2 bg-muted rounded">
                          <span className="font-medium">Review Notes: </span>
                          {report.review_notes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
