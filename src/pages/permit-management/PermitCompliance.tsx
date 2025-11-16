import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, AlertCircle, Clock, FileText, Upload, Download, X } from "lucide-react";
import { useDocuments } from "@/hooks/useDocuments";
import { useToast } from "@/hooks/use-toast";

const PermitCompliance = () => {
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [reportType, setReportType] = useState("");
  const [reportPeriod, setReportPeriod] = useState("");
  const [executiveSummary, setExecutiveSummary] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { uploadDocument } = useDocuments();
  const { toast } = useToast();
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReport = async () => {
    if (!selectedReport || !reportType || !reportPeriod) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload each file
      for (const file of uploadedFiles) {
        await uploadDocument(file, selectedReport.permitNumber);
      }

      toast({
        title: "Report Submitted",
        description: "Your compliance report has been submitted successfully"
      });

      // Reset form
      setSelectedReport(null);
      setReportType("");
      setReportPeriod("");
      setExecutiveSummary("");
      setUploadedFiles([]);
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit compliance report",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" onClick={() => setSelectedReport(report)}>
                              <Upload className="w-4 h-4 mr-2" />
                              Submit Report
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Submit Compliance Report</DialogTitle>
                              <DialogDescription>
                                Upload compliance report documents for {report.permitNumber}
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-6 py-4">
                              {/* Report Template Download */}
                              <Card className="bg-muted/30">
                                <CardHeader>
                                  <CardTitle className="text-base">Reporting Template</CardTitle>
                                  <CardDescription>
                                    Download the official reporting template and complete it before uploading
                                  </CardDescription>
                                </CardHeader>
                                <CardContent>
                                  <Button variant="outline" className="w-full">
                                    <Download className="w-4 h-4 mr-2" />
                                    Download Compliance Report Template
                                  </Button>
                                </CardContent>
                              </Card>

                              {/* Report Type Selection */}
                              <div className="space-y-2">
                                <Label htmlFor="reportType">Report Type *</Label>
                                <Select value={reportType} onValueChange={setReportType}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select report type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="monthly-water">Monthly Water Quality Report</SelectItem>
                                    <SelectItem value="quarterly-env">Quarterly Environmental Monitoring</SelectItem>
                                    <SelectItem value="annual-compliance">Annual Compliance Report</SelectItem>
                                    <SelectItem value="incident-report">Incident Report</SelectItem>
                                    <SelectItem value="waste-management">Waste Management Report</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Reporting Period */}
                              <div className="space-y-2">
                                <Label htmlFor="reportPeriod">Reporting Period *</Label>
                                <Select value={reportPeriod} onValueChange={setReportPeriod}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select period" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="jan-2025">January 2025</SelectItem>
                                    <SelectItem value="feb-2025">February 2025</SelectItem>
                                    <SelectItem value="q1-2025">Q1 2025</SelectItem>
                                    <SelectItem value="q2-2025">Q2 2025</SelectItem>
                                    <SelectItem value="2025">Year 2025</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Executive Summary */}
                              <div className="space-y-2">
                                <Label htmlFor="summary">Executive Summary</Label>
                                <Textarea
                                  id="summary"
                                  placeholder="Provide a brief summary of compliance status and key findings..."
                                  rows={4}
                                  value={executiveSummary}
                                  onChange={(e) => setExecutiveSummary(e.target.value)}
                                />
                              </div>

                              {/* File Upload Section */}
                              <div className="space-y-2">
                                <Label>Upload Compliance Documents *</Label>
                                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                  <p className="text-sm text-muted-foreground mb-2">
                                    Upload completed report template, monitoring data, laboratory results, photos, and supporting evidence
                                  </p>
                                  <input
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="file-upload"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                  />
                                  <Label htmlFor="file-upload">
                                    <Button variant="outline" type="button" asChild>
                                      <span>
                                        <FileText className="w-4 h-4 mr-2" />
                                        Choose Files
                                      </span>
                                    </Button>
                                  </Label>
                                </div>
                                
                                {/* Display uploaded files */}
                                {uploadedFiles.length > 0 && (
                                  <div className="mt-4 space-y-2">
                                    <Label className="text-sm font-medium">Selected Files:</Label>
                                    {uploadedFiles.map((file, index) => (
                                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                                        <span className="text-sm truncate flex-1">{file.name}</span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => removeFile(index)}
                                          type="button"
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Compliance Checklist */}
                              <Card className="bg-muted/30">
                                <CardHeader>
                                  <CardTitle className="text-base">Compliance Checklist</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="monitoring-completed" className="rounded" />
                                    <Label htmlFor="monitoring-completed" className="text-sm font-normal">
                                      All required monitoring activities completed
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="standards-met" className="rounded" />
                                    <Label htmlFor="standards-met" className="text-sm font-normal">
                                      Environmental standards and limits met
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="incidents-reported" className="rounded" />
                                    <Label htmlFor="incidents-reported" className="text-sm font-normal">
                                      All incidents and non-compliance events reported
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="corrective-actions" className="rounded" />
                                    <Label htmlFor="corrective-actions" className="text-sm font-normal">
                                      Corrective actions from previous reports implemented
                                    </Label>
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Submit Buttons */}
                              <div className="flex gap-3 pt-4">
                                <Button 
                                  onClick={handleSubmitReport} 
                                  disabled={isSubmitting || uploadedFiles.length === 0}
                                  className="flex-1"
                                >
                                  {isSubmitting ? "Submitting..." : "Submit Report"}
                                </Button>
                                <Button variant="outline" type="button" className="flex-1">
                                  Save as Draft
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
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