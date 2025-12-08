import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Invoice {
  id: string;
  invoice_number: string;
  date: string;
  yourRef: string;
  contact: string;
  telephone: string;
  email: string;
  client: string;
  clientAddress: string;
  items: {
    quantity: number;
    itemCode: string;
    description: string;
    unitPrice: number;
    disc: number;
    totalPrice: number;
  }[];
  subtotal: number;
  freight: number;
  gst: number;
  totalInc: number;
  paidToDate: number;
  balanceDue: number;
  status: 'paid' | 'unpaid' | 'partial';
  permitType: string;
  activityLevel: string;
  prescribedActivity: string;
  receiptUrl?: string | null;
}

// Mock data for demo purposes - will be synced to database
const MOCK_INVOICES: Invoice[] = [
  {
    id: '1',
    invoice_number: '23-F1-3-188',
    date: '20/03/2025',
    yourRef: 'EP-L3(07B)',
    contact: 'Kavau Diagoro, Manager Revenue',
    telephone: '(675) 3014665/3014614',
    email: 'revenuemanager@cepa.gov.pg',
    client: 'Morobe Consolidates Goldfields Limited',
    clientAddress: 'P.O Box 4018 Lae, Morobe\nPapua New Guinea',
    items: [
      {
        quantity: 1,
        itemCode: 'F1',
        description: 'Annual Fee - Level 3 Mining Operation',
        unitPrice: 543170.00,
        disc: 0,
        totalPrice: 543170.00
      }
    ],
    subtotal: 543170.00,
    freight: 0.00,
    gst: 0.00,
    totalInc: 543170.00,
    paidToDate: 0.00,
    balanceDue: 543170.00,
    status: 'unpaid',
    permitType: 'Environment Permit',
    activityLevel: 'Level 3',
    prescribedActivity: 'Mining and Quarrying Operations'
  },
  {
    id: '2',
    invoice_number: '23-F2-2A-095',
    date: '15/03/2025',
    yourRef: 'EP-L2A(04C)',
    contact: 'Kavau Diagoro, Manager Revenue',
    telephone: '(675) 3014665/3014614',
    email: 'revenuemanager@cepa.gov.pg',
    client: 'Pacific Industrial Services Ltd',
    clientAddress: 'Section 117, Allotment 23\nPort Moresby, NCD\nPapua New Guinea',
    items: [
      {
        quantity: 1,
        itemCode: 'F2',
        description: 'Annual Fee - Level 2A Waste Management',
        unitPrice: 125500.00,
        disc: 0,
        totalPrice: 125500.00
      }
    ],
    subtotal: 125500.00,
    freight: 0.00,
    gst: 0.00,
    totalInc: 125500.00,
    paidToDate: 62750.00,
    balanceDue: 62750.00,
    status: 'partial',
    permitType: 'Environment Permit',
    activityLevel: 'Level 2A',
    prescribedActivity: 'Waste Treatment and Disposal Facility'
  },
  {
    id: '3',
    invoice_number: '23-F3-1-042',
    date: '10/03/2025',
    yourRef: 'EP-L1(02A)',
    contact: 'Kavau Diagoro, Manager Revenue',
    telephone: '(675) 3014665/3014614',
    email: 'revenuemanager@cepa.gov.pg',
    client: 'Coastal Aquaculture PNG',
    clientAddress: 'P.O Box 892\nMadang, Madang Province\nPapua New Guinea',
    items: [
      {
        quantity: 1,
        itemCode: 'F3',
        description: 'Annual Fee - Level 1 Aquaculture Operation',
        unitPrice: 45200.00,
        disc: 0,
        totalPrice: 45200.00
      }
    ],
    subtotal: 45200.00,
    freight: 0.00,
    gst: 0.00,
    totalInc: 45200.00,
    paidToDate: 45200.00,
    balanceDue: 0.00,
    status: 'paid',
    permitType: 'Environment Permit',
    activityLevel: 'Level 1',
    prescribedActivity: 'Aquaculture and Fish Farming'
  }
];

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch invoices from database, seeding with mock data if empty
  const fetchInvoices = useCallback(async () => {
    if (!user) return;

    try {
      // First check if we have any invoices in the database for this user
      const { data: dbInvoices, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching invoices:', error);
        // Fall back to mock data if there's an error
        setInvoices(MOCK_INVOICES);
        return;
      }

      if (dbInvoices && dbInvoices.length > 0) {
        // Fetch entity names for invoices
        const entityIds = [...new Set(dbInvoices.filter(inv => inv.entity_id).map(inv => inv.entity_id))];
        let entitiesMap: Record<string, string> = {};
        
        if (entityIds.length > 0) {
          const { data: entities } = await supabase
            .from('entities')
            .select('id, name')
            .in('id', entityIds);
          
          if (entities) {
            entitiesMap = entities.reduce((acc, e) => ({ ...acc, [e.id]: e.name }), {});
          }
        }

        // Map database invoices to our Invoice interface
        const mappedInvoices: Invoice[] = dbInvoices.map(inv => {
          const invoiceType = inv.invoice_type || 'permit_fee';
          const isInspectionFee = invoiceType === 'inspection_fee';
          
          return {
            id: inv.id,
            invoice_number: inv.invoice_number || '',
            date: inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-GB') : '',
            yourRef: isInspectionFee ? 'INS-FEE' : '',
            contact: 'Kavau Diagoro, Manager Revenue',
            telephone: '(675) 3014665/3014614',
            email: 'revenuemanager@cepa.gov.pg',
            client: inv.entity_id ? (entitiesMap[inv.entity_id] || 'Unknown Entity') : '',
            clientAddress: '',
            items: isInspectionFee ? [
              {
                quantity: 1,
                itemCode: 'INS-FEE',
                description: 'Inspection Travel Costs',
                unitPrice: Number(inv.amount) || 0,
                disc: 0,
                totalPrice: Number(inv.amount) || 0
              }
            ] : [],
            subtotal: Number(inv.amount) || 0,
            freight: 0,
            gst: 0,
            totalInc: Number(inv.amount) || 0,
            paidToDate: inv.payment_status === 'paid' ? Number(inv.amount) : 0,
            balanceDue: inv.payment_status === 'paid' ? 0 : Number(inv.amount),
            status: (inv.payment_status || inv.status || 'unpaid') as 'paid' | 'unpaid' | 'partial',
            permitType: isInspectionFee ? 'Inspection Fee' : 'Environment Permit',
            activityLevel: '',
            prescribedActivity: isInspectionFee ? 'Site Inspection' : '',
            receiptUrl: inv.document_path
          };
        });
        setInvoices(mappedInvoices);
      } else {
        // No invoices in DB - seed with mock data
        console.log('No invoices found, seeding mock data...');
        await seedMockInvoices();
      }
    } catch (err) {
      console.error('Error in fetchInvoices:', err);
      setInvoices(MOCK_INVOICES);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Seed mock invoices to database
  const seedMockInvoices = async () => {
    if (!user) return;

    try {
      for (const mockInv of MOCK_INVOICES) {
        const { error } = await supabase.from('invoices').insert({
          user_id: user.id,
          invoice_number: mockInv.invoice_number,
          amount: mockInv.totalInc,
          currency: 'PGK',
          status: mockInv.status,
          payment_status: mockInv.status,
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });

        if (error) {
          console.error('Error seeding invoice:', error);
        }
      }

      // Fetch again after seeding
      const { data: dbInvoices } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id);

      if (dbInvoices) {
        // Merge DB data with mock data for display
        const mergedInvoices = MOCK_INVOICES.map(mock => {
          const dbInv = dbInvoices.find(db => db.invoice_number === mock.invoice_number);
          if (dbInv) {
            return {
              ...mock,
              id: dbInv.id,
              status: (dbInv.payment_status || dbInv.status || mock.status) as 'paid' | 'unpaid' | 'partial',
              paidToDate: dbInv.payment_status === 'paid' ? mock.totalInc : mock.paidToDate,
              balanceDue: dbInv.payment_status === 'paid' ? 0 : mock.balanceDue,
              receiptUrl: dbInv.document_path
            };
          }
          return mock;
        });
        setInvoices(mergedInvoices);
      }
    } catch (err) {
      console.error('Error seeding invoices:', err);
      setInvoices(MOCK_INVOICES);
    }
  };

  // Refresh a specific invoice from database
  const refreshInvoice = useCallback(async (invoiceNumber: string) => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('invoice_number', invoiceNumber)
        .maybeSingle();

      if (error) {
        console.error('Error refreshing invoice:', error);
        return;
      }

      if (data) {
        setInvoices(prev => prev.map(inv => 
          inv.invoice_number === invoiceNumber
            ? {
                ...inv,
                id: data.id,
                status: (data.payment_status || data.status || 'unpaid') as 'paid' | 'unpaid' | 'partial',
                paidToDate: data.payment_status === 'paid' ? inv.totalInc : inv.paidToDate,
                balanceDue: data.payment_status === 'paid' ? 0 : inv.balanceDue,
                receiptUrl: data.document_path
              }
            : inv
        ));

        if (data.payment_status === 'paid') {
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