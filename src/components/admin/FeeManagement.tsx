import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DollarSign, MoreVertical, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

export function FeeManagement() {
  const [feeStructures, setFeeStructures] = useState<any[]>([]);
  const [filteredFees, setFilteredFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    permit_type: '',
    fee_category: '',
    activity_type: '',
    permit_operation: 'New Application',
    administration_form: 'Simple',
    technical_form: 'Standard',
    annual_recurrent_fee: 0,
    work_plan_amount: 15500,
    category_multiplier: 1.0,
    base_processing_days: 30,
    is_active: true
  });

  useEffect(() => {
    fetchFeeStructures();
  }, []);

  useEffect(() => {
    filterFees();
  }, [feeStructures, searchTerm, categoryFilter]);

  const fetchFeeStructures = async () => {
    try {
      const { data, error } = await supabase
        .from('fee_structures')
        .select('*')
        .order('fee_category');

      if (error) throw error;
      setFeeStructures(data || []);
    } catch (error: any) {
      toast.error('Failed to load fee structures');
    } finally {
      setLoading(false);
    }
  };

  const filterFees = () => {
    let filtered = feeStructures;

    if (searchTerm) {
      filtered = filtered.filter(fee => 
        fee.permit_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fee.fee_category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fee.activity_type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(fee => fee.fee_category === categoryFilter);
    }

    setFilteredFees(filtered);
  };

  const handleOpenDialog = (fee?: any) => {
    if (fee) {
      setEditingFee(fee);
      setFormData({
        permit_type: fee.permit_type || '',
        fee_category: fee.fee_category,
        activity_type: fee.activity_type,
        permit_operation: fee.permit_operation,
        administration_form: fee.administration_form,
        technical_form: fee.technical_form,
        annual_recurrent_fee: fee.annual_recurrent_fee || 0,
        work_plan_amount: fee.work_plan_amount,
        category_multiplier: fee.category_multiplier,
        base_processing_days: fee.base_processing_days,
        is_active: fee.is_active
      });
    } else {
      setEditingFee(null);
      setFormData({
        permit_type: '',
        fee_category: '',
        activity_type: '',
        permit_operation: 'New Application',
        administration_form: 'Simple',
        technical_form: 'Standard',
        annual_recurrent_fee: 0,
        work_plan_amount: 15500,
        category_multiplier: 1.0,
        base_processing_days: 30,
        is_active: true
      });
    }
    setDialogOpen(true);
  };

  const handleSaveFee = async () => {
    try {
      if (editingFee) {
        const { error } = await supabase
          .from('fee_structures')
          .update(formData)
          .eq('id', editingFee.id);
        
        if (error) throw error;
        toast.success('Fee structure updated successfully');
      } else {
        const { error } = await supabase
          .from('fee_structures')
          .insert([formData]);
        
        if (error) throw error;
        toast.success('Fee structure created successfully');
      }
      
      setDialogOpen(false);
      fetchFeeStructures();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteFee = async (id: string) => {
    if (!confirm('Are you sure you want to delete this fee structure?')) return;
    
    try {
      const { error } = await supabase
        .from('fee_structures')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Fee structure deleted successfully');
      fetchFeeStructures();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredFees.length / itemsPerPage);
  const paginatedFees = filteredFees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Fee Structure Management
          </CardTitle>
          <CardDescription>
            Manage fee categories and structures for different permit types
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by permit type, category, or activity..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="2.1">Category 2.1</SelectItem>
                <SelectItem value="2.2">Category 2.2</SelectItem>
                <SelectItem value="2.3">Category 2.3</SelectItem>
                <SelectItem value="2.4">Category 2.4</SelectItem>
                <SelectItem value="3">Category 3</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => handleOpenDialog()}>Add Fee Structure</Button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Total Structures</div>
                <div className="text-2xl font-bold">{feeStructures.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Active</div>
                <div className="text-2xl font-bold text-green-600">
                  {feeStructures.filter(f => f.is_active).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Fee Categories</div>
                <div className="text-2xl font-bold">
                  {new Set(feeStructures.map(f => f.fee_category)).size}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Avg. Processing Days</div>
                <div className="text-2xl font-bold">
                  {Math.round(feeStructures.reduce((acc, f) => acc + f.base_processing_days, 0) / feeStructures.length || 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fee Structures Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Permit Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Activity Type</TableHead>
                  <TableHead>Operation</TableHead>
                  <TableHead>Annual Fee (K)</TableHead>
                  <TableHead>Processing Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Loading fee structures...
                    </TableCell>
                  </TableRow>
                ) : paginatedFees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No fee structures found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedFees.map((fee) => (
                    <TableRow key={fee.id}>
                      <TableCell className="font-medium">{fee.permit_type || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{fee.fee_category}</Badge>
                      </TableCell>
                      <TableCell>{fee.activity_type}</TableCell>
                      <TableCell className="text-sm">{fee.permit_operation}</TableCell>
                      <TableCell className="font-mono">
                        {fee.annual_recurrent_fee?.toLocaleString() || '0'}
                      </TableCell>
                      <TableCell>{fee.base_processing_days}</TableCell>
                      <TableCell>
                        <Badge variant={fee.is_active ? "default" : "secondary"}>
                          {fee.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDialog(fee)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteFee(fee.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>

      {/* Edit/Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingFee ? 'Edit' : 'Add'} Fee Structure</DialogTitle>
            <DialogDescription>Configure fee structure details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Permit Type</Label>
                <Input 
                  value={formData.permit_type}
                  onChange={(e) => setFormData({...formData, permit_type: e.target.value})}
                  placeholder="e.g., Water Permit"
                />
              </div>
              <div>
                <Label>Fee Category</Label>
                <Input 
                  value={formData.fee_category}
                  onChange={(e) => setFormData({...formData, fee_category: e.target.value})}
                  placeholder="e.g., 2.1"
                />
              </div>
            </div>
            
            <div>
              <Label>Activity Type</Label>
              <Input 
                value={formData.activity_type}
                onChange={(e) => setFormData({...formData, activity_type: e.target.value})}
                placeholder="e.g., Industrial"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Permit Operation</Label>
                <Select 
                  value={formData.permit_operation}
                  onValueChange={(value) => setFormData({...formData, permit_operation: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New Application">New Application</SelectItem>
                    <SelectItem value="Renewal">Renewal</SelectItem>
                    <SelectItem value="Amendment">Amendment</SelectItem>
                    <SelectItem value="Transfer">Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Administration Form</Label>
                <Select 
                  value={formData.administration_form}
                  onValueChange={(value) => setFormData({...formData, administration_form: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Simple">Simple</SelectItem>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Complex">Complex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Technical Form</Label>
                <Select 
                  value={formData.technical_form}
                  onValueChange={(value) => setFormData({...formData, technical_form: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                    <SelectItem value="Expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Base Processing Days</Label>
                <Input 
                  type="number"
                  value={formData.base_processing_days}
                  onChange={(e) => setFormData({...formData, base_processing_days: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Annual Fee (Kina)</Label>
                <Input 
                  type="number"
                  value={formData.annual_recurrent_fee}
                  onChange={(e) => setFormData({...formData, annual_recurrent_fee: parseFloat(e.target.value)})}
                />
              </div>
              <div>
                <Label>Work Plan Amount</Label>
                <Input 
                  type="number"
                  value={formData.work_plan_amount}
                  onChange={(e) => setFormData({...formData, work_plan_amount: parseFloat(e.target.value)})}
                />
              </div>
              <div>
                <Label>Category Multiplier</Label>
                <Input 
                  type="number"
                  step="0.1"
                  value={formData.category_multiplier}
                  onChange={(e) => setFormData({...formData, category_multiplier: parseFloat(e.target.value)})}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
              />
              <Label>Active</Label>
            </div>

            <Button onClick={handleSaveFee} className="w-full">Save Fee Structure</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}