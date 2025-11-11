import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Building, Mail, Phone, Calendar, MapPin, FileText } from 'lucide-react';
import { PermitForAssessment } from '../types';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BasicInfoReadOnlyProps {
  permit: PermitForAssessment;
}

interface EntityDetails {
  id?: string;
  name: string;
  entity_type: string;
  email?: string;
  phone?: string;
  address?: string;
  registration_number?: string;
  tax_number?: string;
  contact_person?: string;
  created_at: string;
  updated_at: string;
}

export function BasicInfoReadOnly({ permit }: BasicInfoReadOnlyProps) {
  const [entityDetails, setEntityDetails] = useState<EntityDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEntityDetails = async () => {
      if (!permit.entity || !permit.entity.name) return;
      
      setLoading(true);
      try {
        // Try to fetch full entity details from entities table
        // First try by entity_id if available, otherwise fallback to name
        let query = supabase.from('entities').select('*');
        
        if (permit.entity.id) {
          query = query.eq('id', permit.entity.id);
        } else {
          query = query.eq('name', permit.entity.name);
        }
        
        const { data, error } = await query.maybeSingle();

        if (error) {
          console.error('Error fetching entity details:', error);
          return;
        }

        if (data) {
          setEntityDetails(data);
        }
      } catch (error) {
        console.error('Error fetching entity details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEntityDetails();
  }, [permit.entity]);
  return (
    <div className="space-y-6">
      {/* Application Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Application Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Application Title</label>
            <p className="font-medium text-lg">{permit.title}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Application Number</label>
              <p className="font-medium">{permit.permit_number || 'Not assigned'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Permit Type</label>
              <Badge variant="outline" className="font-medium">
                {permit.permit_type}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Application Date</label>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <p className="font-medium">
                  {new Date(permit.application_date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <Badge variant="secondary" className="font-medium">
                {permit.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entity Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5 text-primary" />
            Complete Entity Information
            {loading && (
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent ml-2" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Entity Name</label>
              <p className="font-medium">{entityDetails?.name || permit.entity.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Entity Type</label>
              <Badge variant="outline" className="font-medium">
                {entityDetails?.entity_type || permit.entity.entity_type}
              </Badge>
            </div>
          </div>

          {entityDetails && (
            <>
              {/* Contact Information */}
              {(entityDetails.email || entityDetails.phone) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {entityDetails.email && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <p className="font-medium">{entityDetails.email}</p>
                      </div>
                    </div>
                  )}
                  {entityDetails.phone && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone</label>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <p className="font-medium">{entityDetails.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Address */}
              {entityDetails.address && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Address</label>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <p className="font-medium">{entityDetails.address}</p>
                  </div>
                </div>
              )}

              {/* Business Registration Details */}
              {(entityDetails.registration_number || entityDetails.tax_number || entityDetails.contact_person) && (
                <div className="border-t pt-4 space-y-3">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Business Registration Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {entityDetails.registration_number && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Registration Number</label>
                        <p className="font-medium">{entityDetails.registration_number}</p>
                      </div>
                    )}
                    {entityDetails.tax_number && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Tax Number</label>
                        <p className="font-medium">{entityDetails.tax_number}</p>
                      </div>
                    )}
                  </div>
                  {entityDetails.contact_person && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Contact Person</label>
                      <p className="font-medium">{entityDetails.contact_person}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Entity Registration Information */}
              <div className="border-t pt-4 space-y-3">
                <h4 className="font-medium text-sm">Entity Registration History</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Entity Registered</label>
                    <p>{new Date(entityDetails.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                    <p>{new Date(entityDetails.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {!entityDetails && !loading && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                Complete entity details not available. Showing basic information only.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Created</label>
              <p>{new Date(permit.created_at).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
              <p>{new Date(permit.updated_at).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}