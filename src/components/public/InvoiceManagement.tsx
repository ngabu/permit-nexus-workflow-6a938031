import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Eye, Receipt } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { InvoiceDetailView } from './InvoiceDetailView';

interface Invoice {
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

// Mock data for 2 invoices with 3 permit applications
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

export function InvoiceManagement() {
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  // Listen for payment success events from PublicDashboard
  useEffect(() => {
    const handlePaymentSuccess = (event: CustomEvent<{ invoiceNumber: string; receiptUrl: string | null }>) => {
      const { invoiceNumber, receiptUrl } = event.detail;
      console.log('Payment success event received:', invoiceNumber, receiptUrl);
      
      // Update local invoice state to show as paid with receipt URL
      setInvoices(prev => prev.map(inv => 
        inv.invoice_number === invoiceNumber
          ? { ...inv, status: 'paid' as const, paidToDate: inv.totalInc, balanceDue: 0, receiptUrl: receiptUrl }
          : inv
      ));
    };

    window.addEventListener('payment-success', handlePaymentSuccess as EventListener);
    
    return () => {
      window.removeEventListener('payment-success', handlePaymentSuccess as EventListener);
    };
  }, []);

  const getStatusColor = (status: string) => {
    const colors = {
      unpaid: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      partial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      unpaid: 'Unpaid',
      paid: 'Paid',
      partial: 'Partial Payment',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const handlePayment = (invoice: Invoice) => {
    toast({
      title: "Payment Gateway",
      description: `Initiating payment for invoice ${invoice.invoice_number}`,
    });
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.prescribedActivity.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (selectedInvoice) {
    return (
      <InvoiceDetailView
        invoice={selectedInvoice}
        onBack={() => setSelectedInvoice(null)}
        onPayment={() => handlePayment(selectedInvoice)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Invoice Management</h2>
          <p className="text-muted-foreground">View and manage your permit-related invoices</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by invoice number, client, or activity..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="partial">Partial Payment</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoice List */}
      {filteredInvoices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No invoices found matching your criteria</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice Number</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Prescribed Activity</TableHead>
                <TableHead>Activity Level</TableHead>
                <TableHead>Permit Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                  <TableCell>{invoice.client}</TableCell>
                  <TableCell>{invoice.prescribedActivity}</TableCell>
                  <TableCell>{invoice.activityLevel}</TableCell>
                  <TableCell>{invoice.permitType}</TableCell>
                  <TableCell className="text-right font-semibold">
                    K{invoice.balanceDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(invoice.status)}>
                      {getStatusLabel(invoice.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedInvoice(invoice)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      {invoice.status === 'paid' && invoice.receiptUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-600 hover:bg-green-50"
                          onClick={() => window.open(invoice.receiptUrl!, '_blank')}
                        >
                          <Receipt className="w-4 h-4 mr-1" />
                          Receipt
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
