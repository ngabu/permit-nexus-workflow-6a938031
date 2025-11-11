import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileX, CheckCircle, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function PermitSurrenderReview() {
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [reviewStatus, setReviewStatus] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");

  const surrenderRequests = [
    {
      id: "1",
      permitNumber: "CEPA-PER-2024-0005",
      permitType: "Forestry Project",
      applicant: "XYZ Forestry Co",
      reason: "Project operations ceased due to completion of forestry activities. Site has been fully rehabilitated.",
      status: "pending",
      submittedDate: "2024-11-08",
      complianceStatus: "All obligations met",
      outstandingIssues: "None"
    }
  ];

  const selectedRequestData = surrenderRequests.find(r => r.id === selectedRequest);

  const handleSubmitReview = () => {
    console.log("Registry review submitted:", { selectedRequest, reviewStatus, reviewNotes });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-card-foreground">Permit Surrender Reviews</h2>
        <p className="text-muted-foreground">Review and assess permit surrender applications</p>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Permit surrender is permanent. Ensure all compliance obligations and site restoration requirements are verified before approval.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Pending Surrender Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {surrenderRequests.map((request) => (
              <div
                key={request.id}
                onClick={() => setSelectedRequest(request.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedRequest === request.id
                    ? 'border-primary bg-accent'
                    : 'hover:bg-accent/50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-card-foreground">{request.permitNumber}</p>
                    <p className="text-sm text-muted-foreground">{request.applicant}</p>
                  </div>
                  <Badge variant={request.status === 'pending' ? 'secondary' : 'default'}>
                    {request.status.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Submitted: {request.submittedDate}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedRequestData && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileX className="w-5 h-5 text-primary" />
                Surrender Request Details (Read-Only)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Permit Number</Label>
                  <p className="font-medium">{selectedRequestData.permitNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Permit Type</Label>
                  <p className="font-medium">{selectedRequestData.permitType}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Applicant</Label>
                  <p className="font-medium">{selectedRequestData.applicant}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Submitted Date</Label>
                  <p className="font-medium">{selectedRequestData.submittedDate}</p>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-muted-foreground">Reason for Surrender</Label>
                <p className="mt-1 p-3 bg-muted rounded-lg">{selectedRequestData.reason}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Compliance Status</Label>
                  <p className="font-medium flex items-center gap-2 mt-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {selectedRequestData.complianceStatus}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Outstanding Issues</Label>
                  <p className="font-medium">{selectedRequestData.outstandingIssues}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registry Review & Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reviewStatus">Review Decision</Label>
                <Select value={reviewStatus} onValueChange={setReviewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select review decision" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approve Surrender</SelectItem>
                    <SelectItem value="requires_clarification">Requires Clarification</SelectItem>
                    <SelectItem value="rejected">Reject Surrender</SelectItem>
                    <SelectItem value="forward_to_compliance">Forward to Compliance for Verification</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reviewNotes">Registry Review Notes</Label>
                <Textarea
                  id="reviewNotes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Verify compliance obligations, site restoration status, and provide assessment notes..."
                  rows={6}
                />
              </div>

              <div className="flex gap-4">
                <Button onClick={handleSubmitReview} className="flex-1">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submit Review
                </Button>
                <Button variant="outline" className="flex-1">
                  Save Draft
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
