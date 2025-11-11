import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Merge, FileText, Upload, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const PermitAmalgamation = () => {
  const [selectedPermits, setSelectedPermits] = useState<string[]>([]);
  const [amalgamationType, setAmalgamationType] = useState("");
  const [justification, setJustification] = useState("");

  const availablePermits = [
    { id: "CEPA-PER-2024-0001", title: "Mining Operation - Site A", type: "Mining", expiry: "2026-12-31" },
    { id: "CEPA-PER-2024-0002", title: "Forestry Project - Block B", type: "Forestry", expiry: "2025-06-30" },
    { id: "CEPA-PER-2024-0003", title: "Water Extraction - Area C", type: "Water", expiry: "2027-03-15" },
    { id: "CEPA-PER-2024-0004", title: "Waste Processing - Facility D", type: "Waste", expiry: "2025-09-30" }
  ];

  const handlePermitSelection = (permitId: string, checked: boolean) => {
    if (checked) {
      setSelectedPermits([...selectedPermits, permitId]);
    } else {
      setSelectedPermits(selectedPermits.filter(id => id !== permitId));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle permit amalgamation submission
    console.log("Permit amalgamation submitted");
  };

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Permit Amalgamation</h1>
          <p className="text-muted-foreground">Combine multiple permits into a single consolidated permit</p>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Permit amalgamation allows you to combine related permits for operational efficiency. All permits must be in good standing and compatible.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Merge className="h-5 w-5" />
              Permit Amalgamation Application
            </CardTitle>
            <CardDescription>Select permits to combine and provide justification</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <Label>Select Permits for Amalgamation (minimum 2 required)</Label>
                <div className="grid grid-cols-1 gap-4">
                  {availablePermits.map((permit) => (
                    <div key={permit.id} className="flex items-start space-x-3 p-4 border border-border rounded-lg">
                      <Checkbox
                        id={permit.id}
                        checked={selectedPermits.includes(permit.id)}
                        onCheckedChange={(checked) => handlePermitSelection(permit.id, checked as boolean)}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-1">
                        <Label htmlFor={permit.id} className="text-sm font-medium cursor-pointer">
                          {permit.id} - {permit.title}
                        </Label>
                        <div className="text-sm text-muted-foreground">
                          <span className="inline-block bg-secondary px-2 py-1 rounded text-xs mr-2">
                            {permit.type}
                          </span>
                          Expires: {new Date(permit.expiry).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amalgamationType">Amalgamation Type</Label>
                <Select value={amalgamationType} onValueChange={setAmalgamationType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select amalgamation type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="geographic">Geographic Consolidation</SelectItem>
                    <SelectItem value="operational">Operational Integration</SelectItem>
                    <SelectItem value="ownership">Ownership Unification</SelectItem>
                    <SelectItem value="efficiency">Administrative Efficiency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="justification">Justification for Amalgamation</Label>
                <Textarea
                  id="justification"
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Explain the business case and environmental benefits of combining these permits..."
                  rows={5}
                />
              </div>

              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-lg">Proposed Consolidated Permit Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="proposedTitle">Proposed Title</Label>
                      <Input
                        id="proposedTitle"
                        placeholder="Consolidated permit title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="proposedDuration">Proposed Duration</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2-years">2 Years</SelectItem>
                          <SelectItem value="3-years">3 Years</SelectItem>
                          <SelectItem value="5-years">5 Years</SelectItem>
                          <SelectItem value="match-longest">Match longest existing permit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="consolidatedScope">Consolidated Scope of Work</Label>
                    <Textarea
                      id="consolidatedScope"
                      placeholder="Describe the combined operations and activities under the new permit..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label>Supporting Documentation</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Upload environmental impact assessments, operational plans, and compatibility studies
                  </p>
                  <Button variant="outline" type="button" className="mt-2">
                    <FileText className="w-4 h-4 mr-2" />
                    Choose Files
                  </Button>
                </div>
              </div>

              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-lg">Compliance Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="compliance-current" />
                    <Label htmlFor="compliance-current" className="text-sm">
                      All selected permits are in good standing with no outstanding violations
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="compatibility-assessed" />
                    <Label htmlFor="compatibility-assessed" className="text-sm">
                      Compatibility assessment completed for all activities
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="environmental-review" />
                    <Label htmlFor="environmental-review" className="text-sm">
                      Environmental impact review conducted for combined operations
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="stakeholder-consultation" />
                    <Label htmlFor="stakeholder-consultation" className="text-sm">
                      Stakeholder consultation completed where required
                    </Label>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={selectedPermits.length < 2}>
                  Submit Amalgamation Application
                </Button>
                <Button type="button" variant="outline" className="flex-1">
                  Save as Draft
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
    </div>
  );
};

export default PermitAmalgamation;