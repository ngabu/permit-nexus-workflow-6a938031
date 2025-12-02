import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GitMerge, CheckCircle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function PermitAmalgamationReview() {
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [reviewStatus, setReviewStatus] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");

  // Mock data - replace with actual data from Supabase
  const amalgamationRequests = [
    {
      id: "1",
      selectedPermits: [
        { id: "CEPA-PER-2024-0001", title: "Mining Operation - Site A", type: "Mining", expiry: "2026-12-31" },
        { id: "CEPA-PER-2024-0002", title: "Forestry Project - Block B", type: "Forestry", expiry: "2025-06-30" }
      ],
      amalgamationType: "Geographic Consolidation",
      justification: "Both operations are geographically adjacent and share common infrastructure. Consolidating permits will improve operational efficiency and reduce administrative burden.",
      proposedTitle: "Integrated Mining & Forestry Operations - Sites A & B",
      proposedDuration: "3 Years",
      consolidatedScope: "Combined mining and forestry operations covering Sites A and B with shared infrastructure and environmental management systems.",
      applicant: "ABC Resources Ltd",
      status: "pending",
      submittedDate: "2024-11-15",
      complianceChecks: {
        goodStanding: true,
        compatibilityAssessed: true,
        environmentalReview: false,
        stakeholderConsultation: true
      }
    },
    {
      id: "2",
      selectedPermits: [
        { id: "CEPA-PER-2024-0003", title: "Water Extraction - Area C", type: "Water", expiry: "2027-03-15" },
        { id: "CEPA-PER-2024-0004", title: "Waste Processing - Facility D", type: "Waste", expiry: "2025-09-30" }
      ],
      amalgamationType: "Operational Integration",
      justification: "Water extraction supports waste processing operations. Single permit streamlines management.",
      proposedTitle: "Integrated Water & Waste Management Facility",
      proposedDuration: "5 Years",
      consolidatedScope: "Integrated water extraction and waste processing operations with shared monitoring systems.",
      applicant: "XYZ Environmental Services",
      status: "under_review",
      submittedDate: "2024-11-01",
      complianceChecks: {
        goodStanding: true,
        compatibilityAssessed: true,
        environmentalReview: true,
        stakeholderConsultation: false
      }
    }
  ];

  const selectedRequestData = amalgamationRequests.find(r => r.id === selectedRequest);

  const handleSubmitReview = () => {
    console.log("Registry review submitted:", { selectedRequest, reviewStatus, reviewNotes });
    // TODO: Save to Supabase
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <GitMerge className="w-5 h-5 mr-2" />
            Permit Amalgamation Reviews ({amalgamationRequests.length})
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Review and assess permit amalgamation applications
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Amalgamation Requests List */}
          {amalgamationRequests.length === 0 ? (
            <div className="text-center py-12">
              <GitMerge className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No amalgamation requests</h3>
              <p className="text-muted-foreground">
                No amalgamation requests have been submitted yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {amalgamationRequests.map((request) => (
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
                    <p className="font-semibold text-card-foreground">{request.proposedTitle}</p>
                    <p className="text-sm text-muted-foreground">{request.applicant}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Combining {request.selectedPermits.length} permits
                    </p>
                  </div>
                  <Badge variant={request.status === 'pending' ? 'secondary' : 'default'}>
                    {request.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>Submitted: {request.submittedDate}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        </CardContent>
      </Card>

      {/* Read-Only Amalgamation Request Details */}
      {selectedRequestData && (
        <>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Review the amalgamation request details below. All permits must be compatible and in good standing.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitMerge className="w-5 h-5 text-primary" />
                Amalgamation Request Details (Read-Only)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Applicant</Label>
                  <p className="font-medium">{selectedRequestData.applicant}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Amalgamation Type</Label>
                  <p className="font-medium">{selectedRequestData.amalgamationType}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Proposed Duration</Label>
                  <p className="font-medium">{selectedRequestData.proposedDuration}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Submitted Date</Label>
                  <p className="font-medium">{selectedRequestData.submittedDate}</p>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-muted-foreground">Selected Permits for Amalgamation</Label>
                <div className="mt-2 space-y-2">
                  {selectedRequestData.selectedPermits.map((permit) => (
                    <div key={permit.id} className="p-3 bg-muted rounded-lg">
                      <p className="font-medium text-sm">{permit.id} - {permit.title}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{permit.type}</Badge>
                        <span className="text-xs text-muted-foreground">Expires: {permit.expiry}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-muted-foreground">Proposed Consolidated Permit Title</Label>
                <p className="mt-1 p-3 bg-muted rounded-lg font-medium">{selectedRequestData.proposedTitle}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Justification for Amalgamation</Label>
                <p className="mt-1 p-3 bg-muted rounded-lg">{selectedRequestData.justification}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Consolidated Scope of Work</Label>
                <p className="mt-1 p-3 bg-muted rounded-lg">{selectedRequestData.consolidatedScope}</p>
              </div>

              <Separator />

              <div>
                <Label className="text-muted-foreground">Compliance Requirements</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    {selectedRequestData.complianceChecks.goodStanding ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
                    )}
                    <span className="text-sm">All permits in good standing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedRequestData.complianceChecks.compatibilityAssessed ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
                    )}
                    <span className="text-sm">Compatibility assessment completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedRequestData.complianceChecks.environmentalReview ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
                    )}
                    <span className="text-sm">Environmental impact review conducted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedRequestData.complianceChecks.stakeholderConsultation ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
                    )}
                    <span className="text-sm">Stakeholder consultation completed</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Registry Review Section */}
          <Card className="bg-accent/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitMerge className="w-5 h-5 text-primary" />
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
                    <SelectItem value="approved">Approve Amalgamation</SelectItem>
                    <SelectItem value="requires_clarification">Requires Clarification</SelectItem>
                    <SelectItem value="rejected">Reject Amalgamation</SelectItem>
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
