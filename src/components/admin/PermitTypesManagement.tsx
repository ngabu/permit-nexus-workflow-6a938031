import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { FileText, MoreVertical, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

export function PermitTypesManagement() {
  const [permitTypes, setPermitTypes] = useState<any[]>([]);
  const [filteredTypes, setFilteredTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    category: '',
    icon_name: '',
    jsonb_column_name: '',
    is_active: true,
    sort_order: 0
  });

  useEffect(() => {
    fetchPermitTypes();
  }, []);

  useEffect(() => {
    filterTypes();
  }, [permitTypes, searchTerm]);

  const fetchPermitTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('permit_types')
        .select('*')
        .order('sort_order');

      if (error) throw error;
      setPermitTypes(data || []);
    } catch (error: any) {
      toast.error('Failed to load permit types');
    } finally {
      setLoading(false);
    }
  };

  const filterTypes = () => {
    if (!searchTerm) {
      setFilteredTypes(permitTypes);
      return;
    }

    const filtered = permitTypes.filter(type =>
      type.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      type.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      type.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTypes(filtered);
  };

  const handleOpenDialog = (type?: any) => {
    if (type) {
      setEditingType(type);
      setFormData({
        name: type.name,
        display_name: type.display_name,
        category: type.category,
        icon_name: type.icon_name || '',
        jsonb_column_name: type.jsonb_column_name || '',
        is_active: type.is_active,
        sort_order: type.sort_order
      });
    } else {
      setEditingType(null);
      setFormData({
        name: '',
        display_name: '',
        category: '',
        icon_name: '',
        jsonb_column_name: '',
        is_active: true,
        sort_order: 0
      });
    }
    setDialogOpen(true);
  };

  const handleSaveType = async () => {
    try {
      if (editingType) {
        const { error } = await supabase
          .from('permit_types')
          .update(formData)
          .eq('id', editingType.id);
        
        if (error) throw error;
        toast.success('Permit type updated successfully');
      } else {
        const { error } = await supabase
          .from('permit_types')
          .insert([formData]);
        
        if (error) throw error;
        toast.success('Permit type created successfully');
      }
      
      setDialogOpen(false);
      fetchPermitTypes();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteType = async (id: string) => {
    if (!confirm('Are you sure you want to delete this permit type?')) return;
    
    try {
      const { error } = await supabase
        .from('permit_types')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Permit type deleted successfully');
      fetchPermitTypes();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredTypes.length / itemsPerPage);
  const paginatedTypes = filteredTypes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-foreground">
            <FileText className="w-5 h-5 mr-2" />
            Permit Types Management
          </CardTitle>
          <CardDescription>Manage available permit types and their configurations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search permit types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => handleOpenDialog()}>Add Permit Type</Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-foreground">{permitTypes.length}</div>
                <div className="text-sm text-muted-foreground">Total Permit Types</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">
                  {permitTypes.filter(t => t.is_active).length}
                </div>
                <div className="text-sm text-muted-foreground">Active</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-gray-600">
                  {permitTypes.filter(t => !t.is_active).length}
                </div>
                <div className="text-sm text-muted-foreground">Inactive</div>
              </CardContent>
            </Card>
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading permit types...</div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Display Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Custom Fields</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTypes.map((type) => (
                      <TableRow key={type.id}>
                        <TableCell className="font-medium">{type.name}</TableCell>
                        <TableCell>{type.display_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{type.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={type.is_active ? "default" : "secondary"}>
                            {type.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {type.jsonb_column_name || 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenDialog(type)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteType(type.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
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
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingType ? 'Edit' : 'Add'} Permit Type</DialogTitle>
            <DialogDescription>Configure permit type details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., water_permit"
              />
            </div>
            <div>
              <Label>Display Name</Label>
              <Input 
                value={formData.display_name}
                onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                placeholder="e.g., Water Permit"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Input 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                placeholder="e.g., Environmental"
              />
            </div>
            <div>
              <Label>Icon Name</Label>
              <Input 
                value={formData.icon_name}
                onChange={(e) => setFormData({...formData, icon_name: e.target.value})}
                placeholder="e.g., droplet"
              />
            </div>
            <div>
              <Label>Sort Order</Label>
              <Input 
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value)})}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
              />
              <Label>Active</Label>
            </div>
            <Button onClick={handleSaveType} className="w-full">Save Permit Type</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}