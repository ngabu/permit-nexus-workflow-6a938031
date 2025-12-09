import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { generateInspectionInvoiceNumber } from '@/components/compliance/InspectionInvoiceGenerator';

export interface Inspection {
  id: string;
  permit_application_id: string | null;
  intent_registration_id?: string | null;
  inspection_type: string;
  scheduled_date: string;
  inspector_id: string | null;
  status: string;
  notes: string | null;
  findings: string | null;
  completed_date: string | null;
  created_at: string;
  updated_at: string;
  accommodation_cost: number;
  transportation_cost: number;
  daily_allowance: number;
  total_travel_cost: number;
  number_of_days: number;
  province: string | null;
  permit_category: string | null;
  created_by: string | null;
  report_path?: string | null;
  permit_number?: string;
  permit_title?: string;
  entity_name?: string;
  entity_id?: string;
  user_id?: string;
  inspector_name?: string | null;
}

export function useInspections() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    if (profile?.user_id) {
      fetchInspections();
    }
  }, [profile?.user_id]);

  const fetchInspections = async () => {
    try {
      setLoading(true);

      // Fetch inspections with optional permit and intent relationships
      let query = supabase
        .from('inspections')
        .select(`
          *,
          permit_applications(
            id,
            permit_number,
            title,
            entity_id,
            user_id,
            entities(id, name)
          ),
          intent_registrations(
            id,
            activity_description,
            entity_id,
            user_id,
            entities(id, name)
          )
        `)
        .order('scheduled_date', { ascending: false });

      // If public user, filter by their permits or intents
      if (profile?.user_type === 'public') {
        // We need to filter based on either permit or intent ownership
        query = query.or(`permit_applications.user_id.eq.${profile.user_id},intent_registrations.user_id.eq.${profile.user_id}`);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formatted = data?.map((inspection: any) => {
        // Get entity info from either permit or intent
        const permitEntity = inspection.permit_applications?.entities;
        const intentEntity = inspection.intent_registrations?.entities;
        
        return {
          id: inspection.id,
          permit_application_id: inspection.permit_application_id,
          intent_registration_id: inspection.intent_registration_id,
          inspection_type: inspection.inspection_type,
          scheduled_date: inspection.scheduled_date,
          inspector_id: inspection.inspector_id,
          status: inspection.status,
          notes: inspection.notes,
          findings: inspection.findings,
          completed_date: inspection.completed_date,
          created_at: inspection.created_at,
          updated_at: inspection.updated_at,
          accommodation_cost: inspection.accommodation_cost || 0,
          transportation_cost: inspection.transportation_cost || 0,
          daily_allowance: inspection.daily_allowance || 0,
          total_travel_cost: inspection.total_travel_cost || 0,
          number_of_days: inspection.number_of_days || 1,
          province: inspection.province,
          permit_category: inspection.permit_category,
          created_by: inspection.created_by,
          report_path: inspection.report_path,
          permit_number: inspection.permit_applications?.permit_number || `Intent: ${inspection.intent_registrations?.id?.slice(0, 8)}`,
          permit_title: inspection.permit_applications?.title || inspection.intent_registrations?.activity_description,
          entity_name: permitEntity?.name || intentEntity?.name,
          entity_id: inspection.permit_applications?.entity_id || inspection.intent_registrations?.entity_id,
          user_id: inspection.permit_applications?.user_id || inspection.intent_registrations?.user_id,
          inspector_name: null
        };
      }) || [];

      setInspections(formatted);
    } catch (error) {
      console.error('Error fetching inspections:', error);
      toast.error('Failed to load inspections');
    } finally {
      setLoading(false);
    }
  };

  const createInspection = async (inspectionData: Partial<Inspection> & { isIntent?: boolean }) => {
    try {
      const numberOfDays = inspectionData.number_of_days || 1;
      
      // Calculate total travel cost: accommodation and daily allowance are multiplied by number of days
      const totalAccommodation = (inspectionData.accommodation_cost || 0) * numberOfDays;
      const totalDailyAllowance = (inspectionData.daily_allowance || 0) * numberOfDays;
      const totalTravelCost = totalAccommodation + (inspectionData.transportation_cost || 0) + totalDailyAllowance;

      let permitData: any = null;
      let intentData: any = null;
      let actualPermitApplicationId: string | null = null;
      let actualIntentRegistrationId: string | null = null;
      
      // Determine the permit_application_id based on the category
      const category = inspectionData.permit_category || '';
      
      if (category === 'Intent Registration') {
        // Fetch intent registration details
        const { data: intent, error: intentError } = await supabase
          .from('intent_registrations')
          .select('id, entity_id, user_id, activity_description, existing_permit_id, entities(id, name)')
          .eq('id', inspectionData.permit_application_id)
          .maybeSingle();
        
        if (intentError) throw intentError;
        if (!intent) throw new Error('Intent registration not found');
        intentData = intent;
        
        // Set intent registration ID directly - no need for permit application
        actualIntentRegistrationId = intent.id;
        
        // Use existing_permit_id if available (optional)
        actualPermitApplicationId = intent.existing_permit_id || null;
      } else if (category === 'Permit Amalgamation') {
        const { data: amalgamation, error } = await supabase
          .from('permit_amalgamations')
          .select('id, user_id, permit_ids')
          .eq('id', inspectionData.permit_application_id)
          .maybeSingle();
        
        if (error) throw error;
        if (!amalgamation) throw new Error('Amalgamation not found');
        
        // Use first permit from the array
        actualPermitApplicationId = amalgamation.permit_ids?.[0] || null;
        if (!actualPermitApplicationId) {
          toast.error('Cannot schedule inspection: No permits in amalgamation');
          return false;
        }
        
        // Fetch permit data for invoice
        const { data: permit } = await supabase
          .from('permit_applications')
          .select('id, permit_number, title, entity_id, user_id, entities(id, name)')
          .eq('id', actualPermitApplicationId)
          .maybeSingle();
        permitData = permit;
      } else if (category === 'Permit Amendment') {
        const { data: amendment, error } = await supabase
          .from('permit_amendments')
          .select('id, user_id, permit_id')
          .eq('id', inspectionData.permit_application_id)
          .maybeSingle();
        
        if (error) throw error;
        if (!amendment) throw new Error('Amendment not found');
        
        actualPermitApplicationId = amendment.permit_id;
        
        const { data: permit } = await supabase
          .from('permit_applications')
          .select('id, permit_number, title, entity_id, user_id, entities(id, name)')
          .eq('id', actualPermitApplicationId)
          .maybeSingle();
        permitData = permit;
      } else if (category === 'Permit Renewal') {
        const { data: renewal, error } = await supabase
          .from('permit_renewals')
          .select('id, user_id, permit_id')
          .eq('id', inspectionData.permit_application_id)
          .maybeSingle();
        
        if (error) throw error;
        if (!renewal) throw new Error('Renewal not found');
        
        actualPermitApplicationId = renewal.permit_id;
        
        const { data: permit } = await supabase
          .from('permit_applications')
          .select('id, permit_number, title, entity_id, user_id, entities(id, name)')
          .eq('id', actualPermitApplicationId)
          .maybeSingle();
        permitData = permit;
      } else if (category === 'Permit Surrender') {
        const { data: surrender, error } = await supabase
          .from('permit_surrenders')
          .select('id, user_id, permit_id')
          .eq('id', inspectionData.permit_application_id)
          .maybeSingle();
        
        if (error) throw error;
        if (!surrender) throw new Error('Surrender not found');
        
        actualPermitApplicationId = surrender.permit_id;
        
        const { data: permit } = await supabase
          .from('permit_applications')
          .select('id, permit_number, title, entity_id, user_id, entities(id, name)')
          .eq('id', actualPermitApplicationId)
          .maybeSingle();
        permitData = permit;
      } else if (category === 'Permit Transfer') {
        const { data: transfer, error } = await supabase
          .from('permit_transfers')
          .select('id, user_id, permit_id')
          .eq('id', inspectionData.permit_application_id)
          .maybeSingle();
        
        if (error) throw error;
        if (!transfer) throw new Error('Transfer not found');
        
        actualPermitApplicationId = transfer.permit_id;
        
        const { data: permit } = await supabase
          .from('permit_applications')
          .select('id, permit_number, title, entity_id, user_id, entities(id, name)')
          .eq('id', actualPermitApplicationId)
          .maybeSingle();
        permitData = permit;
      } else {
        // Default: Permit Application
        actualPermitApplicationId = inspectionData.permit_application_id || null;
        
        const { data: permit, error: permitError } = await supabase
          .from('permit_applications')
          .select('id, permit_number, title, entity_id, user_id, entities(id, name)')
          .eq('id', actualPermitApplicationId)
          .maybeSingle();

        if (permitError) throw permitError;
        if (!permit) throw new Error('Permit application not found');
        permitData = permit;
      }
      // Validate that at least one reference exists
      if (!actualPermitApplicationId && !actualIntentRegistrationId) {
        toast.error('Cannot schedule inspection: Invalid application reference');
        return false;
      }

      // Create the inspection with appropriate IDs
      // Note: total_travel_cost is a generated column in the database, so we don't include it
      const { data: newInspection, error } = await supabase
        .from('inspections')
        .insert({
          permit_application_id: actualPermitApplicationId,
          intent_registration_id: actualIntentRegistrationId,
          inspection_type: inspectionData.inspection_type,
          scheduled_date: inspectionData.scheduled_date,
          inspector_id: inspectionData.inspector_id,
          status: 'pending',
          notes: inspectionData.notes,
          accommodation_cost: inspectionData.accommodation_cost || 0,
          transportation_cost: inspectionData.transportation_cost || 0,
          daily_allowance: inspectionData.daily_allowance || 0,
          number_of_days: numberOfDays,
          province: inspectionData.province,
          permit_category: inspectionData.permit_category,
          created_by: profile?.user_id
        })
        .select()
        .single();

      if (error) throw error;

      // Create invoice for the inspection if there are travel costs
      if (totalTravelCost > 0 && newInspection) {
        const invoiceNumber = generateInspectionInvoiceNumber();
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30); // 30 days from now

        const userId = permitData?.user_id || intentData?.user_id;
        const entityId = permitData?.entity_id || intentData?.entity_id;

        const { error: invoiceError } = await supabase
          .from('invoices')
          .insert({
            user_id: userId,
            permit_id: actualPermitApplicationId,
            intent_registration_id: actualIntentRegistrationId,
            entity_id: entityId,
            inspection_id: newInspection.id,
            invoice_number: invoiceNumber,
            invoice_type: 'inspection_fee',
            amount: totalTravelCost,
            currency: 'PGK',
            status: 'unpaid',
            due_date: dueDate.toISOString()
          });

        if (invoiceError) {
          console.error('Error creating inspection invoice:', invoiceError);
          toast.error('Inspection registered but invoice creation failed');
        } else {
          toast.success('Inspection registered and invoice generated successfully');
        }
      } else {
        toast.success('Inspection registered successfully');
      }

      await fetchInspections();
      return true;
    } catch (error) {
      console.error('Error creating inspection:', error);
      toast.error('Failed to register inspection');
      return false;
    }
  };

  const updateInspection = async (id: string, updates: Partial<Inspection>) => {
    try {
      const { error } = await supabase
        .from('inspections')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast.success('Inspection updated successfully');
      await fetchInspections();
      return true;
    } catch (error) {
      console.error('Error updating inspection:', error);
      toast.error('Failed to update inspection');
      return false;
    }
  };

  const suspendInspection = async (id: string, reason?: string) => {
    try {
      const { error } = await supabase
        .from('inspections')
        .update({ 
          status: 'suspended',
          notes: reason ? `Suspended: ${reason}` : 'Suspended'
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Inspection suspended successfully');
      await fetchInspections();
      return true;
    } catch (error) {
      console.error('Error suspending inspection:', error);
      toast.error('Failed to suspend inspection');
      return false;
    }
  };

  const reactivateInspection = async (id: string) => {
    try {
      const { error } = await supabase
        .from('inspections')
        .update({ 
          status: 'scheduled',
          notes: 'Reactivated from suspended status'
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Inspection reactivated successfully');
      await fetchInspections();
      return true;
    } catch (error) {
      console.error('Error reactivating inspection:', error);
      toast.error('Failed to reactivate inspection');
      return false;
    }
  };

  const deleteInspection = async (id: string) => {
    try {
      // First verify inspection is suspended
      const inspection = inspections.find(i => i.id === id);
      if (!inspection || inspection.status !== 'suspended') {
        toast.error('Only suspended inspections can be deleted');
        return false;
      }

      // Delete associated invoice first
      await supabase
        .from('invoices')
        .delete()
        .eq('inspection_id', id);

      const { error } = await supabase
        .from('inspections')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Inspection deleted successfully');
      await fetchInspections();
      return true;
    } catch (error) {
      console.error('Error deleting inspection:', error);
      toast.error('Failed to delete inspection');
      return false;
    }
  };

  return {
    inspections,
    loading,
    refetch: fetchInspections,
    createInspection,
    updateInspection,
    suspendInspection,
    reactivateInspection,
    deleteInspection
  };
}
