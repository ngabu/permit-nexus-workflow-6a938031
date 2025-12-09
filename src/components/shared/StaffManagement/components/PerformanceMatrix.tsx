import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Clock, Target, AlertTriangle, CheckCircle, Award } from 'lucide-react';
import { StaffPerformanceMetrics } from '../types';

interface PerformanceMatrixProps {
  metrics: StaffPerformanceMetrics[];
  overallMetrics: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    inProgressTasks: number;
    overdueTasks: number;
    completionRate: number;
  };
}

export function PerformanceMatrix({ metrics, overallMetrics }: PerformanceMatrixProps) {
  const getPerformanceLevel = (rate: number): { label: string; color: string } => {
    if (rate >= 90) return { label: 'Excellent', color: 'text-green-600 bg-green-100 dark:bg-green-950' };
    if (rate >= 75) return { label: 'Good', color: 'text-blue-600 bg-blue-100 dark:bg-blue-950' };
    if (rate >= 50) return { label: 'Average', color: 'text-amber-600 bg-amber-100 dark:bg-amber-950' };
    return { label: 'Needs Improvement', color: 'text-destructive bg-destructive/10' };
  };

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Total Tasks</span>
            </div>
            <p className="text-2xl font-bold mt-1">{overallMetrics.totalTasks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Completed</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-green-600">{overallMetrics.completedTasks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-muted-foreground">Pending</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-amber-600">{overallMetrics.pendingTasks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-muted-foreground">In Progress</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-blue-600">{overallMetrics.inProgressTasks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-muted-foreground">Overdue</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-destructive">{overallMetrics.overdueTasks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Completion</span>
            </div>
            <p className="text-2xl font-bold mt-1">{overallMetrics.completionRate.toFixed(0)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Individual Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Staff Performance Matrix
          </CardTitle>
          <CardDescription>
            Individual performance metrics for all team members
          </CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No performance data available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">Staff Member</th>
                    <th className="pb-3 font-medium text-center hidden sm:table-cell">Total</th>
                    <th className="pb-3 font-medium text-center hidden sm:table-cell">Completed</th>
                    <th className="pb-3 font-medium text-center hidden md:table-cell">In Progress</th>
                    <th className="pb-3 font-medium text-center hidden md:table-cell">Overdue</th>
                    <th className="pb-3 font-medium text-center">Completion Rate</th>
                    <th className="pb-3 font-medium text-center hidden lg:table-cell">On-Time Rate</th>
                    <th className="pb-3 font-medium text-center hidden lg:table-cell">Avg. Days</th>
                    <th className="pb-3 font-medium text-center">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((m, idx) => {
                    const performance = getPerformanceLevel(m.completionRate);
                    return (
                      <tr key={m.staffId} className="border-b last:border-0">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            {idx === 0 && m.completionRate > 0 && (
                              <Award className="h-4 w-4 text-amber-500" />
                            )}
                            <span className="font-medium truncate max-w-[150px]">{m.staffName}</span>
                          </div>
                        </td>
                        <td className="py-3 text-center hidden sm:table-cell">{m.totalTasks}</td>
                        <td className="py-3 text-center text-green-600 hidden sm:table-cell">{m.completedTasks}</td>
                        <td className="py-3 text-center text-blue-600 hidden md:table-cell">{m.inProgressTasks}</td>
                        <td className="py-3 text-center text-destructive hidden md:table-cell">{m.overdueTasks}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <Progress value={m.completionRate} className="h-2 flex-1" />
                            <span className="text-sm w-12 text-right">{m.completionRate.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="py-3 text-center hidden lg:table-cell">
                          <span className={m.onTimeRate >= 80 ? 'text-green-600' : m.onTimeRate >= 50 ? 'text-amber-600' : 'text-destructive'}>
                            {m.onTimeRate.toFixed(0)}%
                          </span>
                        </td>
                        <td className="py-3 text-center hidden lg:table-cell">{m.avgCompletionTime}</td>
                        <td className="py-3 text-center">
                          <Badge className={performance.color}>{performance.label}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
