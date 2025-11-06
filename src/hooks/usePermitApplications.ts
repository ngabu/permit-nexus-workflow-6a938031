import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PermitApplication {
  id: string;
  title: string;
  permit_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  application_date: string | null;
  user_id: string;
  entity_id: string;
  permit_number: string | null;
  coordinates?: any;
  entity?: {
    id: string;
    name: string;
    entity_type: string;
    contact_person: string | null;
    email: string | null;
    phone: string | null;
  };
  assigned_officer?: {
    id: string;
    full_name: string | null;
    email: string;
  };
  details?: {
    legal_description: string | null;
    land_type: string | null;
    owner_name: string | null;
    proposed_works_description: string | null;
    activity_location: string | null;
    estimated_cost_kina: number | null;
    is_draft: boolean | null;
    current_step: number | null;
  };
}

export function usePermitApplications() {
  const [applications, setApplications] = useState<PermitApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  const fetchApplications = async () => {
    try {
      let query = (supabase as any)
        .from('permit_applications')
        .select(`
          id,
          title,
          permit_type,
          status,
          created_at,
          updated_at,
          application_date,
          user_id,
          entity_id,
          permit_number,
          coordinates,
          assigned_officer_id,
          assigned_officer_name,
          assigned_officer_email,
          entity_name,
          entity_type,
          legal_description,
          land_type,
          owner_name,
          proposed_works_description,
          activity_location,
          estimated_cost_kina,
          is_draft,
          current_step,
          entities (
            id,
            name,
            entity_type,
            contact_person,
            email,
            phone
          )
        `);

      // Filter based on user role
      if (profile?.user_type === 'public') {
        query = query.eq('user_id', profile.user_id);
      } else if (profile?.staff_unit === 'registry' && profile?.staff_position === 'officer') {
        // Registry officers only see their assigned applications
        query = query.eq('assigned_officer_id', profile.user_id);
      }
      // Registry managers and super admins can see all applications (no additional filter)

      const { data, error } = await query
        .order('created_at', { ascending: false });

      if (error) throw error;

        // Transform the data to match the PermitApplication interface
        const transformedData = (data || []).map(app => ({
          ...app,
          entity: app.entities ? {
            id: app.entities.id,
            name: app.entities.name,
            entity_type: app.entities.entity_type,
            contact_person: app.entities.contact_person,
            email: app.entities.email,
            phone: app.entities.phone
          } : app.entity_name ? {
            id: app.entity_id || '',
            name: app.entity_name,
            entity_type: app.entity_type || '',
            contact_person: null,
            email: null,
            phone: null
          } : undefined,
          assigned_officer: app.assigned_officer_name ? {
            id: app.assigned_officer_id || '',
            full_name: app.assigned_officer_name,
            email: app.assigned_officer_email || ''
          } : undefined,
          details: {
            legal_description: app.legal_description,
            land_type: app.land_type,
            owner_name: app.owner_name,
            proposed_works_description: app.proposed_works_description,
            activity_location: app.activity_location,
            estimated_cost_kina: app.estimated_cost_kina,
            is_draft: app.is_draft,
            current_step: app.current_step
          }
        }));

      setApplications(transformedData);
    } catch (error) {
      console.error('Error fetching permit applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: string, assignedOfficerId?: string) => {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (assignedOfficerId) {
        updateData.assigned_officer_id = assignedOfficerId;
      }

      const { error } = await (supabase as any)
        .from('permit_applications')
        .update(updateData)
        .eq('id', applicationId);

      if (error) throw error;

      // Refresh the applications list
      fetchApplications();
      return { success: true };
    } catch (error) {
      console.error('Error updating application status:', error);
      return { success: false, error };
    }
  };

  const assignOfficer = async (applicationId: string, officerId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('permit_applications')
        .update({
          assigned_officer_id: officerId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId);

      if (error) throw error;

      // Refresh the applications list
      fetchApplications();
      return { success: true };
    } catch (error) {
      console.error('Error assigning officer:', error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    if (profile?.user_type) {
      fetchApplications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.user_type, profile?.staff_unit, profile?.staff_position, profile?.user_id]);

  return {
    applications,
    loading,
    updateApplicationStatus,
    assignOfficer,
    refetch: fetchApplications
  };
}