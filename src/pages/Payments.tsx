import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CreditCard, Clock, CheckCircle, Download, Receipt } from "lucide-react";

const payments = [
  {
    id: 1,
    invoiceNumber: "INV-2024-001",
    description: "Environmental Permit Application Fee",
    amount: 500.00,
    status: "paid",
    dueDate: "2024-01-30",
    paidDate: "2024-01-25",
    applicationId: "APP-2024-001"
  },
  {
    id: 2,
    invoiceNumber: "INV-2024-002",
    description: "Annual Compliance Monitoring Fee",
    amount: 1200.00,
    status: "pending",
    dueDate: "2024-02-15",
    paidDate: null,
    applicationId: "APP-2024-001"
  },
  {
    id: 3,
    invoiceNumber: "INV-2024-003",
    description: "Waste Management License Fee",
    amount: 750.00,
    status: "overdue",
    dueDate: "2024-01-15",
    paidDate: null,
    applicationId: "APP-2024-002"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "paid": return "bg-green-100 text-green-800";
    case "pending": return "bg-yellow-100 text-yellow-800";
    case "overdue": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "paid": return <CheckCircle className="w-4 h-4" />;
    case "pending": return <Clock className="w-4 h-4" />;
    case "overdue": return <Clock className="w-4 h-4" />;
    default: return <Clock className="w-4 h-4" />;
  }
};

export default function Payments() {
  const totalPaid = payments
    .filter(p => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = payments
    .filter(p => p.status !== "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Payment Management</h1>
        <p className="text-muted-foreground">
          View and manage payments for your applications and permits.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalPaid.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +2.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">${totalPending.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              2 pending payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Due</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">Feb 15</div>
            <p className="text-xs text-muted-foreground">
              $1,200.00 due
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            Payment History
          </CardTitle>
          <CardDescription>
            All payments and invoices for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-full">
                    {getStatusIcon(payment.status)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{payment.description}</h3>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>{payment.invoiceNumber}</span>
                      <span>•</span>
                      <span>Due: {payment.dueDate}</span>
                      {payment.paidDate && (
                        <>
                          <span>•</span>
                          <span>Paid: {payment.paidDate}</span>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Application: {payment.applicationId}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-semibold text-foreground">${payment.amount.toFixed(2)}</div>
                    <Badge className={getStatusColor(payment.status)}>
                      {payment.status}
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    {payment.status !== "paid" && (
                      <Button size="sm" className="bg-primary hover:bg-primary/90">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay Now
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Invoice
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}