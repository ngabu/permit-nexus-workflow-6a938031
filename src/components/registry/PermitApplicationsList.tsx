import { useState } from 'react';
import { usePermitApplications } from '@/hooks/usePermitApplications';
import { useRegistryStaff } from './hooks/useRegistryStaff';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Calendar, User, Building, ExternalLink, Clock, Search, Filter, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export function PermitApplicationsList() {
  const { applications, loading, assignOfficer, refetch } = usePermitApplications();
  const { staff } = useRegistryStaff();
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');
  const [assignmentFilter, setAssignmentFilter] = useState('all');
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [assigningTo, setAssigningTo] = useState<string | null>(null);

  const isManager = profile?.staff_position && ['manager', 'director', 'managing_director'].includes(profile.staff_position);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'under_initial_review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'under_review':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'requires_clarification':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const handleViewApplication = (applicationId: string) => {
    navigate(`/registry/applications/${applicationId}`);
  };

  const handleAssignOfficer = async (applicationId: string, officerId: string) => {
    try {
      setAssigningTo(applicationId);
      
      const result = await assignOfficer(applicationId, officerId);
      
      if (result.success) {
        toast({
          title: "Application Assigned",
          description: "The application has been successfully assigned to the officer.",
        });
        refetch();
      } else {
        throw new Error('Assignment failed');
      }
    } catch (error) {
      console.error('Error assigning application:', error);
      toast({
        title: "Assignment Failed",
        description: "There was an error assigning the application.",
        variant: "destructive",
      });
    } finally {
      setAssigningTo(null);
    }
  };

  const handleBulkAssign = async (officerId: string) => {
    if (selectedApplications.length === 0) {
      toast({
        title: "No Applications Selected",
        description: "Please select applications to assign.",
        variant: "destructive",
      });
      return;
    }

    try {
      const promises = selectedApplications.map(applicationId => 
        assignOfficer(applicationId, officerId)
      );

      const results = await Promise.all(promises);
      const successCount = results.filter(r => r.success).length;

      toast({
        title: "Applications Assigned",
        description: `Successfully assigned ${successCount} of ${selectedApplications.length} applications.`,
      });

      setSelectedApplications([]);
      refetch();
    } catch (error) {
      console.error('Error bulk assigning applications:', error);
      toast({
        title: "Assignment Failed",
        description: "There was an error assigning the applications.",
        variant: "destructive",
      });
    }
  };

  const toggleApplicationSelection = (applicationId: string) => {
    setSelectedApplications(prev => 
      prev.includes(applicationId) 
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  const filteredApplications = applications.filter(application => {
    // For managers on registry dashboard, only show submitted applications for assignment
    if (isManager) {
      if (application.status !== 'submitted') {
        return false;
      }
    }
    
    const matchesSearch = !searchTerm || 
      application.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.entity?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.permit_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || application.status === statusFilter;
    
    const matchesEntity = entityFilter === 'all' || application.entity?.entity_type === entityFilter;

    const matchesAssignment = assignmentFilter === 'all' || 
      (assignmentFilter === 'assigned' && application.assigned_officer) ||
      (assignmentFilter === 'unassigned' && !application.assigned_officer);

    return matchesSearch && matchesStatus && matchesEntity && matchesAssignment;
  });

  const entityTypes = [...new Set(applications.map(a => a.entity?.entity_type).filter(Boolean))];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex justify-center items-center">
            <Clock className="w-6 h-6 mr-2 animate-spin" />
            Loading permit applications...
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
              <FileText className="w-5 h-5 mr-2" />
              {isManager ? 'Permit Applications for Assignment' : 'My Assigned Applications'} ({filteredApplications.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {isManager 
                ? "Assign permit applications to registry officers for initial review"
                : "Review and process your assigned permit applications"
              }
            </p>
          </div>
          {isManager && selectedApplications.length > 0 && (
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
                onClick={() => setSelectedApplications([])}
              >
                Clear ({selectedApplications.length})
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
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="under_initial_review">Under Initial Review</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
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
                  <SelectValue placeholder="All applications" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Applications</SelectItem>
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

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No applications found</h3>
            <p className="text-muted-foreground">
              {applications.length === 0 
                ? "No applications have been submitted yet."
                : "Try adjusting your filters to see more results."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApplications.map((application) => {
              const assignedOfficer = application.assigned_officer || staff.find(s => s.id === application.assigned_officer?.id);
              const isSelected = selectedApplications.includes(application.id);
              const canAssign = isManager && (!application.assigned_officer || application.status === 'submitted');

              return (
                <Card 
                  key={application.id} 
                  className={`border-l-4 transition-all ${
                    application.status === 'submitted' 
                      ? 'border-l-blue-500' 
                      : application.status === 'approved'
                      ? 'border-l-green-500'
                      : application.status === 'rejected'
                      ? 'border-l-red-500'
                      : 'border-l-orange-500'
                  } ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {canAssign && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleApplicationSelection(application.id)}
                            className="mt-1 rounded border-gray-300"
                          />
                        )}
                        
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <h3 className="font-medium">
                              {application.title || `Application ${application.permit_number}`}
                            </h3>
                            <Badge className={getStatusColor(application.status)}>
                              {application.status.replace(/_/g, ' ')}
                            </Badge>
                            {application.permit_number && (
                              <Badge variant="outline">
                                #{application.permit_number}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Building className="w-4 h-4" />
                              <span>{application.entity?.name || 'Unknown Entity'}</span>
                              <span className="text-xs px-1 py-0.5 bg-muted rounded">
                                {application.entity?.entity_type}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>Submitted: {new Date(application.created_at).toLocaleDateString()}</span>
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

                          {application.details?.proposed_works_description && (
                            <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                              <strong>Description:</strong> {application.details.proposed_works_description}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {canAssign && (
                          <Select
                            disabled={assigningTo === application.id}
                            onValueChange={(officerId) => handleAssignOfficer(application.id, officerId)}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Assign to..." />
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
                          onClick={() => handleViewApplication(application.id)}
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