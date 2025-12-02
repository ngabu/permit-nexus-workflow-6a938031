import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Edit, Trash2, FileCode } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface RevenueItemCode {
  id: string;
  item_number: string;
  item_name: string;
  item_description: string | null;
  created_at: string;
  updated_at: string;
}

export function RevenueItemCodesManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RevenueItemCode | null>(null);
  const [formData, setFormData] = useState({
    item_number: '',
    item_name: '',
    item_description: ''
  });

  // Fetch item codes
  const { data: itemCodes = [], isLoading } = useQuery({
    queryKey: ['revenue-item-codes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('revenue_item_codes')
        .select('*')
        .order('item_number');
      
      if (error) throw error;
      return data as RevenueItemCode[];
    }
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('revenue_item_codes')
        .insert([data]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revenue-item-codes'] });
      toast({ title: 'Success', description: 'Item code created successfully' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create item code',
        variant: 'destructive'
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('revenue_item_codes')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revenue-item-codes'] });
      toast({ title: 'Success', description: 'Item code updated successfully' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update item code',
        variant: 'destructive'
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('revenue_item_codes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revenue-item-codes'] });
      toast({ title: 'Success', description: 'Item code deleted successfully' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete item code',
        variant: 'destructive'
      });
    }
  });

  const filteredItemCodes = itemCodes.filter(item =>
    item.item_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.item_description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const handleOpenDialog = (item?: RevenueItemCode) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        item_number: item.item_number,
        item_name: item.item_name,
        item_description: item.item_description || ''
      });
    } else {
      setEditingItem(null);
      setFormData({
        item_number: '',
        item_name: '',
        item_description: ''
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setFormData({
      item_number: '',
      item_name: '',
      item_description: ''
    });
  };

  const handleSubmit = () => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item code?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileCode className="w-5 h-5" />
                Revenue Item Codes Management
              </CardTitle>
              <CardDescription>Manage MYOB revenue item codes and descriptions</CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Item Code
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search item codes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-muted rounded-lg h-16"></div>
              ))}
            </div>
          ) : filteredItemCodes.length === 0 ? (
            <div className="text-center py-12">
              <FileCode className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No item codes found</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Number</TableHead>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItemCodes.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.item_number}</TableCell>
                      <TableCell>{item.item_name}</TableCell>
                      <TableCell className="max-w-md truncate">
                        {item.item_description || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleOpenDialog(item)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit' : 'Add'} Item Code</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update' : 'Create'} a revenue item code for MYOB integration
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="item_number">Item Code *</Label>
              <Input
                id="item_number"
                placeholder="e.g., F1"
                value={formData.item_number}
                onChange={(e) => setFormData({...formData, item_number: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="item_name">Item Name *</Label>
              <Input
                id="item_name"
                placeholder="e.g., Environment Permit Application Fee"
                value={formData.item_name}
                onChange={(e) => setFormData({...formData, item_name: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="item_description">Description</Label>
              <Textarea
                id="item_description"
                placeholder="Add any additional details..."
                value={formData.item_description}
                onChange={(e) => setFormData({...formData, item_description: e.target.value})}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.item_number || !formData.item_name || createMutation.isPending || updateMutation.isPending}
            >
              {editingItem ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}