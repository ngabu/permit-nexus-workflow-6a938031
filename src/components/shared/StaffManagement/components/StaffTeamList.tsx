import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, UserCheck, UserX, Mail, Plus, Briefcase } from 'lucide-react';
import { StaffMember, UnitTask } from '../types';

interface StaffTeamListProps {
  staff: StaffMember[];
  tasks: UnitTask[];
  isManager: boolean;
  onToggleStatus: (staffId: string, newStatus: boolean) => Promise<void>;
  onAssignTask: (staffId: string) => void;
}

export function StaffTeamList({ staff, tasks, isManager, onToggleStatus, onAssignTask }: StaffTeamListProps) {
  const getStaffWorkload = (staffId: string) => {
    const staffTasks = tasks.filter(t => t.assigned_to === staffId);
    return {
      total: staffTasks.length,
      pending: staffTasks.filter(t => t.status === 'pending').length,
      inProgress: staffTasks.filter(t => t.status === 'in_progress').length,
      overdue: staffTasks.filter(t => t.status === 'overdue').length,
    };
  };

  const officers = staff.filter(s => s.staff_position === 'officer' || s.staff_position === 'manager');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Members
        </CardTitle>
        <CardDescription>
          {officers.length} team member{officers.length !== 1 ? 's' : ''} in your unit
        </CardDescription>
      </CardHeader>
      <CardContent>
        {officers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No team members found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {officers.map((member) => {
              const workload = getStaffWorkload(member.id);
              return (
                <div
                  key={member.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      member.is_active ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      {member.is_active ? (
                        <UserCheck className="h-5 w-5 text-primary" />
                      ) : (
                        <UserX className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium truncate">{member.full_name || 'No name'}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pl-13 sm:pl-0">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      {member.staff_position || 'Staff'}
                    </Badge>
                    
                    <Badge variant={workload.overdue > 0 ? 'destructive' : workload.total > 5 ? 'secondary' : 'default'}>
                      {workload.total} task{workload.total !== 1 ? 's' : ''}
                    </Badge>

                    {workload.overdue > 0 && (
                      <Badge variant="destructive">
                        {workload.overdue} overdue
                      </Badge>
                    )}

                    <Badge variant={member.is_active ? 'default' : 'outline'}>
                      {member.is_active ? 'Active' : 'Suspended'}
                    </Badge>

                    {isManager && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onAssignTask(member.id)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Assign
                        </Button>
                        <Button
                          size="sm"
                          variant={member.is_active ? 'ghost' : 'default'}
                          onClick={() => onToggleStatus(member.id, !member.is_active)}
                        >
                          {member.is_active ? 'Suspend' : 'Activate'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
