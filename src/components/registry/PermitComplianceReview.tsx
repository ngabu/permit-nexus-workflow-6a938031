import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldCheck, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function PermitComplianceReview() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [reviewStatus, setReviewStatus] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");

  // Mock data - replace with actual data from Supabase
  const complianceReports = [
    {
      id: "1",
      permitNumber: "CEPA-PER-2024-0001",
      title: "Mining Operation",
      applicant: "ABC Mining Ltd",
      reportType: "Quarterly Compliance Report",
      reportingPeriod: "Q3 2024 (Jul-Sep)",
      submittedDate: "2024-10-15",
      dueDate: "2024-12-31",
      status: "submitted",
      lastReport: "2024-07-20",
      complianceStatus: "compliant",
      violations: [],
      environmentalMonitoring: {
        airQuality: "Within limits",
        waterQuality: "Compliant",
        noiseLevel: "Acceptable",
        wasteManagement: "On track"
      },
      documentationSubmitted: [
        "Quarterly monitoring data",
        "Incident reports",
        "Environmental audit report"
      ]
    },
    {
      id: "2",
      permitNumber: "CEPA-PER-2024-0002",
      title: "Forestry Project",
      applicant: "XYZ Forestry Co",
      reportType: "Annual Compliance Report",
      reportingPeriod: "2024 Annual",
      submittedDate: "2024-11-01",
      dueDate: "2024-11-30",
      status: "under_review",
      lastReport: "2023-11-15",
      complianceStatus: "pending_review",
      violations: [
        {
          type: "Minor",
          description: "Late submission of monthly report (August)",
          resolution: "Resolved with warning"
        }
      ],
      environmentalMonitoring: {
        forestCoverage: "95% maintained",
        soilErosion: "Controlled",
        biodiversity: "Protected areas intact",
        reforestation: "On schedule"
      },
      documentationSubmitted: [
        "Annual forest management report",
        "Biodiversity assessment",
        "Reforestation progress report"
      ]
    }
  ];

  const selectedReportData = complianceReports.find(r => r.id === selectedReport);

  const handleSubmitReview = () => {
    console.log("Registry review submitted:", { selectedReport, reviewStatus, reviewNotes });
    // TODO: Save to Supabase
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending_review":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShieldCheck className="w-5 h-5 mr-2" />
            Permit Compliance Reviews ({complianceReports.length})
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Review and assess permit compliance reports
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {complianceReports.length === 0 ? (
            <div className="text-center py-12">
              <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No compliance reports</h3>
              <p className="text-muted-foreground">
                No compliance reports have been submitted yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {complianceReports.map((report) => (
              <div
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedReport === report.id
                    ? 'border-primary bg-accent'
                    : 'hover:bg-accent/50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-card-foreground">{report.permitNumber}</p>
                    <p className="text-sm text-muted-foreground">{report.title} - {report.applicant}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {report.reportType} | Period: {report.reportingPeriod}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={report.status === 'submitted' ? 'secondary' : 'default'}>
                      {report.status.replace('_', ' ')}
                    </Badge>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(report.complianceStatus)}
                      <span className="text-xs">
                        {report.complianceStatus.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>Submitted: {report.submittedDate} | Due: {report.dueDate}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        </CardContent>
      </Card>

      {/* Read-Only Compliance Report Details */}
      {selectedReportData && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Compliance Report Details (Read-Only)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Permit Number</Label>
                  <p className="font-medium">{selectedReportData.permitNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Permit Title</Label>
                  <p className="font-medium">{selectedReportData.title}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Applicant</Label>
                  <p className="font-medium">{selectedReportData.applicant}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Report Type</Label>
                  <p className="font-medium">{selectedReportData.reportType}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Reporting Period</Label>
                  <p className="font-medium">{selectedReportData.reportingPeriod}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Submitted Date</Label>
                  <p className="font-medium">{selectedReportData.submittedDate}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Due Date</Label>
                  <p className="font-medium">{selectedReportData.dueDate}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Last Report</Label>
                  <p className="font-medium">{selectedReportData.lastReport}</p>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-muted-foreground">Environmental Monitoring Results</Label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  {Object.entries(selectedReportData.environmentalMonitoring).map(([key, value]) => (
                    <div key={key} className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="font-medium text-sm mt-1">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-muted-foreground">Documentation Submitted</Label>
                <div className="mt-2 space-y-2">
                  {selectedReportData.documentationSubmitted.map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-muted-foreground">Violations & Issues</Label>
                {selectedReportData.violations.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    {selectedReportData.violations.map((violation, idx) => (
                      <div key={idx} className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              <Badge variant="outline" className="mr-2">{violation.type}</Badge>
                              {violation.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Resolution: {violation.resolution}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">No violations reported</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                {getStatusIcon(selectedReportData.complianceStatus)}
                <div>
                  <p className="font-medium">Overall Compliance Status</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {selectedReportData.complianceStatus.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Registry Review Section */}
          <Card className="bg-accent/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Registry Review & Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reviewStatus">Review Decision</Label>
                <Select value={reviewStatus} onValueChange={setReviewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select review decision" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Accept Report - Compliant</SelectItem>
                    <SelectItem value="requires_clarification">Requires Additional Information</SelectItem>
                    <SelectItem value="non_compliant">Non-Compliant - Issue Notice</SelectItem>
                    <SelectItem value="forward_to_compliance">Forward to Compliance Unit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reviewNotes">Registry Review Notes</Label>
                <Textarea
                  id="reviewNotes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Provide detailed review notes, assessment findings, and recommendations..."
                  rows={6}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button variant="secondary" className="w-32">
                  Save Draft
                </Button>
                <Button onClick={handleSubmitReview} className="w-40">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submit Review
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}
