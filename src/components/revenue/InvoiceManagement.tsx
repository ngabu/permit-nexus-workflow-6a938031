import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useInvoices, Invoice } from './hooks/useInvoices';
import { useEntitiesForInvoice } from '@/hooks/useEntitiesForInvoice';
import { usePermitApplicationsByEntity } from '@/hooks/usePermitApplicationsByEntity';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { FileText, Plus, Send, Eye, Download, Search, Filter, Ban, Loader2, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RevenueInvoiceDetailView } from './RevenueInvoiceDetailView';
import { generateInvoicePdf } from './utils/generateInvoicePdf';

export function InvoiceManagement() {
  const { invoices, loading, suspendInvoice, reactivateInvoice, refetch } = useInvoices();
  const { data: entities = [], isLoading: entitiesLoading } = useEntitiesForInvoice();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [suspendingInvoiceId, setSuspendingInvoiceId] = useState<string | null>(null);
  const [reactivatingInvoiceId, setReactivatingInvoiceId] = useState<string | null>(null);
  const [entitySearchOpen, setEntitySearchOpen] = useState(false);
  const [entitySearchValue, setEntitySearchValue] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    entity: '',
    permitApplication: '',
    amount: '',
    dueDate: '',
    itemCode: '',
    itemName: '',
    description: '',
    notes: ''
  });

  // Fetch permit applications for selected entity
  const { applications: permitApplications, loading: applicationsLoading } = usePermitApplicationsByEntity(formData.entity || null);
  
  // Fetch revenue item codes
  const { data: itemCodes = [], isLoading: itemCodesLoading } = useQuery({
    queryKey: ['revenue-item-codes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('revenue_item_codes')
        .select('*')
        .order('item_number');
      if (error) throw error;
      return data || [];
    }
  });

  const filteredEntities = useMemo(() => {
    if (!entities || !Array.isArray(entities)) return [];
    if (!entitySearchValue) return entities;
    return entities.filter(entity =>
      entity.name.toLowerCase().includes(entitySearchValue.toLowerCase()) ||
      entity.registration_number?.toLowerCase().includes(entitySearchValue.toLowerCase())
    );
  }, [entities, entitySearchValue]);

  // Filter for new/unpaid invoices only (not paid)
  const unpaidInvoices = useMemo(() => {
    if (!invoices || !Array.isArray(invoices)) return [];
    return invoices.filter(invoice => invoice.status !== 'paid' && invoice.payment_status !== 'paid');
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    return unpaidInvoices.filter(invoice => {
      const matchesSearch = 
        invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.entity?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [unpaidInvoices, searchTerm, statusFilter]);

  const handleCreateInvoice = async () => {
    try {
      if (!formData.entity || !formData.permitApplication || !formData.amount || !formData.dueDate) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields',
          variant: 'destructive'
        });
        return;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to create an invoice',
          variant: 'destructive'
        });
        return;
      }

      // Find the selected application to determine if it's an intent or permit
      const selectedApp = permitApplications.find(app => app.id === formData.permitApplication);
      const isIntent = selectedApp?.type === 'intent';

      // Generate sequential invoice number in format INV-YYYY-XXX
      const currentYear = new Date().getFullYear();
      const yearPrefix = `INV-${currentYear}-`;
      
      // Get the latest invoice number for this year
      const { data: latestInvoice } = await supabase
        .from('invoices')
        .select('invoice_number')
        .like('invoice_number', `${yearPrefix}%`)
        .order('invoice_number', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      let nextNumber = 1;
      if (latestInvoice?.invoice_number) {
        const match = latestInvoice.invoice_number.match(/INV-\d{4}-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1], 10) + 1;
        }
      }
      
      const invoiceNumber = `${yearPrefix}${nextNumber.toString().padStart(3, '0')}`;

      // Find selected item code for description
      const selectedItemCode = itemCodes.find(item => item.id === formData.itemCode);

      // Create the invoice in the database
      const { data: newInvoice, error } = await supabase
        .from('invoices')
        .insert({
          invoice_number: invoiceNumber,
          user_id: user.id,
          entity_id: formData.entity,
          permit_id: isIntent ? null : formData.permitApplication,
          intent_registration_id: isIntent ? formData.permitApplication : null,
          amount: parseFloat(formData.amount),
          due_date: formData.dueDate,
          status: 'pending',
          payment_status: 'pending',
          invoice_type: isIntent ? 'intent_fee' : 'permit_fee',
          source_dashboard: 'revenue',
          item_code: selectedItemCode?.item_number || null,
          item_description: selectedItemCode?.item_name || formData.description || null
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating invoice:', error);
        throw error;
      }

      toast({
        title: 'Invoice Created',
        description: `Invoice ${invoiceNumber} has been generated successfully`,
      });
      setCreateDialogOpen(false);
      setFormData({
        entity: '',
        permitApplication: '',
        amount: '',
        dueDate: '',
        itemCode: '',
        itemName: '',
        description: '',
        notes: ''
      });
      refetch();
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to create invoice. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setViewDialogOpen(true);
  };

  const handleSuspendInvoice = async (invoice: Invoice) => {
    // Check if invoice was created from a different dashboard
    if (invoice.source_dashboard && invoice.source_dashboard !== 'revenue') {
      const sourceDashboardName = invoice.source_dashboard.charAt(0).toUpperCase() + invoice.source_dashboard.slice(1);
      toast({
        title: 'Cannot Suspend Invoice',
        description: `This invoice was created on the ${sourceDashboardName} Dashboard. Only invoices created from the Revenue Dashboard can be suspended here. Please contact the ${sourceDashboardName} team to manage this invoice.`,
        variant: 'destructive',
        duration: 6000,
      });
      return;
    }
    
    setSuspendingInvoiceId(invoice.id);
    
    try {
      const result = await suspendInvoice(invoice.id, invoice.source_dashboard);
      if (result.success) {
        toast({
          title: 'Invoice Suspended',
          description: `Invoice ${invoice.invoice_number} has been suspended successfully.`,
        });
        // Close the detail view if open
        if (viewDialogOpen) {
          setViewDialogOpen(false);
          setSelectedInvoice(null);
        }
      } else {
        toast({
          title: 'Failed to Suspend Invoice',
          description: result.error || 'An unexpected error occurred while suspending the invoice.',
          variant: 'destructive',
          duration: 6000,
        });
      }
    } catch (error) {
      console.error('Error suspending invoice:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSuspendingInvoiceId(null);
    }
  };

  const handleReactivateInvoice = async (invoice: Invoice) => {
    if (invoice.source_dashboard && invoice.source_dashboard !== 'revenue') {
      const sourceDashboardName = invoice.source_dashboard.charAt(0).toUpperCase() + invoice.source_dashboard.slice(1);
      toast({
        title: 'Cannot Reactivate Invoice',
        description: `This invoice was created on the ${sourceDashboardName} Dashboard. Please contact the ${sourceDashboardName} team to manage this invoice.`,
        variant: 'destructive',
        duration: 6000,
      });
      return;
    }
    
    setReactivatingInvoiceId(invoice.id);
    
    try {
      const result = await reactivateInvoice(invoice.id, invoice.source_dashboard);
      if (result.success) {
        toast({
          title: 'Invoice Reactivated',
          description: `Invoice ${invoice.invoice_number} has been reactivated successfully.`,
        });
        if (viewDialogOpen) {
          setViewDialogOpen(false);
          setSelectedInvoice(null);
        }
      } else {
        toast({
          title: 'Failed to Reactivate Invoice',
          description: result.error || 'An unexpected error occurred while reactivating the invoice.',
          variant: 'destructive',
          duration: 6000,
        });
      }
    } catch (error) {
      console.error('Error reactivating invoice:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setReactivatingInvoiceId(null);
    }
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    try {
      generateInvoicePdf({
        invoice_number: invoice.invoice_number,
        created_at: invoice.created_at,
        amount: invoice.amount,
        status: invoice.status,
        entity: invoice.entity,
        permit: invoice.permit,
        inspection: invoice.inspection,
        intent_registration: invoice.intent_registration,
        invoice_type: invoice.invoice_type,
        item_code: invoice.item_code,
        item_description: invoice.item_description
      });
      toast({
        title: 'Invoice Downloaded',
        description: `Invoice ${invoice.invoice_number} has been downloaded as PDF.`,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to generate PDF. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'sent': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'suspended': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header with Create Button */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Invoice Management
                </CardTitle>
                <CardDescription>View and manage invoices (view only - suspend available for revenue-created invoices)</CardDescription>
              </div>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Invoice Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="border-primary/20">
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">Unpaid Invoices</p>
                  <p className="text-2xl font-bold text-foreground">{unpaidInvoices?.length || 0}</p>
                </CardContent>
              </Card>
              <Card className="border-primary/20">
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">Total Outstanding</p>
                  <p className="text-2xl font-bold text-amber-600">
                    K{(unpaidInvoices?.reduce((sum, inv) => sum + inv.amount, 0) || 0).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-primary/20">
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">
                    {unpaidInvoices?.filter(inv => inv.status === 'overdue').length || 0}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Invoices Table */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse bg-muted rounded-lg h-16"></div>
                ))}
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No invoices found</p>
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice Number</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => {
                      const canSuspend = invoice.source_dashboard === 'revenue';
                      const isNotSuspended = invoice.status !== 'suspended';
                      
                      // Find matching item code for the invoice type
                      const matchingItemCode = itemCodes.find(code => {
                        const invoiceType = invoice.invoice_type?.toLowerCase() || '';
                        const itemName = code.item_name.toLowerCase();
                        // Match based on invoice_type to item_name
                        if (invoiceType === 'inspection_fee' && itemName.includes('inspection')) return true;
                        if (invoiceType === 'permit_fee' && (itemName.includes('permit') && itemName.includes('annual'))) return true;
                        if (invoiceType === 'application_fee' && itemName.includes('application')) return true;
                        return false;
                      });
                      
                      return (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={
                              invoice.invoice_type === 'inspection_fee' 
                                ? 'border-blue-300 text-blue-700 bg-blue-50'
                                : 'border-green-300 text-green-700 bg-green-50'
                            }>
                              {matchingItemCode 
                                ? matchingItemCode.item_name
                                : invoice.invoice_type === 'inspection_fee' ? 'Inspection Fee' : 'Permit Fee'}
                            </Badge>
                          </TableCell>
                          <TableCell>{invoice.entity?.name || 'N/A'}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {invoice.invoice_type === 'inspection_fee' && invoice.inspection
                              ? `${invoice.inspection.inspection_type} - ${invoice.inspection.province || 'N/A'}`
                              : invoice.permit?.title || 'N/A'}
                          </TableCell>
                          <TableCell className="font-semibold">K{invoice.amount.toLocaleString()}</TableCell>
                          <TableCell>{format(new Date(invoice.due_date), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(invoice.status)}>
                              {invoice.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                title="View Details"
                                onClick={() => handleViewInvoice(invoice)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                title="Download PDF"
                                onClick={() => handleDownloadInvoice(invoice)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              {canSuspend && isNotSuspended && (
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                  onClick={() => handleSuspendInvoice(invoice)}
                                  disabled={suspendingInvoiceId === invoice.id}
                                  title="Suspend Invoice"
                                >
                                  {suspendingInvoiceId === invoice.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Ban className="w-4 h-4" />
                                  )}
                                </Button>
                              )}
                              {canSuspend && invoice.status === 'suspended' && (
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={() => handleReactivateInvoice(invoice)}
                                  disabled={reactivatingInvoiceId === invoice.id}
                                  title="Reactivate Invoice"
                                >
                                  {reactivatingInvoiceId === invoice.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <RefreshCw className="w-4 h-4" />
                                  )}
                                </Button>
                              )}
                              {!canSuspend && (
                                <span className="text-xs text-muted-foreground px-2">
                                  Manage on {invoice.source_dashboard}
                                </span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Invoice Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>Generate a new permit fee invoice</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entity">Client (Entity) *</Label>
                <Popover open={entitySearchOpen} onOpenChange={setEntitySearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={entitySearchOpen}
                      className="w-full justify-between"
                    >
                      {formData.entity
                        ? entities.find((entity) => entity.id === formData.entity)?.name
                        : "Search and select client..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput 
                        placeholder="Search entities..." 
                        value={entitySearchValue}
                        onValueChange={setEntitySearchValue}
                      />
                      <CommandList>
                        <CommandEmpty>No entity found.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                          {entitiesLoading ? (
                            <div className="py-6 text-center text-sm">Loading entities...</div>
                          ) : filteredEntities.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">No entities found</div>
                          ) : (
                            filteredEntities.map((entity) => (
                              <CommandItem
                                key={entity.id}
                                value={entity.name}
                                onSelect={() => {
                                  setFormData({
                                    ...formData,
                                    entity: entity.id,
                                    permitApplication: '',
                                  });
                                  setEntitySearchOpen(false);
                                  setEntitySearchValue('');
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    formData.entity === entity.id ? 'opacity-100' : 'opacity-0'
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span>{entity.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {entity.entity_type}{' '}
                                    {entity.registration_number && `• ${entity.registration_number}`}
                                  </span>
                                </div>
                              </CommandItem>
                            ))
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="permitApplication">Intent / Permit Application *</Label>
                <Select 
                  value={formData.permitApplication} 
                  onValueChange={(val) => setFormData({...formData, permitApplication: val})}
                  disabled={!formData.entity || applicationsLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !formData.entity 
                        ? "Select a client first" 
                        : applicationsLoading 
                          ? "Loading applications..." 
                          : permitApplications.length === 0
                            ? "No intents or permits found"
                            : "Select intent or permit"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {permitApplications.map((app) => (
                      <SelectItem key={app.id} value={app.id}>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={
                              app.type === 'intent' 
                                ? 'border-purple-300 text-purple-700 bg-purple-50 text-xs px-1.5 py-0'
                                : 'border-green-300 text-green-700 bg-green-50 text-xs px-1.5 py-0'
                            }>
                              {app.type === 'intent' ? 'Intent' : 'Permit'}
                            </Badge>
                            <span className="font-medium">{app.permit_number || app.title}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {app.permit_type} • {app.status}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (PGK) *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="itemCode">Item Code</Label>
                <Select 
                  value={formData.itemCode} 
                  onValueChange={(val) => {
                    const selectedItem = itemCodes.find(item => item.id === val);
                    setFormData({
                      ...formData, 
                      itemCode: val,
                      itemName: selectedItem?.item_name || ''
                    });
                  }}
                  disabled={itemCodesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      itemCodesLoading 
                        ? "Loading item codes..." 
                        : itemCodes.length === 0
                          ? "No item codes found"
                          : "Select item code"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {itemCodes.map((code) => (
                      <SelectItem key={code.id} value={code.id}>
                        {code.item_number} - {code.item_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="itemName">Item Name</Label>
                <Input
                  id="itemName"
                  placeholder="Item name"
                  value={formData.itemName}
                  onChange={(e) => setFormData({...formData, itemName: e.target.value})}
                  readOnly={!!formData.itemCode}
                  className={formData.itemCode ? 'bg-muted' : ''}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="e.g., Annual Environment Permit Fee"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes..."
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateInvoice}>
              <FileText className="w-4 h-4 mr-2" />
              Create Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Invoice Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
          <DialogHeader className="sr-only">
            <DialogTitle>
              Invoice Details - {selectedInvoice?.invoice_number}
            </DialogTitle>
            <DialogDescription>
              View detailed invoice information
            </DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <RevenueInvoiceDetailView
              invoice={selectedInvoice as any}
              itemCodes={itemCodes}
              onBack={() => {
                setViewDialogOpen(false);
                setSelectedInvoice(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

    </>
  );
}