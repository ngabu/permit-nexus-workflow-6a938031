import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Shield } from "lucide-react";
import { PermitEnforcementReview } from "@/components/registry/PermitEnforcementReview";

export function PermitEnforcementComplianceReview() {
  const [complianceStatus, setComplianceStatus] = useState("");
  const [complianceFeedback, setComplianceFeedback] = useState("");

  const handleSubmitCompliance = () => {
    console.log("Compliance review submitted:", { complianceStatus, complianceFeedback });
  };

  return (
    <div className="space-y-6">
      {/* Registry Review Section (Read-Only) */}
      <PermitEnforcementReview />

      {/* Compliance Review Section */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Compliance Enforcement Assessment & Action
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="complianceStatus">Enforcement Action Decision</Label>
            <Select value={complianceStatus} onValueChange={setComplianceStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select enforcement action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="accept_response">Accept Response - Close Case</SelectItem>
                <SelectItem value="verify_corrective_actions">Verify Corrective Actions - Schedule Inspection</SelectItem>
                <SelectItem value="extend_deadline">Extend Deadline - Monitor Progress</SelectItem>
                <SelectItem value="escalate_warning">Escalate to Compliance Order</SelectItem>
                <SelectItem value="suspend_permit">Suspend Permit</SelectItem>
                <SelectItem value="revoke_permit">Recommend Permit Revocation</SelectItem>
                <SelectItem value="legal_action">Recommend Legal Proceedings</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="complianceFeedback">Compliance Enforcement Assessment & Next Steps</Label>
            <Textarea
              id="complianceFeedback"
              value={complianceFeedback}
              onChange={(e) => setComplianceFeedback(e.target.value)}
              placeholder="Assess permit holder response adequacy, verify corrective actions implemented, evaluate ongoing risks, specify monitoring requirements, determine enforcement escalation if needed, and provide detailed action plan..."
              rows={6}
            />
          </div>

          <div className="flex gap-4">
            <Button onClick={handleSubmitCompliance} className="flex-1">
              <CheckCircle className="w-4 h-4 mr-2" />
              Submit Enforcement Assessment
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
