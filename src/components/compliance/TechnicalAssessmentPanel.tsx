import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft,
  FileText, 
  Upload, 
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  User,
  Calendar,
  Building
} from "lucide-react";

interface TechnicalAssessmentPanelProps {
  applicationId: string;
  onBack: () => void;
  isManager: boolean;
}

export function TechnicalAssessmentPanel({ applicationId, onBack, isManager }: TechnicalAssessmentPanelProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [comments, setComments] = useState('');
  const [decision, setDecision] = useState('');

  // Mock application data - replace with real data fetch
  const application = {
    id: applicationId,
    applicationNumber: 'ENV-2024-001',
    proponentName: 'Mining Corp Ltd',
    proponentAddress: '123 Industrial Ave, Port Moresby',
    contactPerson: 'John Doe',
    contactEmail: 'john.doe@miningcorp.com',
    contactPhone: '+675 123 4567',
    applicationType: 'Water Extraction',
    level: '2A',
    status: 'under_review',
    submissionDate: '2024-01-15',
    deadlineDate: '2024-02-14',
    assignedOfficer: 'Jane Smith',
    documents: [
      { name: 'Application Form', type: 'form', uploaded: true },
      { name: 'Environmental Impact Statement', type: 'eis', uploaded: true },
      { name: 'Technical Drawings', type: 'technical', uploaded: false },
      { name: 'Appendix G1 - Public Notice', type: 'appendix', uploaded: false }
    ]
  };

  // Statutory steps based on permit level
  const getStatutorySteps = (level: string) => {
    const baseSteps = [
      { id: 1, name: 'Application Review', description: 'Initial review and completeness check' },
      { id: 2, name: 'Technical Assessment', description: 'Detailed technical review of proposal' },
      { id: 3, name: 'Document Referral', description: 'Referral to relevant departments' }
    ];

    if (level === '2B' || level === '3') {
      baseSteps.push(
        { id: 4, name: 'Public Notice', description: 'Public advertisement and consultation period' },
        { id: 5, name: 'Objection Review', description: 'Review and respond to public objections' }
      );
    }

    if (level === '3') {
      baseSteps.push(
        { id: 6, name: 'Director Approval', description: 'Final review and approval by Director' }
      );
    }

    baseSteps.push(
      { id: baseSteps.length + 1, name: 'Permit Decision', description: 'Final permit decision and issuance' }
    );

    return baseSteps;
  };

  const statutorySteps = getStatutorySteps(application.level);
  const completedSteps = 2; // Mock - replace with real data
  const progressPercentage = (completedSteps / statutorySteps.length) * 100;

  const handleStepComplete = (stepId: number) => {
    // Handle step completion logic
    console.log(`Completing step ${stepId}`);
  };

  const handleDocumentUpload = (documentType: string) => {
    // Handle document upload logic
    console.log(`Uploading document: ${documentType}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{application.applicationNumber}</h2>
          <p className="text-muted-foreground">{application.applicationType} Assessment</p>
        </div>
        <div className="ml-auto">
          <Badge variant="outline">Level {application.level}</Badge>
        </div>
      </div>

      {/* Progress Indicator */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Progress</CardTitle>
          <CardDescription>
            Step {completedSteps} of {statutorySteps.length} completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercentage} className="mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {statutorySteps.map((step, index) => (
              <div 
                key={step.id} 
                className={`p-2 rounded text-center text-xs ${
                  index < completedSteps 
                    ? 'bg-green-100 text-green-800' 
                    : index === completedSteps 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {step.name}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Application Details</TabsTrigger>
          <TabsTrigger value="assessment">Technical Assessment</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="timeline">Timeline & Comments</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Proponent Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="font-medium">Organization</Label>
                  <p className="text-sm text-muted-foreground">{application.proponentName}</p>
                </div>
                <div>
                  <Label className="font-medium">Address</Label>
                  <p className="text-sm text-muted-foreground">{application.proponentAddress}</p>
                </div>
                <div>
                  <Label className="font-medium">Contact Person</Label>
                  <p className="text-sm text-muted-foreground">{application.contactPerson}</p>
                </div>
                <div>
                  <Label className="font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">{application.contactEmail}</p>
                </div>
                <div>
                  <Label className="font-medium">Phone</Label>
                  <p className="text-sm text-muted-foreground">{application.contactPhone}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Application Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="font-medium">Application Type</Label>
                  <p className="text-sm text-muted-foreground">{application.applicationType}</p>
                </div>
                <div>
                  <Label className="font-medium">Permit Level</Label>
                  <p className="text-sm text-muted-foreground">Level {application.level}</p>
                </div>
                <div>
                  <Label className="font-medium">Submission Date</Label>
                  <p className="text-sm text-muted-foreground">{application.submissionDate}</p>
                </div>
                <div>
                  <Label className="font-medium">Statutory Deadline</Label>
                  <p className="text-sm text-muted-foreground text-red-600">{application.deadlineDate}</p>
                </div>
                <div>
                  <Label className="font-medium">Assigned Officer</Label>
                  <p className="text-sm text-muted-foreground">{application.assignedOfficer}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assessment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Statutory Step Checklist</CardTitle>
              <CardDescription>Complete each step according to PNG Environment Act 2000</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statutorySteps.map((step, index) => (
                  <div key={step.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                    <Checkbox 
                      checked={index < completedSteps}
                      disabled={index > completedSteps}
                      onCheckedChange={() => handleStepComplete(step.id)}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{step.name}</h4>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                    {index < completedSteps && (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                    {index === completedSteps && (
                      <Clock className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assessment Decision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="decision">Recommendation</Label>
                <Select value={decision} onValueChange={setDecision}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recommendation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approve">Approve</SelectItem>
                    <SelectItem value="approve_conditions">Approve with Conditions</SelectItem>
                    <SelectItem value="reject">Reject</SelectItem>
                    <SelectItem value="more_info">Request More Information</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="comments">Assessment Comments</Label>
                <Textarea
                  id="comments"
                  placeholder="Enter detailed assessment comments and recommendations..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={6}
                />
              </div>
              <Button>Save Assessment</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Required Documents</CardTitle>
              <CardDescription>Upload and manage assessment documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {application.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">Type: {doc.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.uploaded ? (
                        <>
                          <Badge variant="default">Uploaded</Badge>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDocumentUpload(doc.type)}
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          Upload
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Timeline</CardTitle>
              <CardDescription>Track all actions and communications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Mock timeline entries */}
                <div className="border-l-2 border-blue-200 pl-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-blue-600 rounded-full -ml-6 mt-1"></div>
                    <div>
                      <p className="font-medium">Application assigned to officer</p>
                      <p className="text-sm text-muted-foreground">Assigned to Jane Smith</p>
                      <p className="text-xs text-muted-foreground">2024-01-16 09:30</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-green-600 rounded-full -ml-6 mt-1"></div>
                    <div>
                      <p className="font-medium">Initial review completed</p>
                      <p className="text-sm text-muted-foreground">Application accepted for technical review</p>
                      <p className="text-xs text-muted-foreground">2024-01-17 14:15</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <Label htmlFor="new-comment">Add Comment</Label>
                <Textarea
                  id="new-comment"
                  placeholder="Add a comment to the assessment timeline..."
                  rows={3}
                />
                <Button className="mt-2">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Add Comment
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}