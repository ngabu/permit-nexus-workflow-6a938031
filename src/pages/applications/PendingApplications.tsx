import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Clock, Search, Eye, FileText, Filter } from "lucide-react";

const pendingApplications = [
  {
    id: "APP-2024-015",
    applicant: "Green Tech Industries",
    type: "Environmental Permit",
    submittedDate: "2024-01-20",
    priority: "high",
    daysOpen: 5
  },
  {
    id: "APP-2024-016", 
    applicant: "Coastal Manufacturing Co.",
    type: "Water Discharge Permit",
    submittedDate: "2024-01-18",
    priority: "medium",
    daysOpen: 7
  },
  {
    id: "APP-2024-017",
    applicant: "Urban Development LLC",
    type: "Air Quality Permit", 
    submittedDate: "2024-01-15",
    priority: "low",
    daysOpen: 10
  }
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high": return "bg-red-100 text-red-800";
    case "medium": return "bg-yellow-100 text-yellow-800";  
    case "low": return "bg-green-100 text-green-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

export default function PendingApplications() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Pending Applications</h1>
        <p className="text-muted-foreground">
          Review and process applications awaiting initial assessment.
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
        {pendingApplications.map((app) => (
          <Card key={app.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Clock className="w-10 h-10 text-primary" />
                  <div>
                    <h3 className="font-semibold text-foreground">{app.id}</h3>
                    <p className="text-foreground">{app.applicant}</p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>{app.type}</span>
                      <span>•</span>
                      <span>Submitted {app.submittedDate}</span>
                      <span>•</span>
                      <span>{app.daysOpen} days open</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className={getPriorityColor(app.priority)}>
                    {app.priority} priority
                  </Badge>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Review
                  </Button>
                  <Button size="sm" className="bg-primary hover:bg-primary/90 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Process
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