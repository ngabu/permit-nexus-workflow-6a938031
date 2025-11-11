import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, MapPin, Clock, FileText, Plus, Edit, Search, Filter, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Application {
  id: string;
  title: string;
  permit_type: string;
  status: string;
  permit_number?: string;
  application_date?: string;
  approval_date?: string;
  created_at: string;
  updated_at: string;
  entity_id?: string;
  description?: string;
  entities?: {
    id: string;
    name: string;
    entity_type: string;
    contact_person?: string;
  };
}

interface Activity {
  id: string;
  permit_id: string;
  activity_type: string;
  status: string;
  details?: any;
  created_at: string;
  updated_at: string;
}

export function MyApplicationsTabs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch applications with entity information
      const { data: appsData, error: appsError } = await (supabase as any)
        .from('permit_applications')
        .select(`
          id,
          title,
          permit_type,
          status,
          permit_number,
          application_date,
          approval_date,
          created_at,
          updated_at,
          entity_id,
          description,
          entities (
            id,
            name,
            entity_type,
            contact_person
          )
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (appsError) throw appsError;

      // Fetch activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('permit_activities')
        .select('*')
        .in('permit_id', appsData?.map(app => app.id) || [])
        .order('updated_at', { ascending: false });

      if (activitiesError) throw activitiesError;

      setApplications(appsData || []);
      setActivities(activitiesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under_initial_review': return 'bg-yellow-100 text-yellow-800';
      case 'under_technical_review': return 'bg-orange-100 text-orange-800';
      case 'requires_clarification': return 'bg-amber-100 text-amber-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleDeleteApplication = async (applicationId: string, status: string) => {
    if (!user) return;
    
    try {
      setDeleteLoading(applicationId);
      
      // Allow deletion of drafts, rejected, or requires_clarification applications
      const allowedStatuses = ['draft', 'rejected', 'requires_clarification'];
      if (!allowedStatuses.includes(status)) {
        throw new Error('Cannot delete application in current status');
      }
      
      // Delete application and cascade to related records
      const { error } = await supabase
        .from('permit_applications')
        .delete()
        .eq('id', applicationId)
        .eq('user_id', user.id)
        .in('status', allowedStatuses);
      
      if (error) throw error;
      
      // Refresh the data
      await fetchData();
      
      toast({
        title: "Application deleted",
        description: "Application has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting application:', error);
      toast({
        title: "Error",
        description: "Failed to delete application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEditApplication = (applicationId: string) => {
    // Navigate to edit mode for the application
    window.location.href = `/submit-application?edit=${applicationId}`;
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.permit_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (app.permit_number && app.permit_number.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.activity_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || activity.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <Tabs defaultValue="applications" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="applications">Applications ({applications.length})</TabsTrigger>
        <TabsTrigger value="permits">Active Permits ({applications.filter(a => a.status === 'approved').length})</TabsTrigger>
        <TabsTrigger value="activities">Activities ({activities.length})</TabsTrigger>
      </TabsList>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 my-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="under_initial_review">Under Initial Review</SelectItem>
            <SelectItem value="under_technical_review">Under Technical Review</SelectItem>
            <SelectItem value="requires_clarification">Requires Clarification</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <TabsContent value="applications" className="space-y-4">
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications found</h3>
              <p className="text-gray-600 text-center mb-4">
                {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search or filter criteria.' : 'You haven\'t submitted any permit applications yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map((application) => (
            <Card key={application.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{application.title}</CardTitle>
                    <CardDescription className="flex items-center mt-2">
                      <span className="font-medium">{application.permit_number || 'Draft'}</span>
                      {/* Display entity information based on entity relationship */}
                      {application.entities ? (
                        <>
                          <span className="mx-2">•</span>
                          <span className="font-medium text-foreground">
                            {application.entities.entity_type === 'INDIVIDUAL' 
                              ? application.entities.name 
                              : application.entities.name}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2">
                            ({application.entities.entity_type?.toUpperCase()})
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="mx-2">•</span>
                          <span className="text-orange-600">No Entity Selected</span>
                        </>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(application.status)}>
                      {formatStatus(application.status)}
                    </Badge>
                    {(application.status === 'draft' || application.status === 'requires_clarification') && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => handleEditApplication(application.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {(['draft', 'rejected', 'requires_clarification'].includes(application.status)) && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={deleteLoading === application.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Application</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this application? This action cannot be undone and will remove all associated data.
                              {application.status === 'requires_clarification' && 
                                " You can also edit the application to address the feedback instead of deleting it."
                              }
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteApplication(application.id, application.status)}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={deleteLoading === application.id}
                            >
                              {deleteLoading === application.id ? 'Deleting...' : 'Delete'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <CalendarDays className="h-4 w-4" />
                    <span>Created: {new Date(application.created_at).toLocaleDateString()}</span>
                  </div>
                  {application.application_date && (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Applied: {new Date(application.application_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Type: {application.permit_type.replace('_', ' ')}</span>
                  </div>
                </div>
                {application.description && (
                  <p className="text-sm text-gray-600 mt-3 p-3 bg-gray-50 rounded-lg">
                    {application.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>

      <TabsContent value="permits" className="space-y-4">
        {filteredApplications.filter(app => app.status === 'approved').length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">No active permits</h3>
              <p className="text-muted-foreground text-center">
                You don't have any approved permits yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredApplications.filter(app => app.status === 'approved').map((permit) => (
            <Card key={permit.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{permit.title}</CardTitle>
                    <CardDescription className="flex items-center mt-2">
                      <span className="font-medium text-green-600">{permit.permit_number}</span>
                      {/* Display entity information based on entity relationship */}
                      {permit.entities ? (
                        <>
                          <span className="mx-2">•</span>
                          <span className="font-medium text-foreground">
                            {permit.entities.entity_type === 'INDIVIDUAL' 
                              ? permit.entities.name 
                              : permit.entities.name}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2">
                            ({permit.entities.entity_type?.toUpperCase()})
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="mx-2">•</span>
                          <span className="text-orange-600">No Entity Selected</span>
                        </>
                      )}
                    </CardDescription>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active Permit</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <CalendarDays className="h-4 w-4" />
                    <span>Approved: {permit.approval_date ? new Date(permit.approval_date).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Type: {permit.permit_type.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Last Updated: {new Date(permit.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>

      <TabsContent value="activities" className="space-y-4">
        {filteredActivities.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">No activities found</h3>
              <p className="text-muted-foreground text-center">
                No permit activities recorded yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredActivities.map((activity) => (
            <Card key={activity.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{activity.activity_type}</CardTitle>
                    <CardDescription className="mt-2">
                      Permit Activity
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(activity.status)}>
                    {formatStatus(activity.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <CalendarDays className="h-4 w-4" />
                    <span>Created: {new Date(activity.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Updated: {new Date(activity.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
                {activity.details && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                      {JSON.stringify(activity.details, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>
    </Tabs>
  );
}