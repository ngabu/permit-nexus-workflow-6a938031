import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Users, ClipboardList, TrendingUp, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { StaffUnit } from './types';
import { useUnitStaff } from './hooks/useUnitStaff';
import { useUnitTasks } from './hooks/useUnitTasks';
import { usePerformanceMetrics } from './hooks/usePerformanceMetrics';
import { TaskAssignmentDialog } from './components/TaskAssignmentDialog';
import { TasksList } from './components/TasksList';
import { StaffTeamList } from './components/StaffTeamList';
import { PerformanceMatrix } from './components/PerformanceMatrix';

interface StaffManagementProps {
  unit: StaffUnit;
}

export function StaffManagement({ unit }: StaffManagementProps) {
  const { profile } = useAuth();
  const { staff, loading: staffLoading, toggleStaffStatus, isManager } = useUnitStaff(unit);
  const { tasks, loading: tasksLoading, createTask, updateTask, deleteTask } = useUnitTasks(unit);
  const { metrics, overallMetrics } = usePerformanceMetrics(tasks, staff);
  
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [preselectedStaffId, setPreselectedStaffId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState('team');

  const loading = staffLoading || tasksLoading;

  const handleAssignTask = (staffId?: string) => {
    setPreselectedStaffId(staffId);
    setAssignDialogOpen(true);
  };

  const handleCreateTask = async (taskData: any) => {
    await createTask(taskData);
  };

  const unitLabel = unit.charAt(0).toUpperCase() + unit.slice(1);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{unitLabel} Staff Management</h2>
          <p className="text-muted-foreground">
            {isManager 
              ? 'Manage your team, assign tasks, and monitor performance' 
              : 'View team members and your assigned tasks'}
          </p>
        </div>
        {isManager && (
          <Button onClick={() => handleAssignTask()} className="shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            Assign Task
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Team</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            <span className="hidden sm:inline">Tasks</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Performance</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="space-y-4">
          <StaffTeamList
            staff={staff}
            tasks={tasks}
            isManager={isManager || false}
            onToggleStatus={toggleStaffStatus}
            onAssignTask={handleAssignTask}
          />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <TasksList
            tasks={isManager ? tasks : tasks.filter(t => t.assigned_to === profile?.user_id)}
            unit={unit}
            isManager={isManager || false}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
          />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <PerformanceMatrix metrics={metrics} overallMetrics={overallMetrics} />
        </TabsContent>
      </Tabs>

      {/* Task Assignment Dialog */}
      <TaskAssignmentDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        staff={staff}
        unit={unit}
        onSubmit={handleCreateTask}
        preselectedStaffId={preselectedStaffId}
      />
    </div>
  );
}
