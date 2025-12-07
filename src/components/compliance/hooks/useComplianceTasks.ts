import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ComplianceTask {
  id: string;
  task_type: 'inspection' | 'intent_assessment' | 'permit_assessment';
  title: string;
  description: string | null;
  assigned_to: string;
  assigned_by: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  due_date: string | null;
  completed_at: string | null;
  related_intent_id: string | null;
  related_permit_id: string | null;
  related_inspection_id: string | null;
  notes: string | null;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
  assignee?: {
    full_name: string;
    email: string;
  };
}

export function useComplianceTasks() {
  const [tasks, setTasks] = useState<ComplianceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('compliance_tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch assignee details
      const assigneeIds = [...new Set((data || []).map(t => t.assigned_to))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, email')
        .in('user_id', assigneeIds);

      const profileMap = new Map(
        (profiles || []).map(p => [
          p.user_id,
          {
            full_name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.email,
            email: p.email
          }
        ])
      );

      const tasksWithAssignees = (data || []).map(task => ({
        ...task,
        assignee: profileMap.get(task.assigned_to)
      }));

      setTasks(tasksWithAssignees as ComplianceTask[]);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: Omit<ComplianceTask, 'id' | 'created_at' | 'updated_at' | 'assignee'>) => {
    try {
      const { data, error } = await supabase
        .from('compliance_tasks')
        .insert([{
          ...taskData,
          assigned_by: profile?.user_id
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Task assigned successfully');
      await fetchTasks();
      return data;
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
      throw error;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<ComplianceTask>) => {
    try {
      const { error } = await supabase
        .from('compliance_tasks')
        .update(updates)
        .eq('id', taskId);

      if (error) throw error;

      toast.success('Task updated successfully');
      await fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
      throw error;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('compliance_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      toast.success('Task deleted successfully');
      await fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
      throw error;
    }
  };

  useEffect(() => {
    if (profile?.staff_unit === 'compliance' || profile?.user_type === 'super_admin') {
      fetchTasks();
    }
  }, [profile?.staff_unit, profile?.user_type]);

  return { tasks, loading, fetchTasks, createTask, updateTask, deleteTask };
}
