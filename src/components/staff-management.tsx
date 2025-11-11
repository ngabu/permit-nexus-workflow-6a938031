
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type UserType = Database['public']['Enums']['user_type'];
type StaffUnit = Database['public']['Enums']['staff_unit'];
type StaffPosition = Database['public']['Enums']['staff_position'];

interface StaffFormData {
  email: string;
  firstName: string;
  lastName: string;
  userType: UserType;
  staffUnit: StaffUnit | null;
  staffPosition: StaffPosition | null;
}

export function StaffManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Profile | null>(null);
  const [formData, setFormData] = useState<StaffFormData>({
    email: '',
    firstName: '',
    lastName: '',
    userType: 'public',
    staffUnit: null,
    staffPosition: null,
  });

  const queryClient = useQueryClient();

  const { data: staffMembers, isLoading } = useQuery({
    queryKey: ['staff-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('user_type', 'public')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Profile[];
    },
  });

  const createStaffMutation = useMutation({
    mutationFn: async (data: StaffFormData) => {
      // Generate a secure random password server-side
      const { data: genPwd, error: pwdErr } = await supabase.rpc('generate_secure_password_v2');
      if (pwdErr) throw pwdErr;
      const tempPassword = genPwd as string;

      // Create the auth user with the generated password
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          first_name: data.firstName,
          last_name: data.lastName,
        },
      });
      if (authError) throw authError;

      // Update basic profile info (names)
      const { error: nameUpdateError } = await supabase
        .from('profiles')
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
          must_change_password: true,
        })
        .eq('user_id', authData.user.id);
      if (nameUpdateError) throw nameUpdateError;

      // Securely update role and staff fields via RPC (audited, RLS-safe)
      const { error: roleErr } = await supabase.rpc('update_user_role_secure_v2', {
        target_user_id: authData.user.id,
        new_role: data.userType,
        new_staff_unit: data.staffUnit,
        new_staff_position: data.staffPosition,
      });
      if (roleErr) throw roleErr;

      return authData.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-members'] });
      toast.success('Staff member created successfully. Share the temporary password securely and advise immediate reset.');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      console.error('Error creating staff member:', error);
      toast.error('Failed to create staff member');
    },
  });

  const updateStaffMutation = useMutation({
    mutationFn: async (data: { id: string; userId: string } & Partial<StaffFormData>) => {
      // Securely update role and staff fields
      if (data.userType || data.staffUnit || data.staffPosition) {
        const { error: roleErr } = await supabase.rpc('update_user_role_secure_v2', {
          target_user_id: data.userId,
          new_role: data.userType ?? 'staff',
          new_staff_unit: data.staffUnit ?? null,
          new_staff_position: data.staffPosition ?? null,
        });
        if (roleErr) throw roleErr;
      }

      // Update non-sensitive fields (names)
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
        })
        .eq('id', data.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-members'] });
      toast.success('Staff member updated successfully');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      console.error('Error updating staff member:', error);
      toast.error('Failed to update staff member');
    },
  });

  const deleteStaffMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.auth.admin.deleteUser(id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-members'] });
      toast.success('Staff member deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting staff member:', error);
      toast.error('Failed to delete staff member');
    },
  });

  const resetForm = () => {
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      userType: 'public',
      staffUnit: null,
      staffPosition: null,
    });
    setEditingStaff(null);
  };

  const handleEdit = (staff: Profile) => {
    setEditingStaff(staff);
    setFormData({
      email: staff.email,
      firstName: staff.first_name || '',
      lastName: staff.last_name || '',
      userType: staff.user_type,
      staffUnit: staff.staff_unit,
      staffPosition: staff.staff_position,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingStaff) {
      updateStaffMutation.mutate({ id: editingStaff.id, userId: editingStaff.user_id, ...formData });
    } else {
      createStaffMutation.mutate(formData);
    }
  };

  const getRoleBadgeColor = (role: UserType) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      manager: 'bg-purple-100 text-purple-800',
      officer: 'bg-blue-100 text-blue-800',
      registry: 'bg-green-100 text-green-800',
      revenue: 'bg-yellow-100 text-yellow-800',
      compliance: 'bg-orange-100 text-orange-800',
      finance: 'bg-indigo-100 text-indigo-800',
      directorate: 'bg-pink-100 text-pink-800',
      public: 'bg-gray-100 text-gray-800',
    };
    return colors[role] || colors.public;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-forest-800 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Staff Management
            </CardTitle>
            <CardDescription>Manage staff accounts, roles, and assignments</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-forest-600 to-nature-600 hover:from-forest-700 hover:to-nature-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}</DialogTitle>
                <DialogDescription>
                  {editingStaff ? 'Update staff member information' : 'Create a new staff account with appropriate roles and assignments'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      disabled={!!editingStaff}
                    />
                  </div>
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="userType">User Type</Label>
                    <Select value={formData.userType} onValueChange={(value: UserType) => setFormData({ ...formData, userType: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                        <SelectItem value="super_admin">Super Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="staffUnit">Staff Unit</Label>
                    <Select 
                      value={formData.staffUnit || ''} 
                      onValueChange={(value: StaffUnit) => setFormData({ ...formData, staffUnit: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="registry">Registry</SelectItem>
                        <SelectItem value="revenue">Revenue</SelectItem>
                        <SelectItem value="compliance">Compliance</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="directorate">Directorate</SelectItem>
                        <SelectItem value="systems_admin">Systems Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                    <Label htmlFor="staffPosition">Staff Position</Label>
                    <Select 
                      value={formData.staffPosition || ''} 
                      onValueChange={(value: StaffPosition) => setFormData({ ...formData, staffPosition: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="officer">Officer</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="director">Director</SelectItem>
                        <SelectItem value="managing_director">Managing Director</SelectItem>
                      </SelectContent>
                    </Select>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createStaffMutation.isPending || updateStaffMutation.isPending}
                    className="bg-gradient-to-r from-forest-600 to-nature-600 hover:from-forest-700 hover:to-nature-700"
                  >
                    {editingStaff ? 'Update' : 'Create'} Staff
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Loading staff members...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffMembers?.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell className="font-medium">
                    {staff.first_name && staff.last_name 
                      ? `${staff.first_name} ${staff.last_name}` 
                      : staff.first_name || staff.last_name || 'N/A'}
                  </TableCell>
                  <TableCell>{staff.email}</TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(staff.user_type)}>{staff.user_type}</Badge>
                  </TableCell>
                  <TableCell>{staff.staff_unit || 'N/A'}</TableCell>
                  <TableCell>{staff.staff_position || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={staff.is_active ? 'default' : 'secondary'}>
                      {staff.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(staff)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteStaffMutation.mutate(staff.id)}
                        disabled={deleteStaffMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
