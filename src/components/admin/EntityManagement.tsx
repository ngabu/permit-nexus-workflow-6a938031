import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building, Search, Filter, MoreVertical, Ban, CheckCircle, AlertTriangle, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Entity {
  id: string;
  name: string;
  entity_type: string;
  user_id: string;
  email: string | null;
  phone: string | null;
  registration_number: string | null;
  created_at: string;
  is_suspended?: boolean;
}

export function EntityManagement() {
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [entities, setEntities] = useState<Entity[]>([]);
  const [filteredEntities, setFilteredEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [entityToSuspend, setEntityToSuspend] = useState<Entity | null>(null);
  const [suspendAction, setSuspendAction] = useState<'suspend' | 'activate'>('suspend');

  useEffect(() => {
    fetchEntities();
  }, []);

  useEffect(() => {
    filterEntities();
  }, [entities, searchTerm, typeFilter]);

  const fetchEntities = async () => {
    try {
      if (profile?.user_type !== 'super_admin' && profile?.user_type !== 'admin') {
        toast({
          title: "Access Denied",
          description: "You don't have permission to view all entities",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('entities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setEntities(data || []);
    } catch (error) {
      console.error('Error fetching entities:', error);
      toast({
        title: "Error",
        description: "Failed to fetch entities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterEntities = () => {
    let filtered = entities;

    if (searchTerm) {
      filtered = filtered.filter(entity => 
        entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entity.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entity.registration_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(entity => entity.entity_type === typeFilter);
    }

    setFilteredEntities(filtered);
  };

  const handleSuspendEntity = async (entity: Entity, action: 'suspend' | 'activate') => {
    setEntityToSuspend(entity);
    setSuspendAction(action);
    setSuspendDialogOpen(true);
  };

  const confirmSuspend = async () => {
    if (!entityToSuspend) return;

    try {
      const isSuspending = suspendAction === 'suspend';

      // Call the database function to freeze/unfreeze all entity records
      const { error } = await supabase.rpc('freeze_entity_records', {
        entity_id_param: entityToSuspend.id,
        should_freeze: isSuspending,
        freeze_reason: isSuspending ? 'Entity suspended by administrator' : null
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Entity ${isSuspending ? 'suspended' : 'activated'} successfully. All related records ${isSuspending ? 'frozen' : 'unfrozen'}.`,
      });

      fetchEntities();
      setSuspendDialogOpen(false);
      setEntityToSuspend(null);
    } catch (error) {
      console.error('Error updating entity:', error);
      toast({
        title: "Error",
        description: "Failed to update entity status",
        variant: "destructive",
      });
    }
  };

  const getEntityTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'INDIVIDUAL': 'Individual',
      'COMPANY': 'Company',
      'GOVERNMENT': 'Government',
      'NGO': 'NGO',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading entities...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Entity Management
          </CardTitle>
          <CardDescription>
            Search, filter, and manage all registered entities. Suspend entities to freeze all related applications and permits.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by name, email, or registration number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                <SelectItem value="COMPANY">Company</SelectItem>
                <SelectItem value="GOVERNMENT">Government</SelectItem>
                <SelectItem value="NGO">NGO</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Total Entities</div>
                <div className="text-2xl font-bold">{entities.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Companies</div>
                <div className="text-2xl font-bold">
                  {entities.filter(e => e.entity_type === 'COMPANY').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Individuals</div>
                <div className="text-2xl font-bold">
                  {entities.filter(e => e.entity_type === 'INDIVIDUAL').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Suspended</div>
                <div className="text-2xl font-bold text-destructive">
                  {entities.filter(e => e.is_suspended).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Entities Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Entity Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Registration #</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No entities found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEntities.map((entity) => (
                    <TableRow key={entity.id}>
                      <TableCell className="font-medium">{entity.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getEntityTypeLabel(entity.entity_type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {entity.registration_number || 'N/A'}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>{entity.email || 'N/A'}</div>
                        <div className="text-muted-foreground">{entity.phone || ''}</div>
                      </TableCell>
                      <TableCell>
                        {entity.is_suspended ? (
                          <Badge variant="destructive" className="gap-1">
                            <Lock className="w-3 h-3" />
                            Suspended
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1 bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="w-3 h-3" />
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(entity.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {entity.is_suspended ? (
                              <DropdownMenuItem
                                onClick={() => handleSuspendEntity(entity, 'activate')}
                                className="text-green-600"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Activate Entity
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleSuspendEntity(entity, 'suspend')}
                                className="text-destructive"
                              >
                                <Ban className="w-4 h-4 mr-2" />
                                Suspend Entity
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Suspend/Activate Confirmation Dialog */}
      <AlertDialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              {suspendAction === 'suspend' ? 'Suspend Entity' : 'Activate Entity'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {suspendAction === 'suspend' ? (
                <>
                  Are you sure you want to suspend <strong>{entityToSuspend?.name}</strong>?
                  <br /><br />
                  This will:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Freeze all permit applications linked to this entity</li>
                    <li>Prevent any edits or deletions of related records</li>
                    <li>Mark all related permits as frozen</li>
                  </ul>
                </>
              ) : (
                <>
                  Are you sure you want to activate <strong>{entityToSuspend?.name}</strong>?
                  <br /><br />
                  This will:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Unfreeze all permit applications</li>
                    <li>Allow edits and deletions of related records</li>
                    <li>Restore normal entity operations</li>
                  </ul>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSuspend}
              className={suspendAction === 'suspend' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {suspendAction === 'suspend' ? 'Suspend Entity' : 'Activate Entity'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
