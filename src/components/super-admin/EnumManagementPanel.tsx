import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Layers, AlertTriangle } from 'lucide-react';

const ENUM_DEFINITIONS = {
  user_type: {
    name: 'User Type',
    description: 'Defines the type of user in the system',
    values: ['public', 'staff', 'admin', 'super_admin'],
    usage: 'Used in profiles table to determine user permissions',
  },
  staff_unit: {
    name: 'Staff Unit',
    description: 'Organizational units for staff members',
    values: ['registry', 'revenue', 'compliance', 'finance', 'directorate', 'systems_admin'],
    usage: 'Used in profiles table for staff organization',
  },
  staff_position: {
    name: 'Staff Position',
    description: 'Position levels within staff units',
    values: ['officer', 'manager', 'director', 'managing_director'],
    usage: 'Used in profiles table for staff hierarchy',
  },
};

export function EnumManagementPanel() {
  return (
    <div className="space-y-4">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Enum values are defined at the database level and require migrations to modify.
          Changes to enums can affect existing data and should be handled carefully.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {Object.entries(ENUM_DEFINITIONS).map(([key, enumDef]) => (
          <Card key={key}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                {enumDef.name}
              </CardTitle>
              <CardDescription>{enumDef.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Enum Key:</h4>
                <code className="text-sm bg-muted px-2 py-1 rounded">{key}</code>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Possible Values:</h4>
                <div className="flex flex-wrap gap-2">
                  {enumDef.values.map((value) => (
                    <Badge key={value} variant="secondary">
                      {value}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Usage:</h4>
                <p className="text-sm text-muted-foreground">{enumDef.usage}</p>
              </div>

              <div className="pt-2 border-t">
                <h4 className="text-sm font-medium mb-2">Database Type Definition:</h4>
                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                  {`CREATE TYPE ${key} AS ENUM (\n  ${enumDef.values.map(v => `'${v}'`).join(',\n  ')}\n);`}
                </pre>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
