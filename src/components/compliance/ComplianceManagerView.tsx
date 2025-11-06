import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  FileCheck, 
  AlertTriangle, 
  Search, 
  Filter,
  UserPlus,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { usePermitApplications } from '@/components/compliance/hooks/usePermitApplications';
import { useComplianceStaff } from '@/components/compliance/hooks/useComplianceStaff';
import { useComplianceAssessments } from '@/components/compliance/hooks/useComplianceAssessments';
import { supabase } from '@/integrations/supabase/client';
import { AssignOfficerDialog } from './AssignOfficerDialog';
import { TechnicalAssessment } from './TechnicalAssessment';

export function ComplianceManagerView() {
  const { applications, loading: appsLoading } = usePermitApplications();
  const { assessments, loading: assessmentsLoading } = useComplianceAssessments();
  const { staff } = useComplianceStaff();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<string | null>(null);

  const officers = staff.filter(s => s.staff_position === 'officer');
  
  // Filter applications
  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.application_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.entity_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const unassignedApplications = applications.filter(app => !app.assigned_compliance_officer_id);
  const assignedApplications = applications.filter(app => app.assigned_compliance_officer_id);
  
  // Assessment statistics
  const pendingAssessments = assessments.filter(a => a.assessment_status === 'pending');
  const inProgressAssessments = assessments.filter(a => a.assessment_status === 'in_progress');
  const completedAssessments = assessments.filter(a => a.assessment_status === 'completed');

  const handleAssignOfficer = async (applicationId: string, officerId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('No authenticated user');

      // Find existing compliance assessment (created by trigger)
      const { data: existingAssessment, error: assessmentQueryError } = await supabase
        .from('compliance_assessments')
        .select('id')
        .eq('permit_application_id', applicationId)
        .single();

      if (assessmentQueryError && assessmentQueryError.code !== 'PGRST116') {
        throw assessmentQueryError;
      }

      if (existingAssessment) {
        // Update existing assessment with assignment
        const { error: updateError } = await supabase
          .from('compliance_assessments')
          .update({
            assessed_by: officerId,
            assigned_by: user.user.id,
            assessment_status: 'in_progress',
            assessment_notes: 'Assessment assigned by compliance manager',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingAssessment.id);

        if (updateError) throw updateError;
      } else {
        // Create new assessment if none exists
        const { error: createError } = await supabase
          .from('compliance_assessments')
          .insert({
            permit_application_id: applicationId,
            assessed_by: officerId,
            assigned_by: user.user.id,
            assessment_status: 'in_progress',
            assessment_notes: 'Assessment assigned by compliance manager'
          });

        if (createError) throw createError;
      }

      // Update permit application assignment
      const { error: permitUpdateError } = await supabase
        .from('permit_applications')
        .update({ 
          assigned_compliance_officer_id: officerId,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (permitUpdateError) throw permitUpdateError;

      toast({
        title: "Assignment successful",
        description: "Application assigned to compliance officer",
      });

      setShowAssignDialog(false);
      setSelectedApplication(null);
    } catch (error) {
      console.error('Error assigning officer:', error);
      toast({
        title: "Assignment failed",
        description: "Failed to assign application to officer",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'under_technical_review':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getAssessmentStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'requires_revision':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  if (appsLoading || assessmentsLoading) {
    return <div className="flex justify-center p-8">Loading compliance data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Management Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applications.length}</div>
            <p className="text-xs text-muted-foreground">
              {assignedApplications.length} assigned
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unassigned</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{unassignedApplications.length}</div>
            <p className="text-xs text-muted-foreground">
              Pending assignment
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inProgressAssessments.length}</div>
            <p className="text-xs text-muted-foreground">
              Being assessed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Officers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{officers.length}</div>
            <p className="text-xs text-muted-foreground">
              Available staff
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Management Interface */}
      <Tabs defaultValue="applications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="officers">Officers</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Application Management</CardTitle>
                <Button
                  onClick={() => setShowAssignDialog(true)}
                  className="gap-2"
                  disabled={unassignedApplications.length === 0}
                >
                  <UserPlus className="h-4 w-4" />
                  Bulk Assign
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Filter */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search applications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="under_technical_review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Applications List */}
              <div className="space-y-3">
                {filteredApplications.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'No applications match your filters'
                      : 'No permit applications found'
                    }
                  </p>
                ) : (
                  filteredApplications.map((application) => (
                    <div key={application.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div className="space-y-1">
                          <h4 className="font-medium">{application.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            #{application.application_number} • {application.entity_name}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(application.status)}>
                              {application.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                            {application.assigned_compliance_officer_id ? (
                              <Badge variant="outline">
                                Assigned to {application.assigned_officer_name || 'Officer'}
                              </Badge>
                            ) : (
                              <Badge variant="destructive">Unassigned</Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          {!application.assigned_compliance_officer_id && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedApplication(application.id);
                                setShowAssignDialog(true);
                              }}
                            >
                              Assign Officer
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Technical Assessments Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assessments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No assessments found</p>
                ) : (
                  assessments.map((assessment) => (
                    <div key={assessment.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <h4 className="font-medium">
                            {assessment.permit_application?.title || 'Assessment'}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Application #{assessment.permit_application?.application_number}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge className={getAssessmentStatusColor(assessment.assessment_status)}>
                              {assessment.assessment_status.replace('_', ' ').toUpperCase()}
                            </Badge>
                            {assessment.compliance_score && (
                              <Badge variant="outline">
                                Score: {assessment.compliance_score}/100
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right text-sm text-muted-foreground">
                          <p>Created: {new Date(assessment.created_at).toLocaleDateString()}</p>
                          {assessment.next_review_date && (
                            <p>Due: {new Date(assessment.next_review_date).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>
                      
                      {assessment.assessment_notes && (
                        <div className="mt-3 p-3 bg-muted rounded-md">
                          <p className="text-sm">{assessment.assessment_notes}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="officers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Officers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {officers.map((officer) => {
                  const officerAssessments = assessments.filter(a => a.assessed_by === officer.id);
                  const activeCases = officerAssessments.filter(a => 
                    a.assessment_status === 'pending' || a.assessment_status === 'in_progress'
                  ).length;
                  
                  return (
                    <Card key={officer.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium">{officer.full_name || officer.email}</h4>
                            <p className="text-sm text-muted-foreground">{officer.email}</p>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Active Cases:</span>
                              <Badge variant={activeCases > 5 ? "destructive" : "secondary"}>
                                {activeCases}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Total Assessments:</span>
                              <span className="text-sm font-medium">{officerAssessments.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Status:</span>
                              <Badge variant={officer.is_active ? "default" : "secondary"}>
                                {officer.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Assignment Dialog */}
      {showAssignDialog && (
        <AssignOfficerDialog
          open={showAssignDialog}
          onOpenChange={setShowAssignDialog}
          officers={officers}
          selectedApplication={selectedApplication}
          onAssign={handleAssignOfficer}
        />
      )}
    </div>
  );
}