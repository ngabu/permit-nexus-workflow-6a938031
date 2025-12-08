import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Entity } from '@/hooks/useEntities';
import { EntityDetailsReadOnly } from '@/components/public/EntityDetailsReadOnly';
import { Building2 } from 'lucide-react';

interface MDEntityTabbedViewProps {
  entity: Entity;
  onUpdate?: () => void;
}

export function MDEntityTabbedView({ entity }: MDEntityTabbedViewProps) {

  return (
    <Card>
      <CardHeader className="bg-primary/5">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building2 className="w-5 h-5 text-primary" />
          Entity Details
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <EntityDetailsReadOnly entity={entity} />
      </CardContent>
    </Card>
  );
}
