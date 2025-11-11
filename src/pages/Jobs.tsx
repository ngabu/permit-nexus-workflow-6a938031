import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, FileText, User, Building, Calculator } from "lucide-react";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { FeeCalculationCard } from "@/components/fee-calculation/FeeCalculationCard";
import { useFeeCalculation } from "@/hooks/useFeeCalculation";
import { ActivityClassificationDisplay } from "@/components/registry/read-only/ActivityClassificationDisplay";

interface JobApplication {
  id: string;
  permit_type: string;
  status: string;
  title: string;
  application_date: string;
  entity_name: string;
  entity_type: string;
  assigned_officer_id: string | null;
  assigned_officer_name: string | null;
  assigned_officer_email: string | null;
  activity_classification?: string;
  activity_level?: string;
  fee_category?: string;
}

const Jobs = () => {
  const { profile } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedApplications, setExpandedApplications] = useState<Set<string>>(new Set());
  const { calculateFees } = useFeeCalculation();

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.operational_unit, profile?.role, profile?.id]);

  const toggleApplicationExpansion = (applicationId: string) => {
    setExpandedApplications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(applicationId)) {
        newSet.delete(applicationId);
      } else {
        newSet.add(applicationId);
      }
      return newSet;
    });
  };

  const fetchApplications = async () => {
    try {
      let query = (supabase as any)
        .from('permit_applications')
        .select(`
          *
        `)
        .order('application_date', { ascending: false });

      if (profile?.operational_unit === 'registry' || profile?.operational_unit === 'compliance' || profile?.operational_unit === 'revenue') {
        query = query.or(`assigned_officer_id.eq.${profile.id},assigned_officer_id.is.null`);
      } else if (profile?.role !== 'admin') {
        query = query.eq('status', 'pending');
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Transform data to include activity classification from details
      const transformedData = (data as any)?.map((app: any) => ({
        ...app,
        activity_classification: app.activity_classification || 'other',
        fee_category: 'Green Category' // Default category
      })) || [];
      
      setApplications(transformedData as any);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "Failed to load job applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const assignToSelf = async (applicationId: string) => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('permit_applications' as any)
        .update({
          status: 'under_review'
        })
        .eq('id', applicationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Application assigned to you successfully!",
      });

      fetchApplications();
    } catch (error) {
      console.error('Error assigning application:', error);
      toast({
        title: "Error",
        description: "Failed to assign application",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'under_review':
        return <Badge className="bg-blue-100 text-blue-800">Under Review</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityColor = (status: string, applicationDate: string) => {
    const daysOld = Math.floor((Date.now() - new Date(applicationDate).getTime()) / (1000 * 60 * 60 * 24));
    
    if (status === 'pending' && daysOld > 30) return 'border-red-200 bg-red-50';
    if (status === 'pending' && daysOld > 14) return 'border-orange-200 bg-orange-50';
    return 'border-gray-200';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading applications...</div>
        </div>
      </DashboardLayout>
    );
  }

  const canAssignApplications = profile?.operational_unit === 'registry' || profile?.operational_unit === 'compliance' || profile?.role === 'admin';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Queue</h1>
          <p className="text-gray-600">
            {canAssignApplications 
              ? "Review and assign permit applications for processing"
              : "View your submitted permit applications and their status"
            }
          </p>
        </div>

        <div className="grid gap-4">
          {applications.map((application) => {
            const isExpanded = expandedApplications.has(application.id);
            const calculatedFees = application.activity_classification && application.permit_type
              ? calculateFees(application.activity_classification, 'new', application.fee_category || 'Green Category')
              : null;

            return (
              <Card 
                key={application.id} 
                className={`transition-all hover:shadow-md ${getPriorityColor(application.status, application.application_date)}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{application.title}</CardTitle>
                      <CardDescription className="flex items-center space-x-4 text-sm">
                        <span className="flex items-center">
                          <FileText className="w-4 h-4 mr-1" />
                          {application.permit_type}
                        </span>
                        <span className="flex items-center">
                          <Building className="w-4 h-4 mr-1" />
                          {application.entity_name}
                        </span>
                        {application.activity_classification && (
                          <ActivityClassificationDisplay 
                            activityId={application.activity_classification}
                            activityLevel={application.activity_level}
                            getLevelColor={(level: string) => {
                              const colors = {
                                'Level 1': 'bg-green-100 text-green-800',
                                'Level 2': 'bg-yellow-100 text-yellow-800',
                                'Level 3': 'bg-red-100 text-red-800'
                              };
                              return colors[level] || 'bg-gray-100 text-gray-800';
                            }}
                          />
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(application.status)}
                      {calculatedFees && (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Fee: {new Intl.NumberFormat('en-PG', {
                            style: 'currency',
                            currency: 'PGK'
                          }).format(calculatedFees.totalFee)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <div>
                        <p className="font-medium">Applied</p>
                        <p>{new Date(application.application_date).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <div>
                        <p className="font-medium">Days Active</p>
                        <p>{Math.floor((Date.now() - new Date(application.application_date).getTime()) / (1000 * 60 * 60 * 24))} days</p>
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-2" />
                      <div>
                        <p className="font-medium">Assigned Officer</p>
                        <p>{application.assigned_officer_name || 'Unassigned'}</p>
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Building className="w-4 h-4 mr-2" />
                      <div>
                        <p className="font-medium">Entity Type</p>
                        <p className="capitalize">{application.entity_type}</p>
                      </div>
                    </div>
                  </div>

                  {application.status === 'rejected' && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800 font-medium">Rejection Reason:</p>
                      <p className="text-sm text-red-700">
                        Rejection reason not available in current schema
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Application ID: {application.id.slice(0, 8)}...
                    </div>
                    <div className="flex space-x-2">
                      {canAssignApplications && !application.assigned_officer_id && application.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => assignToSelf(application.id)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Assign to Me
                        </Button>
                      )}
                      {calculatedFees && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleApplicationExpansion(application.id)}
                        >
                          {isExpanded ? 'Hide Fees' : 'Show Fees'}
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>

                  {/* Fee Calculation Display */}
                  {isExpanded && calculatedFees && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <FeeCalculationCard
                        fees={calculatedFees}
                        activityType={application.activity_classification}
                        permitType="new"
                        feeCategory={application.fee_category || 'Green Category'}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {applications.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
                <p className="text-gray-600">
                  {canAssignApplications 
                    ? "There are no permit applications in the queue at the moment."
                    : "You haven't submitted any permit applications yet."
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Jobs;
