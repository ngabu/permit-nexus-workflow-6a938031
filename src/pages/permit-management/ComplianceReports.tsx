import { useState } from "react";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, Calendar, FileText, Upload, Clock, CheckCircle } from "lucide-react";

const ComplianceReports = () => {
  const [selectedPermit, setSelectedPermit] = useState("");
  const [reportType, setReportType] = useState("");
  const [reportPeriod, setReportPeriod] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle compliance report submission
    console.log("Compliance report submitted");
  };

  const scheduledReports = [
    {
      id: 1,
      permit: "CEPA-PER-2024-0001",
      type: "Monthly Water Quality",
      dueDate: "2024-06-30",
      status: "overdue"
    },
    {
      id: 2,
      permit: "CEPA-PER-2024-0001",
      type: "Quarterly Environmental Monitoring",
      dueDate: "2024-07-15",
      status: "pending"
    },
    {
      id: 3,
      permit: "CEPA-PER-2024-0002",
      type: "Annual Compliance Report",
      dueDate: "2024-12-31",
      status: "upcoming"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "overdue": return "destructive";
      case "pending": return "secondary";
      case "upcoming": return "outline";
      case "submitted": return "default";
      default: return "outline";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Compliance Reports</h1>
          <p className="text-muted-foreground">Submit periodic compliance reports as required by your permits</p>
        </div>

        {/* Scheduled Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Scheduled Reports
            </CardTitle>
            <CardDescription>View and manage your upcoming compliance report submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scheduledReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground">{report.type}</h3>
                    <p className="text-sm text-muted-foreground">Permit: {report.permit}</p>
                    <p className="text-sm text-muted-foreground">Due: {new Date(report.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(report.status)}>
                      {report.status === "overdue" && <Clock className="w-3 h-3 mr-1" />}
                      {report.status === "submitted" && <CheckCircle className="w-3 h-3 mr-1" />}
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </Badge>
                    <Button size="sm" variant="outline">
                      Submit Report
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* New Report Submission */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Submit New Compliance Report
            </CardTitle>
            <CardDescription>Submit a new compliance report for your permit</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="permit">Select Permit</Label>
                <Select value={selectedPermit} onValueChange={setSelectedPermit}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a permit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CEPA-PER-2024-0001">CEPA-PER-2024-0001 - Mining Operation</SelectItem>
                    <SelectItem value="CEPA-PER-2024-0002">CEPA-PER-2024-0002 - Forestry Project</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reportType">Report Type</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly-water">Monthly Water Quality</SelectItem>
                      <SelectItem value="quarterly-env">Quarterly Environmental Monitoring</SelectItem>
                      <SelectItem value="annual-compliance">Annual Compliance Report</SelectItem>
                      <SelectItem value="incident-report">Incident Report</SelectItem>
                      <SelectItem value="waste-management">Waste Management Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reportPeriod">Reporting Period</Label>
                  <Select value={reportPeriod} onValueChange={setReportPeriod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="may-2024">May 2024</SelectItem>
                      <SelectItem value="q2-2024">Q2 2024</SelectItem>
                      <SelectItem value="2024">Year 2024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="executiveSummary">Executive Summary</Label>
                <Textarea
                  id="executiveSummary"
                  placeholder="Provide a brief summary of compliance status and key findings..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Monitoring Data & Supporting Documents</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Upload monitoring data, laboratory results, photos, and other supporting evidence
                  </p>
                  <Button variant="outline" type="button" className="mt-2">
                    <FileText className="w-4 h-4 mr-2" />
                    Choose Files
                  </Button>
                </div>
              </div>

              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-lg">Compliance Checklist</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="monitoring-completed" className="rounded" />
                    <Label htmlFor="monitoring-completed" className="text-sm">
                      All required monitoring activities completed
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="standards-met" className="rounded" />
                    <Label htmlFor="standards-met" className="text-sm">
                      Environmental standards and limits met
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="incidents-reported" className="rounded" />
                    <Label htmlFor="incidents-reported" className="text-sm">
                      All incidents and non-compliance events reported
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="corrective-actions" className="rounded" />
                    <Label htmlFor="corrective-actions" className="text-sm">
                      Corrective actions from previous reports implemented
                    </Label>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  Submit Compliance Report
                </Button>
                <Button type="button" variant="outline" className="flex-1">
                  Save as Draft
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ComplianceReports;