import React, { useState, useEffect } from 'react';
import { SimpleHeader } from '@/components/SimpleHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, FileText, CheckCircle, Clock, Edit, Eye, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface Permit {
  id: string;
  title: string;
  permit_type: string;
  permit_number?: string;
  status: string;
  approval_date?: string;
  expiry_date?: string;
  created_at: string;
  updated_at: string;
  entity_name?: string;
  description?: string;
  activity_location?: string;
}

interface PermitActivity {
  id: string;
  permit_id: string;
  activity_type: string;
  status: string;
  details?: any;
  created_at: string;
  updated_at: string;
}

const Permits = () => {
  const { user } = useAuth();
  const [permits, setPermits] = useState<Permit[]>([]);
  const [activities, setActivities] = useState<PermitActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchPermitsAndActivities();
    }
  }, [user]);

  const fetchPermitsAndActivities = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch user's permits (approved applications)
      const { data: permitsData, error: permitsError } = await (supabase as any)
        .from('permit_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (permitsError) throw permitsError;

      // Fetch permit activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('permit_activities')
        .select('*')
        .in('permit_id', permitsData?.map(p => p.id) || [])
        .order('updated_at', { ascending: false });

      if (activitiesError) throw activitiesError;

      setPermits(permitsData || []);
      setActivities(activitiesData || []);
    } catch (error) {
      console.error('Error fetching permits and activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge className={getStatusColor(status)}>
        {formatStatus(status)}
      </Badge>
    );
  };

  const handleViewPermit = (permitId: string) => {
    // Navigate to permit details
    console.log('View permit:', permitId);
  };

  const handleEditPermit = (permitId: string) => {
    // Navigate to edit permit
    console.log('Edit permit:', permitId);
  };

  const filteredPermits = permits.filter(permit => {
    const matchesSearch = permit.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         permit.permit_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (permit.permit_number && permit.permit_number.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || permit.status === statusFilter;
    const matchesType = typeFilter === 'all' || permit.permit_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SimpleHeader />
        <main className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading permits...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SimpleHeader />
      <main className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-forest-800">Permit Management</h1>
              <p className="text-forest-600 mt-1">Submit applications and manage your permits</p>
            </div>
            <Button 
              onClick={() => window.location.href = '/submit-application'}
              className="bg-gradient-to-r from-forest-600 to-nature-600 hover:from-forest-700 hover:to-nature-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Application
            </Button>
          </div>

          {/* Filter Section */}
          <Card className="border-forest-200">
            <CardHeader>
              <CardTitle className="text-forest-800 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filter & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search permits..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="under_assessment">Under Assessment</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Permit Type</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="environmental">Environmental</SelectItem>
                      <SelectItem value="mining">Mining</SelectItem>
                      <SelectItem value="forestry">Forestry</SelectItem>
                      <SelectItem value="fisheries">Fisheries</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date Range</Label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All dates" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All dates</SelectItem>
                      <SelectItem value="last-week">Last Week</SelectItem>
                      <SelectItem value="last-month">Last Month</SelectItem>
                      <SelectItem value="last-year">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-forest-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-forest-600">Total Applications</p>
                    <p className="text-2xl font-bold text-forest-800">{permits.length}</p>
                  </div>
                  <FileText className="w-8 h-8 text-forest-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-forest-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-forest-600">Approved</p>
                    <p className="text-2xl font-bold text-green-600">
                      {permits.filter(p => p.status === 'approved').length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-forest-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-forest-600">Pending</p>
                    <p className="text-2xl font-bold text-amber-600">
                      {permits.filter(p => ['submitted', 'under_assessment'].includes(p.status)).length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-amber-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-forest-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-forest-600">Draft</p>
                    <p className="text-2xl font-bold text-gray-600">
                      {permits.filter(p => p.status === 'draft').length}
                    </p>
                  </div>
                  <Edit className="w-8 h-8 text-gray-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Permits List */}
          <Card className="border-forest-200">
            <CardHeader>
              <CardTitle className="text-forest-800">Permit Applications</CardTitle>
              <CardDescription>All your permit applications and their current status</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-lg">Loading permits...</div>
                </div>
              ) : filteredPermits.length > 0 ? (
                <div className="space-y-4">
                  {filteredPermits.map((permit) => (
                    <div 
                      key={permit.id}
                      className="flex items-center justify-between p-4 border border-forest-100 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h3 className="font-semibold text-forest-800">
                              {permit.title || 'Untitled Application'}
                            </h3>
                            <p className="text-sm text-forest-600">
                              {permit.permit_type} • Application #{permit.permit_number || permit.id.slice(0, 8)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Applied: {format(new Date(permit.created_at), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {getStatusBadge(permit.status)}
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewPermit(permit.id)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          {permit.status === 'draft' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditPermit(permit.id)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mb-2">No permits found</p>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' || dateFilter !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Start by creating your first permit application'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Permits;