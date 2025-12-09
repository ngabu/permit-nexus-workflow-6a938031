import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchInvoices = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch invoices with related data for the current user
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
        .eq('user_id', user.id)
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
      
      // Transform the data to match the Invoice interface
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
          payment_status: invoice.payment_status || invoice.status,
        };
      });
      
      setInvoices(transformedData);
    } catch (err) {
      console.error('Error in fetchInvoices:', err);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Refresh a specific invoice from database
  const refreshInvoice = useCallback(async (invoiceNumber: string) => {
    try {
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
        .eq('invoice_number', invoiceNumber)
        .maybeSingle();

      if (error) {
        console.error('Error refreshing invoice:', error);
        return;
      }

      if (data) {
        // Fetch permit if needed
        let permitData = null;
        if (data.permit_id) {
          const { data: permit } = await supabase
            .from('permit_applications')
            .select('id, title, permit_number, permit_type, entity_name, entity_type')
            .eq('id', data.permit_id)
            .maybeSingle();
          permitData = permit;
        }

        const updatedInvoice: Invoice = {
          ...data,
          permit: permitData ? {
            title: permitData.title,
            permit_number: permitData.permit_number,
            permit_type: permitData.permit_type
          } : undefined,
          entity: data.entities && typeof data.entities === 'object' ? {
            name: (data.entities as any).name,
            entity_type: (data.entities as any).entity_type
          } : (permitData ? {
            name: permitData.entity_name,
            entity_type: permitData.entity_type
          } : undefined),
          inspection: data.inspections && typeof data.inspections === 'object' ? {
            id: (data.inspections as any).id,
            inspection_type: (data.inspections as any).inspection_type,
            scheduled_date: (data.inspections as any).scheduled_date,
            province: (data.inspections as any).province,
            number_of_days: (data.inspections as any).number_of_days
          } : undefined,
          intent_registration: data.intent_registrations && typeof data.intent_registrations === 'object' ? {
            id: (data.intent_registrations as any).id,
            activity_description: (data.intent_registrations as any).activity_description,
            status: (data.intent_registrations as any).status
          } : undefined,
          payment_status: data.payment_status || data.status,
        };

        setInvoices(prev => prev.map(inv => 
          inv.invoice_number === invoiceNumber ? updatedInvoice : inv
        ));

        if (data.status === 'paid' || data.payment_status === 'paid') {
          toast({
            title: "Payment Confirmed",
            description: `Invoice ${invoiceNumber} has been marked as paid.`,
          });
        }
      }
    } catch (err) {
      console.error('Error refreshing invoice:', err);
    }
  }, [toast]);

  // Update local invoice state (for immediate UI feedback)
  const updateLocalInvoice = useCallback((invoiceNumber: string, updates: Partial<Invoice>) => {
    setInvoices(prev => prev.map(inv => 
      inv.invoice_number === invoiceNumber
        ? { ...inv, ...updates }
        : inv
    ));
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return {
    invoices,
    loading,
    refreshInvoice,
    updateLocalInvoice,
    refetch: fetchInvoices
  };
}
