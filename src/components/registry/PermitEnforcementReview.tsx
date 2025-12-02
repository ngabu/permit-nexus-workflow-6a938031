import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gavel, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function PermitEnforcementReview() {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [reviewStatus, setReviewStatus] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");

  // Mock data - replace with actual data from Supabase
  const enforcementActions = [
    {
      id: "1",
      permitNumber: "CEPA-PER-2024-0001",
      title: "Mining Operation",
      applicant: "ABC Mining Ltd",
      actionType: "Warning Notice",
      severity: "Minor",
      issueDate: "2024-10-01",
      responseDeadline: "2024-11-01",
      status: "awaiting_response",
      description: "Late submission of quarterly environmental monitoring report",
      violationDetails: "Q2 2024 report submitted 15 days past the due date (July 30, 2024 vs July 15, 2024)",
      requiredActions: [
        "Submit outstanding Q2 2024 report immediately",
        "Provide explanation for late submission",
        "Implement measures to prevent future delays"
      ],
      potentialConsequences: "Continued non-compliance may result in permit suspension",
      complianceHistory: {
        previousViolations: 0,
        lastInspection: "2024-08-15",
        overallRating: "Good Standing"
      },
      responseSubmitted: false
    },
    {
      id: "2",
      permitNumber: "CEPA-PER-2024-0003",
      title: "Water Extraction Facility",
      applicant: "DEF Water Corp",
      actionType: "Compliance Order",
      severity: "Moderate",
      issueDate: "2024-09-15",
      responseDeadline: "2024-10-15",
      status: "response_received",
      description: "Exceeding permitted water extraction limits",
      violationDetails: "Monthly extraction exceeded permit limit by 12% in August 2024 (123,000L vs 110,000L permitted)",
      requiredActions: [
        "Reduce extraction to within permitted limits immediately",
        "Submit corrective action plan",
        "Install flow monitoring equipment",
        "Provide weekly extraction reports for 3 months"
      ],
      potentialConsequences: "Failure to comply may result in permit revocation and financial penalties",
      complianceHistory: {
        previousViolations: 1,
        lastInspection: "2024-07-10",
        overallRating: "Requires Monitoring"
      },
      responseSubmitted: true,
      responseDetails: {
        submittedDate: "2024-10-10",
        summary: "Flow monitoring equipment installed. Corrective action plan submitted. Extraction reduced to 95,000L per month.",
        supportingDocuments: [
          "Corrective Action Plan.pdf",
          "Flow Monitor Installation Certificate.pdf",
          "September Extraction Report.pdf"
        ]
      }
    },
    {
      id: "3",
      permitNumber: "CEPA-PER-2024-0002",
      title: "Forestry Project",
      applicant: "XYZ Forestry Co",
      actionType: "Stop Work Order",
      severity: "Critical",
      issueDate: "2024-11-10",
      responseDeadline: "2024-11-12",
      status: "active",
      description: "Operations in unauthorized area detected",
      violationDetails: "Harvesting activities observed 500m beyond permitted boundary in protected buffer zone",
      requiredActions: [
        "Cease all operations immediately",
        "Submit incident report within 48 hours",
        "Conduct environmental impact assessment of affected area",
        "Propose remediation plan",
        "Attend compliance hearing"
      ],
      potentialConsequences: "Immediate permit suspension. Potential criminal prosecution. Financial penalties up to K500,000.",
      complianceHistory: {
        previousViolations: 0,
        lastInspection: "2024-09-20",
        overallRating: "Previously Good Standing"
      },
      responseSubmitted: false
    }
  ];

  const selectedActionData = enforcementActions.find(a => a.id === selectedAction);

  const handleSubmitReview = () => {
    console.log("Registry review submitted:", { selectedAction, reviewStatus, reviewNotes });
    // TODO: Save to Supabase
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "destructive";
      case "moderate":
        return "default";
      case "minor":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "awaiting_response":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "response_received":
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gavel className="w-5 h-5 mr-2" />
            Permit Enforcement Reviews ({enforcementActions.length})
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Review enforcement actions and permit holder responses
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {enforcementActions.length === 0 ? (
            <div className="text-center py-12">
              <Gavel className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No enforcement actions</h3>
              <p className="text-muted-foreground">
                No enforcement actions are currently active.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {enforcementActions.map((action) => (
              <div
                key={action.id}
                onClick={() => setSelectedAction(action.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedAction === action.id
                    ? 'border-primary bg-accent'
                    : 'hover:bg-accent/50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-card-foreground">{action.permitNumber}</p>
                    <p className="text-sm text-muted-foreground">{action.title} - {action.applicant}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {action.actionType}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={getSeverityColor(action.severity)}>
                      {action.severity}
                    </Badge>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(action.status)}
                      <span className="text-xs">
                        {action.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>Issued: {action.issueDate} | Deadline: {action.responseDeadline}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        </CardContent>
      </Card>

      {/* Read-Only Enforcement Action Details */}
      {selectedActionData && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gavel className="w-5 h-5 text-primary" />
                Enforcement Action Details (Read-Only)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Permit Number</Label>
                  <p className="font-medium">{selectedActionData.permitNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Permit Title</Label>
                  <p className="font-medium">{selectedActionData.title}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Permit Holder</Label>
                  <p className="font-medium">{selectedActionData.applicant}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Action Type</Label>
                  <p className="font-medium">{selectedActionData.actionType}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Severity</Label>
                  <Badge variant={getSeverityColor(selectedActionData.severity)}>
                    {selectedActionData.severity}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Issue Date</Label>
                  <p className="font-medium">{selectedActionData.issueDate}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Response Deadline</Label>
                  <p className="font-medium">{selectedActionData.responseDeadline}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedActionData.status)}
                    <span className="capitalize">{selectedActionData.status.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="mt-1 p-3 bg-muted rounded-lg">{selectedActionData.description}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Violation Details</Label>
                <div className="mt-1 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                  <p>{selectedActionData.violationDetails}</p>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-muted-foreground">Required Actions</Label>
                <div className="mt-2 space-y-2">
                  {selectedActionData.requiredActions.map((action, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2 bg-muted rounded">
                      <span className="font-semibold text-primary">{idx + 1}.</span>
                      <span className="text-sm">{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Potential Consequences</Label>
                <div className="mt-1 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                    <p className="text-sm">{selectedActionData.potentialConsequences}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-muted-foreground">Compliance History</Label>
                <div className="mt-2 grid grid-cols-3 gap-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Previous Violations</p>
                    <p className="font-medium text-lg mt-1">{selectedActionData.complianceHistory.previousViolations}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Last Inspection</p>
                    <p className="font-medium text-sm mt-1">{selectedActionData.complianceHistory.lastInspection}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Overall Rating</p>
                    <p className="font-medium text-sm mt-1">{selectedActionData.complianceHistory.overallRating}</p>
                  </div>
                </div>
              </div>

              {selectedActionData.responseSubmitted && selectedActionData.responseDetails && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-muted-foreground">Permit Holder Response</Label>
                    <div className="mt-2 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Submitted: {selectedActionData.responseDetails.submittedDate}</p>
                        <p className="mt-2">{selectedActionData.responseDetails.summary}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Supporting Documents:</p>
                        <div className="space-y-1">
                          {selectedActionData.responseDetails.supportingDocuments.map((doc, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                              <span>{doc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Registry Review Section */}
          <Card className="bg-accent/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gavel className="w-5 h-5 text-primary" />
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
                    <SelectItem value="close_compliant">Close Case - Compliant</SelectItem>
                    <SelectItem value="accept_response">Accept Response - Monitor</SelectItem>
                    <SelectItem value="requires_further_action">Requires Further Action</SelectItem>
                    <SelectItem value="escalate">Escalate to Enforcement</SelectItem>
                    <SelectItem value="suspend_permit">Recommend Permit Suspension</SelectItem>
                    <SelectItem value="revoke_permit">Recommend Permit Revocation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reviewNotes">Registry Review Notes</Label>
                <Textarea
                  id="reviewNotes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Provide detailed review notes, assessment of permit holder response, and recommendations for next steps..."
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
