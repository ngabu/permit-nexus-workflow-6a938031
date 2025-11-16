import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, MessageSquare, MapPin } from "lucide-react";
import { usePermitInspections } from "@/hooks/usePermitInspections";
import { format } from "date-fns";

const PermitEnforcement = () => {
  const { inspections, loading } = usePermitInspections();

  // Group inspections by permit
  const inspectionsByPermit = inspections.reduce((acc, inspection) => {
    const key = inspection.permit_number;
    if (!acc[key]) {
      acc[key] = {
        permit_number: inspection.permit_number,
        permit_title: inspection.permit_title,
        inspections: []
      };
    }
    acc[key].inspections.push(inspection);
    return acc;
  }, {} as Record<string, any>);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'scheduled':
        return 'secondary';
      case 'in-progress':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const totalScheduled = inspections.filter(i => i.status === 'scheduled').length;
  const totalInProgress = inspections.filter(i => i.status === 'in-progress').length;
  const totalCompleted = inspections.filter(i => i.status === 'completed').length;

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Permit Enforcement</h1>
          <p className="text-muted-foreground">View scheduled inspections and enforcement actions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-card-foreground">Scheduled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-card-foreground">{totalScheduled}</span>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-card-foreground">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-card-foreground">{totalInProgress}</span>
                <MessageSquare className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-card-foreground">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-card-foreground">{totalCompleted}</span>
                <FileText className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Scheduled Inspections</CardTitle>
            <CardDescription>Upcoming and past inspections for your permits</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading inspections...</div>
            ) : Object.keys(inspectionsByPermit).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No inspections scheduled</p>
                <p className="text-sm">Inspections will appear here when scheduled by CEPA staff</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.values(inspectionsByPermit).map((permitGroup: any) => (
                  <div key={permitGroup.permit_number} className="space-y-3">
                    <div className="flex items-center gap-3 pb-2 border-b">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold text-card-foreground">{permitGroup.permit_number}</h3>
                        <p className="text-sm text-muted-foreground">{permitGroup.permit_title}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 pl-8">
                      {permitGroup.inspections.map((inspection: any) => (
                        <Card key={inspection.id} className="bg-muted/30">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-3">
                                  <span className="font-medium text-card-foreground">{inspection.inspection_type}</span>
                                  <Badge variant={getStatusColor(inspection.status)}>
                                    {inspection.status.replace('-', ' ')}
                                  </Badge>
                                </div>
                                <div className="space-y-1 text-sm">
                                  <p className="text-muted-foreground">
                                    <Calendar className="inline h-4 w-4 mr-1" />
                                    Scheduled: {format(new Date(inspection.scheduled_date), 'PPP')}
                                  </p>
                                  {inspection.inspector_name && (
                                    <p className="text-muted-foreground">
                                      Inspector: {inspection.inspector_name}
                                    </p>
                                  )}
                                  {inspection.notes && (
                                    <p className="text-muted-foreground mt-2">
                                      {inspection.notes}
                                    </p>
                                  )}
                                  {inspection.findings && (
                                    <div className="mt-2 p-2 bg-background rounded border">
                                      <p className="font-medium text-sm">Findings:</p>
                                      <p className="text-sm text-muted-foreground">{inspection.findings}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                              {inspection.status === 'completed' && (
                                <Button variant="outline" size="sm">
                                  <FileText className="w-4 h-4 mr-2" />
                                  View Report
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
};

export default PermitEnforcement;
