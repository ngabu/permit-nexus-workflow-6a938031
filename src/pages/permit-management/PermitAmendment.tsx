import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, FileText, Upload } from "lucide-react";

const PermitAmendment = () => {
  const [selectedPermit, setSelectedPermit] = useState("");
  const [amendmentType, setAmendmentType] = useState("");
  const [amendmentDetails, setAmendmentDetails] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Permit amendment submitted");
  };

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Permit Amendment</h1>
          <p className="text-muted-foreground">Request changes to existing permit conditions</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Permit Amendment Application
            </CardTitle>
            <CardDescription>Modify conditions or scope of your existing permit</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="permit">Select Permit to Amend</Label>
                <Select value={selectedPermit} onValueChange={setSelectedPermit}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a permit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CEPA-PER-2024-0001">CEPA-PER-2024-0001 - Mining Operation</SelectItem>
                    <SelectItem value="CEPA-PER-2024-0002">CEPA-PER-2024-0002 - Forestry Project</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amendmentType">Type of Amendment</Label>
                <Select value={amendmentType} onValueChange={setAmendmentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select amendment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scope">Scope of Activities</SelectItem>
                    <SelectItem value="location">Location Changes</SelectItem>
                    <SelectItem value="conditions">Permit Conditions</SelectItem>
                    <SelectItem value="capacity">Production Capacity</SelectItem>
                    <SelectItem value="technology">Technology/Methods</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amendmentDetails">Amendment Details</Label>
                <Textarea
                  id="amendmentDetails"
                  value={amendmentDetails}
                  onChange={(e) => setAmendmentDetails(e.target.value)}
                  placeholder="Describe the proposed changes and justification..."
                  rows={5}
                />
              </div>

              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-lg">Environmental Impact Assessment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="environmentalImpact">Expected Environmental Impact</Label>
                    <Textarea
                      id="environmentalImpact"
                      placeholder="Assess the environmental impact of the proposed amendments..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mitigationMeasures">Mitigation Measures</Label>
                    <Textarea
                      id="mitigationMeasures"
                      placeholder="Describe measures to mitigate any negative impacts..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label>Supporting Documents</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Upload technical reports, revised plans, and environmental assessments
                  </p>
                  <Button variant="outline" type="button" className="mt-2">
                    <FileText className="w-4 h-4 mr-2" />
                    Choose Files
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  Submit Amendment Request
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

export default PermitAmendment;