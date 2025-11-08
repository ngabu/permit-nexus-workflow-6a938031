import { useState, useMemo } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { RegistrySidebar } from "@/components/registry/RegistrySidebar";
import { InitialAssessmentsList } from "@/components/registry/InitialAssessmentsList";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AllocationDialog } from "@/components/shared/AllocationDialog";
import { FileText, Clock, CheckCircle, Users, AlertCircle, Plus, UserCheck, ClipboardList, ArrowRight, FileCheck, XCircle, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useRegistryStaff } from "@/components/registry/hooks/useRegistryStaff";
import { useInitialAssessments } from "@/components/registry/hooks/useInitialAssessments";
import { TeamManagement } from "@/components/registry/TeamManagement";
import { ProfileSettings } from "@/components/public/ProfileSettings";
import { AppSettings } from "@/components/public/AppSettings";
import RegistryReports from "@/components/registry/RegistryReports";
import { IntentApplicationReview } from "@/components/registry/IntentApplicationReview";
import { PermitApplicationsList } from "@/components/registry/PermitApplicationsList";

const RegistryDashboard = () => {
  const { profile } = useAuth();
  const { assessments, loading } = useInitialAssessments();
  const { staff } = useRegistryStaff();
  const [allocationDialogOpen, setAllocationDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const isManager = profile?.staff_position && ['manager', 'director', 'managing_director'].includes(profile.staff_position);

  // Memoize stats calculation to avoid re-computing on every render
  const stats = useMemo(() => {
    const pending = assessments.filter(a => a.assessment_status === 'pending').length;
    const passed = assessments.filter(a => a.assessment_status === 'passed').length;
    const failed = assessments.filter(a => a.assessment_status === 'failed').length;
    const clarification = assessments.filter(a => a.assessment_status === 'requires_clarification').length;
    
    return {
      pendingAssessments: pending,
      passedAssessments: passed,
      failedAssessments: failed,
      clarificationAssessments: clarification,
      forwardedAssessments: 0, // No forwarded status in current schema
      totalAssessments: assessments.length
    };
  }, [assessments]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <RegistrySidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b border-sidebar-border bg-background p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-sidebar-accent" />
                <div>
                  <h1 className="text-3xl font-bold text-card-foreground">
                    Registry {isManager ? 'Management' : 'Unit'} Dashboard
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isManager 
                      ? 'Manage permit assessments and allocate work to registry officers'
                      : 'Conduct initial permit assessments and reviews'
                    }
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="px-4 py-2">
                <UserCheck className="w-4 h-4 mr-2" />
                Registry {isManager ? 'Manager' : 'Officer'}
              </Badge>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Status-based Stats */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-sm text-card-foreground">
                <Clock className="w-4 h-4 mr-2 text-blue-500" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.pendingAssessments}</div>
              <p className="text-xs text-muted-foreground">Awaiting assessment</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-sm text-card-foreground">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                Passed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.passedAssessments}</div>
              <p className="text-xs text-muted-foreground">Assessment passed</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-sm text-card-foreground">
                <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
                Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.failedAssessments}</div>
              <p className="text-xs text-muted-foreground">Assessment failed</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-sm text-card-foreground">
                <Clock className="w-4 h-4 mr-2 text-amber-500" />
                Clarification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats.clarificationAssessments}</div>
              <p className="text-xs text-muted-foreground">Needs clarification</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-sm text-card-foreground">
                <Users className="w-4 h-4 mr-2 text-purple-500" />
                Forwarded
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.forwardedAssessments}</div>
              <p className="text-xs text-muted-foreground">To compliance</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-sm text-card-foreground">
                <ClipboardList className="w-4 h-4 mr-2 text-gray-500" />
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.totalAssessments}</div>
              <p className="text-xs text-muted-foreground">All assessments</p>
            </CardContent>
          </Card>
                 </div>

                 {/* Recent Activities */}
                 <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-card-foreground">Recent Activities</CardTitle>
                        <CardDescription className="text-muted-foreground">Latest updates and actions in the registry unit</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {loading ? (
                        <div className="text-center py-8 text-muted-foreground">Loading activities...</div>
                      ) : assessments.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No recent activities</div>
                      ) : (
                        assessments.slice(0, 6).map((assessment) => {
                          const getActivityIcon = () => {
                            switch (assessment.assessment_status) {
                              case 'passed':
                                return { icon: CheckCircle, color: 'green' };
                              case 'failed':
                                return { icon: XCircle, color: 'red' };
                              case 'requires_clarification':
                                return { icon: AlertCircle, color: 'amber' };
                              default:
                                return { icon: Clock, color: 'blue' };
                            }
                          };

                          const { icon: Icon, color } = getActivityIcon();
                          const activityTitle = assessment.assessment_status === 'passed' 
                            ? 'Assessment Approved'
                            : assessment.assessment_status === 'failed'
                            ? 'Assessment Failed'
                            : assessment.assessment_status === 'requires_clarification'
                            ? 'Clarification Required'
                            : 'New Assessment';

                           return (
                            <div key={assessment.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                              <div className={`p-2 rounded-full bg-${color}-100 dark:bg-${color}-950`}>
                                <Icon className={`w-5 h-5 text-${color}-600`} />
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                  <p className="font-medium text-card-foreground">{activityTitle}</p>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(assessment.updated_at), { addSuffix: true })}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Application <span className="font-medium text-card-foreground">
                                    {assessment.permit_application?.application_number || assessment.permit_application?.title || 'N/A'}
                                  </span> {assessment.assessment_notes}
                                </p>
                                <div className="flex gap-2 mt-2">
                                  {assessment.permit_application?.permit_type && (
                                    <Badge variant="secondary" className="text-xs">
                                      {assessment.permit_application.permit_type}
                                    </Badge>
                                  )}
                                  {assessment.permit_application?.entity_name && (
                                    <Badge variant="outline" className="text-xs">
                                      {assessment.permit_application.entity_name}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Allocation Dialog */}
                <AllocationDialog
                  open={allocationDialogOpen}
                  onOpenChange={setAllocationDialogOpen}
                  staffUnit="registry"
                />
              </div>
            )}

            {activeTab === 'assessments' && <InitialAssessmentsList />}
            {activeTab === 'intent-reviews' && <IntentApplicationReview />}
            {activeTab === 'permit-reviews' && <PermitApplicationsList />}
            {activeTab === 'reports' && <RegistryReports />}
            {activeTab === 'team' && isManager && <TeamManagement />}
            {activeTab === 'profile' && <ProfileSettings />}
            {activeTab === 'settings' && <AppSettings />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default RegistryDashboard;