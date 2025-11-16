import React, { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useInspections } from '@/hooks/useInspections';
import { CalendarDays, MapPin, DollarSign, Search, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const PermitEnforcementInspections = () => {
  const { inspections, loading } = useInspections();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredInspections = useMemo(() => {
    return inspections.filter(inspection => 
      inspection.permit_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inspection.permit_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inspection.inspection_type?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [inspections, searchQuery]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading inspections...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Permit Enforcement - Inspections</h1>
          <p className="text-muted-foreground mt-2">
            View scheduled and completed inspections for your permits
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">
                {inspections.filter(i => i.status === 'scheduled').length}
              </div>
              <p className="text-sm text-muted-foreground">Upcoming Inspections</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">
                {inspections.filter(i => i.status === 'in-progress').length}
              </div>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {inspections.filter(i => i.status === 'completed').length}
              </div>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search inspections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Inspections List */}
        <div className="space-y-4">
          {filteredInspections.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? 'No inspections found matching your search.'
                    : 'No inspections scheduled for your permits yet.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredInspections.map((inspection) => (
              <Card key={inspection.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{inspection.inspection_type}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Permit: {inspection.permit_number || inspection.permit_title}
                      </p>
                    </div>
                    <Badge className={getStatusColor(inspection.status)}>
                      {inspection.status.replace('-', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-sm">
                      <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Scheduled Date</p>
                        <p>{format(new Date(inspection.scheduled_date), 'PPP')}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Province</p>
                        <p>{inspection.province || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-sm">
                      <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Total Travel Cost</p>
                        <p>K {inspection.total_travel_cost.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  {inspection.total_travel_cost > 0 && (
                    <div className="p-4 bg-muted rounded-lg space-y-2">
                      <p className="font-medium text-sm">Travel Costs Breakdown:</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Accommodation</p>
                          <p className="font-medium">K {inspection.accommodation_cost.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Transportation</p>
                          <p className="font-medium">K {inspection.transportation_cost.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Daily Allowance</p>
                          <p className="font-medium">K {inspection.daily_allowance.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                        <AlertCircle className="h-4 w-4 inline mr-2" />
                        These travel costs will be charged to your entity.
                      </div>
                    </div>
                  )}

                  {inspection.notes && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
                      <p className="font-medium mb-1">Inspection Notes:</p>
                      <p className="text-muted-foreground">{inspection.notes}</p>
                    </div>
                  )}

                  {inspection.findings && inspection.status === 'completed' && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg text-sm">
                      <p className="font-medium mb-1">Inspection Findings:</p>
                      <p className="text-muted-foreground">{inspection.findings}</p>
                    </div>
                  )}

                  {inspection.inspector_name && (
                    <div className="mt-4 text-sm text-muted-foreground">
                      Inspector: <span className="font-medium text-foreground">{inspection.inspector_name}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PermitEnforcementInspections;
