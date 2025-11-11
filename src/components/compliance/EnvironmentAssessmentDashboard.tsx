import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  User, 
  Calendar,
  Search,
  Filter,
  Upload,
  Eye,
  MessageSquare,
  XCircle,
  ArrowRight
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from '@/contexts/AuthContext';
import { useComplianceAssessments } from '@/components/compliance/hooks/useComplianceAssessments';
import { TechnicalAssessmentPanel } from './TechnicalAssessmentPanel';
import { ComplianceApplicationsList } from './ComplianceApplicationsList';


interface EnvironmentAssessmentDashboardProps {
  isManager: boolean;
}

export function EnvironmentAssessmentDashboard({ isManager }: EnvironmentAssessmentDashboardProps) {
  const { profile } = useAuth();
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Use actual data from hooks
  const { assessments, loading } = useComplianceAssessments();

  if (loading) {
    return <div className="flex justify-center p-8">Loading assessments...</div>;
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', variant: 'destructive' as const },
      in_progress: { label: 'In Progress', variant: 'default' as const },
      passed: { label: 'Passed', variant: 'default' as const },
      failed: { label: 'Failed', variant: 'destructive' as const },
      requires_clarification: { label: 'Requires Clarification', variant: 'secondary' as const }
    };
    
    return statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'outline' as const };
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const filteredAssessments = assessments.filter(assessment => {
    const matchesLevel = filterLevel === 'all' || assessment.permit_application?.permit_type === filterLevel;
    const matchesStatus = filterStatus === 'all' || assessment.assessment_status === filterStatus;
    const matchesSearch = (assessment.permit_application?.application_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (assessment.permit_application?.entity_name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchesLevel && matchesStatus && matchesSearch;
  });

  if (selectedApplication) {
    return (
      <TechnicalAssessmentPanel 
        applicationId={selectedApplication}
        onBack={() => setSelectedApplication(null)}
        isManager={isManager}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm">
              <Clock className="w-4 h-4 mr-2 text-blue-500" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {assessments.filter(a => a.assessment_status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting assignment</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm">
              <AlertCircle className="w-4 h-4 mr-2 text-yellow-500" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {assessments.filter(a => a.assessment_status === 'in_progress').length}
            </div>
            <p className="text-xs text-muted-foreground">Under review</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm">
              <CheckCircle className="w-4 h-4 mr-2 text-success" />
              Passed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {assessments.filter(a => a.assessment_status === 'passed').length}
            </div>
            <p className="text-xs text-muted-foreground">Assessment passed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm">
              <AlertCircle className="w-4 h-4 mr-2 text-destructive" />
              Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {assessments.filter(a => a.assessment_status === 'failed').length}
            </div>
            <p className="text-xs text-muted-foreground">Assessment failed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm">
              <Clock className="w-4 h-4 mr-2 text-purple-500" />
              Clarification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {assessments.filter(a => a.assessment_status === 'requires_clarification').length}
            </div>
            <p className="text-xs text-muted-foreground">Needs clarification</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm">
              <FileText className="w-4 h-4 mr-2 text-gray-500" />
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{assessments.length}</div>
            <p className="text-xs text-muted-foreground">All assessments</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest updates and actions in the compliance unit</CardDescription>
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
                    case 'in_progress':
                      return { icon: Clock, color: 'yellow' };
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
                  : assessment.assessment_status === 'in_progress'
                  ? 'Assessment In Progress'
                  : 'New Assessment';

                return (
                  <div key={assessment.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className={`p-2 rounded-full bg-${color}-100 dark:bg-${color}-950`}>
                      <Icon className={`w-5 h-5 text-${color}-600`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-medium">{activityTitle}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(assessment.updated_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Application <span className="font-medium text-foreground">
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
                        {assessment.compliance_score !== null && (
                          <Badge variant="default" className="text-xs">
                            Score: {assessment.compliance_score}
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

      <Tabs defaultValue="deadlines" className="space-y-6">
        <TabsList>
          <TabsTrigger value="deadlines">Statutory Deadlines</TabsTrigger>
          {isManager && <TabsTrigger value="assignments">Assignments</TabsTrigger>}
        </TabsList>

        <TabsContent value="deadlines">
          <div className="text-center py-8 text-muted-foreground">
            Statutory deadlines feature will be connected to real application data.
          </div>
        </TabsContent>

        {isManager && (
          <TabsContent value="assignments">
            <div className="text-center py-8 text-muted-foreground">
              Assignment panel will be connected to real application data.
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}