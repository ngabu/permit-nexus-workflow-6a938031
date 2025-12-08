import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ApplicationOption {
  id: string;
  label: string;
  province?: string;
  status: string;
  entityName?: string;
}

export const useInspectionApplications = (applicationType: string) => {
  const [options, setOptions] = useState<ApplicationOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      setOptions([]);

      try {
        switch (applicationType) {
          case 'permit': {
            // Fetch permit applications with under_review or approved status
            const { data, error } = await supabase
              .from('permit_applications')
              .select(`
                id,
                title,
                permit_number,
                status,
                province,
                entity_id,
                entities:entity_id (name)
              `)
              .in('status', ['under_review', 'under_initial_review', 'under_technical_review', 'approved']);

            if (error) throw error;

            setOptions(
              (data || []).map((app: any) => ({
                id: app.id,
                label: app.permit_number || app.title || 'Untitled Permit',
                province: app.province,
                status: app.status,
                entityName: app.entities?.name || 'Unknown Entity'
              }))
            );
            break;
          }

          case 'intent': {
            // Fetch intent registrations with under_review status
            const { data, error } = await supabase
              .from('intent_registrations')
              .select(`
                id,
                activity_description,
                status,
                province,
                entity_id,
                entities:entity_id (name)
              `)
              .eq('status', 'under_review');

            if (error) throw error;

            setOptions(
              (data || []).map((intent: any) => ({
                id: intent.id,
                label: intent.activity_description?.substring(0, 50) + '...' || 'Untitled Intent',
                province: intent.province,
                status: intent.status,
                entityName: intent.entities?.name || 'Unknown Entity'
              }))
            );
            break;
          }

          case 'amalgamation': {
            // Fetch permit amalgamations with permit details
            const { data, error } = await supabase
              .from('permit_amalgamations')
              .select(`
                id,
                amalgamation_reason,
                status,
                user_id,
                permit_ids
              `)
              .in('status', ['pending', 'under_review']);

            if (error) throw error;

            // For each amalgamation, we need to get the first permit's details
            const optionsWithDetails = await Promise.all(
              (data || []).map(async (amalg: any) => {
                let permitLabel = 'Amalgamation Request';
                let province = '';
                let entityName = 'Unknown Entity';

                if (amalg.permit_ids && amalg.permit_ids.length > 0) {
                  const { data: permitData } = await supabase
                    .from('permit_applications')
                    .select('title, permit_number, province, entities:entity_id (name)')
                    .eq('id', amalg.permit_ids[0])
                    .single();

                  if (permitData) {
                    permitLabel = `Amalgamation: ${permitData.permit_number || permitData.title}`;
                    province = permitData.province || '';
                    entityName = (permitData.entities as any)?.name || 'Unknown Entity';
                  }
                }

                return {
                  id: amalg.id,
                  label: permitLabel,
                  province,
                  status: amalg.status,
                  entityName
                };
              })
            );

            setOptions(optionsWithDetails);
            break;
          }

          case 'amendment': {
            // Fetch permit amendments with permit details
            const { data, error } = await supabase
              .from('permit_amendments')
              .select(`
                id,
                amendment_type,
                amendment_reason,
                status,
                permit_id,
                permit_applications:permit_id (
                  title,
                  permit_number,
                  province,
                  entities:entity_id (name)
                )
              `)
              .in('status', ['pending', 'under_review']);

            if (error) throw error;

            setOptions(
              (data || []).map((amend: any) => ({
                id: amend.id,
                label: `Amendment: ${amend.permit_applications?.permit_number || amend.permit_applications?.title || 'Unknown Permit'} - ${amend.amendment_type}`,
                province: amend.permit_applications?.province,
                status: amend.status,
                entityName: (amend.permit_applications?.entities as any)?.name || 'Unknown Entity'
              }))
            );
            break;
          }

          case 'renewal': {
            // Fetch permit renewals with permit details
            const { data, error } = await supabase
              .from('permit_renewals')
              .select(`
                id,
                renewal_period_years,
                renewal_reason,
                status,
                permit_id,
                permit_applications:permit_id (
                  title,
                  permit_number,
                  province,
                  entities:entity_id (name)
                )
              `)
              .in('status', ['pending', 'under_review']);

            if (error) throw error;

            setOptions(
              (data || []).map((renewal: any) => ({
                id: renewal.id,
                label: `Renewal: ${renewal.permit_applications?.permit_number || renewal.permit_applications?.title || 'Unknown Permit'}`,
                province: renewal.permit_applications?.province,
                status: renewal.status,
                entityName: (renewal.permit_applications?.entities as any)?.name || 'Unknown Entity'
              }))
            );
            break;
          }

          case 'surrender': {
            // Fetch permit surrenders with permit details
            const { data, error } = await supabase
              .from('permit_surrenders')
              .select(`
                id,
                surrender_reason,
                status,
                permit_id,
                permit_applications:permit_id (
                  title,
                  permit_number,
                  province,
                  entities:entity_id (name)
                )
              `)
              .in('status', ['pending', 'under_review']);

            if (error) throw error;

            setOptions(
              (data || []).map((surrender: any) => ({
                id: surrender.id,
                label: `Surrender: ${surrender.permit_applications?.permit_number || surrender.permit_applications?.title || 'Unknown Permit'}`,
                province: surrender.permit_applications?.province,
                status: surrender.status,
                entityName: (surrender.permit_applications?.entities as any)?.name || 'Unknown Entity'
              }))
            );
            break;
          }

          case 'transfer': {
            // Fetch permit transfers with permit details
            const { data, error } = await supabase
              .from('permit_transfers')
              .select(`
                id,
                transfer_reason,
                status,
                permit_id,
                permit_applications:permit_id (
                  title,
                  permit_number,
                  province,
                  entities:entity_id (name)
                )
              `)
              .in('status', ['pending', 'under_review']);

            if (error) throw error;

            setOptions(
              (data || []).map((transfer: any) => ({
                id: transfer.id,
                label: `Transfer: ${transfer.permit_applications?.permit_number || transfer.permit_applications?.title || 'Unknown Permit'}`,
                province: transfer.permit_applications?.province,
                status: transfer.status,
                entityName: (transfer.permit_applications?.entities as any)?.name || 'Unknown Entity'
              }))
            );
            break;
          }

          default:
            setOptions([]);
        }
      } catch (error) {
        console.error('Error fetching applications for inspection:', error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    if (applicationType) {
      fetchApplications();
    }
  }, [applicationType]);

  return { options, loading };
};
