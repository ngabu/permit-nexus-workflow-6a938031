
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, UserPlus, Edit, Users, Shield, AlertCircle } from "lucide-react";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type UserType = Database['public']['Enums']['user_type'];
type StaffUnit = Database['public']['Enums']['staff_unit'];
type StaffPosition = Database['public']['Enums']['staff_position'];

interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  user_type: UserType;
  staff_unit: StaffUnit | null;
  staff_position: StaffPosition | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  user_id: string;
  phone?: string | null;
  address?: string | null;
  organization?: string | null;
  two_fa_enabled?: boolean;
  // Computed properties for backward compatibility
  full_name?: string | null;
  role?: UserType;
  operational_unit?: StaffUnit | null;
}

const UserManagement = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    user_type: 'public' as UserType,
    staff_unit: null as StaffUnit | null,
    staff_position: null as StaffPosition | null,
    // Computed fields for forms
    full_name: '',
    role: 'public' as UserType,
    operational_unit: null as StaffUnit | null,
  });

  useEffect(() => {
    if (profile?.user_type === 'super_admin') {
      fetchUsers();
    }
  }, [profile]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to match expected interface
      const transformedData = (data || []).map(item => ({
        ...item,
        full_name: item.first_name && item.last_name 
          ? `${item.first_name} ${item.last_name}` 
          : item.first_name || item.last_name,
        role: item.user_type,
        operational_unit: item.staff_unit
      }));
      
      setUsers(transformedData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    try {
      // Generate a secure random password server-side
      const { data: genPwd, error: pwdErr } = await supabase.rpc('generate_secure_password_v2');
      if (pwdErr) throw pwdErr;
      const tempPassword = genPwd as string;

      // Create auth user first with secure password
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          first_name: formData.first_name,
          last_name: formData.last_name,
        }
      });

      if (authError) throw authError;

      // Update the profile with basic details
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            first_name: formData.first_name,
            last_name: formData.last_name,
            must_change_password: true,
          })
          .eq('user_id', authData.user.id);

        if (profileError) throw profileError;

        // Securely set role and staff fields via RPC (audited)
        const { error: roleErr } = await supabase.rpc('update_user_role_secure_v2', {
          target_user_id: authData.user.id,
          new_role: formData.user_type,
          new_staff_unit: formData.staff_unit,
          new_staff_position: formData.staff_position,
        });
        if (roleErr) throw roleErr;
      }

      toast({
        title: "Success",
        description: "User created with a secure temporary password. Share it securely and advise immediate reset.",
      });

      setIsCreateDialogOpen(false);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    }
  };

  const updateUser = async () => {
    if (!selectedUser) return;

    try {
      // Securely update role and staff fields via RPC (audited, RLS-safe)
      const { error: roleErr } = await supabase.rpc('update_user_role_secure_v2', {
        target_user_id: selectedUser.user_id,
        new_role: formData.user_type,
        new_staff_unit: formData.staff_unit,
        new_staff_position: formData.staff_position,
      });
      if (roleErr) throw roleErr;

      // Update non-sensitive fields (names)
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User updated successfully!",
      });

      setIsEditDialogOpen(false);
      setSelectedUser(null);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      // Delete from auth (this will cascade to profiles due to foreign key)
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User deleted successfully!",
      });

      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      first_name: '',
      last_name: '',
      user_type: 'public',
      staff_unit: null,
      staff_position: null,
      full_name: '',
      role: 'public',
      operational_unit: null,
    });
  };

  const openEditDialog = (user: Profile) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      user_type: user.user_type,
      staff_unit: user.staff_unit,
      staff_position: user.staff_position,
      full_name: user.full_name || '',
      role: user.user_type,
      operational_unit: user.staff_unit,
    });
    setIsEditDialogOpen(true);
  };

  const getRoleBadgeVariant = (role: UserType) => {
    switch (role) {
      case 'super_admin':
      case 'admin':
        return 'destructive';
      case 'staff':
        return 'default';
      default:
        return 'secondary';
    }
  };

  // Show access denied if not admin
  if (profile?.user_type !== 'super_admin') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-lg font-semibold text-gray-900">Access Denied</h2>
            <p className="text-gray-600">You need administrator privileges to access this page.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading users...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage system users and their roles</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Create User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Create a new user account with specified role and permissions.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                   <Select value={formData.user_type} onValueChange={(value: UserType) => setFormData({ ...formData, user_type: value, role: value })}>
                     <SelectTrigger>
                       <SelectValue placeholder="Select role" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="public">Public</SelectItem>
                       <SelectItem value="staff">Staff</SelectItem>
                       <SelectItem value="admin">Admin</SelectItem>
                       <SelectItem value="super_admin">Super Admin</SelectItem>
                     </SelectContent>
                   </Select>
                </div>
                {['registry', 'revenue', 'compliance', 'finance', 'directorate'].includes(formData.role) && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="operational_unit">Operational Unit</Label>
                       <Select value={formData.staff_unit || ''} onValueChange={(value: StaffUnit) => setFormData({ ...formData, staff_unit: value, operational_unit: value })}>
                         <SelectTrigger>
                           <SelectValue placeholder="Select staff unit" />
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
                    <div className="space-y-2">
                      <Label htmlFor="staff_position">Staff Position</Label>
                      <Select value={formData.staff_position || ''} onValueChange={(value: StaffPosition) => setFormData({ ...formData, staff_position: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select staff position" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="officer">Officer</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createUser}>Create User</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              System Users
            </CardTitle>
            <CardDescription>
              Total users: {users.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{user.full_name || 'No name'}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                          {user.role}
                        </Badge>
                        {user.operational_unit && (
                          <Badge variant="outline" className="text-xs">
                            {user.operational_unit}
                          </Badge>
                        )}
                        {user.staff_position && (
                          <Badge variant="outline" className="text-xs">
                            {user.staff_position}
                          </Badge>
                        )}
                        {!user.is_active && (
                          <Badge variant="secondary" className="text-xs">
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(user)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteUser(user.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user role and permissions.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit_email">Email (Read-only)</Label>
                <Input
                  id="edit_email"
                  value={formData.email}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_full_name">Full Name</Label>
                <Input
                  id="edit_full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_role">Role</Label>
                 <Select value={formData.user_type} onValueChange={(value: UserType) => setFormData({ ...formData, user_type: value, role: value })}>
                   <SelectTrigger>
                     <SelectValue placeholder="Select role" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="public">Public</SelectItem>
                     <SelectItem value="staff">Staff</SelectItem>
                     <SelectItem value="admin">Admin</SelectItem>
                     <SelectItem value="super_admin">Super Admin</SelectItem>
                   </SelectContent>
                 </Select>
              </div>
              {['registry', 'revenue', 'compliance', 'finance', 'directorate'].includes(formData.role) && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="edit_operational_unit">Operational Unit</Label>
                     <Select value={formData.staff_unit || ''} onValueChange={(value: StaffUnit) => setFormData({ ...formData, staff_unit: value, operational_unit: value })}>
                       <SelectTrigger>
                         <SelectValue placeholder="Select staff unit" />
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
                  <div className="space-y-2">
                    <Label htmlFor="edit_staff_position">Staff Position</Label>
                    <Select value={formData.staff_position || ''} onValueChange={(value: StaffPosition) => setFormData({ ...formData, staff_position: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select staff position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="officer">Officer</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={updateUser}>Update User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;
