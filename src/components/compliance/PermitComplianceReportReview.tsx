import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Shield } from "lucide-react";
import { PermitComplianceReview } from "@/components/registry/PermitComplianceReview";

export function PermitComplianceReportReview() {
  const [complianceStatus, setComplianceStatus] = useState("");
  const [complianceFeedback, setComplianceFeedback] = useState("");

  const handleSubmitCompliance = () => {
    console.log("Compliance review submitted:", { complianceStatus, complianceFeedback });
  };

  return (
    <div className="space-y-6">
      {/* Registry Review Section (Read-Only) */}
      <PermitComplianceReview />

      {/* Compliance Review Section */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Compliance Assessment & Status Update
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="complianceStatus">Compliance Status Update</Label>
            <Select value={complianceStatus} onValueChange={setComplianceStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select compliance status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fully_compliant">Fully Compliant - No Issues</SelectItem>
                <SelectItem value="substantially_compliant">Substantially Compliant - Minor Issues</SelectItem>
                <SelectItem value="requires_corrective_action">Requires Corrective Action</SelectItem>
                <SelectItem value="schedule_inspection">Schedule Compliance Inspection</SelectItem>
                <SelectItem value="issue_warning">Issue Warning Notice</SelectItem>
                <SelectItem value="enforcement_action">Recommend Enforcement Action</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="complianceFeedback">Compliance Assessment & Action Plan</Label>
            <Textarea
              id="complianceFeedback"
              value={complianceFeedback}
              onChange={(e) => setComplianceFeedback(e.target.value)}
              placeholder="Assess compliance report accuracy, verify monitoring data, identify any violations or concerns, specify corrective actions required, set follow-up timelines, and provide recommendations..."
              rows={6}
            />
          </div>

          <div className="flex gap-4">
            <Button onClick={handleSubmitCompliance} className="flex-1">
              <CheckCircle className="w-4 h-4 mr-2" />
              Submit Compliance Assessment
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
