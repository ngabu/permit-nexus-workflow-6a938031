import { useMemo } from 'react';
import { UnitTask, StaffMember, StaffPerformanceMetrics } from '../types';
import { differenceInDays } from 'date-fns';

export function usePerformanceMetrics(tasks: UnitTask[], staff: StaffMember[]) {
  const metrics = useMemo((): StaffPerformanceMetrics[] => {
    return staff.map(member => {
      const memberTasks = tasks.filter(t => t.assigned_to === member.id);
      const completedTasks = memberTasks.filter(t => t.status === 'completed');
      const pendingTasks = memberTasks.filter(t => t.status === 'pending');
      const inProgressTasks = memberTasks.filter(t => t.status === 'in_progress');
      const overdueTasks = memberTasks.filter(t => t.status === 'overdue');
      
      // Calculate average completion time
      const completedWithDates = completedTasks.filter(t => t.completed_at && t.created_at);
      const avgCompletionTime = completedWithDates.length > 0
        ? completedWithDates.reduce((sum, t) => {
            const days = differenceInDays(new Date(t.completed_at!), new Date(t.created_at));
            return sum + Math.max(days, 0);
          }, 0) / completedWithDates.length
        : 0;
      
      // Calculate on-time rate (completed before or on due date)
      const completedWithDueDates = completedTasks.filter(t => t.due_date && t.completed_at);
      const onTimeCompleted = completedWithDueDates.filter(t => 
        new Date(t.completed_at!) <= new Date(t.due_date!)
      ).length;
      const onTimeRate = completedWithDueDates.length > 0
        ? (onTimeCompleted / completedWithDueDates.length) * 100
        : 100;

      return {
        staffId: member.id,
        staffName: member.full_name || member.email,
        totalTasks: memberTasks.length,
        completedTasks: completedTasks.length,
        pendingTasks: pendingTasks.length,
        inProgressTasks: inProgressTasks.length,
        overdueTasks: overdueTasks.length,
        completionRate: memberTasks.length > 0 
          ? (completedTasks.length / memberTasks.length) * 100 
          : 0,
        avgCompletionTime: Math.round(avgCompletionTime * 10) / 10,
        onTimeRate: Math.round(onTimeRate * 10) / 10,
      };
    }).sort((a, b) => b.completionRate - a.completionRate);
  }, [tasks, staff]);

  const overallMetrics = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const overdueTasks = tasks.filter(t => t.status === 'overdue').length;

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      overdueTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
    };
  }, [tasks]);

  return { metrics, overallMetrics };
}
