import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Shield } from "lucide-react";
import { IntentApplicationReview } from "@/components/registry/IntentApplicationReview";

export function IntentRegistrationComplianceReview() {
  const [complianceStatus, setComplianceStatus] = useState("");
  const [complianceFeedback, setComplianceFeedback] = useState("");

  const handleSubmitCompliance = () => {
    console.log("Compliance review submitted:", { complianceStatus, complianceFeedback });
  };

  return (
    <div className="space-y-6">
      {/* Registry Review Section (Read-Only) */}
      <IntentApplicationReview />

      {/* Compliance Review Section */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Compliance Review & Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="complianceStatus">Compliance Decision</Label>
            <Select value={complianceStatus} onValueChange={setComplianceStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select compliance decision" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approve">Approve - Compliant</SelectItem>
                <SelectItem value="conditional_approval">Conditional Approval</SelectItem>
                <SelectItem value="requires_inspection">Requires Site Inspection</SelectItem>
                <SelectItem value="requires_additional_docs">Requires Additional Documentation</SelectItem>
                <SelectItem value="reject">Reject - Non-Compliant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="complianceFeedback">Compliance Feedback & Recommendations</Label>
            <Textarea
              id="complianceFeedback"
              value={complianceFeedback}
              onChange={(e) => setComplianceFeedback(e.target.value)}
              placeholder="Provide compliance assessment, environmental impact concerns, monitoring requirements, and recommendations..."
              rows={6}
            />
          </div>

          <div className="flex gap-4">
            <Button onClick={handleSubmitCompliance} className="flex-1">
              <CheckCircle className="w-4 h-4 mr-2" />
              Submit Compliance Review
            </Button>
            <Button variant="outline" className="flex-1">
              Save Draft
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
