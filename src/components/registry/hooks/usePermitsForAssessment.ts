import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PermitForAssessment {
  id: string;
  title: string;
  permit_type: string;
  status: string;
  application_date: string | null;
  permit_number: string | null;
  assigned_officer_id?: string | null;
  assigned_officer?: {
    id: string;
    email: string;
    full_name: string | null;
  };
  entity: {
    name: string;
    entity_type: string;
  };
  assessment?: {
    id: string;
    assessment_status: string;
    assessment_notes: string;
    assessed_by: string;
    created_at: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export function usePermitsForAssessment() {
  const [permits, setPermits] = useState<PermitForAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  const fetchPermitsForAssessment = async () => {
    try {
      console.log('Fetching permits for assessment...');
      
      let query = supabase
        .from('permit_applications')
        .select(`
          id,
          title,
          permit_type,
          status,
          application_date,
          permit_number,
          assigned_officer_id,
          entity_id,
          entity_name,
          entity_type,
          created_at,
          updated_at
        `)
        .neq('status', 'draft')
        .or('is_draft.is.null,is_draft.eq.false');

      // Filter based on user role
      if (profile?.staff_position === 'officer') {
        // Officers can only see permits assigned to them
        query = query.eq('assigned_officer_id', profile.user_id);
      }
      // Managers can see all permits (no additional filter needed)

      const { data: permits, error: permitsError } = await query.order('created_at', { ascending: false });

      if (permitsError) {
        console.error('Error fetching permits:', permitsError);
        throw permitsError;
      }

      console.log('Fetched permits:', permits);
      setPermits((permits || []).map((permit: any) => ({
        id: permit.id,
        title: permit.title,
        permit_type: permit.permit_type,
        status: permit.status,
        application_date: permit.application_date,
        permit_number: permit.permit_number,
        assigned_officer_id: permit.assigned_officer_id,
        description: permit.description,
        entity: {
          name: permit.entity_name || 'Unknown Entity',
          entity_type: permit.entity_type || 'Unknown'
        },
        created_at: permit.created_at,
        updated_at: permit.updated_at
      })));
    } catch (error) {
      console.error('Error fetching permits for assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Allow both registry staff and super admin to view permits
    if (profile?.staff_unit === 'registry' || profile?.user_type === 'super_admin') {
      fetchPermitsForAssessment();
    } else {
      console.log('User does not have registry access:', profile);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.staff_unit, profile?.user_type]);

  return { permits, loading, refetch: fetchPermitsForAssessment };
}