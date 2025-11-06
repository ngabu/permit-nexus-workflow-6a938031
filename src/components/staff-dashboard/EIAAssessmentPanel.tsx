
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { EIAWorkflowManager } from "./EIAWorkflowManager";
import { 
  FileCheck, 
  Search, 
  MapPin, 
  AlertTriangle, 
  Shield, 
  FileText, 
  CheckCircle,
  Monitor,
  Clock,
  Users,
  TreePine,
  Droplets,
  Workflow
} from "lucide-react";

const eiaSteps = [
  { id: 1, name: "Screening", icon: Search, status: "completed" },
  { id: 2, name: "Scoping", icon: MapPin, status: "completed" },
  { id: 3, name: "Impact Analysis", icon: AlertTriangle, status: "in-progress" },
  { id: 4, name: "Mitigation Measures", icon: Shield, status: "pending" },
  { id: 5, name: "Reporting (EIS)", icon: FileText, status: "pending" },
  { id: 6, name: "Review", icon: FileCheck, status: "pending" },
  { id: 7, name: "Decision Making", icon: CheckCircle, status: "pending" },
  { id: 8, name: "Monitoring", icon: Monitor, status: "pending" }
];

const pendingEIAReviews = [
  {
    id: "EIA-2024-001",
    project: "Riverside Industrial Park Expansion",
    category: "Red Category",
    submittedDate: "2024-01-15",
    currentStep: "Impact Analysis",
    progress: 35,
    assessor: "Dr. Sarah Johnson",
    priority: "high",
    type: "Manufacturing"
  },
  {
    id: "EIA-2024-002", 
    project: "Coastal Resort Development",
    category: "Orange Category",
    submittedDate: "2024-01-18",
    currentStep: "Scoping",
    progress: 25,
    assessor: "Mark Thompson",
    priority: "medium",
    type: "Tourism"
  }
];

const getStepStatus = (status: string) => {
  switch (status) {
    case "completed": return "bg-primary text-primary-foreground";
    case "in-progress": return "bg-accent text-accent-foreground";
    case "pending": return "bg-muted text-muted-foreground";
    default: return "bg-muted text-muted-foreground";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high": return "destructive";
    case "medium": return "secondary";
    case "low": return "outline";
    default: return "outline";
  }
};

export const EIAAssessmentPanel = () => {
  const [selectedEIA, setSelectedEIA] = useState(pendingEIAReviews[0]);
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null);

  if (activeWorkflow) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">EIA Assessment Workflow</h2>
            <p className="text-muted-foreground">Step-by-step assessment process with fee calculation</p>
          </div>
          <Button variant="outline" onClick={() => setActiveWorkflow(null)}>
            Back to Overview
          </Button>
        </div>
        <EIAWorkflowManager />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* EIA Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active EIA Reviews</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Red Category Projects</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">High impact assessments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Reviews</CardTitle>
            <Clock className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Community Consultations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Scheduled this month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="reviews" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reviews">EIA Reviews</TabsTrigger>
          <TabsTrigger value="process">EIA Process</TabsTrigger>
          <TabsTrigger value="regulations">PNG Regulations</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending EIA Reviews</CardTitle>
              <CardDescription>
                Environmental Impact Assessments requiring review and decision
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingEIAReviews.map((eia) => (
                  <div 
                    key={eia.id} 
                    className={`p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer ${selectedEIA.id === eia.id ? 'bg-accent/50' : ''}`}
                    onClick={() => setSelectedEIA(eia)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-foreground">{eia.id}</h3>
                          <Badge variant={getPriorityColor(eia.priority)}>
                            {eia.category}
                          </Badge>
                        </div>
                        <p className="text-foreground">{eia.project}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>Assessor: {eia.assessor}</span>
                          <span>•</span>
                          <span>Current: {eia.currentStep}</span>
                          <span>•</span>
                          <span>Type: {eia.type}</span>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="flex items-center space-x-2">
                          <Progress value={eia.progress} className="w-24" />
                          <span className="text-sm font-medium">{eia.progress}%</span>
                        </div>
                        <div className="space-x-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/eia-review/${eia.id}`}>View Details</Link>
                          </Button>
                          <Button 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveWorkflow(eia.id);
                            }}
                          >
                            <Workflow className="h-4 w-4 mr-2" />
                            Start Assessment
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="process" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>EIA Process Steps</CardTitle>
              <CardDescription>
                Systematic process for environmental impact assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {eiaSteps.map((step) => {
                  const IconComponent = step.icon;
                  return (
                    <div
                      key={step.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        step.status === 'completed' ? 'border-primary bg-primary/5' :
                        step.status === 'in-progress' ? 'border-accent bg-accent/5' :
                        'border-border bg-muted/5'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${getStepStatus(step.status)}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{step.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{step.status}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold">EIA Core Values</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <h4 className="font-medium">Integrity</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        An unbiased and balanced process ensuring fair assessment
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center space-x-2">
                        <FileCheck className="h-5 w-5 text-primary" />
                        <h4 className="font-medium">Utility</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Providing credible insights for informed decision-making
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center space-x-2">
                        <TreePine className="h-5 w-5 text-primary" />
                        <h4 className="font-medium">Sustainability</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Leading to protective and corrective environmental actions
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regulations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Papua New Guinea Environmental Regulations</CardTitle>
              <CardDescription>
                Key regulations under the Environment Act 2000
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Droplets className="h-5 w-5 text-blue-500" />
                        <h4 className="font-medium">Water Quality Criteria Regulation 2002</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Sets water quality standards for freshwater and marine environments to protect aquatic life
                      </p>
                      <Button size="sm" variant="outline" className="mt-3">View Standards</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <FileText className="h-5 w-5 text-green-500" />
                        <h4 className="font-medium">Permits Regulation 2002</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Outlines the process for obtaining environmental permits, conditions, and approval procedures
                      </p>
                      <Button size="sm" variant="outline" className="mt-3">View Process</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        <h4 className="font-medium">Prescribed Activities Regulation 2002</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Provides specific guidelines on regulated activities requiring environmental assessment
                      </p>
                      <Button size="sm" variant="outline" className="mt-3">View Activities</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Users className="h-5 w-5 text-purple-500" />
                        <h4 className="font-medium">Council's Procedure Regulation 2002</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Defines procedures of the Environmental Council for permit review and approval
                      </p>
                      <Button size="sm" variant="outline" className="mt-3">View Procedures</Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6 p-4 bg-accent/20 rounded-lg">
                  <h4 className="font-medium mb-2">Project Categories</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <Badge variant="destructive" className="mb-2">Red Category</Badge>
                      <p className="text-muted-foreground">
                        High impact projects: Power plants, textiles, tanneries requiring comprehensive EIA
                      </p>
                    </div>
                    <div>
                      <Badge variant="secondary" className="mb-2">Orange Category</Badge>
                      <p className="text-muted-foreground">
                        Medium impact projects requiring environmental clearance and monitoring
                      </p>
                    </div>
                    <div>
                      <Badge variant="outline" className="mb-2">Green Category</Badge>
                      <p className="text-muted-foreground">
                        Low impact projects with minimal environmental requirements
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
