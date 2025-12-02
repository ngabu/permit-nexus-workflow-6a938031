import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Entity } from '@/hooks/useEntities';
import { format } from 'date-fns';

interface EntityDetailsReadOnlyProps {
  entity: Entity;
}

export function EntityDetailsReadOnly({ entity }: EntityDetailsReadOnlyProps) {
  const ReadOnlyField = ({ label, value }: { label: string; value: string | number | undefined | null }) => (
    <div>
      <Label className="text-muted-foreground">{label}</Label>
      <p className="font-medium mt-1">{value || '-'}</p>
    </div>
  );

  return (
    <div className="p-6 bg-background border-t">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">Entity Details</h4>
          <Badge variant={entity.is_suspended ? 'destructive' : 'default'}>
            {entity.is_suspended ? 'Suspended' : 'Active'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReadOnlyField label="Entity Name" value={entity.name} />
          <ReadOnlyField label="Entity Type" value={entity.entity_type} />
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReadOnlyField label="Email" value={entity.email} />
          <ReadOnlyField label="Phone" value={entity.phone} />
          <ReadOnlyField label="Postal Address" value={entity.postal_address} />
          <ReadOnlyField label="Registered Address" value={entity['registered address']} />
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReadOnlyField label="Province" value={entity.province} />
          <ReadOnlyField label="District" value={entity.district} />
        </div>

        <Separator />

        <div>
          <Label className="text-muted-foreground">Contact Person</Label>
          <div className="mt-2 p-3 bg-muted rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="font-medium text-sm mt-1">{entity.contact_person || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium text-sm mt-1">{entity.contact_person_email || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-medium text-sm mt-1">{entity.contact_person_phone || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReadOnlyField label="IPA Reg Number" value={entity.registration_number} />
          <ReadOnlyField label="IRC Tax Number" value={entity.tax_number} />
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ReadOnlyField 
            label="Created Date" 
            value={format(new Date(entity.created_at), 'PPP p')} 
          />
          <ReadOnlyField 
            label="Last Updated" 
            value={format(new Date(entity.updated_at), 'PPP p')} 
          />
          <ReadOnlyField label="User ID" value={entity.user_id} />
        </div>
      </div>
    </div>
  );
}
