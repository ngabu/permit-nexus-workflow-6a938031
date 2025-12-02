import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Entity {
  id: string;
  entity_type: string;
  name: string;
  email?: string;
  phone?: string;
  postal_address?: string;
  'registered address'?: string;
  registration_number?: string;
  tax_number?: string;
  contact_person?: string;
  contact_person_email?: string;
  contact_person_phone?: string;
  district?: string;
  province?: string;
  is_suspended?: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export function useEntities() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchEntities = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('entities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Convert contact_person_phone from number to string
      const formattedData = (data || []).map(entity => ({
        ...entity,
        contact_person_phone: entity.contact_person_phone?.toString()
      }));
      
      setEntities(formattedData as Entity[]);
    } catch (error) {
      console.error('Error fetching entities:', error);
      toast({
        title: "Error",
        description: "Failed to load entities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const refetchEntities = () => {
    fetchEntities();
  };

  return {
    entities,
    loading,
    refetchEntities
  };
}