import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { XCircle, Search, Eye, FileText, RotateCcw, Filter } from "lucide-react";

const rejectedApplications = [
  {
    id: "APP-2024-005",
    applicant: "Questionable Industries Inc",
    type: "Environmental Permit",
    rejectedDate: "2024-01-10",
    rejectedBy: "Dr. Michael Brown",
    reason: "Insufficient environmental impact assessment documentation",
    canAppeal: true,
    appealDeadline: "2024-02-09"
  },
  {
    id: "APP-2024-006",
    applicant: "Outdated Manufacturing LLC",
    type: "Air Quality Permit",
    rejectedDate: "2024-01-12",
    rejectedBy: "Sarah Wilson",
    reason: "Proposed emissions exceed regulatory limits",
    canAppeal: true,
    appealDeadline: "2024-02-11"
  },
  {
    id: "APP-2024-007",
    applicant: "Incomplete Solutions Co",
    type: "Waste Management License",
    rejectedDate: "2024-01-08",
    rejectedBy: "James Anderson",
    reason: "Missing waste disposal methodology and safety protocols",
    canAppeal: false,
    appealDeadline: null
  }
];

export default function RejectedApplications() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Rejected Applications</h1>
        <p className="text-muted-foreground">
          Applications that have been rejected with reasons and appeal options.
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
      </div>

      <div className="grid gap-4">
        {rejectedApplications.map((app) => (
          <Card key={app.id} className="hover:shadow-md transition-shadow border-l-4 border-l-red-500">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <XCircle className="w-10 h-10 text-red-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground">{app.id}</h3>
                    <p className="text-foreground">{app.applicant}</p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>{app.type}</span>
                      <span>•</span>
                      <span>Rejected {app.rejectedDate}</span>
                      <span>•</span>
                      <span>By {app.rejectedBy}</span>
                    </div>
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800 font-medium mb-1">Rejection Reason:</p>
                      <p className="text-sm text-red-700">{app.reason}</p>
                    </div>
                    {app.canAppeal && app.appealDeadline && (
                      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <strong>Appeal available until:</strong> {app.appealDeadline}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <Badge className="bg-red-100 text-red-800">
                    Rejected
                  </Badge>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                    {app.canAppeal && (
                      <Button size="sm" className="bg-primary hover:bg-primary/90 flex items-center gap-2">
                        <RotateCcw className="w-4 h-4" />
                        Process Appeal
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Details
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}