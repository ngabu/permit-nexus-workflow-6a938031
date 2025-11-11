import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRightLeft, Building, FileText, Upload } from "lucide-react";

const PermitTransfer = () => {
  const [selectedPermit, setSelectedPermit] = useState("");
  const [transfereeType, setTransfereeType] = useState("");
  const [transfereeDetails, setTransferreeDetails] = useState({
    name: "",
    businessNumber: "",
    address: "",
    contactPerson: "",
    email: "",
    phone: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle permit transfer submission
    console.log("Permit transfer submitted");
  };

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Permit Transfer</h1>
          <p className="text-muted-foreground">Transfer your environment permit to another entity</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" />
              Permit Transfer Application
            </CardTitle>
            <CardDescription>Transfer ownership of your permit to another qualified entity</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="permit">Select Permit to Transfer</Label>
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
                <Label htmlFor="transfereeType">Transferee Type</Label>
                <Select value={transfereeType} onValueChange={setTransfereeType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select entity type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                    <SelectItem value="government">Government Entity</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Transferee Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Entity/Individual Name</Label>
                      <Input
                        id="name"
                        value={transfereeDetails.name}
                        onChange={(e) => setTransferreeDetails({...transfereeDetails, name: e.target.value})}
                        placeholder="Full legal name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessNumber">Business Registration Number</Label>
                      <Input
                        id="businessNumber"
                        value={transfereeDetails.businessNumber}
                        onChange={(e) => setTransferreeDetails({...transfereeDetails, businessNumber: e.target.value})}
                        placeholder="Business registration number"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={transfereeDetails.address}
                      onChange={(e) => setTransferreeDetails({...transfereeDetails, address: e.target.value})}
                      placeholder="Full business address"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactPerson">Contact Person</Label>
                      <Input
                        id="contactPerson"
                        value={transfereeDetails.contactPerson}
                        onChange={(e) => setTransferreeDetails({...transfereeDetails, contactPerson: e.target.value})}
                        placeholder="Contact person name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={transfereeDetails.email}
                        onChange={(e) => setTransferreeDetails({...transfereeDetails, email: e.target.value})}
                        placeholder="contact@company.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={transfereeDetails.phone}
                        onChange={(e) => setTransferreeDetails({...transfereeDetails, phone: e.target.value})}
                        placeholder="+675 XXXX XXXX"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label>Required Documents</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Upload transferee's business registration, financial statements, and technical competency certificates
                  </p>
                  <Button variant="outline" type="button" className="mt-2">
                    <FileText className="w-4 h-4 mr-2" />
                    Choose Files
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  Submit Transfer Application
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

export default PermitTransfer;