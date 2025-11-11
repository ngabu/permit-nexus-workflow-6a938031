import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, FileText, MessageSquare } from "lucide-react";

const PermitEnforcement = () => {
  const enforcementActions = [
    {
      id: 1,
      permitNumber: "CEPA-PER-2024-0001",
      title: "Mining Operation",
      actionType: "Warning Notice",
      issueDate: "2024-10-01",
      status: "resolved",
      description: "Late submission of quarterly report"
    }
  ];

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Permit Enforcement</h1>
          <p className="text-muted-foreground">View enforcement actions and respond to notices</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-card-foreground">Active Notices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-card-foreground">0</span>
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-card-foreground">Pending Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-card-foreground">0</span>
                <MessageSquare className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-card-foreground">Resolved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-card-foreground">1</span>
                <FileText className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Enforcement History</CardTitle>
            <CardDescription>All enforcement actions and notices for your permits</CardDescription>
          </CardHeader>
          <CardContent>
            {enforcementActions.length > 0 ? (
              <div className="space-y-4">
                {enforcementActions.map((action) => (
                  <Card key={action.id} className="bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-card-foreground">{action.permitNumber}</h3>
                            <Badge variant={action.status === "resolved" ? "default" : "destructive"}>
                              {action.status === "resolved" ? "Resolved" : "Active"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{action.title}</p>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-card-foreground">
                              {action.actionType}
                            </p>
                            <p className="text-sm text-muted-foreground">{action.description}</p>
                            <p className="text-xs text-muted-foreground">
                              Issued: {new Date(action.issueDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <FileText className="w-4 h-4 mr-2" />
                            View Notice
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No enforcement actions found</p>
                <p className="text-sm">All permits are in good standing</p>
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
};

export default PermitEnforcement;