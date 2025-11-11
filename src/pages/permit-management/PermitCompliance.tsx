import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Clock, FileText, Upload } from "lucide-react";

const PermitCompliance = () => {
  const complianceReports = [
    {
      id: 1,
      permitNumber: "CEPA-PER-2024-0001",
      title: "Mining Operation",
      dueDate: "2024-12-31",
      status: "compliant",
      lastReport: "2024-10-15"
    },
    {
      id: 2,
      permitNumber: "CEPA-PER-2024-0002",
      title: "Forestry Project",
      dueDate: "2024-11-30",
      status: "pending",
      lastReport: "2024-08-20"
    }
  ];

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Permit Compliance</h1>
          <p className="text-muted-foreground">Monitor and report on permit compliance obligations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-card-foreground">Compliant</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-card-foreground">1</span>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-card-foreground">Pending Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-card-foreground">1</span>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-card-foreground">Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-card-foreground">0</span>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Compliance Reports</CardTitle>
            <CardDescription>Track and submit required compliance reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {complianceReports.map((report) => (
                <Card key={report.id} className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-card-foreground">{report.permitNumber}</h3>
                          <Badge variant={report.status === "compliant" ? "default" : "secondary"}>
                            {report.status === "compliant" ? "Compliant" : "Report Due"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{report.title}</p>
                        <div className="flex gap-4 text-sm">
                          <span className="text-muted-foreground">
                            Last Report: {new Date(report.lastReport).toLocaleDateString()}
                          </span>
                          <span className="text-muted-foreground">
                            Next Due: {new Date(report.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <FileText className="w-4 h-4 mr-2" />
                          View Report
                        </Button>
                        <Button size="sm">
                          <Upload className="w-4 h-4 mr-2" />
                          Submit Report
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
    </div>
  );
};

export default PermitCompliance;