
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Building, User, Edit, Trash2, ChevronsUpDown, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { EntityForm } from './EntityForm';
import { EntityDetailsReadOnly } from './EntityDetailsReadOnly';

interface Entity {
  id: string;
  entity_type: 'individual' | 'company';
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  registration_number?: string;
  tax_number?: string;
  contact_person?: string;
  created_at: string;
  updated_at: string;
}

export function EntityManagement() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchEntities();
    }
  }, [user]);

  const fetchEntities = async () => {
    try {
      const { data, error } = await supabase
        .from('entities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Type assertion to ensure proper typing
      setEntities(data as Entity[] || []);
    } catch (error) {
      console.error('Error fetching entities:', error);
      toast({
        title: "Error",
        description: "Failed to load entities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (entityId: string) => {
    try {
      const { error } = await supabase
        .from('entities')
        .delete()
        .eq('id', entityId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Entity deleted successfully",
      });
      fetchEntities();
    } catch (error) {
      console.error('Error deleting entity:', error);
      toast({
        title: "Error",
        description: "Failed to delete entity",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (entity: Entity) => {
    setEditingEntity(entity);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingEntity(null);
    fetchEntities();
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading entities...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Entity Management</h3>
          <p className="text-forest-600 font-semibold">Manage individuals and companies for permit applications</p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-forest-600 to-nature-600 hover:from-forest-700 hover:to-nature-700">
              <Plus className="w-4 h-4 mr-2" />
              New Entity
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingEntity ? 'Edit Entity' : 'Create New Entity'}</DialogTitle>
            </DialogHeader>
            <EntityForm
              entity={editingEntity}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setShowForm(false);
                setEditingEntity(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {entities.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Building className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h4 className="font-semibold mb-2">No Entities Found</h4>
            <p className="text-sm text-muted-foreground mb-4">Create your first entity to start applying for permits</p>
            <Button onClick={() => setShowForm(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Entity
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entities.map((entity) => (
                  <>
                    <TableRow 
                      key={entity.id} 
                      className={`cursor-pointer transition-colors ${
                        selectedEntity?.id === entity.id 
                          ? 'bg-accent hover:bg-accent/90' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedEntity(selectedEntity?.id === entity.id ? null : entity)}
                    >
                      <TableCell>
                        {selectedEntity?.id === entity.id ? (
                          <ChevronDown className="w-4 h-4 text-primary" />
                        ) : (
                          <ChevronsUpDown className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                        )}
                      </TableCell>
                      <TableCell className="flex items-center">
                        {entity.entity_type === 'company' ? (
                          <Building className="w-4 h-4 mr-2" />
                        ) : (
                          <User className="w-4 h-4 mr-2" />
                        )}
                        <span className="font-medium">{entity.name}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={entity.entity_type === 'company' ? 'default' : 'secondary'}>
                          {entity.entity_type === 'company' ? 'Company' : 'Individual'}
                        </Badge>
                      </TableCell>
                      <TableCell>{entity.email || '-'}</TableCell>
                      <TableCell>{new Date(entity.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(entity);
                            }}
                          >
                            <Edit className="w-4 h-4 text-primary" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(entity.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {selectedEntity?.id === entity.id && (
                      <TableRow className="bg-glass/50 backdrop-blur-md hover:bg-glass/50">
                        <TableCell colSpan={6} className="p-0">
                          <div className="border-t border-glass/30 bg-white/80 dark:bg-primary/5 backdrop-blur-md p-6">
                            <EntityDetailsReadOnly entity={selectedEntity} />
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}
    </div>
  );
}
