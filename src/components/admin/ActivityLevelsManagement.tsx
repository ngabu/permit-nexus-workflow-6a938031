import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { BarChart3, Edit, Plus } from 'lucide-react';
import { toast } from 'sonner';

export function ActivityLevelsManagement() {
  const [levels, setLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    public_review_required: false
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_levels')
        .select('*')
        .order('id');

      if (error) throw error;
      setLevels(data || []);
    } catch (error: any) {
      toast.error('Failed to load activity levels');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (level?: any) => {
    if (level) {
      setEditingLevel(level);
      setFormData({
        name: level.name,
        description: level.description,
        public_review_required: level.public_review_required
      });
    } else {
      setEditingLevel(null);
      setFormData({
        name: '',
        description: '',
        public_review_required: false
      });
    }
    setDialogOpen(true);
  };

  const handleSaveLevel = async () => {
    try {
      if (editingLevel) {
        const { error } = await supabase
          .from('activity_levels')
          .update(formData)
          .eq('id', editingLevel.id);
        
        if (error) throw error;
        toast.success('Level updated successfully');
      } else {
        const { error } = await supabase
          .from('activity_levels')
          .insert([formData]);
        
        if (error) throw error;
        toast.success('Level created successfully');
      }
      
      setDialogOpen(false);
      fetchLevels();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteLevel = async (id: number) => {
    if (!confirm('Are you sure you want to delete this level? This may affect existing activities.')) return;
    
    try {
      const { error } = await supabase
        .from('activity_levels')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Level deleted successfully');
      fetchLevels();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-foreground">
              <BarChart3 className="w-5 h-5 mr-2" />
              Activity Levels Management
            </CardTitle>
            <CardDescription>View and configure activity classification levels</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Level
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingLevel ? 'Edit' : 'Add'} Activity Level</DialogTitle>
                <DialogDescription>Configure activity level details</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Level 1"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Level description"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={formData.public_review_required}
                    onCheckedChange={(checked) => setFormData({...formData, public_review_required: checked})}
                  />
                  <Label>Public Review Required</Label>
                </div>
                <Button onClick={handleSaveLevel} className="w-full">Save Level</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-foreground">{levels.length}</div>
              <div className="text-sm text-muted-foreground">Total Levels</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">
                {levels.filter(l => l.public_review_required).length}
              </div>
              <div className="text-sm text-muted-foreground">Require Public Review</div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading levels...</div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md border">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Level</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Public Review</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {levels.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((level) => (
                  <TableRow key={level.id}>
                    <TableCell className="font-bold text-lg">{level.id}</TableCell>
                    <TableCell className="font-medium">{level.name}</TableCell>
                    <TableCell className="max-w-lg">{level.description}</TableCell>
                    <TableCell>
                      <Badge className={level.public_review_required ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {level.public_review_required ? 'Required' : 'Not Required'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleOpenDialog(level)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteLevel(level.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>

            {/* Pagination */}
            {Math.ceil(levels.length / itemsPerPage) > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.ceil(levels.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
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
                      onClick={() => setCurrentPage(p => Math.min(Math.ceil(levels.length / itemsPerPage), p + 1))}
                      className={currentPage === Math.ceil(levels.length / itemsPerPage) ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
