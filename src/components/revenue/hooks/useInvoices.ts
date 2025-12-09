
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
  source_dashboard?: string | null;
  item_code?: string | null;
  item_description?: string | null;
  // Verification fields
  verification_status?: string | null;
  verified_by?: string | null;
  verified_at?: string | null;
  verification_notes?: string | null;
  cepa_receipt_path?: string | null;
  stripe_receipt_url?: string | null;
  // New payment verification columns
  payment_receipt?: string | null;
  accounts_verified?: boolean | null;
  transaction_number?: string | null;
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
      // Fetch invoices with related data - using only tables that have FK relationships
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
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
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching invoices:', error);
        setInvoices([]);
        setLoading(false);
        return;
      }

      // Fetch permit applications separately for invoices that have permit_id
      const permitIds = (data || [])
        .filter(inv => inv.permit_id)
        .map(inv => inv.permit_id);
      
      let permitsMap: Record<string, any> = {};
      if (permitIds.length > 0) {
        const { data: permits } = await supabase
          .from('permit_applications')
          .select('id, title, permit_number, permit_type, entity_name, entity_type')
          .in('id', permitIds);
        
        if (permits) {
          permitsMap = permits.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
        }
      }

      // Fetch assigned officer profiles separately
      const officerIds = (data || [])
        .filter(inv => inv.assigned_officer_id)
        .map(inv => inv.assigned_officer_id);
      
      let officersMap: Record<string, any> = {};
      if (officerIds.length > 0) {
        const { data: officers } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .in('id', officerIds);
        
        if (officers) {
          officersMap = officers.reduce((acc, o) => ({ ...acc, [o.id]: o }), {});
        }
      }
      
      // Transform the data to match the Invoice interface using lookup maps
      const transformedData = (data || []).map(invoice => {
        const permitData = invoice.permit_id ? permitsMap[invoice.permit_id] : null;
        const officerData = invoice.assigned_officer_id ? officersMap[invoice.assigned_officer_id] : null;
        
        return {
          ...invoice,
          permit: permitData ? {
            title: permitData.title,
            permit_number: permitData.permit_number,
            permit_type: permitData.permit_type
          } : undefined,
          entity: invoice.entities && typeof invoice.entities === 'object' ? {
            name: (invoice.entities as any).name,
            entity_type: (invoice.entities as any).entity_type
          } : (permitData ? {
            name: permitData.entity_name,
            entity_type: permitData.entity_type
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
          assigned_officer: officerData ? {
            full_name: `${officerData.first_name || ''} ${officerData.last_name || ''}`.trim() || null,
            email: officerData.email
          } : undefined,
          payment_status: invoice.status,
          follow_up_date: invoice.follow_up_date,
          follow_up_notes: invoice.follow_up_notes
        };
      });
      
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

  const suspendInvoice = async (invoiceId: string, sourceDashboard?: string) => {
    // Only allow suspension if the invoice was created on the revenue dashboard
    if (sourceDashboard && sourceDashboard !== 'revenue') {
      const dashboardName = sourceDashboard.charAt(0).toUpperCase() + sourceDashboard.slice(1);
      return { 
        success: false, 
        error: `This invoice was created on the ${dashboardName} Dashboard and cannot be suspended from the Revenue Dashboard. Please contact the ${dashboardName} team to manage this invoice.` 
      };
    }
    
    try {
      const { data, error } = await supabase
        .from('invoices')
        .update({ 
          status: 'suspended',
          updated_at: new Date().toISOString()
        })
        .eq('id', invoiceId)
        .select();

      if (error) {
        console.error('Suspend invoice error:', error);
        // Parse Supabase error and return user-friendly message
        let userMessage = 'Unable to suspend this invoice. ';
        if (error.code === '42501' || error.message?.includes('permission')) {
          userMessage += 'You do not have permission to suspend this invoice.';
        } else if (error.code === '23503' || error.message?.includes('foreign key')) {
          userMessage += 'This invoice has related records that prevent suspension.';
        } else if (error.code === 'PGRST116') {
          userMessage += 'Invoice not found or has already been modified.';
        } else {
          userMessage += error.message || 'Please try again or contact support if the issue persists.';
        }
        return { success: false, error: userMessage };
      }

      // Check if any rows were actually updated
      if (!data || data.length === 0) {
        return { success: false, error: 'No invoice was updated. This may be due to insufficient permissions.' };
      }

      // Refresh the invoices list
      fetchInvoices();
      return { success: true };
    } catch (error: any) {
      console.error('Error suspending invoice:', error);
      return { 
        success: false, 
        error: error?.message || 'An unexpected error occurred while suspending the invoice. Please try again or contact support.' 
      };
    }
  };

  const reactivateInvoice = async (invoiceId: string, sourceDashboard?: string) => {
    // Only allow reactivation if the invoice was created on the revenue dashboard
    if (sourceDashboard && sourceDashboard !== 'revenue') {
      const dashboardName = sourceDashboard.charAt(0).toUpperCase() + sourceDashboard.slice(1);
      return { 
        success: false, 
        error: `This invoice was created on the ${dashboardName} Dashboard and cannot be reactivated from the Revenue Dashboard. Please contact the ${dashboardName} team to manage this invoice.` 
      };
    }
    
    try {
      const { data, error } = await supabase
        .from('invoices')
        .update({ 
          status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', invoiceId)
        .select();

      if (error) {
        console.error('Reactivate invoice error:', error);
        let userMessage = 'Unable to reactivate this invoice. ';
        if (error.code === '42501' || error.message?.includes('permission')) {
          userMessage += 'You do not have permission to reactivate this invoice.';
        } else {
          userMessage += error.message || 'Please try again or contact support if the issue persists.';
        }
        return { success: false, error: userMessage };
      }

      if (!data || data.length === 0) {
        return { success: false, error: 'No invoice was updated. This may be due to insufficient permissions.' };
      }

      // Refresh the invoices list
      fetchInvoices();
      return { success: true };
    } catch (error: any) {
      console.error('Error reactivating invoice:', error);
      return { 
        success: false, 
        error: error?.message || 'An unexpected error occurred while reactivating the invoice. Please try again or contact support.' 
      };
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
    if (profile?.staff_unit === 'revenue' || profile?.user_type === 'admin' || profile?.user_type === 'super_admin') {
      fetchInvoices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.staff_unit, profile?.user_type]);

  const deleteInvoice = async (invoiceId: string, sourceDashboard?: string) => {
    // Only allow deletion if the invoice was created on the revenue dashboard
    if (sourceDashboard && sourceDashboard !== 'revenue') {
      const dashboardName = sourceDashboard.charAt(0).toUpperCase() + sourceDashboard.slice(1);
      return { 
        success: false, 
        error: `This invoice was created on the ${dashboardName} Dashboard and cannot be deleted from the Revenue Dashboard. Please contact the ${dashboardName} team to manage this invoice.` 
      };
    }
    
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId);

      if (error) {
        let userMessage = 'Unable to delete this invoice. ';
        if (error.code === '42501' || error.message?.includes('permission')) {
          userMessage += 'You do not have permission to delete this invoice.';
        } else if (error.code === '23503' || error.message?.includes('foreign key')) {
          userMessage += 'This invoice has related records that prevent deletion.';
        } else if (error.code === 'PGRST116') {
          userMessage += 'Invoice not found or has already been deleted.';
        } else {
          userMessage += 'Please try again or contact support if the issue persists.';
        }
        return { success: false, error: userMessage };
      }

      // Refresh the invoices list
      fetchInvoices();
      return { success: true };
    } catch (error) {
      console.error('Error deleting invoice:', error);
      return { 
        success: false, 
        error: 'An unexpected error occurred while deleting the invoice. Please try again or contact support.' 
      };
    }
  };

  return { 
    invoices, 
    loading, 
    updateInvoice,
    updateInvoicePaymentStatus, 
    scheduleFollowUp,
    suspendInvoice,
    reactivateInvoice,
    deleteInvoice,
    refetch: fetchInvoices 
  };
}
