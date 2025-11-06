import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  FileCheck, 
  Clock, 
  AlertCircle, 
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Calendar
} from 'lucide-react';
import { useComplianceAssessments } from './hooks/useComplianceAssessments';
import { TechnicalAssessment } from './TechnicalAssessment';

export function ComplianceOfficerView() {
  const { assessments, loading, refetch } = useComplianceAssessments();
  const { toast } = useToast();
  const [selectedAssessment, setSelectedAssessment] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showTechnicalAssessment, setShowTechnicalAssessment] = useState(false);

  // Filter assessments
  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = assessment.permit_application?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.permit_application?.application_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.permit_application?.entity_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || assessment.assessment_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const pendingAssessments = assessments.filter(a => a.assessment_status === 'pending');
  const inProgressAssessments = assessments.filter(a => a.assessment_status === 'in_progress');
  const completedAssessments = assessments.filter(a => a.assessment_status === 'completed');
  const overdueAssessments = assessments.filter(a => {
    if (!a.next_review_date) return false;
    return new Date(a.next_review_date) < new Date() && a.assessment_status !== 'completed';
  });

  const handleStartAssessment = (assessment: any) => {
    setSelectedAssessment(assessment);
    setShowTechnicalAssessment(true);
  };

  const handleAssessmentUpdate = () => {
    setShowTechnicalAssessment(false);
    setSelectedAssessment(null);
    refetch();
  };

  const handleCancelAssessment = () => {
    setShowTechnicalAssessment(false);
    setSelectedAssessment(null);
  };


  const getStatusColor = (status: string) => {
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

  const isOverdue = (reviewDate: string | null) => {
    if (!reviewDate) return false;
    return new Date(reviewDate) < new Date();
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading assessments...</div>;
  }

  if (showTechnicalAssessment && selectedAssessment) {
    return (
      <TechnicalAssessment
        assessment={selectedAssessment}
        onUpdate={handleAssessmentUpdate}
        onCancel={handleCancelAssessment}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Officer Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingAssessments.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inProgressAssessments.length}</div>
            <p className="text-xs text-muted-foreground">Being assessed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{completedAssessments.length}</div>
            <p className="text-xs text-muted-foreground">Finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueAssessments.length}</div>
            <p className="text-xs text-muted-foreground">Past due</p>
          </CardContent>
        </Card>
      </div>

      {/* Assessment Management Interface */}
      <Tabs defaultValue="my-assessments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="my-assessments">My Assessments</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="my-assessments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Active Assessments</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">
                    {pendingAssessments.length + inProgressAssessments.length} Active
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Filter */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search assessments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-background"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="requires_revision">Requires Revision</option>
                </select>
              </div>

              {/* Assessments List */}
              <div className="space-y-3">
                {filteredAssessments.filter(a => a.assessment_status !== 'completed').length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'No assessments match your filters'
                      : 'No active assessments assigned'
                    }
                  </p>
                ) : (
                  filteredAssessments
                    .filter(a => a.assessment_status !== 'completed')
                    .map((assessment) => (
                      <div key={assessment.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div className="space-y-1">
                            <h4 className="font-medium">{assessment.permit_application?.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              #{assessment.permit_application?.application_number} • {assessment.permit_application?.entity_name}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(assessment.assessment_status)}>
                                {assessment.assessment_status.replace('_', ' ').toUpperCase()}
                              </Badge>
                              {assessment.next_review_date && isOverdue(assessment.next_review_date) && (
                                <Badge variant="destructive">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Overdue
                                </Badge>
                              )}
                              {assessment.compliance_score && (
                                <Badge variant="outline">
                                  Score: {assessment.compliance_score}/100
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStartAssessment(assessment)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleStartAssessment(assessment)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              {assessment.assessment_status === 'pending' ? 'Start' : 'Continue'}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span>Created:</span> {new Date(assessment.created_at).toLocaleDateString()}
                          </div>
                          {assessment.next_review_date && (
                            <div>
                              <Calendar className="h-3 w-3 inline mr-1" />
                              Due: {new Date(assessment.next_review_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        
                        {assessment.assessment_notes && (
                          <div className="mt-3 p-3 bg-muted rounded-md">
                            <p className="text-sm line-clamp-2">{assessment.assessment_notes}</p>
                          </div>
                        )}
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {completedAssessments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No completed assessments found</p>
                ) : (
                  completedAssessments.map((assessment) => (
                    <div key={assessment.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="space-y-1">
                          <h4 className="font-medium">{assessment.permit_application?.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            #{assessment.permit_application?.application_number} • {assessment.permit_application?.entity_name}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(assessment.assessment_status)}>
                              COMPLETED
                            </Badge>
                            {assessment.compliance_score && (
                              <Badge variant="outline">
                                Score: {assessment.compliance_score}/100
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStartAssessment(assessment)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        Completed: {new Date(assessment.updated_at).toLocaleDateString()}
                      </div>
                      
                      {assessment.recommendations && (
                        <div className="mt-3 p-3 bg-muted rounded-md">
                          <p className="text-sm">{assessment.recommendations}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}