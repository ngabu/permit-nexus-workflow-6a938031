
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: string;
  payment_status: string | null;
  due_date: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  assigned_officer_id: string | null;
  follow_up_date: string | null;
  follow_up_notes: string | null;
  paid_date?: string;
  invoice_type?: string;
  inspection_id?: string | null;
  intent_registration_id?: string | null;
  document_path?: string | null;
  // Verification fields
  verification_status?: string | null;
  verified_by?: string | null;
  verified_at?: string | null;
  verification_notes?: string | null;
  cepa_receipt_path?: string | null;
  stripe_receipt_url?: string | null;
  permit?: {
    title: string;
    permit_number: string | null;
    permit_type: string;
  };
  entity?: {
    name: string;
    entity_type: string;
  };
  inspection?: {
    id: string;
    inspection_type: string;
    scheduled_date: string;
    province: string | null;
    number_of_days: number;
  };
  intent_registration?: {
    id: string;
    activity_description: string;
    status: string;
  };
  assigned_officer?: {
    full_name: string | null;
    email: string;
  };
}

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          permit_applications (
            id,
            title,
            permit_number,
            permit_type,
            entity_name,
            entity_type
          ),
          inspections (
            id,
            inspection_type,
            scheduled_date,
            province,
            number_of_days
          ),
          intent_registrations (
            id,
            activity_description,
            status
          ),
          entities (
            id,
            name,
            entity_type
          ),
          profiles!assigned_officer_id (
            id,
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching invoices:', error);
        setInvoices([]);
        setLoading(false);
        return;
      }
      
      // Transform the data to match the Invoice interface
      const transformedData = (data || []).map(invoice => ({
        ...invoice,
        permit: invoice.permit_applications && typeof invoice.permit_applications === 'object' ? {
          title: (invoice.permit_applications as any).title,
          permit_number: (invoice.permit_applications as any).permit_number,
          permit_type: (invoice.permit_applications as any).permit_type
        } : undefined,
        entity: invoice.entities && typeof invoice.entities === 'object' ? {
          name: (invoice.entities as any).name,
          entity_type: (invoice.entities as any).entity_type
        } : (invoice.permit_applications && typeof invoice.permit_applications === 'object' ? {
          name: (invoice.permit_applications as any).entity_name,
          entity_type: (invoice.permit_applications as any).entity_type
        } : undefined),
        inspection: invoice.inspections && typeof invoice.inspections === 'object' ? {
          id: (invoice.inspections as any).id,
          inspection_type: (invoice.inspections as any).inspection_type,
          scheduled_date: (invoice.inspections as any).scheduled_date,
          province: (invoice.inspections as any).province,
          number_of_days: (invoice.inspections as any).number_of_days
        } : undefined,
        intent_registration: invoice.intent_registrations && typeof invoice.intent_registrations === 'object' ? {
          id: (invoice.intent_registrations as any).id,
          activity_description: (invoice.intent_registrations as any).activity_description,
          status: (invoice.intent_registrations as any).status
        } : undefined,
        assigned_officer: invoice.profiles && typeof invoice.profiles === 'object' && invoice.profiles !== null ? {
          full_name: (invoice.profiles as any).full_name,
          email: (invoice.profiles as any).email
        } : undefined,
        payment_status: invoice.status,
        follow_up_date: invoice.follow_up_date,
        follow_up_notes: invoice.follow_up_notes
      }));
      
      setInvoices(transformedData);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateInvoice = async (invoiceId: string, updates: Partial<Invoice>) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', invoiceId);

      if (error) throw error;

      // Refresh the invoices list
      fetchInvoices();
      return { success: true };
    } catch (error) {
      console.error('Error updating invoice:', error);
      return { success: false, error };
    }
  };

  const updateInvoicePaymentStatus = async (invoiceId: string, status: string, followUpNotes?: string) => {
    try {
      const updateData: any = {
        payment_status: status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'paid') {
        updateData.paid_date = new Date().toISOString();
      }

      if (followUpNotes) {
        updateData.follow_up_notes = followUpNotes;
        updateData.follow_up_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', invoiceId);

      if (error) throw error;

      // Refresh the invoices list
      fetchInvoices();
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  };

  const scheduleFollowUp = async (invoiceId: string, followUpDate: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({
          follow_up_date: followUpDate,
          follow_up_notes: notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', invoiceId);

      if (error) throw error;

      // Refresh the invoices list
      fetchInvoices();
    } catch (error) {
      console.error('Error scheduling follow-up:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (profile?.operational_unit === 'revenue' || profile?.role === 'admin') {
      fetchInvoices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.operational_unit, profile?.role]);

  return { 
    invoices, 
    loading, 
    updateInvoice,
    updateInvoicePaymentStatus, 
    scheduleFollowUp,
    refetch: fetchInvoices 
  };
}
