import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle
} from "lucide-react";

interface Application {
  id: string;
  applicationNumber: string;
  proponentName: string;
  applicationType: string;
  level: string;
  status: string;
  submissionDate: string;
  deadlineDate: string;
  assignedOfficer: string | null;
  urgency: string;
}

interface StatutoryDeadlineTrackerProps {
  applications: Application[];
}

export function StatutoryDeadlineTracker({ applications }: StatutoryDeadlineTrackerProps) {
  const getDaysUntilDeadline = (deadlineDate: string) => {
    const deadline = new Date(deadlineDate);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDeadlineStatus = (daysUntil: number) => {
    if (daysUntil < 0) return { status: 'overdue', color: 'text-destructive', bg: 'bg-destructive/10' };
    if (daysUntil <= 7) return { status: 'critical', color: 'text-destructive', bg: 'bg-destructive/10' };
    if (daysUntil <= 14) return { status: 'warning', color: 'text-warning', bg: 'bg-warning/10' };
    return { status: 'normal', color: 'text-success', bg: 'bg-success/10' };
  };

  const sortedApplications = applications
    .map(app => ({
      ...app,
      daysUntilDeadline: getDaysUntilDeadline(app.deadlineDate),
      deadlineStatus: getDeadlineStatus(getDaysUntilDeadline(app.deadlineDate))
    }))
    .sort((a, b) => a.daysUntilDeadline - b.daysUntilDeadline);

  const overdueCount = sortedApplications.filter(app => app.daysUntilDeadline < 0).length;
  const criticalCount = sortedApplications.filter(app => app.daysUntilDeadline >= 0 && app.daysUntilDeadline <= 7).length;
  const warningCount = sortedApplications.filter(app => app.daysUntilDeadline > 7 && app.daysUntilDeadline <= 14).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-destructive/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueCount}</div>
            <p className="text-xs text-muted-foreground">Past statutory deadline</p>
          </CardContent>
        </Card>
        
        <Card className="border-destructive/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical (≤7 days)</CardTitle>
            <Clock className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{criticalCount}</div>
            <p className="text-xs text-muted-foreground">Immediate attention required</p>
          </CardContent>
        </Card>
        
        <Card className="border-warning/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warning (≤14 days)</CardTitle>
            <Calendar className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{warningCount}</div>
            <p className="text-xs text-muted-foreground">Monitor closely</p>
          </CardContent>
        </Card>
      </div>

      {/* Deadline List */}
      <Card>
        <CardHeader>
          <CardTitle>Statutory Deadlines</CardTitle>
          <CardDescription>All applications sorted by deadline urgency</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedApplications.map((application) => (
              <div 
                key={application.id} 
                className={`p-4 border rounded-lg ${application.deadlineStatus.bg} border-l-4 ${
                  application.deadlineStatus.status === 'overdue' ? 'border-l-red-500' :
                  application.deadlineStatus.status === 'critical' ? 'border-l-red-400' :
                  application.deadlineStatus.status === 'warning' ? 'border-l-yellow-400' :
                  'border-l-green-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{application.applicationNumber}</h4>
                      <Badge variant="outline">Level {application.level}</Badge>
                      {application.deadlineStatus.status === 'overdue' && (
                        <Badge variant="destructive">OVERDUE</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {application.proponentName} • {application.applicationType}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span>Deadline: {application.deadlineDate}</span>
                      <span className={application.deadlineStatus.color}>
                        {application.daysUntilDeadline < 0 
                          ? `${Math.abs(application.daysUntilDeadline)} days overdue`
                          : `${application.daysUntilDeadline} days remaining`
                        }
                      </span>
                      {application.assignedOfficer && (
                        <span>Officer: {application.assignedOfficer}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {application.deadlineStatus.status === 'overdue' && (
                      <Button variant="destructive" size="sm">
                        Escalate
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}