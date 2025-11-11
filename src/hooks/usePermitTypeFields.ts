import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PermitTypeField {
  id: string;
  permit_type_id: string;
  field_name: string;
  field_label: string;
  field_type: string;
  field_options: any;
  is_mandatory: boolean;
  placeholder: string | null;
  help_text: string | null;
  sort_order: number;
  validation_rules: any;
  created_at?: string;
  updated_at?: string;
}

export const usePermitTypeFields = (permitTypeName?: string) => {
  const [fields, setFields] = useState<PermitTypeField[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!permitTypeName) {
      setFields([]);
      return;
    }

    const fetchFields = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // First get the permit_type_id from permit_types table
        const { data: permitTypeData, error: permitTypeError } = await supabase
          .from('permit_types')
          .select('id')
          .eq('name', permitTypeName)
          .maybeSingle();

        if (permitTypeError) throw permitTypeError;
        
        if (!permitTypeData) {
          console.log('No permit type found for:', permitTypeName);
          setFields([]);
          return;
        }

        // Then fetch the active fields for this permit type
        const { data: fieldsData, error: fieldsError } = await supabase
          .from('permit_type_fields')
          .select('*')
          .eq('permit_type_id', permitTypeData.id)
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (fieldsError) throw fieldsError;

        setFields(fieldsData || []);
      } catch (err) {
        console.error('Error fetching permit type fields:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch fields');
        setFields([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFields();
  }, [permitTypeName]);

  return { fields, loading, error };
};
