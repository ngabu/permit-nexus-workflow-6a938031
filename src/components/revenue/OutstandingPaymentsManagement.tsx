import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useInvoices } from './hooks/useInvoices';
import { AlertTriangle, Phone, Mail, MessageSquare, Calendar, Clock, DollarSign, TrendingDown, User } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, differenceInDays } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function OutstandingPaymentsManagement() {
  const { invoices, scheduleFollowUp, loading } = useInvoices();
  const { toast } = useToast();
  const [followUpDialogOpen, setFollowUpDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpNotes, setFollowUpNotes] = useState('');
  const [followUpMethod, setFollowUpMethod] = useState('');
  const [sortBy, setSortBy] = useState<'amount' | 'overdue' | 'entity'>('overdue');

  // Filter outstanding invoices
  const outstandingInvoices = invoices.filter(
    inv => inv.payment_status === 'pending' || inv.payment_status === 'overdue' || inv.payment_status === 'partially_paid'
  );

  // Calculate overdue days and sort
  const invoicesWithOverdue = outstandingInvoices.map(invoice => ({
    ...invoice,
    overdueDays: differenceInDays(new Date(), new Date(invoice.due_date))
  })).sort((a, b) => {
    if (sortBy === 'amount') return b.amount - a.amount;
    if (sortBy === 'overdue') return b.overdueDays - a.overdueDays;
    return (a.entity?.name || '').localeCompare(b.entity?.name || '');
  });

  // Statistics
  const totalOutstanding = outstandingInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const criticalOverdue = invoicesWithOverdue.filter(inv => inv.overdueDays > 30).length;
  const avgOverdueDays = invoicesWithOverdue.length > 0
    ? Math.round(invoicesWithOverdue.reduce((sum, inv) => sum + Math.max(0, inv.overdueDays), 0) / invoicesWithOverdue.length)
    : 0;

  const handleScheduleFollowUp = async () => {
    if (!selectedInvoice || !followUpDate || !followUpNotes || !followUpMethod) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      await scheduleFollowUp(
        selectedInvoice.id,
        followUpDate,
        `Method: ${followUpMethod}. ${followUpNotes}`
      );

      toast({
        title: 'Follow-up Scheduled',
        description: 'Payment follow-up has been scheduled successfully',
      });

      setFollowUpDialogOpen(false);
      setSelectedInvoice(null);
      setFollowUpDate('');
      setFollowUpNotes('');
      setFollowUpMethod('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to schedule follow-up',
        variant: 'destructive'
      });
    }
  };

  const getOverdueColor = (days: number) => {
    if (days <= 0) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    if (days <= 15) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    if (days <= 30) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  const getPriorityBadge = (days: number) => {
    if (days > 30) return <Badge variant="destructive">Critical</Badge>;
    if (days > 15) return <Badge className="bg-orange-500">High</Badge>;
    if (days > 0) return <Badge className="bg-yellow-500">Medium</Badge>;
    return <Badge variant="secondary">Normal</Badge>;
  };

  return (
    <>
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Outstanding</p>
                  <p className="text-2xl font-bold text-foreground">K{totalOutstanding.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Outstanding Invoices</p>
                  <p className="text-2xl font-bold text-foreground">{outstandingInvoices.length}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Critical Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{criticalOverdue}</p>
                </div>
                <Clock className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg. Overdue Days</p>
                  <p className="text-2xl font-bold text-foreground">{avgOverdueDays}</p>
                </div>
                <TrendingDown className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Outstanding Payments Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Outstanding Payments
                </CardTitle>
                <CardDescription>Track and follow up on overdue payments</CardDescription>
              </div>
              <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overdue">Most Overdue</SelectItem>
                  <SelectItem value="amount">Highest Amount</SelectItem>
                  <SelectItem value="entity">Entity Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse bg-muted rounded-lg h-16"></div>
                ))}
              </div>
            ) : invoicesWithOverdue.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No outstanding payments</p>
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Priority</TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Days Overdue</TableHead>
                      <TableHead>Last Follow-up</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoicesWithOverdue.map((invoice) => (
                      <TableRow key={invoice.id} className={invoice.overdueDays > 30 ? 'bg-red-50 dark:bg-red-950/20' : ''}>
                        <TableCell>{getPriorityBadge(invoice.overdueDays)}</TableCell>
                        <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{invoice.entity?.name}</p>
                            <p className="text-xs text-muted-foreground">{invoice.entity?.entity_type}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">K{invoice.amount.toLocaleString()}</TableCell>
                        <TableCell>{format(new Date(invoice.due_date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>
                          <Badge className={getOverdueColor(invoice.overdueDays)}>
                            {invoice.overdueDays > 0 ? `${invoice.overdueDays} days` : 'Due soon'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {invoice.follow_up_date ? (
                            <div className="text-sm">
                              <p className="font-medium">{format(new Date(invoice.follow_up_date), 'MMM dd')}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-xs">
                                {invoice.follow_up_notes}
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">No follow-up</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setFollowUpDialogOpen(true);
                              }}
                            >
                              <Calendar className="w-4 h-4 mr-1" />
                              Follow Up
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Follow-up Dialog */}
      <Dialog open={followUpDialogOpen} onOpenChange={setFollowUpDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule Payment Follow-up</DialogTitle>
            <DialogDescription>
              Schedule a follow-up for invoice {selectedInvoice?.invoice_number}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Invoice Details */}
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">Entity</p>
                    <p className="text-foreground">{selectedInvoice?.entity?.name}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Amount Outstanding</p>
                    <p className="text-lg font-bold text-foreground">K{selectedInvoice?.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Days Overdue</p>
                    <p className="text-foreground font-semibold text-red-600">
                      {selectedInvoice?.overdueDays > 0 ? `${selectedInvoice.overdueDays} days` : 'Not yet overdue'}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Contact</p>
                    <p className="text-foreground text-sm">{selectedInvoice?.entity?.email || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Follow-up Form */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="followUpDate">Follow-up Date *</Label>
                  <Input
                    id="followUpDate"
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="followUpMethod">Contact Method *</Label>
                  <Select value={followUpMethod} onValueChange={setFollowUpMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone">Phone Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="letter">Formal Letter</SelectItem>
                      <SelectItem value="visit">In-person Visit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="followUpNotes">Follow-up Notes *</Label>
                <Textarea
                  id="followUpNotes"
                  placeholder="Enter details about the follow-up action, discussion points, or reminders..."
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Entity
                </Button>
                <Button type="button" variant="outline" size="sm">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Reminder Email
                </Button>
                <Button type="button" variant="outline" size="sm">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send SMS
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFollowUpDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleScheduleFollowUp}>
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Follow-up
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
