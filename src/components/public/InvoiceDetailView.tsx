import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Download, Printer, CreditCard } from 'lucide-react';
import emblem from '@/assets/png-emblem.png';

interface InvoiceItem {
  quantity: number;
  itemCode: string;
  description: string;
  unitPrice: number;
  disc: number;
  totalPrice: number;
}

interface InvoiceDetailProps {
  invoice: {
    id: string;
    invoice_number: string;
    date: string;
    yourRef: string;
    contact: string;
    telephone: string;
    email: string;
    client: string;
    clientAddress: string;
    items: InvoiceItem[];
    subtotal: number;
    freight: number;
    gst: number;
    totalInc: number;
    paidToDate: number;
    balanceDue: number;
    status: string;
  };
  onBack: () => void;
  onPayment: () => void;
}

export function InvoiceDetailView({ invoice, onBack, onPayment }: InvoiceDetailProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Download functionality would be implemented here
    console.log('Download invoice');
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex justify-between items-center print:hidden">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Invoices
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          {invoice.status !== 'paid' && (
            <Button onClick={onPayment} className="bg-gradient-to-r from-forest-600 to-nature-600">
              <CreditCard className="w-4 h-4 mr-2" />
              Online Payment
            </Button>
          )}
        </div>
      </div>

      {/* Invoice Document */}
      <Card className="p-8 bg-white">
        {/* Header with Emblem and Authority Info */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-start gap-4">
            <img src={emblem} alt="CEPA Emblem" className="w-24 h-24 object-contain" />
            <div>
              <h1 className="text-lg font-bold text-foreground">
                Conservation & Environment Protection Authority
              </h1>
              <div className="text-sm text-muted-foreground mt-2 space-y-1">
                <p>Tower 1, Dynasty Twin Tower</p>
                <p>Savannah Heights, Waigani</p>
                <p>P.O. Box 6601/BOROKO, NCD</p>
                <p>Papua New Guinea</p>
              </div>
            </div>
          </div>
          
          <div className="text-right space-y-2">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <span className="font-semibold text-muted-foreground">Invoice:</span>
              <span className="text-red-600 font-semibold">{invoice.invoice_number}</span>
              
              <span className="font-semibold text-muted-foreground">Date:</span>
              <span className="font-semibold">{invoice.date}</span>
              
              <span className="font-semibold text-muted-foreground">Your Ref:</span>
              <span className="font-semibold">{invoice.yourRef}</span>
              
              <span className="font-semibold text-muted-foreground">Contact:</span>
              <span className="font-semibold">{invoice.contact}</span>
              
              <span className="font-semibold text-muted-foreground">Telephone:</span>
              <span className="font-semibold">{invoice.telephone}</span>
              
              <span className="font-semibold text-muted-foreground">Email:</span>
              <span className="font-semibold text-primary">{invoice.email}</span>
            </div>
          </div>
        </div>

        {/* Client Information */}
        <div className="mb-8 p-4 border border-border">
          <div className="font-semibold text-foreground mb-2">Client:</div>
          <div className="text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">{invoice.client}</p>
            <p>{invoice.clientAddress}</p>
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
              {invoice.items.map((item, index) => (
                <tr key={index}>
                  <td className="border border-border p-2 text-center">{item.quantity}</td>
                  <td className="border border-border p-2">{item.itemCode}</td>
                  <td className="border border-border p-2">{item.description}</td>
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
              {Array(5 - invoice.items.length).fill(0).map((_, index) => (
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
                <span>K{invoice.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between border border-border p-2">
                <span className="font-semibold">Freight (ex. GST):</span>
                <span>K{invoice.freight.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between border border-border p-2">
                <span className="font-semibold">GST:</span>
                <span>K{invoice.gst.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between border border-border p-2 bg-muted/30">
                <span className="font-bold">Total (inc. GST):</span>
                <span className="font-bold">K{invoice.totalInc.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between border border-border p-2">
                <span className="font-semibold">Paid to Date:</span>
                <span>K{invoice.paidToDate.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between border border-border p-2 bg-muted/50">
                <span className="font-bold text-lg">Balance Due:</span>
                <span className="font-bold text-lg">K{invoice.balanceDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Terms */}
        <div className="mb-8">
          <div className="font-bold text-foreground mb-2">PAYMENT TERMS:</div>
          <div className="text-sm text-muted-foreground ml-8">
            Cheque payable to:
            <div className="font-semibold text-foreground mt-1">
              CONSERVATION & ENVIRONMENT PROTECTION AUTHORITY
            </div>
          </div>
        </div>

        {/* Bank Accounts */}
        <div className="grid grid-cols-3 gap-4 text-sm mb-8">
          <div className="border border-border p-4">
            <div className="font-bold text-center mb-3">RECURRENT ACCOUNT</div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="font-semibold">BANK:</span>
                <span>BANK SOUTH PACIFIC</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">ACCOUNT:</span>
                <span>7003101749</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">BRANCH:</span>
                <span>PORT MORESBY</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">BSB:</span>
                <span>088-294</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">SWIFTCODE:</span>
                <span>BOSPPGPM</span>
              </div>
            </div>
          </div>

          <div className="border border-border p-4">
            <div className="font-bold text-center mb-3">OPERATIONAL ACCOUNT</div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="font-semibold">BANK:</span>
                <span>BANK SOUTH PACIFIC</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">ACCOUNT:</span>
                <span>7003101905</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">BRANCH:</span>
                <span>PORT MORESBY</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">BSB:</span>
                <span>088-294</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">SWIFTCODE:</span>
                <span>BOSPPGPM</span>
              </div>
            </div>
          </div>

          <div className="border border-border p-4">
            <div className="font-bold text-center mb-3">DOF-CEPA REVENUE ACCOUNT</div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="font-semibold">BANK:</span>
                <span>BANK SOUTH PACIFIC</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">ACCOUNT:</span>
                <span>7012975319</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">BRANCH:</span>
                <span>PORT MORESBY</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">BSB:</span>
                <span>088-294</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">SWIFTCODE:</span>
                <span>BOSPPGPM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page Number */}
        <div className="text-right text-sm text-muted-foreground">
          Page 1 of 1
        </div>
      </Card>
    </div>
  );
}
