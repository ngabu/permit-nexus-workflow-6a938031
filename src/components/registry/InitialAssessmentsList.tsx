import { useState } from 'react';
import { useInitialAssessments } from './hooks/useInitialAssessments';
import { useRegistryStaff } from './hooks/useRegistryStaff';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Calendar, User, Building, ExternalLink, FileCheck, Clock, Search, Filter, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function InitialAssessmentsList() {
  const { assessments, loading, refetch } = useInitialAssessments();
  const { staff } = useRegistryStaff();
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');
  const [selectedAssessments, setSelectedAssessments] = useState<string[]>([]);
  const [assigningTo, setAssigningTo] = useState<string | null>(null);

  const isManager = profile?.staff_position && ['manager', 'director', 'managing_director'].includes(profile.staff_position);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'passed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'requires_clarification':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'forwarded_to_compliance':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const handleViewApplication = (assessmentId: string) => {
    navigate(`/registry/applications/${assessmentId}`);
  };

  const handleAssignOfficer = async (assessmentId: string, officerId: string) => {
    try {
      setAssigningTo(assessmentId);
      
      // Get the assessment to find the permit application ID
      const { data: assessment, error: fetchError } = await supabase
        .from('initial_assessments')
        .select('permit_application_id')
        .eq('id', assessmentId)
        .single();

      if (fetchError) throw fetchError;

      // Update both initial_assessments and permit_applications tables
      const [assessmentUpdate, applicationUpdate] = await Promise.all([
        supabase
          .from('initial_assessments')
          .update({ assessed_by: officerId })
          .eq('id', assessmentId),
        supabase
          .from('permit_applications')
          .update({ 
            assigned_officer_id: officerId,
            updated_at: new Date().toISOString()
          })
          .eq('id', assessment.permit_application_id)
      ]);

      if (assessmentUpdate.error) throw assessmentUpdate.error;
      if (applicationUpdate.error) throw applicationUpdate.error;

      toast({
        title: "Assessment Assigned",
        description: "The assessment has been successfully assigned to the officer.",
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
      // Get all selected assessments with their permit application IDs
      const { data: assessmentsData, error: fetchError } = await supabase
        .from('initial_assessments')
        .select('id, permit_application_id')
        .in('id', selectedAssessments);

      if (fetchError) throw fetchError;

      // Update both initial_assessments and permit_applications tables
      const assessmentPromises = assessmentsData.map(assessment => 
        supabase
          .from('initial_assessments')
          .update({ assessed_by: officerId })
          .eq('id', assessment.id)
      );

      const applicationPromises = assessmentsData.map(assessment => 
        supabase
          .from('permit_applications')
          .update({ 
            assigned_officer_id: officerId,
            updated_at: new Date().toISOString()
          })
          .eq('id', assessment.permit_application_id)
      );

      await Promise.all([...assessmentPromises, ...applicationPromises]);

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
    const matchesSearch = !searchTerm || 
      assessment.permit_application?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.permit_application?.entity_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.permit_application?.application_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || assessment.assessment_status === statusFilter;
    
    const matchesEntity = entityFilter === 'all' || assessment.permit_application?.entity_type === entityFilter;

    return matchesSearch && matchesStatus && matchesEntity;
  });

  const entityTypes = [...new Set(assessments.map(a => a.permit_application?.entity_type).filter(Boolean))];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex justify-center items-center">
            <Clock className="w-6 h-6 mr-2 animate-spin" />
            Loading initial assessments...
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
              <FileCheck className="w-5 h-5 mr-2" />
              Initial Assessments ({filteredAssessments.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Review and assign permit applications for initial assessment
            </p>
          </div>
          {isManager && selectedAssessments.length > 0 && (
            <div className="flex items-center gap-2">
              <Select onValueChange={handleBulkAssign}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Assign selected to..." />
                </SelectTrigger>
                 <SelectContent>
                   {staff.map((member) => (
                     <SelectItem key={member.id} value={member.id}>
                       {member.full_name || member.email}
                       {member.staff_position === 'manager' && ' (Manager)'}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
          <div>
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search applications..."
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
                <SelectItem value="passed">Passed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="requires_clarification">Requires Clarification</SelectItem>
                <SelectItem value="forwarded_to_compliance">Forwarded to Compliance</SelectItem>
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

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setEntityFilter('all');
              }}
              className="w-full"
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Assessment List */}
        {filteredAssessments.length === 0 ? (
          <div className="text-center py-12">
            <FileCheck className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No assessments found</h3>
            <p className="text-muted-foreground">
              {assessments.length === 0 
                ? "No applications have been submitted yet."
                : "Try adjusting your filters to see more results."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAssessments.map((assessment) => {
              const assignedOfficer = staff.find(s => s.id === assessment.assessed_by);
              const isSelected = selectedAssessments.includes(assessment.id);
              console.log('Assessment assessed_by:', assessment.assessed_by, 'Assigned officer:', assignedOfficer);

              return (
                <Card 
                  key={assessment.id} 
                  className={`border-l-4 transition-all ${
                    assessment.assessment_status === 'pending' 
                      ? 'border-l-blue-500' 
                      : assessment.assessment_status === 'passed'
                      ? 'border-l-green-500'
                      : assessment.assessment_status === 'failed'
                      ? 'border-l-red-500'
                      : 'border-l-orange-500'
                  } ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {isManager && assessment.assessment_status === 'pending' && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleAssessmentSelection(assessment.id)}
                            className="mt-1 rounded border-gray-300"
                          />
                        )}
                        
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <h3 className="font-medium">
                              {assessment.permit_application?.title || `Application ${assessment.permit_application?.application_number}`}
                            </h3>
                            <Badge className={getStatusColor(assessment.assessment_status)}>
                              {assessment.assessment_status.replace(/_/g, ' ')}
                            </Badge>
                            {assessment.permit_application?.application_number && (
                              <Badge variant="outline">
                                #{assessment.permit_application.application_number}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Building className="w-4 h-4" />
                              <span>{assessment.permit_application?.entity_name || 'Unknown Entity'}</span>
                              <span className="text-xs px-1 py-0.5 bg-muted rounded">
                                {assessment.permit_application?.entity_type}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>Submitted: {new Date(assessment.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              <span>
                                {assignedOfficer ? 
                                  `Assigned to: ${assignedOfficer.full_name || assignedOfficer.email}` : 
                                  'Unassigned'
                                }
                              </span>
                            </div>
                          </div>

                          {assessment.assessment_notes && (
                            <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                              <strong>Notes:</strong> {assessment.assessment_notes}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {isManager && assessment.assessment_status === 'pending' && (
                          <Select
                            disabled={assigningTo === assessment.id}
                            onValueChange={(officerId) => handleAssignOfficer(assessment.id, officerId)}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Assign to..." />
                            </SelectTrigger>
                             <SelectContent>
                               {staff.map((member) => (
                                 <SelectItem key={member.id} value={member.id}>
                                   {member.full_name || member.email}
                                   {member.staff_position === 'manager' && ' (Manager)'}
                                 </SelectItem>
                               ))}
                            </SelectContent>
                          </Select>
                        )}
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewApplication(assessment.id)}
                          disabled={assessment.assessed_by && assessment.assessed_by !== profile?.user_id}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Review
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}