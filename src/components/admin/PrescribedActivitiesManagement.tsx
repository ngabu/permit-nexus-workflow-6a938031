import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Layers, Plus, Edit, Search } from 'lucide-react';
import { toast } from 'sonner';

export function PrescribedActivitiesManagement() {
  const [activities, setActivities] = useState<any[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [activities, searchTerm, levelFilter]);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('prescribed_activities')
        .select('*')
        .order('category_number');

      if (error) throw error;
      setActivities(data || []);
    } catch (error: any) {
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const filterActivities = () => {
    let filtered = activities;

    if (searchTerm) {
      filtered = filtered.filter(activity => 
        activity.activity_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.category_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (levelFilter !== 'all') {
      filtered = filtered.filter(activity => 
        activity.level?.toString() === levelFilter
      );
    }

    setFilteredActivities(filtered);
  };

  const handleSaveActivity = async (formData: any) => {
    try {
      if (editingActivity) {
        const { error } = await supabase
          .from('prescribed_activities')
          .update(formData)
          .eq('id', editingActivity.id);
        
        if (error) throw error;
        toast.success('Activity updated successfully');
      } else {
        const { error } = await supabase
          .from('prescribed_activities')
          .insert([formData]);
        
        if (error) throw error;
        toast.success('Activity created successfully');
      }
      
      setDialogOpen(false);
      setEditingActivity(null);
      fetchActivities();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteActivity = async (id: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;
    
    try {
      const { error } = await supabase
        .from('prescribed_activities')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Activity deleted successfully');
      fetchActivities();
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
              <Layers className="w-5 h-5 mr-2" />
              Prescribed Activities Management
            </CardTitle>
            <CardDescription>Manage prescribed activities and their classifications</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingActivity(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Activity
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingActivity ? 'Edit' : 'Add'} Prescribed Activity</DialogTitle>
                <DialogDescription>Configure activity details and classification</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Category Number</Label>
                  <Input placeholder="e.g., 1.1" defaultValue={editingActivity?.category_number} />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea placeholder="Activity description" defaultValue={editingActivity?.description} />
                </div>
                <div>
                  <Label>Category Type</Label>
                  <Input placeholder="e.g., industrial, commercial" defaultValue={editingActivity?.category_type} />
                </div>
                <div>
                  <Label>Fee Category</Label>
                  <Input placeholder="e.g., A, B, C" defaultValue={editingActivity?.fee_category} />
                </div>
                <Button onClick={() => handleSaveActivity({})}>Save Activity</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-4 py-2 border rounded-md bg-background"
          >
            <option value="all">All Levels</option>
            <option value="1">Level 1</option>
            <option value="2">Level 2</option>
            <option value="3">Level 3</option>
          </select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-foreground">{activities.length}</div>
              <div className="text-sm text-muted-foreground">Total Activities</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">
                {new Set(activities.map(a => a.category_type)).size}
              </div>
              <div className="text-sm text-muted-foreground">Category Types</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {new Set(activities.map(a => a.fee_category)).size}
              </div>
              <div className="text-sm text-muted-foreground">Fee Categories</div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading activities...</div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md border">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category #</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Fee Category</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivities.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">{activity.category_number}</TableCell>
                    <TableCell className="max-w-md truncate">{activity.activity_description}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{activity.category_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge>{activity.fee_category}</Badge>
                    </TableCell>
                    <TableCell>{activity.level}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setEditingActivity(activity);
                            setDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteActivity(activity.id)}
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
            {Math.ceil(filteredActivities.length / itemsPerPage) > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.ceil(filteredActivities.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
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
                      onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredActivities.length / itemsPerPage), p + 1))}
                      className={currentPage === Math.ceil(filteredActivities.length / itemsPerPage) ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
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
