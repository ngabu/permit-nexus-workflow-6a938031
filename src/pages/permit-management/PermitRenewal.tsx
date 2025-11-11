import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Calendar, FileText, Upload, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const PermitRenewal = () => {
  const [selectedPermit, setSelectedPermit] = useState("");
  const [renewalPeriod, setRenewalPeriod] = useState("");
  const [operationalChanges, setOperationalChanges] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle permit renewal submission
    console.log("Permit renewal submitted");
  };

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Permit Renewal</h1>
          <p className="text-muted-foreground">Renew your environment permit before expiration</p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Permit renewal applications should be submitted at least 6 months before expiration to ensure continuity of operations.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Permit Renewal Application
            </CardTitle>
            <CardDescription>Extend the validity of your environment permit</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="permit">Select Permit to Renew</Label>
                <Select value={selectedPermit} onValueChange={setSelectedPermit}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a permit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CEPA-PER-2024-0001">CEPA-PER-2024-0001 - Mining Operation (Expires: Dec 2024)</SelectItem>
                    <SelectItem value="CEPA-PER-2024-0002">CEPA-PER-2024-0002 - Forestry Project (Expires: Mar 2025)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="renewalPeriod">Renewal Period</Label>
                  <Select value={renewalPeriod} onValueChange={setRenewalPeriod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select renewal period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-year">1 Year</SelectItem>
                      <SelectItem value="2-years">2 Years</SelectItem>
                      <SelectItem value="3-years">3 Years</SelectItem>
                      <SelectItem value="5-years">5 Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferredStartDate">Preferred Start Date</Label>
                  <Input
                    id="preferredStartDate"
                    type="date"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="operationalChanges">Operational Changes (if any)</Label>
                <Textarea
                  id="operationalChanges"
                  value={operationalChanges}
                  onChange={(e) => setOperationalChanges(e.target.value)}
                  placeholder="Describe any changes to operations, expansion plans, or new activities since the original permit was issued..."
                  rows={4}
                />
              </div>

              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Compliance Status Review
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Outstanding Compliance Issues</Label>
                      <div className="text-sm text-muted-foreground bg-card p-3 rounded border">
                        No outstanding compliance issues found
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Recent Inspections</Label>
                      <div className="text-sm text-muted-foreground bg-card p-3 rounded border">
                        Last inspection: March 15, 2024 - Compliant
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label>Updated Documents</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Upload updated environmental management plans, monitoring reports, and any other required documents
                  </p>
                  <Button variant="outline" type="button" className="mt-2">
                    <FileText className="w-4 h-4 mr-2" />
                    Choose Files
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  Submit Renewal Application
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

export default PermitRenewal;