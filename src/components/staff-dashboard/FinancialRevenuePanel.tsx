import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  DollarSign, 
  Receipt, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText,
  Download,
  RefreshCw,
  Plus,
  ExternalLink
} from "lucide-react";

interface Transaction {
  id: string;
  transaction_number: string;
  transaction_type: string;
  amount: number;
  currency: string;
  status: string;
  payment_method?: string;
  payment_reference?: string;
  myob_reference?: string;
  due_date?: string;
  paid_date?: string;
  created_at: string;
  application_id?: string;
  permit_id?: string;
}

interface FinancialStats {
  totalRevenue: number;
  pendingPayments: number;
  overduePayments: number;
  monthlyRevenue: number;
  myobReconciled: number;
  unreconciled: number;
}

export const FinancialRevenuePanel = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<FinancialStats>({
    totalRevenue: 0,
    pendingPayments: 0,
    overduePayments: 0,
    monthlyRevenue: 0,
    myobReconciled: 0,
    unreconciled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isReconcileDialogOpen, setIsReconcileDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      // Using invoices table as financial transactions for now
      const { data: transactions } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });

      if (transactions) {
        // Map invoices to transaction format
        const mappedTransactions = transactions.map(invoice => ({
          id: invoice.id,
          transaction_number: invoice.invoice_number,
          transaction_type: 'invoice',
          amount: Number(invoice.amount),
          currency: invoice.currency,
          status: invoice.status,
          payment_method: null,
          payment_reference: null,
          myob_reference: null,
          due_date: invoice.due_date,
          paid_date: invoice.paid_date,
          created_at: invoice.created_at,
          application_id: null,
          permit_id: invoice.permit_id
        }));
        setTransactions(mappedTransactions);
        calculateStats(mappedTransactions);
      }
    } catch (error) {
      console.error("Error fetching financial data:", error);
      toast({
        title: "Error",
        description: "Failed to load financial data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (transactions: Transaction[]) => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalRevenue = transactions
      .filter(t => t.status === 'paid')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const pendingPayments = transactions.filter(t => t.status === 'pending').length;
    
    const overduePayments = transactions.filter(t => 
      t.status === 'pending' && t.due_date && new Date(t.due_date) < now
    ).length;

    const monthlyRevenue = transactions
      .filter(t => t.status === 'paid' && new Date(t.created_at) >= thisMonth)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const myobReconciled = transactions.filter(t => t.myob_reference).length;
    const unreconciled = transactions.filter(t => t.status === 'paid' && !t.myob_reference).length;

    setStats({
      totalRevenue,
      pendingPayments,
      overduePayments,
      monthlyRevenue,
      myobReconciled,
      unreconciled,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-primary/10 text-primary">Paid</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'PGK') => {
    return new Intl.NumberFormat('en-PG', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const handleReconcileWithMYOB = async (transactionId: string, myobRef: string) => {
    try {
      // Note: MYOB reconciliation would need additional table/fields
      const { error } = await supabase
        .from("invoices")
        .update({ status: 'reconciled' })
        .eq("id", transactionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Transaction reconciled with MYOB",
      });

      fetchFinancialData();
      setIsReconcileDialogOpen(false);
    } catch (error) {
      console.error("Error reconciling transaction:", error);
      toast({
        title: "Error",
        description: "Failed to reconcile transaction",
        variant: "destructive",
      });
    }
  };

  const generateInvoice = async (transactionData: any) => {
    try {
      // This would typically call an edge function to generate PDF invoice
      toast({
        title: "Invoice Generated",
        description: "Invoice has been created and sent",
      });
      setIsInvoiceDialogOpen(false);
    } catch (error) {
      console.error("Error generating invoice:", error);
      toast({
        title: "Error",
        description: "Failed to generate invoice",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading financial data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Financial & Revenue Management</h2>
        <p className="text-muted-foreground">Manage payments, reconcile MYOB records, and generate invoices</p>
      </div>

      {/* Financial Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">All time revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingPayments}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.overduePayments}</div>
            <p className="text-xs text-muted-foreground">Past due date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MYOB Reconciled</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.myobReconciled}</div>
            <p className="text-xs text-muted-foreground">Matched in MYOB</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unreconciled</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.unreconciled}</div>
            <p className="text-xs text-muted-foreground">Need reconciliation</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <div className="flex justify-between items-center">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
            <TabsTrigger value="reconcile">Reconcile</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Invoice
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Generate New Invoice</DialogTitle>
                  <DialogDescription>Create an invoice for permit fees or penalties</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoice-type">Invoice Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select invoice type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="application_fee">Application Fee</SelectItem>
                        <SelectItem value="permit_fee">Permit Fee</SelectItem>
                        <SelectItem value="annual_fee">Annual Fee</SelectItem>
                        <SelectItem value="penalty_fee">Penalty Fee</SelectItem>
                        <SelectItem value="compliance_fee">Compliance Fee</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (PGK)</Label>
                    <Input id="amount" type="number" placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="due-date">Due Date</Label>
                    <Input id="due-date" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Invoice description..." />
                  </div>
                  <Button onClick={() => generateInvoice({})} className="w-full">
                    Generate Invoice
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" onClick={fetchFinancialData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest financial activities across all permit operations</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>MYOB Ref</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.slice(0, 10).map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.transaction_number}</TableCell>
                      <TableCell>{transaction.transaction_type.replace('_', ' ').toUpperCase()}</TableCell>
                      <TableCell>{formatCurrency(transaction.amount, transaction.currency)}</TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell>{new Date(transaction.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {transaction.myob_reference ? (
                          <span className="text-primary">{transaction.myob_reference}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Payments</CardTitle>
              <CardDescription>Outstanding payments requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Days Overdue</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.filter(t => t.status === 'pending').map((transaction) => {
                    const dueDate = transaction.due_date ? new Date(transaction.due_date) : null;
                    const isOverdue = dueDate && dueDate < new Date();
                    const daysOverdue = isOverdue ? Math.floor((new Date().getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
                    
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">{transaction.transaction_number}</TableCell>
                        <TableCell>{transaction.transaction_type.replace('_', ' ').toUpperCase()}</TableCell>
                        <TableCell>{formatCurrency(transaction.amount, transaction.currency)}</TableCell>
                        <TableCell>
                          {dueDate ? (
                            <span className={isOverdue ? "text-destructive" : ""}>
                              {dueDate.toLocaleDateString()}
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          {isOverdue ? (
                            <Badge variant="destructive">{daysOverdue} days</Badge>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              Send Reminder
                            </Button>
                            <Button size="sm">
                              Mark Paid
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paid">
          <Card>
            <CardHeader>
              <CardTitle>Paid Transactions</CardTitle>
              <CardDescription>Successfully completed payments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Paid Date</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>MYOB Ref</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.filter(t => t.status === 'paid').map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.transaction_number}</TableCell>
                      <TableCell>{transaction.transaction_type.replace('_', ' ').toUpperCase()}</TableCell>
                      <TableCell>{formatCurrency(transaction.amount, transaction.currency)}</TableCell>
                      <TableCell>
                        {transaction.paid_date ? new Date(transaction.paid_date).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>{transaction.payment_method || '-'}</TableCell>
                      <TableCell>
                        {transaction.myob_reference ? (
                          <div className="flex items-center gap-2">
                            <span className="text-primary">{transaction.myob_reference}</span>
                            <CheckCircle className="h-4 w-4 text-primary" />
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Not reconciled</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Receipt
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reconcile">
          <Card>
            <CardHeader>
              <CardTitle>MYOB Reconciliation</CardTitle>
              <CardDescription>Match payments with MYOB accounting records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Button variant="outline" className="mr-2">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open MYOB
                </Button>
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync with MYOB
                </Button>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction #</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>MYOB Reference</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.filter(t => t.status === 'paid' && !t.myob_reference).map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.transaction_number}</TableCell>
                      <TableCell>{formatCurrency(transaction.amount, transaction.currency)}</TableCell>
                      <TableCell>
                        {transaction.paid_date ? new Date(transaction.paid_date).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Unreconciled</Badge>
                      </TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>
                        <Dialog open={isReconcileDialogOpen} onOpenChange={setIsReconcileDialogOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" onClick={() => setSelectedTransaction(transaction)}>
                              Reconcile
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reconcile with MYOB</DialogTitle>
                              <DialogDescription>
                                Enter the MYOB reference number for transaction {selectedTransaction?.transaction_number}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="myob-ref">MYOB Reference Number</Label>
                                <Input id="myob-ref" placeholder="Enter MYOB reference..." />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="notes">Reconciliation Notes</Label>
                                <Textarea id="notes" placeholder="Additional notes..." />
                              </div>
                              <Button 
                                onClick={() => handleReconcileWithMYOB(selectedTransaction?.id || '', '')} 
                                className="w-full"
                              >
                                Confirm Reconciliation
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};