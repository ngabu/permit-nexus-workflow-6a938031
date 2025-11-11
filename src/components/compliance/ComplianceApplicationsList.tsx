import { useState } from 'react';
import { useComplianceAssessments } from './hooks/useComplianceAssessments';
import { useComplianceStaff } from './hooks/useComplianceStaff';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Calendar, User, Building, ExternalLink, Shield, Clock, Search, Filter, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export function ComplianceApplicationsList() {
  const { assessments, loading, assignAssessment, refetch } = useComplianceAssessments();
  const { staff } = useComplianceStaff();
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');
  const [assignmentFilter, setAssignmentFilter] = useState('all');
  const [selectedAssessments, setSelectedAssessments] = useState<string[]>([]);
  const [assigningTo, setAssigningTo] = useState<string | null>(null);

  const isManager = profile?.staff_position && ['manager', 'director', 'managing_director'].includes(profile.staff_position);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'passed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'requires_clarification':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const handleViewAssessment = (assessmentId: string) => {
    navigate(`/compliance/assessments/${assessmentId}`);
  };

  const handleAssignOfficer = async (assessmentId: string, officerId: string) => {
    try {
      setAssigningTo(assessmentId);
      
      await assignAssessment(assessmentId, officerId, 'Assessment assigned by manager');
      
      toast({
        title: "Assessment Assigned",
        description: "The assessment has been successfully assigned to the compliance officer.",
      });
      
      refetch();
    } catch (error) {
      console.error('Error assigning assessment:', error);
      toast({
        title: "Assignment Failed",
        description: "There was an error assigning the assessment.",
        variant: "destructive",
      });
    } finally {
      setAssigningTo(null);
    }
  };

  const handleBulkAssign = async (officerId: string) => {
    if (selectedAssessments.length === 0) {
      toast({
        title: "No Assessments Selected",
        description: "Please select assessments to assign.",
        variant: "destructive",
      });
      return;
    }

    try {
      const promises = selectedAssessments.map(assessmentId => 
        assignAssessment(assessmentId, officerId, 'Bulk assignment by manager')
      );

      await Promise.all(promises);

      toast({
        title: "Assessments Assigned",
        description: `Successfully assigned ${selectedAssessments.length} assessments.`,
      });

      setSelectedAssessments([]);
      refetch();
    } catch (error) {
      console.error('Error bulk assigning assessments:', error);
      toast({
        title: "Assignment Failed",
        description: "There was an error assigning the assessments.",
        variant: "destructive",
      });
    }
  };

  const toggleAssessmentSelection = (assessmentId: string) => {
    setSelectedAssessments(prev => 
      prev.includes(assessmentId) 
        ? prev.filter(id => id !== assessmentId)
        : [...prev, assessmentId]
    );
  };

  const filteredAssessments = assessments.filter(assessment => {
    // For managers, show all applications. For officers, show only assigned ones
    if (!isManager && assessment.assessed_by !== profile?.user_id) {
      return false;
    }
    
    const matchesSearch = !searchTerm || 
      assessment.permit_application?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.permit_application?.entity_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.permit_application?.application_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || assessment.assessment_status === statusFilter;
    
    const matchesEntity = entityFilter === 'all' || assessment.permit_application?.entity_type === entityFilter;

    const matchesAssignment = assignmentFilter === 'all' || 
      (assignmentFilter === 'assigned' && assessment.assessor) ||
      (assignmentFilter === 'unassigned' && !assessment.assessor);

    return matchesSearch && matchesStatus && matchesEntity && matchesAssignment;
  });

  const entityTypes = [...new Set(assessments.map(a => a.permit_application?.entity_type).filter(Boolean))];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex justify-center items-center">
            <Clock className="w-6 h-6 mr-2 animate-spin" />
            Loading compliance assessments...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              {isManager ? 'Compliance Assessments for Assignment' : 'My Assigned Assessments'} ({filteredAssessments.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {isManager 
                ? "Assign compliance assessments to compliance officers for technical review"
                : "Review and process your assigned compliance assessments"
              }
            </p>
          </div>
          {isManager && selectedAssessments.length > 0 && (
            <div className="flex items-center gap-2">
              <Select onValueChange={handleBulkAssign}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Assign selected to..." />
                </SelectTrigger>
                <SelectContent>
                  {staff.filter(s => s.staff_position === 'officer').map((officer) => (
                    <SelectItem key={officer.id} value={officer.id}>
                      {officer.full_name || officer.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedAssessments([])}
              >
                Clear ({selectedAssessments.length})
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-muted/30 rounded-lg">
          <div>
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search assessments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="passed">Passed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="requires_clarification">Requires Clarification</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="entity">Entity Type</Label>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All entities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entity Types</SelectItem>
                {entityTypes.filter(type => type && type.trim() !== '').map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isManager && (
            <div>
              <Label htmlFor="assignment">Assignment</Label>
              <Select value={assignmentFilter} onValueChange={setAssignmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All assessments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assessments</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setEntityFilter('all');
                setAssignmentFilter('all');
              }}
              className="w-full"
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Assessments Table */}
        {filteredAssessments.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No assessments found</h3>
            <p className="text-muted-foreground">
              {assessments.length === 0 
                ? "No assessments have been created yet."
                : "Try adjusting your filters to see more results."
              }
            </p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
               <TableHeader>
                <TableRow className="bg-muted/50">
                  {isManager && <TableHead className="w-12"></TableHead>}
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Application</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssessments.map((assessment) => {
              const assignedOfficer = assessment.assessor || staff.find(s => s.id === assessment.assessed_by);
              const isSelected = selectedAssessments.includes(assessment.id);
              const canAssign = isManager && (!assessment.assessor || assessment.assessment_status === 'pending');

              const getStatusIcon = () => {
                switch (assessment.assessment_status) {
                  case 'passed':
                    return { icon: CheckCircle, color: 'text-success' };
                  case 'failed':
                    return { icon: AlertCircle, color: 'text-destructive' };
                  case 'in_progress':
                    return { icon: Clock, color: 'text-warning' };
                  case 'requires_clarification':
                    return { icon: AlertCircle, color: 'text-accent' };
                  default:
                    return { icon: Clock, color: 'text-primary' };
                }
              };

              const { icon: StatusIcon, color: statusIconColor } = getStatusIcon();

              return (
                    <TableRow
                      key={assessment.id}
                      className={`${
                        isSelected 
                          ? 'bg-primary/5' 
                          : 'hover:bg-muted/50'
                      } transition-colors`}
                    >
                      {canAssign && (
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleAssessmentSelection(assessment.id)}
                            className="rounded border-gray-300 cursor-pointer"
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        <StatusIcon className={`w-5 h-5 ${statusIconColor}`} />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {assessment.permit_application?.title || `Assessment ${assessment.permit_application?.application_number}`}
                          </div>
                          {assessment.permit_application?.application_number && (
                            <div className="text-xs text-muted-foreground">
                              #{assessment.permit_application.application_number}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            {assessment.permit_application?.entity_name || 'Unknown'}
                          </div>
                          {assessment.permit_application?.entity_type && (
                            <Badge variant="outline" className="text-xs">
                              {assessment.permit_application.entity_type}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(assessment.assessment_status)}>
                          {assessment.assessment_status.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {assignedOfficer 
                            ? `${assignedOfficer.full_name || assignedOfficer.email}` 
                            : <span className="text-muted-foreground italic">Unassigned</span>
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {new Date(assessment.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canAssign && (
                            <Select
                              disabled={assigningTo === assessment.id}
                              onValueChange={(officerId) => handleAssignOfficer(assessment.id, officerId)}
                            >
                              <SelectTrigger className="w-32 h-8 text-xs">
                                <SelectValue placeholder="Assign..." />
                              </SelectTrigger>
                              <SelectContent>
                                {staff.filter(s => s.staff_position === 'officer').map((officer) => (
                                  <SelectItem key={officer.id} value={officer.id}>
                                    {officer.full_name || officer.email}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewAssessment(assessment.id)}
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Review
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}