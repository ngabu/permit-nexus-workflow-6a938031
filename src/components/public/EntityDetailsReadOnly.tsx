import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, User, Mail, Phone, MapPin, FileText, Hash, UserCheck } from 'lucide-react';
import { Entity } from '@/hooks/useEntities';

interface EntityDetailsReadOnlyProps {
  entity: Entity;
}

export function EntityDetailsReadOnly({ entity }: EntityDetailsReadOnlyProps) {
  return (
    <Card className="border-forest-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {entity.entity_type === 'company' ? (
            <Building className="w-5 h-5 text-forest-600" />
          ) : (
            <User className="w-5 h-5 text-forest-600" />
          )}
          <span>{entity.name}</span>
          <Badge variant={entity.entity_type === 'company' ? 'default' : 'secondary'}>
            {entity.entity_type === 'company' ? 'Company' : 'Individual'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-3 uppercase tracking-wide">
            Basic Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <User className="w-4 h-4" />
                Entity Name
              </label>
              <div className="bg-glass/50 backdrop-blur-sm border border-glass rounded-md px-3 py-2 text-sm">
                {entity.name}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Building className="w-4 h-4" />
                Entity Type
              </label>
              <div className="bg-glass/50 backdrop-blur-sm border border-glass rounded-md px-3 py-2 text-sm">
                {entity.entity_type === 'company' ? 'Company' : 'Individual'}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-3 uppercase tracking-wide">
            Contact Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <div className="bg-glass/50 backdrop-blur-sm border border-glass rounded-md px-3 py-2 text-sm">
                {entity.email || 'Not provided'}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </label>
              <div className="bg-glass/50 backdrop-blur-sm border border-glass rounded-md px-3 py-2 text-sm">
                {entity.phone || 'Not provided'}
              </div>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-3 uppercase tracking-wide">
            Address Information
          </h4>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Address
            </label>
            <div className="bg-glass/50 backdrop-blur-sm border border-glass rounded-md px-3 py-2 text-sm min-h-[2.5rem]">
              {entity.address || 'Not provided'}
            </div>
          </div>
        </div>

        {/* Legal Information */}
        {entity.entity_type === 'company' && (
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-3 uppercase tracking-wide">
              Legal Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Registration Number
                </label>
                <div className="bg-glass/50 backdrop-blur-sm border border-glass rounded-md px-3 py-2 text-sm">
                  {entity.registration_number || 'Not provided'}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Tax Number
                </label>
                <div className="bg-glass/50 backdrop-blur-sm border border-glass rounded-md px-3 py-2 text-sm">
                  {entity.tax_number || 'Not provided'}
                </div>
              </div>
            </div>
            {entity.contact_person && (
              <div className="mt-4 space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  Contact Person
                </label>
                <div className="bg-glass/50 backdrop-blur-sm border border-glass rounded-md px-3 py-2 text-sm">
                  {entity.contact_person}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Metadata */}
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-3 uppercase tracking-wide">
            Record Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Created Date
              </label>
              <div className="bg-glass/50 backdrop-blur-sm border border-glass rounded-md px-3 py-2 text-sm">
                {new Date(entity.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Last Updated
              </label>
              <div className="bg-glass/50 backdrop-blur-sm border border-glass rounded-md px-3 py-2 text-sm">
                {new Date(entity.updated_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}