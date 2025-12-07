import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, UserCheck, Mail, ClipboardList, Play, Pause, CheckCircle, Clock, AlertTriangle, Trash2 } from 'lucide-react';
import { useComplianceStaff } from './hooks/useComplianceStaff';
import { useComplianceAssessments } from './hooks/useComplianceAssessments';
import { useComplianceTasks } from './hooks/useComplianceTasks';
import { AssignTaskDialog } from './AssignTaskDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ComplianceStaff {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  operational_unit: string | null;
  staff_position: string | null;
  is_active: boolean | null;
  created_at: string | null;
}

export function TeamManagement() {
  const { staff, refetch: refetchStaff } = useComplianceStaff();
  const { assessments } = useComplianceAssessments();
  const { tasks, createTask, updateTask, deleteTask, loading: tasksLoading } = useComplianceTasks();
  const { profile } = useAuth();
  
  const [selectedOfficer, setSelectedOfficer] = useState<ComplianceStaff | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [updatingOfficer, setUpdatingOfficer] = useState<string | null>(null);

  const isManager = profile?.staff_position === 'manager' || profile?.staff_position === 'director' || profile?.user_type === 'super_admin';
  
  // Show officers for task assignment, show all staff for team view
  const officers = staff.filter(s => s.staff_position === 'officer');
  const allStaff = staff; // All compliance staff for team management view
  
  // Calculate workload for each staff member
  const getStaffWorkload = (staffId: string) => {
    return assessments.filter(a => a.assessed_by === staffId && a.assessment_status === 'in_progress').length;
  };

  const getStaffTaskCount = (staffId: string) => {
    return tasks.filter(t => t.assigned_to === staffId && t.status !== 'completed').length;
  };

  const handleToggleStatus = async (officer: ComplianceStaff) => {
    if (!isManager) return;
    
    setUpdatingOfficer(officer.id);
    try {
      const newStatus = !officer.is_active;
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: newStatus })
        .eq('user_id', officer.id);

      if (error) throw error;
      
      toast.success(`Officer ${newStatus ? 'activated' : 'suspended'} successfully`);
      await refetchStaff();
    } catch (error) {
      console.error('Error updating officer status:', error);
      toast.error('Failed to update officer status');
    } finally {
      setUpdatingOfficer(null);
    }
  };

  const handleOpenTaskDialog = () => {
    setAssignDialogOpen(true);
  };

  const handleCreateTask = async (taskData: {
    task_type: 'inspection' | 'intent_assessment' | 'permit_assessment';
    title: string;
    description: string;
    assigned_to: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    due_date: string | null;
    related_inspection_id?: string | null;
    related_intent_id?: string | null;
    related_permit_id?: string | null;
  }) => {
    await createTask({
      ...taskData,
      status: 'pending',
      progress_percentage: 0,
      assigned_by: profile?.user_id || '',
      completed_at: null,
      related_intent_id: taskData.related_intent_id || null,
      related_permit_id: taskData.related_permit_id || null,
      related_inspection_id: taskData.related_inspection_id || null,
      notes: null,
    });
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    await updateTask(taskId, { 
      status: newStatus as any,
      completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
      progress_percentage: newStatus === 'completed' ? 100 : newStatus === 'in_progress' ? 50 : 0
    });
  };

  const handleUpdateProgress = async (taskId: string, progress: number) => {
    await updateTask(taskId, { 
      progress_percentage: progress,
      status: progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'pending',
      completed_at: progress === 100 ? new Date().toISOString() : null
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20"><Play className="w-3 h-3 mr-1" />In Progress</Badge>;
      case 'overdue':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20"><AlertTriangle className="w-3 h-3 mr-1" />Overdue</Badge>;
      default:
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'high':
        return <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">High</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="secondary">Normal</Badge>;
    }
  };

  const getTaskTypeBadge = (taskType: string) => {
    switch (taskType) {
      case 'inspection':
        return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">Inspection</Badge>;
      case 'intent_assessment':
        return <Badge className="bg-cyan-500/10 text-cyan-600 border-cyan-500/20">Intent Assessment</Badge>;
      default:
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Permit Assessment</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="team" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="team">
            <Users className="w-4 h-4 mr-2" />
            Team ({allStaff.length})
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <ClipboardList className="w-4 h-4 mr-2" />
            Tasks ({tasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Compliance Team Management
                </CardTitle>
                <CardDescription>
                  {isManager 
                    ? 'Manage compliance staff - suspend/activate officers and assign tasks' 
                    : 'Compliance team members and their current workload'}
                </CardDescription>
              </div>
              {isManager && profile && (
                <Button
                  onClick={handleOpenTaskDialog}
                >
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Assign Task to Self
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {allStaff.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No compliance staff found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allStaff.map((member) => {
                    const workload = getStaffWorkload(member.id);
                    const taskCount = getStaffTaskCount(member.id);
                    const isOfficer = member.staff_position === 'officer';
                    const isSelf = member.id === profile?.user_id;
                    return (
                      <div
                        key={member.id}
                        className={`flex flex-col lg:flex-row lg:items-center justify-between p-4 bg-background border rounded-lg gap-4 ${!member.is_active ? 'opacity-60' : ''} ${isSelf ? 'border-primary/50 bg-primary/5' : ''}`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${member.is_active ? 'bg-primary/10' : 'bg-muted'}`}>
                            <UserCheck className={`w-5 h-5 ${member.is_active ? 'text-primary' : 'text-muted-foreground'}`} />
                          </div>
                          <div>
                            <h4 className="font-medium flex items-center gap-2">
                              {member.full_name || 'No name provided'}
                              {isSelf && <Badge variant="outline" className="text-xs">You</Badge>}
                            </h4>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Mail className="w-3 h-3 mr-1" />
                              {member.email}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {member.staff_position || 'Staff'}
                          </Badge>
                          <Badge 
                            variant={workload > 3 ? "destructive" : workload > 1 ? "secondary" : "default"}
                          >
                            {workload} assessments
                          </Badge>
                          <Badge variant="outline">
                            {taskCount} tasks
                          </Badge>
                          <Badge 
                            variant={member.is_active ? "default" : "outline"}
                            className={member.is_active ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-red-500/10 text-red-600 border-red-500/20"}
                          >
                            {member.is_active ? "Active" : "Suspended"}
                          </Badge>
                        </div>

                        {isManager && isOfficer && !isSelf && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleStatus(member)}
                              disabled={updatingOfficer === member.id}
                              className={member.is_active ? "hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/20" : "hover:bg-green-500/10 hover:text-green-600 hover:border-green-500/20"}
                            >
                              {member.is_active ? (
                                <>
                                  <Pause className="w-4 h-4 mr-1" />
                                  Suspend
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4 mr-1" />
                                  Activate
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleOpenTaskDialog}
                              disabled={!member.is_active}
                            >
                              <ClipboardList className="w-4 h-4 mr-1" />
                              Assign Task
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ClipboardList className="w-5 h-5 mr-2" />
                Task Management
              </CardTitle>
              <CardDescription>
                Track and manage assigned tasks for compliance officers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tasksLoading ? (
                <div className="text-center py-8">Loading tasks...</div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-8">
                  <ClipboardList className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No tasks assigned yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Status</TableHead>
                        {isManager && <TableHead>Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{task.title}</p>
                              {task.description && (
                                <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                  {task.description}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getTaskTypeBadge(task.task_type)}</TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {task.assignee?.full_name || task.assignee?.email || 'Unknown'}
                            </span>
                          </TableCell>
                          <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                          <TableCell>
                            {task.due_date ? (
                              <span className="text-sm">
                                {format(new Date(task.due_date), 'PP')}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-sm">No due date</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="w-[100px] space-y-1">
                              <Progress value={task.progress_percentage} className="h-2" />
                              <span className="text-xs text-muted-foreground">{task.progress_percentage}%</span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(task.status)}</TableCell>
                          {isManager && (
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Select
                                  value={task.status}
                                  onValueChange={(value) => handleUpdateTaskStatus(task.id, value)}
                                >
                                  <SelectTrigger className="w-[120px] h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="overdue">Overdue</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteTask(task.id)}
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AssignTaskDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        onAssign={handleCreateTask}
      />
    </div>
  );
}
