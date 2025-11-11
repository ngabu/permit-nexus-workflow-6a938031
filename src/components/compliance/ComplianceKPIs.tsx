import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useComplianceAssessments } from './hooks/useComplianceAssessments';
import { usePermitApplications } from './hooks/usePermitApplications';
import { 
  FileCheck, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  UserCheck,
  TrendingUp,
  Calendar,
  Target
} from 'lucide-react';

export function ComplianceKPIs() {
  const { assessments, loading: assessmentsLoading } = useComplianceAssessments();
  const { applications, loading: applicationsLoading } = usePermitApplications();

  if (assessmentsLoading || applicationsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }, (_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const pendingAssessments = assessments.filter(a => a.assessment_status === 'pending');
  const inProgressAssessments = assessments.filter(a => a.assessment_status === 'in_progress');
  const completedAssessments = assessments.filter(a => a.assessment_status === 'completed');
  const overdueAssessments = assessments.filter(a => {
    if (!a.next_review_date) return false;
    return new Date(a.next_review_date) < new Date() && a.assessment_status !== 'completed';
  });

  const kpis = [
    {
      title: 'Pending Assessments',
      value: pendingAssessments.length,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'In Progress',
      value: inProgressAssessments.length,
      icon: UserCheck,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Completed',
      value: completedAssessments.length,
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Overdue',
      value: overdueAssessments.length,
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {kpi.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${kpi.bgColor}`}>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${kpi.color}`}>
              {kpi.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}