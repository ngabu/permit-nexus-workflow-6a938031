import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, User, FileText, AlertCircle, CheckCircle2, ClipboardList } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export function ComplianceInspectionsView() {
  const { user } = useAuth();

  const { data: inspections, isLoading } = useQuery({
    queryKey: ['user-inspections', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Get user's permit applications first
      const { data: permits, error: permitsError } = await supabase
        .from('permit_applications')
        .select('id')
        .eq('user_id', user.id);
      
      if (permitsError) throw permitsError;
      if (!permits || permits.length === 0) return [];
      
      const permitIds = permits.map(p => p.id);
      
      // Get inspections for user's permits
      const { data, error } = await supabase
        .from('inspections')
        .select(`
          *,
          permit_applications (
            permit_number,
            title
          )
        `)
        .in('permit_application_id', permitIds)
        .order('scheduled_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Scheduled</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">In Progress</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Inspections</h2>
        <p className="text-muted-foreground mt-1">
          View scheduled and completed inspections for your permits
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inspections?.filter(i => i.status === 'scheduled').length || 0}</p>
                <p className="text-sm text-muted-foreground">Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inspections?.filter(i => i.status === 'completed').length || 0}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inspections?.filter(i => i.status === 'in_progress').length || 0}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inspections List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Your Inspections
          </CardTitle>
          <CardDescription>
            All inspections related to your permit applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!inspections || inspections.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Inspections Yet</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Inspections will appear here once they are scheduled for your permits.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {inspections.map((inspection) => (
                <div
                  key={inspection.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {inspection.permit_applications?.title || 'Permit Inspection'}
                        </span>
                        {getStatusBadge(inspection.status)}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {inspection.permit_applications?.permit_number || 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(inspection.scheduled_date), 'PPP')}
                        </span>
                        {inspection.province && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {inspection.province}
                          </span>
                        )}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Type: </span>
                        <span className="capitalize">{inspection.inspection_type.replace(/_/g, ' ')}</span>
                      </div>
                      {inspection.findings && (
                        <div className="text-sm mt-2 p-2 bg-muted rounded">
                          <span className="font-medium">Findings: </span>
                          {inspection.findings}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
