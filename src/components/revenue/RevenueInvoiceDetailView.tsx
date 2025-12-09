import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';

import { format } from 'date-fns';
import emblem from '@/assets/png-emblem.png';
import { Invoice } from './types';

interface RevenueItemCode {
  id: string;
  item_number: string;
  item_name: string;
  item_description: string | null;
}

interface RevenueInvoiceDetailViewProps {
  invoice: Invoice & {
    inspection?: {
      inspection_type: string;
      province?: string;
      number_of_days?: number;
      scheduled_date: string;
    };
    intent_registration?: {
      activity_description: string;
      status: string;
    };
    verification_status?: string;
    verification_notes?: string;
    invoice_type?: string;
    item_code?: string | null;
    item_description?: string | null;
  };
  onBack: () => void;
  itemCodes?: RevenueItemCode[];
}

export function RevenueInvoiceDetailView({ 
  invoice, 
  onBack,
  itemCodes = []
}: RevenueInvoiceDetailViewProps) {

  // Use saved item_code and item_description, or fall back to matching from itemCodes
  const savedItemCode = invoice.item_code;
  const savedItemDescription = invoice.item_description;

  // Find matching item code for the invoice type (fallback for older invoices)
  const matchingItemCode = itemCodes.find(code => {
    const invoiceType = invoice.invoice_type?.toLowerCase() || '';
    const itemName = code.item_name.toLowerCase();
    if (invoiceType === 'inspection_fee' && itemName.includes('inspection')) return true;
    if (invoiceType === 'permit_fee' && (itemName.includes('permit') && itemName.includes('annual'))) return true;
    if (invoiceType === 'application_fee' && itemName.includes('application')) return true;
    if (invoiceType === 'intent_fee' && itemName.includes('intent')) return true;
    return false;
  });

  // Build the associated context string for description
  const getAssociatedDescription = () => {
    if (invoice.intent_registration) {
      return `for Associated Intent Registration\n${invoice.entity?.name || ''} ${invoice.intent_registration.activity_description}`;
    }
    if (invoice.permit) {
      return `for Associated Permit\n${invoice.entity?.name || ''} ${invoice.permit.title}`;
    }
    if (invoice.inspection) {
      return `for Associated Inspection\n${invoice.entity?.name || ''} ${invoice.inspection.inspection_type}`;
    }
    return '';
  };

  const associatedContext = getAssociatedDescription();

  // Calculate invoice items based on type with proper item codes
  const baseDescription = savedItemDescription || matchingItemCode?.item_name || (invoice.invoice_type === 'inspection_fee' 
    ? `Inspection Fee - ${invoice.inspection?.inspection_type || 'Field Inspection'}` 
    : invoice.permit?.title || 'Permit Application Fee');
  
  const fullDescription = associatedContext 
    ? `${baseDescription} - ${associatedContext}`
    : baseDescription;

  const invoiceItems = [
    {
      quantity: 1,
      itemCode: savedItemCode || matchingItemCode?.item_number || (invoice.invoice_type === 'inspection_fee' ? 'INSP-FEE' : 'PERMIT-FEE'),
      description: fullDescription,
      unitPrice: invoice.amount,
      disc: 0,
      totalPrice: invoice.amount
    }
  ];

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex justify-between items-center print:hidden">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Invoices
        </Button>
      </div>

      {/* Invoice Document */}
      <Card className="p-8 bg-white">
        {/* Header - Emblem Left, CEPA Info Middle, Invoice Details Right */}
        <div className="flex justify-between items-start mb-6 pb-4 border-b border-border">
          {/* Left - Emblem */}
          <div className="flex-shrink-0">
            <img src={emblem} alt="CEPA Emblem" className="w-20 h-20 object-contain" />
          </div>
          
          {/* Middle - Authority Info */}
          <div className="flex-1 px-6">
            <h1 className="text-lg font-bold text-foreground">
              Conservation & Environment Protection Authority
            </h1>
            <div className="text-sm text-muted-foreground mt-2 space-y-0.5">
              <p>Tower 1, Dynasty Twin Tower</p>
              <p>Savannah Heights, Waigani</p>
              <p>P.O. Box 6601/BOROKO, NCD</p>
              <p>Papua New Guinea</p>
            </div>
          </div>
          
          {/* Right - Invoice Details */}
          <div className="text-right">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <span className="font-semibold text-muted-foreground text-right">Invoice:</span>
              <span className="text-red-600 font-semibold">{invoice.invoice_number}</span>
              
              <span className="font-semibold text-muted-foreground text-right">Date:</span>
              <span className="font-semibold">{format(new Date(invoice.created_at), 'dd/MM/yyyy')}</span>
              
              <span className="font-semibold text-muted-foreground text-right">Your Ref:</span>
              <span className="font-semibold"></span>
              
              <span className="font-semibold text-muted-foreground text-right">Contact:</span>
              <span className="font-semibold">Kavau Diagoro, Manager Revenue</span>
              
              <span className="font-semibold text-muted-foreground text-right">Telephone:</span>
              <span className="font-semibold">(675) 3014665/3014614</span>
              
              <span className="font-semibold text-muted-foreground text-right">Email:</span>
              <span className="font-semibold text-green-600">revenuemanager@cepa.gov.pg</span>
            </div>
          </div>
        </div>

        {/* Client Information */}
        <div className="mb-6 p-4 border border-border">
          <div className="font-semibold text-foreground mb-2">Client:</div>
          <div className="text-sm">
            <p className="font-semibold text-foreground">{invoice.entity?.name || 'N/A'}</p>
          </div>
        </div>


        {/* Invoice Items Table */}
        <div className="mb-8">
          <table className="w-full border-collapse border border-border">
            <thead>
              <tr className="bg-muted/50">
                <th className="border border-border p-2 text-left text-sm font-semibold">QUANTITY</th>
                <th className="border border-border p-2 text-left text-sm font-semibold">ITEM CODE</th>
                <th className="border border-border p-2 text-left text-sm font-semibold">DESCRIPTION</th>
                <th className="border border-border p-2 text-right text-sm font-semibold">UNIT PRICE(ex. GST)</th>
                <th className="border border-border p-2 text-right text-sm font-semibold">DISC %</th>
                <th className="border border-border p-2 text-right text-sm font-semibold">TOTAL PRICE(ex. GST)</th>
              </tr>
            </thead>
            <tbody>
              {invoiceItems.map((item, index) => (
                <tr key={index}>
                  <td className="border border-border p-2 text-center">{item.quantity}</td>
                  <td className="border border-border p-2">{item.itemCode}</td>
                  <td className="border border-border p-2 whitespace-pre-line">{item.description}</td>
                  <td className="border border-border p-2 text-right">
                    K{item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="border border-border p-2 text-right">{item.disc}</td>
                  <td className="border border-border p-2 text-right">
                    K{item.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
              {/* Empty rows for spacing */}
              {Array(4).fill(0).map((_, index) => (
                <tr key={`empty-${index}`}>
                  <td className="border border-border p-2 h-12">&nbsp;</td>
                  <td className="border border-border p-2">&nbsp;</td>
                  <td className="border border-border p-2">&nbsp;</td>
                  <td className="border border-border p-2">&nbsp;</td>
                  <td className="border border-border p-2">&nbsp;</td>
                  <td className="border border-border p-2">&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mt-4">
            <div className="w-96 space-y-2">
              <div className="flex justify-between border border-border p-2">
                <span className="font-semibold">Subtotal:</span>
                <span>K{invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between border border-border p-2">
                <span className="font-semibold">Freight (ex. GST):</span>
                <span>K0.00</span>
              </div>
              <div className="flex justify-between border border-border p-2">
                <span className="font-semibold">GST:</span>
                <span>K0.00</span>
              </div>
              <div className="flex justify-between border border-border p-2 bg-muted/30">
                <span className="font-bold">Total (inc. GST):</span>
                <span className="font-bold">K{invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between border border-border p-2">
                <span className="font-semibold">Paid to Date:</span>
                <span>K{invoice.status === 'paid' ? invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}</span>
              </div>
              <div className="flex justify-between border border-border p-2 bg-muted/50">
                <span className="font-bold text-lg">Balance Due:</span>
                <span className="font-bold text-lg">
                  K{invoice.status === 'paid' ? '0.00' : invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Terms */}
        <div className="mb-8">
          <div className="font-bold text-foreground mb-2">PAYMENT TERMS:</div>
          <div className="text-sm text-muted-foreground ml-8">
            All payments must be processed via the CEPA e-Permit Portal through the respective client's dashboard.
          </div>
        </div>

        {/* Assigned Officer (Revenue Staff Info) */}
        {invoice.assigned_officer && (
          <div className="mb-4 text-sm">
            <span className="font-semibold">Assigned Officer:</span>{' '}
            {invoice.assigned_officer.full_name || 'N/A'} ({invoice.assigned_officer.email})
          </div>
        )}

        {/* Page Number */}
        <div className="text-right text-sm text-muted-foreground">
          Page 1 of 1
        </div>
      </Card>
    </div>
  );
}
