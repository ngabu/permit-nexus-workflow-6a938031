import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Calendar, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function PermitRenewalReview() {
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [reviewStatus, setReviewStatus] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");

  // Mock data - replace with actual data from Supabase
  const renewalRequests = [
    {
      id: "1",
      permitNumber: "CEPA-PER-2024-0001",
      permitType: "Mining Operation",
      applicant: "ABC Mining Ltd",
      currentExpiry: "2024-12-31",
      requestedPeriod: "3 Years",
      preferredStartDate: "2025-01-01",
      operationalChanges: "No major changes. Minor expansion to include adjacent area.",
      status: "pending",
      submittedDate: "2024-10-15",
      complianceStatus: "Good Standing"
    },
    {
      id: "2",
      permitNumber: "CEPA-PER-2024-0002",
      permitType: "Forestry Project",
      applicant: "XYZ Forestry Co",
      currentExpiry: "2025-03-31",
      requestedPeriod: "2 Years",
      preferredStartDate: "2025-04-01",
      operationalChanges: "Introduction of sustainable harvesting techniques.",
      status: "under_review",
      submittedDate: "2024-11-01",
      complianceStatus: "Good Standing"
    }
  ];

  const selectedRequestData = renewalRequests.find(r => r.id === selectedRequest);

  const handleSubmitReview = () => {
    console.log("Registry review submitted:", { selectedRequest, reviewStatus, reviewNotes });
    // TODO: Save to Supabase
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-card-foreground">Permit Renewal Reviews</h2>
        <p className="text-muted-foreground">Review and assess permit renewal applications</p>
      </div>

      {/* Renewal Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Renewal Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {renewalRequests.map((request) => (
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
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>Expires: {request.currentExpiry} | Submitted: {request.submittedDate}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Read-Only Renewal Request Details */}
      {selectedRequestData && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-primary" />
                Renewal Request Details (Read-Only)
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
                  <Label className="text-muted-foreground">Current Expiry</Label>
                  <p className="font-medium">{selectedRequestData.currentExpiry}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Requested Period</Label>
                  <p className="font-medium">{selectedRequestData.requestedPeriod}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Preferred Start Date</Label>
                  <p className="font-medium">{selectedRequestData.preferredStartDate}</p>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-muted-foreground">Operational Changes</Label>
                <p className="mt-1 p-3 bg-muted rounded-lg">{selectedRequestData.operationalChanges}</p>
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
                  <Label className="text-muted-foreground">Submitted Date</Label>
                  <p className="font-medium">{selectedRequestData.submittedDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Registry Review Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
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
                    <SelectItem value="approved">Approve Renewal</SelectItem>
                    <SelectItem value="requires_clarification">Requires Clarification</SelectItem>
                    <SelectItem value="rejected">Reject Renewal</SelectItem>
                    <SelectItem value="forward_to_compliance">Forward to Compliance</SelectItem>
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
