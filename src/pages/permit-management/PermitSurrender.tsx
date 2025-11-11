import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, FileText, Upload } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const PermitSurrender = () => {
  const [selectedPermit, setSelectedPermit] = useState("");
  const [reason, setReason] = useState("");
  const [documents, setDocuments] = useState<File[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle permit surrender submission
    console.log("Permit surrender submitted");
  };

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Permit Surrender</h1>
          <p className="text-muted-foreground">Surrender your environment permit when operations cease</p>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Surrendering a permit is permanent and cannot be undone. Ensure all compliance obligations are met before proceeding.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Permit Surrender Form</CardTitle>
            <CardDescription>Complete all required fields to surrender your permit</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="permit">Select Permit to Surrender</Label>
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
                <Label htmlFor="reason">Reason for Surrender</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why you are surrendering this permit..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Supporting Documents</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Upload final compliance reports, site restoration certificates, and other required documents
                  </p>
                  <Button variant="outline" type="button" className="mt-2">
                    <FileText className="w-4 h-4 mr-2" />
                    Choose Files
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  Submit Surrender Request
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

export default PermitSurrender;