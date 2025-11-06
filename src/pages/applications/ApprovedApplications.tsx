import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle, Search, Eye, Download, FileText, Filter } from "lucide-react";

const approvedApplications = [
  {
    id: "APP-2024-008",
    applicant: "EcoFriendly Solutions Ltd",
    type: "Environmental Permit",
    approvedDate: "2024-01-15",
    approvedBy: "Jane Smith",
    permitNumber: "EP-2024-108",
    validUntil: "2025-01-15"
  },
  {
    id: "APP-2024-009",
    applicant: "Sustainable Manufacturing Co",
    type: "Air Quality Permit", 
    approvedDate: "2024-01-18",
    approvedBy: "Dr. Robert Lee",
    permitNumber: "AQ-2024-045",
    validUntil: "2025-01-18"
  },
  {
    id: "APP-2024-010",
    applicant: "Clean Water Industries",
    type: "Water Discharge Permit",
    approvedDate: "2024-01-20",
    approvedBy: "Maria Garcia",
    permitNumber: "WD-2024-023",
    validUntil: "2025-01-20"
  }
];

export default function ApprovedApplications() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Approved Applications</h1>
        <p className="text-muted-foreground">
          Applications that have been approved and permits issued.
        </p>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search applications..." className="pl-10" />
          </div>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
        <Button className="bg-primary hover:bg-primary/90 flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-4">
        {approvedApplications.map((app) => (
          <Card key={app.id} className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-foreground">{app.id}</h3>
                    <p className="text-foreground">{app.applicant}</p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>{app.type}</span>
                      <span>•</span>
                      <span>Approved {app.approvedDate}</span>
                      <span>•</span>
                      <span>By {app.approvedBy}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                      <span>Permit: {app.permitNumber}</span>
                      <span>•</span>
                      <span>Valid until {app.validUntil}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className="bg-green-100 text-green-800">
                    Approved
                  </Badge>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Certificate
                  </Button>
                  <Button size="sm" className="bg-primary hover:bg-primary/90 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}