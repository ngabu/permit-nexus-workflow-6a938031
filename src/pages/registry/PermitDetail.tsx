import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Loader2, FileText, Calendar, Building, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface PermitDetail {
  id: string;
  title: string;
  permit_number: string | null;
  permit_type: string;
  description: string | null;
  status: string;
  entity_name: string | null;
  entity_type: string | null;
  activity_location: string | null;
  application_date: string | null;
  approval_date: string | null;
  expiry_date: string | null;
  created_at: string;
  updated_at: string;
}

export function PermitDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [permit, setPermit] = useState<PermitDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPermit();
  }, [id]);

  const fetchPermit = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('permit_applications')
        .select('id, title, permit_number, permit_type, description, status, entity_name, entity_type, activity_location, application_date, approval_date, expiry_date, created_at, updated_at')
        .eq('id', id)
        .single();

      if (error) throw error;
      setPermit(data);
    } catch (error) {
      console.error('Error fetching permit:', error);
      toast({
        title: 'Error',
        description: 'Failed to load permit details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!permit) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Permit not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{permit.permit_number || 'Permit Details'}</h1>
          <p className="text-muted-foreground">{permit.title}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Permit Information
            </CardTitle>
            <Badge variant="default">Active</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Permit Number</label>
              <p className="text-base font-semibold">{permit.permit_number || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Permit Type</label>
              <p className="text-base capitalize">{permit.permit_type.replace(/_/g, ' ')}</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <p className="text-base">{permit.description || '-'}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Building className="h-4 w-4" />
              Entity Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Entity Name</label>
                <p className="text-base">{permit.entity_name || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Entity Type</label>
                <p className="text-base capitalize">{permit.entity_type || '-'}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </h3>
            <p className="text-base">{permit.activity_location || '-'}</p>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Important Dates
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Application Date</label>
                <p className="text-base">
                  {permit.application_date ? format(new Date(permit.application_date), 'PPP') : '-'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Approval Date</label>
                <p className="text-base">
                  {permit.approval_date ? format(new Date(permit.approval_date), 'PPP') : '-'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Expiry Date</label>
                <p className="text-base">
                  {permit.expiry_date ? format(new Date(permit.expiry_date), 'PPP') : '-'}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Created Date</label>
              <p className="text-base">{format(new Date(permit.created_at), 'PPP')}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
              <p className="text-base">{format(new Date(permit.updated_at), 'PPP')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
