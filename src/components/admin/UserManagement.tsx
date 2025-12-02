import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Users, UserPlus, Search, MoreVertical, Ban, CheckCircle, RefreshCw, Edit } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';
import { format } from 'date-fns';

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
  is_suspended: boolean | null;
  suspended_at: string | null;
  suspended_by: string | null;
  suspension_reason: string | null;
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
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [userToSuspend, setUserToSuspend] = useState<UserProfile | null>(null);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [createStaffDialogOpen, setCreateStaffDialogOpen] = useState(false);
  const [editStaffDialogOpen, setEditStaffDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserProfile | null>(null);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [userForPasswordReset, setUserForPasswordReset] = useState<UserProfile | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [newStaffData, setNewStaffData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    staff_unit: '' as StaffUnit | '',
    staff_position: '' as StaffPosition | '',
    phone: ''
  });
  
  const [editStaffData, setEditStaffData] = useState({
    first_name: '',
    last_name: '',
    staff_unit: '' as StaffUnit | '',
    staff_position: '' as StaffPosition | '',
    phone: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, userTypeFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      if (profile?.user_type !== 'admin' && profile?.user_type !== 'super_admin') {
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
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (userTypeFilter !== 'all') {
      filtered = filtered.filter(user => user.user_type === userTypeFilter);
    }

    if (statusFilter === 'active') {
      filtered = filtered.filter(user => !user.is_suspended);
    } else if (statusFilter === 'suspended') {
      filtered = filtered.filter(user => user.is_suspended);
    }

    setFilteredUsers(filtered);
  };

  const handleSuspendUser = async () => {
    if (!userToSuspend) return;
    
    if (userToSuspend.user_type === 'super_admin') {
      toast({
        title: "Cannot suspend Super Admin",
        description: "Super admin accounts cannot be suspended",
        variant: "destructive",
      });
      return;
    }

    if (!userToSuspend.is_suspended && !suspensionReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for suspension",
        variant: "destructive",
      });
      return;
    }

    try {
      const isSuspending = !userToSuspend.is_suspended;
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_suspended: isSuspending,
          suspended_at: isSuspending ? new Date().toISOString() : null,
          suspended_by: isSuspending ? profile?.user_id : null,
          suspension_reason: isSuspending ? suspensionReason : null
        })
        .eq('id', userToSuspend.id);

      if (error) throw error;

      await fetchUsers();
      toast({
        title: "Success",
        description: `User ${isSuspending ? 'suspended' : 'reactivated'} successfully`,
      });
      setSuspensionReason('');
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

  const handleCreateStaffUser = async () => {
    if (!newStaffData.email || !newStaffData.password || !newStaffData.staff_unit || !newStaffData.staff_position) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get the current session for authorization
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      // Call the edge function to create user
      const response = await supabase.functions.invoke('create-user', {
        body: {
          email: newStaffData.email,
          password: newStaffData.password,
          first_name: newStaffData.first_name,
          last_name: newStaffData.last_name,
          user_type: 'staff',
          staff_unit: newStaffData.staff_unit,
          staff_position: newStaffData.staff_position,
          phone: newStaffData.phone || null
        }
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to create user");
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast({
        title: "Success",
        description: "Staff user created successfully",
      });

      setNewStaffData({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        staff_unit: '',
        staff_position: '',
        phone: ''
      });
      setCreateStaffDialogOpen(false);
      await fetchUsers();
    } catch (error: any) {
      console.error('Error creating staff user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create staff user",
        variant: "destructive",
      });
    }
  };

  const handleResetPassword = async () => {
    if (!userForPasswordReset) return;

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        userForPasswordReset.email,
        { redirectTo: `${window.location.origin}/reset-password` }
      );

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password reset email sent successfully",
      });

      setResetPasswordDialogOpen(false);
      setUserForPasswordReset(null);
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    }
  };

  const handleEditStaffUser = async () => {
    if (!userToEdit || !editStaffData.staff_unit || !editStaffData.staff_position) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: editStaffData.first_name,
          last_name: editStaffData.last_name,
          staff_unit: editStaffData.staff_unit as StaffUnit,
          staff_position: editStaffData.staff_position as StaffPosition,
          phone: editStaffData.phone || null
        })
        .eq('user_id', userToEdit.user_id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Staff user updated successfully",
      });

      setEditStaffDialogOpen(false);
      setUserToEdit(null);
      await fetchUsers();
    } catch (error: any) {
      console.error('Error updating staff user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update staff user",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (user: UserProfile) => {
    setUserToEdit(user);
    setEditStaffData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      staff_unit: user.staff_unit || '',
      staff_position: user.staff_position || '',
      phone: user.phone || ''
    });
    setEditStaffDialogOpen(true);
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

  const UserTable = ({ users, onSuspend, onResetPassword, onEdit, getUserTypeColor }: { 
    users: any[], 
    onSuspend: (user: any) => void,
    onResetPassword: (user: any) => void,
    onEdit?: (user: any) => void,
    getUserTypeColor: (type: UserType) => string
  }) => {
    const totalPages = Math.ceil(users.length / itemsPerPage);
    const paginatedUsers = users.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
    
    return (
      <div className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Unit/Position</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : 'N/A'}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge className={getUserTypeColor(user.user_type)}>
                      {user.user_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {user.staff_unit && user.staff_position ? (
                      <>
                        <div>{user.staff_unit}</div>
                        <div className="text-muted-foreground">{user.staff_position}</div>
                      </>
                    ) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {user.is_suspended ? (
                      <Badge variant="destructive">Suspended</Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(user.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {user.user_type === 'staff' && onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(user)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => onSuspend(user)}>
                          {user.is_suspended ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Reactivate
                            </>
                          ) : (
                            <>
                              <Ban className="w-4 h-4 mr-2" />
                              Suspend
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onResetPassword(user)}>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Reset Password
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
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
    );
  };

  const publicUsers = filteredUsers.filter(u => u.user_type === 'public');
  const staffUsers = filteredUsers.filter(u => u.user_type === 'staff');

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-7 w-7" />
            User Management
          </h2>
          <p className="text-muted-foreground mt-1">Manage users, suspend accounts, and reset passwords</p>
        </div>
        <Button onClick={() => setCreateStaffDialogOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Add Staff User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({filteredUsers.length})</TabsTrigger>
          <TabsTrigger value="public">Public ({publicUsers.length})</TabsTrigger>
          <TabsTrigger value="staff">Staff ({staffUsers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <UserTable 
            users={filteredUsers} 
            onSuspend={(u) => { setUserToSuspend(u); setSuspendDialogOpen(true); }} 
            onResetPassword={(u) => { setUserForPasswordReset(u); setResetPasswordDialogOpen(true); }} 
            onEdit={openEditDialog} 
            getUserTypeColor={getUserTypeColor} 
          />
        </TabsContent>
        <TabsContent value="public">
          <UserTable 
            users={publicUsers} 
            onSuspend={(u) => { setUserToSuspend(u); setSuspendDialogOpen(true); }} 
            onResetPassword={(u) => { setUserForPasswordReset(u); setResetPasswordDialogOpen(true); }} 
            onEdit={openEditDialog} 
            getUserTypeColor={getUserTypeColor} 
          />
        </TabsContent>
        <TabsContent value="staff">
          <UserTable 
            users={staffUsers} 
            onSuspend={(u) => { setUserToSuspend(u); setSuspendDialogOpen(true); }} 
            onResetPassword={(u) => { setUserForPasswordReset(u); setResetPasswordDialogOpen(true); }} 
            onEdit={openEditDialog} 
            getUserTypeColor={getUserTypeColor} 
          />
        </TabsContent>
      </Tabs>

      <AlertDialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{userToSuspend?.is_suspended ? 'Reactivate' : 'Suspend'} User</AlertDialogTitle>
            <AlertDialogDescription>
              {userToSuspend?.is_suspended ? 'Reactivate' : 'Suspend'} {userToSuspend?.email}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          {!userToSuspend?.is_suspended && (
            <div className="py-4">
              <Label>Reason *</Label>
              <Textarea value={suspensionReason} onChange={(e) => setSuspensionReason(e.target.value)} className="mt-2" required />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSuspendUser} disabled={!userToSuspend?.is_suspended && !suspensionReason}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={createStaffDialogOpen} onOpenChange={setCreateStaffDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Staff User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Email *</Label><Input type="email" value={newStaffData.email} onChange={(e) => setNewStaffData({...newStaffData, email: e.target.value})} /></div>
            <div><Label>Password *</Label><Input type="password" value={newStaffData.password} onChange={(e) => setNewStaffData({...newStaffData, password: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>First Name</Label><Input value={newStaffData.first_name} onChange={(e) => setNewStaffData({...newStaffData, first_name: e.target.value})} /></div>
              <div><Label>Last Name</Label><Input value={newStaffData.last_name} onChange={(e) => setNewStaffData({...newStaffData, last_name: e.target.value})} /></div>
            </div>
            <div><Label>Unit *</Label><Select value={newStaffData.staff_unit} onValueChange={(v) => setNewStaffData({...newStaffData, staff_unit: v as StaffUnit})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="registry">Registry</SelectItem><SelectItem value="compliance">Compliance</SelectItem><SelectItem value="revenue">Revenue</SelectItem><SelectItem value="finance">Finance</SelectItem><SelectItem value="directorate">Directorate</SelectItem></SelectContent></Select></div>
            <div><Label>Position *</Label><Select value={newStaffData.staff_position} onValueChange={(v) => setNewStaffData({...newStaffData, staff_position: v as StaffPosition})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="officer">Officer</SelectItem><SelectItem value="manager">Manager</SelectItem><SelectItem value="director">Director</SelectItem><SelectItem value="managing_director">Managing Director</SelectItem></SelectContent></Select></div>
            <div><Label>Phone</Label><Input value={newStaffData.phone} onChange={(e) => setNewStaffData({...newStaffData, phone: e.target.value})} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateStaffDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateStaffUser}>Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editStaffDialogOpen} onOpenChange={setEditStaffDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Staff User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>First Name</Label><Input value={editStaffData.first_name} onChange={(e) => setEditStaffData({...editStaffData, first_name: e.target.value})} /></div>
              <div><Label>Last Name</Label><Input value={editStaffData.last_name} onChange={(e) => setEditStaffData({...editStaffData, last_name: e.target.value})} /></div>
            </div>
            <div><Label>Unit *</Label><Select value={editStaffData.staff_unit} onValueChange={(v) => setEditStaffData({...editStaffData, staff_unit: v as StaffUnit})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="registry">Registry</SelectItem><SelectItem value="compliance">Compliance</SelectItem><SelectItem value="revenue">Revenue</SelectItem><SelectItem value="finance">Finance</SelectItem><SelectItem value="directorate">Directorate</SelectItem></SelectContent></Select></div>
            <div><Label>Position *</Label><Select value={editStaffData.staff_position} onValueChange={(v) => setEditStaffData({...editStaffData, staff_position: v as StaffPosition})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="officer">Officer</SelectItem><SelectItem value="manager">Manager</SelectItem><SelectItem value="director">Director</SelectItem><SelectItem value="managing_director">Managing Director</SelectItem></SelectContent></Select></div>
            <div><Label>Phone</Label><Input value={editStaffData.phone} onChange={(e) => setEditStaffData({...editStaffData, phone: e.target.value})} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditStaffDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditStaffUser}>Update User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>Send a password reset email to {userForPasswordReset?.email}?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetPasswordDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleResetPassword}>Send Reset Email</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
