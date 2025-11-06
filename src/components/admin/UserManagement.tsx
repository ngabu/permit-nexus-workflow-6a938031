import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Users, UserPlus, UserMinus, Search, Filter, MoreVertical, Mail, Phone, Building, Calendar, Shield, Ban, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Database } from '@/integrations/supabase/types';

type StaffUnit = Database['public']['Enums']['staff_unit'];
type StaffPosition = Database['public']['Enums']['staff_position'];
type UserType = Database['public']['Enums']['user_type'];

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  user_type: UserType;
  staff_unit: StaffUnit | null;
  staff_position: StaffPosition | null;
  is_active: boolean;
  created_at: string;
  phone: string | null;
  organization: string | null;
}

export function UserManagement() {
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [userToSuspend, setUserToSuspend] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, userTypeFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      // Check if user is super_admin to fetch all users
      if (profile?.user_type !== 'super_admin') {
        toast({
          title: "Access Denied",
          description: "You don't have permission to view all users",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Fetched users:', data?.length || 0, 'users');
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.organization && user.organization.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (userTypeFilter !== 'all') {
      filtered = filtered.filter(user => user.user_type === userTypeFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => 
        statusFilter === 'active' ? user.is_active : !user.is_active
      );
    }

    setFilteredUsers(filtered);
  };

  const handleSuspendUser = async (user: UserProfile) => {
    if (user.user_type === 'super_admin') {
      toast({
        title: "Cannot suspend Super Admin",
        description: "Super admin accounts cannot be suspended",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !user.is_active })
        .eq('id', user.id);

      if (error) throw error;

      await fetchUsers();
      toast({
        title: "Success",
        description: `User ${user.is_active ? 'suspended' : 'reactivated'} successfully`,
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
    setSuspendDialogOpen(false);
    setUserToSuspend(null);
  };

  const handleEditUser = async (updatedUser: Partial<UserProfile>) => {
    if (!selectedUser) return;

    try {
      // Create update object with proper typing
      const updateData: any = {};
      
      if (updatedUser.first_name !== undefined) updateData.first_name = updatedUser.first_name;
      if (updatedUser.last_name !== undefined) updateData.last_name = updatedUser.last_name;
      if (updatedUser.phone !== undefined) updateData.phone = updatedUser.phone;
      if (updatedUser.organization !== undefined) updateData.organization = updatedUser.organization;
      if (updatedUser.staff_unit !== undefined) updateData.staff_unit = updatedUser.staff_unit;
      if (updatedUser.staff_position !== undefined) updateData.staff_position = updatedUser.staff_position;

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', selectedUser.id);

      if (error) throw error;

      await fetchUsers();
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    }
    setEditDialogOpen(false);
    setSelectedUser(null);
  };

  const getUserTypeColor = (userType: UserType) => {
    switch (userType) {
      case 'super_admin': return 'bg-red-100 text-red-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'staff': return 'bg-blue-100 text-blue-800';
      case 'public': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStaffColor = (unit: StaffUnit | null) => {
    if (!unit) return 'bg-gray-100 text-gray-800';
    switch (unit) {
      case 'registry': return 'bg-emerald-100 text-emerald-800';
      case 'compliance': return 'bg-amber-100 text-amber-800';
      case 'revenue': return 'bg-cyan-100 text-cyan-800';
      case 'finance': return 'bg-orange-100 text-orange-800';
      case 'directorate': return 'bg-slate-100 text-slate-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const publicUsers = filteredUsers.filter(u => u.user_type === 'public');
  const staffUsers = filteredUsers.filter(u => u.user_type !== 'public');

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-600 mx-auto"></div>
          <p className="mt-4 text-forest-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-forest-800 flex items-center gap-2">
            <Users className="h-6 w-6" />
            User Management
          </h2>
          <p className="text-forest-600">Manage all system users, roles, and permissions</p>
        </div>
        <Button className="bg-forest-600 hover:bg-forest-700">
          <UserPlus className="w-4 h-4 mr-2" />
          Add New User
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search Users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, email, or organization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="userType">User Type</Label>
              <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All user types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="public">Public Users</SelectItem>
                  <SelectItem value="staff">Staff Users</SelectItem>
                  <SelectItem value="admin">Administrators</SelectItem>
                  <SelectItem value="super_admin">Super Administrators</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Account Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setUserTypeFilter('all');
                  setStatusFilter('all');
                }}
                className="w-full"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Tables */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Users ({filteredUsers.length})</TabsTrigger>
          <TabsTrigger value="public">Public Users ({publicUsers.length})</TabsTrigger>
          <TabsTrigger value="staff">Staff Users ({staffUsers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <UserTable 
            users={filteredUsers}
            onEdit={(user) => {
              setSelectedUser(user);
              setEditDialogOpen(true);
            }}
            onSuspend={(user) => {
              setUserToSuspend(user);
              setSuspendDialogOpen(true);
            }}
            getUserTypeColor={getUserTypeColor}
            getStaffColor={getStaffColor}
          />
        </TabsContent>

        <TabsContent value="public">
          <UserTable 
            users={publicUsers}
            onEdit={(user) => {
              setSelectedUser(user);
              setEditDialogOpen(true);
            }}
            onSuspend={(user) => {
              setUserToSuspend(user);
              setSuspendDialogOpen(true);
            }}
            getUserTypeColor={getUserTypeColor}
            getStaffColor={getStaffColor}
          />
        </TabsContent>

        <TabsContent value="staff">
          <UserTable 
            users={staffUsers}
            onEdit={(user) => {
              setSelectedUser(user);
              setEditDialogOpen(true);
            }}
            onSuspend={(user) => {
              setUserToSuspend(user);
              setSuspendDialogOpen(true);
            }}
            getUserTypeColor={getUserTypeColor}
            getStaffColor={getStaffColor}
          />
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      <EditUserDialog
        user={selectedUser}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleEditUser}
      />

      {/* Suspend User Dialog */}
      <AlertDialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {userToSuspend?.is_active ? 'Suspend User Account' : 'Reactivate User Account'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {userToSuspend?.is_active 
                ? `Are you sure you want to suspend ${userToSuspend?.first_name} ${userToSuspend?.last_name}? They will lose access to the system.`
                : `Are you sure you want to reactivate ${userToSuspend?.first_name} ${userToSuspend?.last_name}? They will regain access to the system.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToSuspend && handleSuspendUser(userToSuspend)}
              className={userToSuspend?.is_active ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
            >
              {userToSuspend?.is_active ? 'Suspend User' : 'Reactivate User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface UserTableProps {
  users: UserProfile[];
  onEdit: (user: UserProfile) => void;
  onSuspend: (user: UserProfile) => void;
  getUserTypeColor: (userType: UserType) => string;
  getStaffColor: (unit: StaffUnit | null) => string;
}

function UserTable({ users, onEdit, onSuspend, getUserTypeColor, getStaffColor }: UserTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Staff Details</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-forest-800">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-sm text-forest-600">{user.email}</div>
                      {user.organization && (
                        <div className="text-xs text-forest-500 flex items-center mt-1">
                          <Building className="w-3 h-3 mr-1" />
                          {user.organization}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getUserTypeColor(user.user_type)}>
                      {user.user_type.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.staff_unit && (
                      <div className="space-y-1">
                        <Badge className={getStaffColor(user.staff_unit)}>
                          {user.staff_unit.toUpperCase()}
                        </Badge>
                        {user.staff_position && (
                          <div className="text-xs text-forest-600">
                            {user.staff_position.replace('_', ' ')}
                          </div>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {user.phone && (
                        <div className="text-xs text-forest-600 flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          {user.phone}
                        </div>
                      )}
                      <div className="text-xs text-forest-600 flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        {user.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {user.is_active ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">
                          <Ban className="w-3 h-3 mr-1" />
                          Suspended
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-forest-600 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(user)}>
                          Edit User
                        </DropdownMenuItem>
                        {user.user_type !== 'super_admin' && (
                          <DropdownMenuItem 
                            onClick={() => onSuspend(user)}
                            className={user.is_active ? "text-destructive" : "text-success"}
                          >
                            {user.is_active ? 'Suspend User' : 'Reactivate User'}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

interface EditUserDialogProps {
  user: UserProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (user: Partial<UserProfile>) => void;
}

function EditUserDialog({ user, open, onOpenChange, onSave }: EditUserDialogProps) {
  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  const handleSave = () => {
    onSave(formData);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information and permissions
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.first_name || ''}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.last_name || ''}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone || ''}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          {user.user_type !== 'public' && (
            <>
              <div>
                <Label htmlFor="staffUnit">Staff Unit</Label>
                <Select
                  value={formData.staff_unit || ''}
                  onValueChange={(value) => setFormData({...formData, staff_unit: value as StaffUnit})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="registry">Registry</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="directorate">Directorate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="staffPosition">Staff Position</Label>
                <Select
                  value={formData.staff_position || ''}
                  onValueChange={(value) => setFormData({...formData, staff_position: value as StaffPosition})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="officer">Officer</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="director">Director</SelectItem>
                    <SelectItem value="managing_director">Managing Director</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {user.user_type === 'public' && (
            <div>
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                value={formData.organization || ''}
                onChange={(e) => setFormData({...formData, organization: e.target.value})}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}