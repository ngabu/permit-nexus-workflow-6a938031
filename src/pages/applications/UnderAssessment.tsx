import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FileCheck, Search, Eye, Clock, User, Filter } from "lucide-react";

const assessmentApplications = [
  {
    id: "APP-2024-012",
    applicant: "Riverside Industrial Park",
    type: "Environmental Permit",
    assessor: "Dr. Sarah Johnson",
    startDate: "2024-01-10",
    estimatedCompletion: "2024-02-10",
    progress: 65
  },
  {
    id: "APP-2024-013",
    applicant: "Metro Waste Solutions",
    type: "Waste Management License",
    assessor: "Mark Thompson",
    startDate: "2024-01-12",
    estimatedCompletion: "2024-02-05",
    progress: 80
  },
  {
    id: "APP-2024-014",
    applicant: "Harbor Bay Development",
    type: "Water Discharge Permit",
    assessor: "Lisa Chen",
    startDate: "2024-01-15",
    estimatedCompletion: "2024-02-20",
    progress: 40
  }
];

const getProgressColor = (progress: number) => {
  if (progress >= 80) return "bg-green-500";
  if (progress >= 50) return "bg-yellow-500";
  return "bg-red-500";
};

export default function UnderAssessment() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Under Assessment</h1>
        <p className="text-muted-foreground">
          Applications currently being reviewed by assessment teams.
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
          Filter by Assessor
        </Button>
      </div>

      <div className="grid gap-4">
        {assessmentApplications.map((app) => (
          <Card key={app.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <FileCheck className="w-10 h-10 text-primary" />
                  <div>
                    <h3 className="font-semibold text-foreground">{app.id}</h3>
                    <p className="text-foreground">{app.applicant}</p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>{app.type}</span>
                      <span>•</span>
                      <User className="w-3 h-3" />
                      <span>{app.assessor}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                      <Clock className="w-3 h-3" />
                      <span>Started {app.startDate}</span>
                      <span>•</span>
                      <span>Due {app.estimatedCompletion}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Progress</div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getProgressColor(app.progress)} transition-all duration-300`}
                          style={{ width: `${app.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{app.progress}%</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      Update Status
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