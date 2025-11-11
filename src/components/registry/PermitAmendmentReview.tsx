import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function PermitAmendmentReview() {
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [reviewStatus, setReviewStatus] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");

  const amendmentRequests = [
    {
      id: "1",
      permitNumber: "CEPA-PER-2024-0001",
      permitType: "Mining Operation",
      applicant: "ABC Mining Ltd",
      amendmentType: "Scope of Activities",
      amendmentDetails: "Request to expand mining area to include adjacent 50 hectares for additional mineral extraction.",
      environmentalImpact: "Minimal impact expected with proper mitigation measures in place.",
      mitigationMeasures: "Enhanced monitoring, buffer zones, and progressive rehabilitation.",
      status: "pending",
      submittedDate: "2024-11-05"
    },
    {
      id: "2",
      permitNumber: "CEPA-PER-2024-0003",
      permitType: "Industrial Facility",
      applicant: "Industrial Corp PNG",
      amendmentType: "Production Capacity",
      amendmentDetails: "Increase production capacity by 30% through equipment upgrades.",
      environmentalImpact: "Increased emissions but within acceptable limits with new technology.",
      mitigationMeasures: "Installation of advanced filtration systems and continuous monitoring.",
      status: "under_review",
      submittedDate: "2024-10-28"
    }
  ];

  const selectedRequestData = amendmentRequests.find(r => r.id === selectedRequest);

  const handleSubmitReview = () => {
    console.log("Registry review submitted:", { selectedRequest, reviewStatus, reviewNotes });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-card-foreground">Permit Amendment Reviews</h2>
        <p className="text-muted-foreground">Review and assess permit amendment requests</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Amendment Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {amendmentRequests.map((request) => (
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
                <div className="mt-2">
                  <Badge variant="outline" className="text-xs">{request.amendmentType}</Badge>
                  <p className="text-sm text-muted-foreground mt-1">Submitted: {request.submittedDate}</p>
                </div>
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
                <Edit className="w-5 h-5 text-primary" />
                Amendment Request Details (Read-Only)
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
                  <Label className="text-muted-foreground">Amendment Type</Label>
                  <Badge variant="outline">{selectedRequestData.amendmentType}</Badge>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-muted-foreground">Amendment Details</Label>
                <p className="mt-1 p-3 bg-muted rounded-lg">{selectedRequestData.amendmentDetails}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Environmental Impact Assessment</Label>
                <p className="mt-1 p-3 bg-muted rounded-lg">{selectedRequestData.environmentalImpact}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Mitigation Measures</Label>
                <p className="mt-1 p-3 bg-muted rounded-lg">{selectedRequestData.mitigationMeasures}</p>
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
                    <SelectItem value="approved">Approve Amendment</SelectItem>
                    <SelectItem value="requires_clarification">Requires Clarification</SelectItem>
                    <SelectItem value="rejected">Reject Amendment</SelectItem>
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
                  placeholder="Provide detailed review notes, technical assessment, and recommendations..."
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
