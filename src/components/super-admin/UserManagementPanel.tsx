import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Edit, Trash2, Plus, Search, Shield } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function UserManagementPanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const queryClient = useQueryClient();

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['super-admin-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Profile[];
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (values: Partial<Profile>) => {
      const { error } = await supabase
        .from('profiles')
        .update(values)
        .eq('id', editingUser!.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-profiles'] });
      toast.success('User updated successfully');
      setEditingUser(null);
    },
    onError: (error) => {
      toast.error('Failed to update user: ' + error.message);
    },
  });

  const filteredProfiles = profiles?.filter(profile =>
    profile.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          User Management
        </CardTitle>
        <CardDescription>Manage all users and their roles across the system</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>User Type</TableHead>
                <TableHead>Staff Unit</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : filteredProfiles?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">No users found</TableCell>
                </TableRow>
              ) : (
                filteredProfiles?.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">
                      {profile.first_name} {profile.last_name}
                    </TableCell>
                    <TableCell>{profile.email}</TableCell>
                    <TableCell>
                      <Badge variant={profile.user_type === 'super_admin' ? 'destructive' : 'default'}>
                        {profile.user_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {profile.staff_unit ? (
                        <Badge variant="outline">{profile.staff_unit}</Badge>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {profile.staff_position ? (
                        <Badge variant="secondary">{profile.staff_position}</Badge>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={profile.is_active ? 'default' : 'destructive'}>
                        {profile.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingUser(profile)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit User</DialogTitle>
                            <DialogDescription>
                              Update user details and permissions
                            </DialogDescription>
                          </DialogHeader>
                          <UserEditForm
                            user={editingUser}
                            onSave={(values) => updateUserMutation.mutate(values)}
                            onCancel={() => setEditingUser(null)}
                          />
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function UserEditForm({
  user,
  onSave,
  onCancel,
}: {
  user: Profile | null;
  onSave: (values: Partial<Profile>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<{
    user_type: Database['public']['Enums']['user_type'];
    staff_unit: Database['public']['Enums']['staff_unit'] | null;
    staff_position: Database['public']['Enums']['staff_position'] | null;
    is_active: boolean;
  }>({
    user_type: user?.user_type || 'public',
    staff_unit: user?.staff_unit || null,
    staff_position: user?.staff_position || null,
    is_active: user?.is_active ?? true,
  });

  if (!user) return null;

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      onSave(formData);
    }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>User Type</Label>
          <Select
            value={formData.user_type}
            onValueChange={(value) => setFormData({ ...formData, user_type: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Staff Unit</Label>
          <Select
            value={formData.staff_unit || 'none'}
            onValueChange={(value) => setFormData({ 
              ...formData, 
              staff_unit: value === 'none' ? null : value as Database['public']['Enums']['staff_unit']
            })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="registry">Registry</SelectItem>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="compliance">Compliance</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="directorate">Directorate</SelectItem>
              <SelectItem value="systems_admin">Systems Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Staff Position</Label>
          <Select
            value={formData.staff_position || 'none'}
            onValueChange={(value) => setFormData({ 
              ...formData, 
              staff_position: value === 'none' ? null : value as Database['public']['Enums']['staff_position']
            })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="officer">Officer</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="director">Director</SelectItem>
              <SelectItem value="managing_director">Managing Director</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={formData.is_active ? 'active' : 'inactive'}
            onValueChange={(value) => setFormData({ ...formData, is_active: value === 'active' })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Changes
        </Button>
      </div>
    </form>
  );
}
