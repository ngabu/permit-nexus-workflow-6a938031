
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileText, 
  DollarSign,
  Upload,
  Download,
  Send
} from "lucide-react";

interface EIAStep {
  id: number;
  name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'requires-info';
  feedback: string;
  documents: string[];
  estimatedDays: number;
}

interface Application {
  id: string;
  project: string;
  category: 'Red Category' | 'Orange Category' | 'Green Category';
  applicationType: 'new' | 'amendment' | 'transfer' | 'amalgamation' | 'compliance' | 'renewal' | 'surrender';
  currentStep: number;
  assessor: string;
  annualRecurrentFee: number;
  estimatedProcessingDays: number;
}

const initialSteps: EIAStep[] = [
  {
    id: 1,
    name: "Screening",
    description: "Determine if EIA is required and categorize the project",
    status: 'completed',
    feedback: "Project classified as Red Category - requires full EIA",
    documents: ["screening_report.pdf"],
    estimatedDays: 5
  },
  {
    id: 2,
    name: "Scoping",
    description: "Define the scope of environmental impact assessment",
    status: 'completed',
    feedback: "Scope defined to include air quality, water resources, and biodiversity impacts",
    documents: ["scoping_document.pdf"],
    estimatedDays: 10
  },
  {
    id: 3,
    name: "Impact Analysis",
    description: "Detailed analysis of potential environmental impacts",
    status: 'in-progress',
    feedback: "",
    documents: [],
    estimatedDays: 15
  },
  {
    id: 4,
    name: "Mitigation Measures",
    description: "Develop measures to mitigate identified impacts",
    status: 'pending',
    feedback: "",
    documents: [],
    estimatedDays: 8
  },
  {
    id: 5,
    name: "Environmental Impact Statement (EIS)",
    description: "Prepare comprehensive EIS report",
    status: 'pending',
    feedback: "",
    documents: [],
    estimatedDays: 12
  },
  {
    id: 6,
    name: "Public Consultation",
    description: "Conduct public consultation and review",
    status: 'pending',
    feedback: "",
    documents: [],
    estimatedDays: 21
  },
  {
    id: 7,
    name: "Technical Review",
    description: "Internal technical review of EIS",
    status: 'pending',
    feedback: "",
    documents: [],
    estimatedDays: 10
  },
  {
    id: 8,
    name: "Decision Making",
    description: "Final decision on permit approval",
    status: 'pending',
    feedback: "",
    documents: [],
    estimatedDays: 5
  }
];

const sampleApplication: Application = {
  id: "EIA-2024-001",
  project: "Riverside Industrial Park Expansion",
  category: "Red Category",
  applicationType: "new",
  currentStep: 3,
  assessor: "Dr. Sarah Johnson",
  annualRecurrentFee: 25000,
  estimatedProcessingDays: 86
};

const feeCalculation = {
  administrationFee: (annualRecurrentFee: number, processingDays: number) => {
    return (annualRecurrentFee / 365) * processingDays;
  },
  
  getFormNumber: (applicationType: string) => {
    const formMap = {
      'new': 'Form 9',
      'compliance': 'Form 5',
      'enforcement': 'Form 6',
      'amalgamation': 'Form 7',
      'amendment': 'Form 8',
      'renewal': 'Form 10',
      'transfer': 'Form 11',
      'surrender': 'Form 12'
    };
    return formMap[applicationType] || 'Form 2';
  }
};

export const EIAWorkflowManager = () => {
  const [steps, setSteps] = useState<EIAStep[]>(initialSteps);
  const [currentFeedback, setCurrentFeedback] = useState("");
  const [showFeeCalculation, setShowFeeCalculation] = useState(false);

  const currentStep = steps.find(step => step.status === 'in-progress');
  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalSteps = steps.length;
  const progress = (completedSteps / totalSteps) * 100;

  const calculatedAdminFee = feeCalculation.administrationFee(
    sampleApplication.annualRecurrentFee,
    sampleApplication.estimatedProcessingDays
  );

  const handleStepAction = (stepId: number, action: 'complete' | 'request-info' | 'reject') => {
    setSteps(prevSteps => 
      prevSteps.map(step => {
        if (step.id === stepId) {
          return {
            ...step,
            status: action === 'complete' ? 'completed' : 
                   action === 'request-info' ? 'requires-info' : 'pending',
            feedback: action === 'complete' ? currentFeedback : 
                     action === 'request-info' ? currentFeedback : step.feedback
          };
        }
        if (step.id === stepId + 1 && action === 'complete') {
          return { ...step, status: 'in-progress' };
        }
        return step;
      })
    );
    setCurrentFeedback("");
    
    // Show fee calculation when assessment is complete
    if (stepId === totalSteps - 1 && action === 'complete') {
      setShowFeeCalculation(true);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'requires-info': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'requires-info': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Application Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{sampleApplication.project}</CardTitle>
              <CardDescription className="mt-2">
                Application ID: {sampleApplication.id} | Category: {sampleApplication.category}
              </CardDescription>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span>Assessor: {sampleApplication.assessor}</span>
                <span>•</span>
                <span>Type: {sampleApplication.applicationType}</span>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="mb-2">
                Step {currentStep?.id || 1} of {totalSteps}
              </Badge>
              <div className="flex items-center gap-2">
                <Progress value={progress} className="w-32" />
                <span className="text-sm font-medium">{Math.round(progress)}%</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="assessment" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assessment">EIA Assessment</TabsTrigger>
          <TabsTrigger value="fees">Fee Calculation</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="assessment" className="space-y-4">
          {/* EIA Steps */}
          <div className="grid gap-4">
            {steps.map((step) => (
              <Card key={step.id} className={`${step.status === 'in-progress' ? 'border-blue-500' : ''}`}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getStatusIcon(step.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{step.name}</h3>
                          <Badge className={getStatusColor(step.status)}>
                            {step.status.replace('-', ' ').toUpperCase()}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            ({step.estimatedDays} days)
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                        
                        {step.feedback && (
                          <div className="bg-gray-50 p-3 rounded-md mb-3">
                            <p className="text-sm"><strong>Feedback:</strong> {step.feedback}</p>
                          </div>
                        )}

                        {step.documents.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {step.documents.map((doc, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                <FileText className="h-3 w-3 mr-1" />
                                {doc}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {step.status === 'in-progress' && (
                          <div className="space-y-3">
                            <Textarea
                              placeholder="Provide assessment feedback..."
                              value={currentFeedback}
                              onChange={(e) => setCurrentFeedback(e.target.value)}
                              className="min-h-[80px]"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleStepAction(step.id, 'complete')}
                                disabled={!currentFeedback.trim()}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Complete Step
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStepAction(step.id, 'request-info')}
                                disabled={!currentFeedback.trim()}
                              >
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Request More Info
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="fees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Fee Calculation (CEPA Administrative Order 0003)
              </CardTitle>
              <CardDescription>
                Automatic fee calculation based on permit category and processing requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Administration Fee */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-3">Administration (Application) Fee</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Annual Recurrent Fee:</span>
                    <p className="font-medium">K{sampleApplication.annualRecurrentFee.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Processing Days:</span>
                    <p className="font-medium">{sampleApplication.estimatedProcessingDays} days</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>Calculation:</strong> (K{sampleApplication.annualRecurrentFee.toLocaleString()} ÷ 365) × {sampleApplication.estimatedProcessingDays} days
                  </p>
                  <p className="text-lg font-bold text-blue-900 mt-2">
                    Administration Fee: K{calculatedAdminFee.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Technical Fee */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-3">Technical (Permit Specific) Fee</h3>
                <div className="text-sm">
                  <p className="text-muted-foreground mb-2">
                    Form: {feeCalculation.getFormNumber(sampleApplication.applicationType)}
                  </p>
                  <p className="text-muted-foreground mb-2">
                    Based on work plan developed for {sampleApplication.category} assessment
                  </p>
                  <div className="p-3 bg-green-50 rounded">
                    <p className="text-lg font-bold text-green-900">
                      Technical Fee: K15,500.00
                    </p>
                    <p className="text-sm text-green-800">
                      (Calculated from detailed work plan)
                    </p>
                  </div>
                </div>
              </div>

              {/* Total Fees */}
              <div className="p-4 border-2 border-primary rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Total Fees Payable</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Administration Fee:</span>
                    <span>K{calculatedAdminFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Technical Fee:</span>
                    <span>K15,500.00</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total Amount:</span>
                    <span>K{(calculatedAdminFee + 15500).toFixed(2)}</span>
                  </div>
                </div>
                
                {showFeeCalculation && (
                  <div className="mt-4 flex gap-2">
                    <Button>
                      <Send className="h-4 w-4 mr-2" />
                      Generate Fee Notice
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download Invoice
                    </Button>
                  </div>
                )}
              </div>

              {/* Required Documents */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-3">Required Documents for Fee Payment</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Signed Fee Notice (Form 2 & {feeCalculation.getFormNumber(sampleApplication.applicationType)})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>CEPA Common Seal Authentication</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Managing Director or Delegate Signature</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Documents</CardTitle>
              <CardDescription>
                Documents generated and collected during the EIA process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {steps.map((step) => (
                  step.documents.length > 0 && (
                    <div key={step.id} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">{step.name}</h4>
                      <div className="space-y-2">
                        {step.documents.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span className="text-sm">{doc}</span>
                            </div>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ))}
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload additional assessment documents
                  </p>
                  <Button variant="outline" size="sm">
                    Choose Files
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
