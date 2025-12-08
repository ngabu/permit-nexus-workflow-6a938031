import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Plus, Calendar, Clock, CheckCircle2, AlertCircle, XCircle, Upload, Download, X, Building2 } from 'lucide-react';
import { format, addMonths, addQuarters, differenceInDays } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDocuments } from '@/hooks/useDocuments';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function ComplianceReportSubmissionsView() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  
  // Permit Compliance state
  const [reportType, setReportType] = useState("");
  const [reportPeriod, setReportPeriod] = useState("");
  const [executiveSummary, setExecutiveSummary] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { uploadDocument } = useDocuments();

  // Get user's entities
  const { data: entities } = useQuery({
    queryKey: ['user-entities', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('entities')
        .select('id, name, entity_type')
        .eq('user_id', user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Get user's approved permits with entity info
  const { data: permits } = useQuery({
    queryKey: ['user-approved-permits-with-entity', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('permit_applications')
        .select(`
          id, 
          permit_number, 
          title,
          status,
          created_at,
          entities (
            id,
            name,
            entity_type
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'approved');
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Get compliance reports with entity and permit info
  const { data: reports, isLoading } = useQuery({
    queryKey: ['user-compliance-reports-detailed', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('compliance_reports')
        .select(`
          *,
          permit_applications (
            id,
            permit_number,
            title,
            entities (
              id,
              name,
              entity_type
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Generate upcoming submission schedules based on approved permits
  const upcomingSchedules = permits?.map((permit, index) => {
    const baseDate = new Date();
    const scheduleTypes = ['Monthly Environmental Monitoring', 'Quarterly Compliance Report', 'Annual Performance Report'];
    const scheduleType = scheduleTypes[index % scheduleTypes.length];
    
    let dueDate: Date;
    let frequency: string;
    
    if (scheduleType.includes('Monthly')) {
      dueDate = addMonths(baseDate, 1);
      frequency = 'Monthly';
    } else if (scheduleType.includes('Quarterly')) {
      dueDate = addQuarters(baseDate, 1);
      frequency = 'Quarterly';
    } else {
      dueDate = addMonths(baseDate, 6);
      frequency = 'Annual';
    }
    
    const daysUntilDue = differenceInDays(dueDate, baseDate);
    
    return {
      id: permit.id,
      permitNumber: permit.permit_number || 'Pending',
      permitTitle: permit.title,
      entityName: permit.entities?.name || 'N/A',
      entityType: permit.entities?.entity_type || 'N/A',
      reportType: scheduleType,
      frequency,
      dueDate,
      daysUntilDue,
      status: daysUntilDue <= 7 ? 'urgent' : daysUntilDue <= 30 ? 'upcoming' : 'scheduled'
    };
  }) || [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitComplianceReport = async () => {
    if (!selectedSchedule || !reportType || !reportPeriod) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create compliance report record
      const { error } = await supabase
        .from('compliance_reports')
        .insert({
          user_id: user?.id,
          permit_id: selectedSchedule.id,
          description: executiveSummary,
          status: 'submitted',
          report_date: new Date().toISOString(),
        });
      
      if (error) throw error;

      // Upload each file
      for (const file of uploadedFiles) {
        await uploadDocument(file, selectedSchedule.permitNumber);
      }

      toast.success("Your compliance report has been submitted successfully");
      queryClient.invalidateQueries({ queryKey: ['user-compliance-reports-detailed'] });

      // Reset form
      setSelectedSchedule(null);
      setIsSubmitDialogOpen(false);
      setReportType("");
      setReportPeriod("");
      setExecutiveSummary("");
      setUploadedFiles([]);
    } catch (error: any) {
      toast.error("Failed to submit compliance report: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
      case 'pending':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getScheduleStatusBadge = (status: string) => {
    switch (status) {
      case 'urgent':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Urgent</Badge>;
      case 'upcoming':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Upcoming</Badge>;
      case 'scheduled':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Scheduled</Badge>;
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
      </div>

      <Tabs defaultValue="submissions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="submissions">My Submissions</TabsTrigger>
          <TabsTrigger value="schedules">Upcoming Submission Schedules</TabsTrigger>
        </TabsList>

        {/* My Submissions Tab */}
        <TabsContent value="submissions" className="space-y-6 mt-6">
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

          {/* Submissions Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Submitted Compliance Reports
              </CardTitle>
              <CardDescription>
                All compliance reports submitted for your entities and permits
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!reports || reports.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No Reports Yet</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto mb-4">
                    You haven't submitted any compliance reports yet. Check the Upcoming Submission Schedules tab to submit your first report.
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Entity</TableHead>
                        <TableHead>Permit Number</TableHead>
                        <TableHead>Permit Title</TableHead>
                        <TableHead>Submission Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Review Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{report.permit_applications?.entities?.name || 'N/A'}</p>
                                <p className="text-xs text-muted-foreground">{report.permit_applications?.entities?.entity_type || ''}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {report.permit_applications?.permit_number || 'N/A'}
                          </TableCell>
                          <TableCell>{report.permit_applications?.title || 'N/A'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {format(new Date(report.report_date), 'PPP')}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(report.status)}</TableCell>
                          <TableCell className="max-w-[200px]">
                            <p className="text-sm text-muted-foreground truncate">
                              {report.review_notes || report.description || '-'}
                            </p>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upcoming Submission Schedules Tab */}
        <TabsContent value="schedules" className="space-y-6 mt-6">
          {/* Schedule Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-card-foreground">Urgent (≤7 days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-card-foreground">
                    {upcomingSchedules.filter(s => s.status === 'urgent').length}
                  </span>
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-card-foreground">Upcoming (≤30 days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-card-foreground">
                    {upcomingSchedules.filter(s => s.status === 'upcoming').length}
                  </span>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-card-foreground">Scheduled</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-card-foreground">
                    {upcomingSchedules.filter(s => s.status === 'scheduled').length}
                  </span>
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Schedules Table */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Compliance Report Deadlines</CardTitle>
              <CardDescription>Submit required compliance reports before their due dates</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingSchedules.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No Scheduled Reports</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    You don't have any approved permits requiring compliance reports yet.
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Entity</TableHead>
                        <TableHead>Permit Number</TableHead>
                        <TableHead>Permit Title</TableHead>
                        <TableHead>Report Type</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Days Remaining</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upcomingSchedules.map((schedule) => (
                        <TableRow key={schedule.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{schedule.entityName}</p>
                                <p className="text-xs text-muted-foreground">{schedule.entityType}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{schedule.permitNumber}</TableCell>
                          <TableCell>{schedule.permitTitle}</TableCell>
                          <TableCell>{schedule.reportType}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{schedule.frequency}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {format(schedule.dueDate, 'PPP')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`font-medium ${schedule.daysUntilDue <= 7 ? 'text-red-600' : schedule.daysUntilDue <= 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                              {schedule.daysUntilDue} days
                            </span>
                          </TableCell>
                          <TableCell>{getScheduleStatusBadge(schedule.status)}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              size="sm" 
                              onClick={() => {
                                setSelectedSchedule(schedule);
                                setIsSubmitDialogOpen(true);
                              }}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Submit Report
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Submit Report Dialog */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submit Compliance Report</DialogTitle>
            <DialogDescription>
              {selectedSchedule && (
                <>Upload compliance report for {selectedSchedule.permitNumber} - {selectedSchedule.reportType}</>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Report Template Download */}
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-base">Reporting Template</CardTitle>
                <CardDescription>
                  Download the official reporting template and complete it before uploading
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download Compliance Report Template
                </Button>
              </CardContent>
            </Card>

            {/* Report Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type *</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly-water">Monthly Water Quality Report</SelectItem>
                  <SelectItem value="quarterly-env">Quarterly Environmental Monitoring</SelectItem>
                  <SelectItem value="annual-compliance">Annual Compliance Report</SelectItem>
                  <SelectItem value="incident-report">Incident Report</SelectItem>
                  <SelectItem value="waste-management">Waste Management Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reporting Period */}
            <div className="space-y-2">
              <Label htmlFor="reportPeriod">Reporting Period *</Label>
              <Select value={reportPeriod} onValueChange={setReportPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jan-2025">January 2025</SelectItem>
                  <SelectItem value="feb-2025">February 2025</SelectItem>
                  <SelectItem value="q1-2025">Q1 2025</SelectItem>
                  <SelectItem value="q2-2025">Q2 2025</SelectItem>
                  <SelectItem value="2025">Year 2025</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Executive Summary */}
            <div className="space-y-2">
              <Label htmlFor="summary">Executive Summary</Label>
              <Textarea
                id="summary"
                placeholder="Provide a brief summary of compliance status and key findings..."
                rows={4}
                value={executiveSummary}
                onChange={(e) => setExecutiveSummary(e.target.value)}
              />
            </div>

            {/* File Upload Section */}
            <div className="space-y-2">
              <Label>Upload Compliance Documents *</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Upload completed report template, monitoring data, laboratory results, photos, and supporting evidence
                </p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                />
                <Label htmlFor="file-upload">
                  <Button variant="outline" type="button" asChild>
                    <span>
                      <FileText className="w-4 h-4 mr-2" />
                      Choose Files
                    </span>
                  </Button>
                </Label>
              </div>
              
              {/* Display uploaded files */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <Label className="text-sm font-medium">Selected Files:</Label>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm truncate flex-1">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        type="button"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Compliance Checklist */}
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-base">Compliance Checklist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="monitoring-completed" className="rounded" />
                  <Label htmlFor="monitoring-completed" className="text-sm font-normal">
                    All required monitoring activities completed
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="standards-met" className="rounded" />
                  <Label htmlFor="standards-met" className="text-sm font-normal">
                    Environmental standards and limits met
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="incidents-reported" className="rounded" />
                  <Label htmlFor="incidents-reported" className="text-sm font-normal">
                    All incidents and non-compliance events reported
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="corrective-actions" className="rounded" />
                  <Label htmlFor="corrective-actions" className="text-sm font-normal">
                    Corrective actions from previous reports implemented
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleSubmitComplianceReport} 
                disabled={isSubmitting || uploadedFiles.length === 0 || !reportType || !reportPeriod}
                className="flex-1"
              >
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </Button>
              <Button 
                variant="outline" 
                type="button" 
                className="flex-1"
                onClick={() => setIsSubmitDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
