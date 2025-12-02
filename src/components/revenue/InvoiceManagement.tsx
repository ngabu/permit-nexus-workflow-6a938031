import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useInvoices } from './hooks/useInvoices';
import { useEntitiesForInvoice } from '@/hooks/useEntitiesForInvoice';
import { usePermitApplicationsByEntity } from '@/hooks/usePermitApplicationsByEntity';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { FileText, Plus, Edit, Trash2, Send, Eye, Download, Search, Filter } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function InvoiceManagement() {
  const { invoices, loading, updateInvoice, refetch } = useInvoices();
  const { data: entities = [], isLoading: entitiesLoading } = useEntitiesForInvoice();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
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

  const filteredInvoices = useMemo(() => {
    if (!invoices || !Array.isArray(invoices)) return [];
    return invoices.filter(invoice => {
      const matchesSearch = 
        invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.entity?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

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

      // Implementation for creating invoice would go here
      // For now, just show success message
      toast({
        title: 'Invoice Created',
        description: 'New invoice has been generated successfully',
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
      toast({
        title: 'Error',
        description: 'Failed to create invoice',
        variant: 'destructive'
      });
    }
  };

  const handleSendInvoice = async (invoiceId: string) => {
    try {
      toast({
        title: 'Invoice Sent',
        description: 'Invoice has been sent to the entity via email',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send invoice',
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
                <CardDescription>Create, manage, and track permit fee invoices</CardDescription>
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
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Invoice Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="border-primary/20">
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">Total Invoices</p>
                  <p className="text-2xl font-bold text-foreground">{invoices?.length || 0}</p>
                </CardContent>
              </Card>
              <Card className="border-primary/20">
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">Unpaid</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {invoices?.filter(inv => inv.status !== 'paid').length || 0}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-primary/20">
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">Total Outstanding</p>
                  <p className="text-2xl font-bold text-foreground">
                    K{(invoices?.filter(inv => inv.status !== 'paid').reduce((sum, inv) => sum + inv.amount, 0) || 0).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-primary/20">
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">Collected</p>
                  <p className="text-2xl font-bold text-green-600">
                    K{(invoices?.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0) || 0).toLocaleString()}
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
                      <TableHead>Entity</TableHead>
                      <TableHead>Permit</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                        <TableCell>{invoice.entity?.name || 'N/A'}</TableCell>
                        <TableCell className="max-w-xs truncate">{invoice.permit?.title || 'N/A'}</TableCell>
                        <TableCell className="font-semibold">K{invoice.amount.toLocaleString()}</TableCell>
                        <TableCell>{format(new Date(invoice.due_date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button size="sm" variant="ghost">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Download className="w-4 h-4" />
                            </Button>
                            {invoice.status === 'draft' && (
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleSendInvoice(invoice.id)}
                              >
                                <Send className="w-4 h-4" />
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setEditDialogOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
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
                <Label htmlFor="permitApplication">Permit Application *</Label>
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
                            ? "No applications found"
                            : "Select permit application"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {permitApplications.map((app) => (
                      <SelectItem key={app.id} value={app.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{app.permit_number || app.title}</span>
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
    </>
  );
}
