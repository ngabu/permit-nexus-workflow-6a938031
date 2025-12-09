import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { UnitTask, StaffUnit } from '../types';

export function useUnitTasks(unit: StaffUnit) {
  const [tasks, setTasks] = useState<UnitTask[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      
      let data: any[] = [];
      let error: any = null;

      // Use specific table queries based on unit
      if (unit === 'registry') {
        const result = await supabase.from('registry_tasks').select('*').order('created_at', { ascending: false });
        data = result.data || [];
        error = result.error;
      } else if (unit === 'compliance') {
        const result = await supabase.from('compliance_tasks').select('*').order('created_at', { ascending: false });
        data = result.data || [];
        error = result.error;
      } else if (unit === 'revenue') {
        const result = await supabase.from('revenue_tasks').select('*').order('created_at', { ascending: false });
        data = result.data || [];
        error = result.error;
      }

      if (error) throw error;

      // Fetch assignee details
      const assigneeIds = [...new Set(data.map(t => t.assigned_to))];
      
      let profileMap = new Map();
      if (assigneeIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, email')
          .in('user_id', assigneeIds);

        profileMap = new Map(
          (profiles || []).map(p => [
            p.user_id,
            {
              full_name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.email,
              email: p.email
            }
          ])
        );
      }

      // Check for overdue tasks
      const now = new Date();
      const tasksWithAssignees = data.map(task => {
        let status = task.status;
        if (task.due_date && new Date(task.due_date) < now && 
            task.status !== 'completed' && task.status !== 'overdue') {
          status = 'overdue';
        }
        return {
          ...task,
          status,
          assignee: profileMap.get(task.assigned_to)
        };
      });

      setTasks(tasksWithAssignees as UnitTask[]);
    } catch (error) {
      console.error(`Error fetching ${unit} tasks:`, error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [unit]);

  const createTask = async (taskData: Omit<UnitTask, 'id' | 'created_at' | 'updated_at' | 'assignee'>) => {
    try {
      const insertData = { ...taskData, assigned_by: profile?.user_id };
      
      if (unit === 'registry') {
        const { error } = await supabase.from('registry_tasks').insert([insertData]);
        if (error) throw error;
      } else if (unit === 'compliance') {
        const { error } = await supabase.from('compliance_tasks').insert([insertData]);
        if (error) throw error;
      } else if (unit === 'revenue') {
        const { error } = await supabase.from('revenue_tasks').insert([insertData]);
        if (error) throw error;
      }

      toast.success('Task created successfully');
      await fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
      throw error;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<UnitTask>) => {
    try {
      const updateData = { ...updates };
      if (updates.status === 'completed' && !updates.completed_at) {
        updateData.completed_at = new Date().toISOString();
        updateData.progress_percentage = 100;
      }

      if (unit === 'registry') {
        const { error } = await supabase.from('registry_tasks').update(updateData).eq('id', taskId);
        if (error) throw error;
      } else if (unit === 'compliance') {
        const { error } = await supabase.from('compliance_tasks').update(updateData).eq('id', taskId);
        if (error) throw error;
      } else if (unit === 'revenue') {
        const { error } = await supabase.from('revenue_tasks').update(updateData).eq('id', taskId);
        if (error) throw error;
      }

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
      if (unit === 'registry') {
        const { error } = await supabase.from('registry_tasks').delete().eq('id', taskId);
        if (error) throw error;
      } else if (unit === 'compliance') {
        const { error } = await supabase.from('compliance_tasks').delete().eq('id', taskId);
        if (error) throw error;
      } else if (unit === 'revenue') {
        const { error } = await supabase.from('revenue_tasks').delete().eq('id', taskId);
        if (error) throw error;
      }

      toast.success('Task deleted successfully');
      await fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
      throw error;
    }
  };

  useEffect(() => {
    if (profile?.staff_unit === unit || profile?.user_type === 'super_admin') {
      fetchTasks();
    } else {
      setLoading(false);
    }
  }, [profile?.staff_unit, profile?.user_type, fetchTasks, unit]);

  return { tasks, loading, fetchTasks, createTask, updateTask, deleteTask };
}
