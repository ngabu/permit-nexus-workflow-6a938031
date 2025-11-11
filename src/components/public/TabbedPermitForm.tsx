import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { usePermitApplicationDetails } from '@/hooks/usePermitApplicationDetails';
import { FileText, User, MapPin, Upload, Shield, Save, ChevronLeft, ChevronRight, Check, Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ApplicationFeeStep } from './steps/ApplicationFeeStep';
import DocumentsTab from '@/components/permit-application-form/DocumentsTab';
import { EntitySelector } from './EntitySelector';

interface TabbedPermitFormProps {
  permitId: string;
  onComplete?: () => void;
}

const STEPS = [
  { id: 'project', label: 'Project Details', icon: FileText, step: 1 },
  { id: 'location', label: 'Location', icon: MapPin, step: 2 },
  { id: 'documents', label: 'Documents', icon: Upload, step: 3 },
  { id: 'fees', label: 'Fees', icon: Calculator, step: 4 },
  { id: 'compliance', label: 'Compliance', icon: Shield, step: 5 }
];

export function TabbedPermitForm({ permitId, onComplete }: TabbedPermitFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const { details, permitInfo, loading, saveDetails } = usePermitApplicationDetails(permitId);
  const [formData, setFormData] = useState<any>({});
  const { toast } = useToast();

  // Initialize form data when details are loaded
  useEffect(() => {
    if (details) {
      setFormData(details);
      setCurrentStep(details.current_step || 1);
      setCompletedSteps(details.completed_steps || []);
    }
  }, [details]);

  const currentStepData = STEPS.find(step => step.step === currentStep);
  const isLastStep = currentStep === STEPS.length;
  const isFirstStep = currentStep === 1;

  const updateFormData = (stepData: any) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1: // Project Details
        return formData.proposed_works_description && formData.legal_description && formData.estimated_cost_kina;
      case 2: // Location
        return formData.activity_location;
      case 3: // Documents
        return true; // Documents are optional for now
      case 4: // Fees
        return formData.permit_type && formData.total_fee;
      case 5: // Compliance
        return true; // Compliance fields are optional
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields before proceeding",
        variant: "destructive"
      });
      return;
    }

    try {
      // Mark current step as completed
      const newCompletedSteps = [...completedSteps];
      if (!newCompletedSteps.includes(currentStep)) {
        newCompletedSteps.push(currentStep);
      }
      
      await saveDetails({
        ...details,
        ...formData,
        current_step: currentStep + 1,
        completed_steps: newCompletedSteps,
        is_draft: true
      });
      
      setCompletedSteps(newCompletedSteps);
      setCurrentStep(currentStep + 1);
      
      toast({
        title: "Progress Saved",
        description: "Your progress has been saved automatically"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save progress",
        variant: "destructive"
      });
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = async () => {
    try {
      await saveDetails({
        ...details,
        ...formData,
        current_step: currentStep,
        completed_steps: completedSteps,
        is_draft: true
      });
      
      toast({
        title: "Draft Saved",
        description: "Your application has been saved as a draft"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save draft",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      toast({
        title: "Validation Error",
        description: "Please complete all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const finalCompletedSteps = [1, 2, 3, 4, 5];
      await saveDetails({
        ...details,
        ...formData,
        current_step: 5,
        completed_steps: finalCompletedSteps,
        is_draft: false
      });
      
      toast({
        title: "Application Submitted",
        description: "Your permit application has been submitted successfully"
      });
      onComplete?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit application",
        variant: "destructive"
      });
    }
  };

  const jumpToStep = (step: number) => {
    // Allow jumping to completed steps or the next step
    if (completedSteps.includes(step) || step <= Math.max(...completedSteps, 0) + 1) {
      setCurrentStep(step);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-600 mx-auto mb-4"></div>
          <p>Loading application form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Environmental Permit Application</h1>
        <p className="text-gray-600">Complete the form step by step to apply for an environmental permit.</p>
        <div className="mt-4">
          <Badge variant="outline" className="text-green-600 border-green-600">
            Application Number: CEPA-APP-{new Date().getFullYear()}{String(Date.now()).slice(-6)}
          </Badge>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = completedSteps.includes(step.step);
            const isCurrent = currentStep === step.step;
            const isAccessible = isCompleted || step.step <= Math.max(...completedSteps, 0) + 1;

            return (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => jumpToStep(step.step)}
                  disabled={!isAccessible}
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                    {
                      "bg-green-500 border-green-500 text-white": isCompleted,
                      "bg-blue-500 border-blue-500 text-white": isCurrent && !isCompleted,
                      "border-gray-300 text-gray-400": !isAccessible,
                      "border-gray-400 text-gray-600 hover:border-gray-500": isAccessible && !isCurrent && !isCompleted
                    }
                  )}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </button>
                <div className="ml-3">
                  <p className={cn("text-sm font-medium", {
                    "text-green-600": isCompleted,
                    "text-blue-600": isCurrent,
                    "text-gray-400": !isAccessible,
                    "text-gray-600": isAccessible && !isCurrent && !isCompleted
                  })}>
                    Step {step.step}
                  </p>
                  <p className={cn("text-xs", {
                    "text-green-500": isCompleted,
                    "text-blue-500": isCurrent,
                    "text-gray-400": !isAccessible,
                    "text-gray-500": isAccessible && !isCurrent && !isCompleted
                  })}>
                    {step.label}
                  </p>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={cn("w-12 h-0.5 mx-4", {
                    "bg-green-500": isCompleted,
                    "bg-gray-300": !isCompleted
                  })} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentStepData && <currentStepData.icon className="w-5 h-5" />}
            {currentStepData?.label}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentStep === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="proposed_works">Brief Description of Proposed Works *</Label>
                <Textarea
                  id="proposed_works"
                  placeholder="Provide a brief description of the proposed works"
                  rows={4}
                  value={formData.proposed_works_description || ''}
                  onChange={(e) => updateFormData({ proposed_works_description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="legal_description">Legal Description of Land *</Label>
                <Textarea
                  id="legal_description"
                  placeholder="Provide legal description of land involved (customary/alienated)"
                  rows={3}
                  value={formData.legal_description || ''}
                  onChange={(e) => updateFormData({ legal_description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="land_type">Land Type</Label>
                  <Input
                    id="land_type"
                    placeholder="Customary/Alienated"
                    value={formData.land_type || ''}
                    onChange={(e) => updateFormData({ land_type: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tenure">Tenure</Label>
                  <Input
                    id="tenure"
                    placeholder="Enter tenure details"
                    value={formData.tenure || ''}
                    onChange={(e) => updateFormData({ tenure: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated_cost">Estimated Cost in Kina *</Label>
                <Input
                  id="estimated_cost"
                  type="number"
                  placeholder="Enter estimated cost in PGK"
                  value={formData.estimated_cost_kina || ''}
                  onChange={(e) => updateFormData({ estimated_cost_kina: parseFloat(e.target.value) })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="commencement_date">Commencement Date</Label>
                  <Input
                    id="commencement_date"
                    type="date"
                    value={formData.commencement_date || ''}
                    onChange={(e) => updateFormData({ commencement_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="completion_date">Completion Date</Label>
                  <Input
                    id="completion_date"
                    type="date"
                    value={formData.completion_date || ''}
                    onChange={(e) => updateFormData({ completion_date: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="activity_location">Location of Activity *</Label>
                <Textarea
                  id="activity_location"
                  placeholder="Provide detailed location information including coordinates if available"
                  rows={4}
                  value={formData.activity_location || ''}
                  onChange={(e) => updateFormData({ activity_location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="existing_permits">Details of Existing Permits</Label>
                <Textarea
                  id="existing_permits"
                  placeholder="Details of existing permits and licenses held over the area"
                  rows={3}
                  value={formData.existing_permits_details || ''}
                  onChange={(e) => updateFormData({ existing_permits_details: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="landowner_status">Landowner Negotiation Status</Label>
                <Textarea
                  id="landowner_status"
                  placeholder="Status of negotiation with landowner groups (if applicable)"
                  rows={2}
                  value={formData.landowner_negotiation_status || ''}
                  onChange={(e) => updateFormData({ landowner_negotiation_status: e.target.value })}
                />
              </div>
            </>
          )}

          {currentStep === 3 && (
            <DocumentsTab 
              formData={formData} 
              handleInputChange={updateFormData}
              handleFileUpload={async (event: React.ChangeEvent<HTMLInputElement>) => {
                // Implement file upload logic here if needed for TabbedPermitForm
                console.log('File upload not implemented in TabbedPermitForm');
              }}
              removeFile={async (fileId: string) => {
                // Implement file removal logic here if needed for TabbedPermitForm
                console.log('File removal not implemented in TabbedPermitForm');
              }}
              formatFileSize={(bytes: number) => {
                if (bytes === 0) return '0 Bytes';
                const k = 1024;
                const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
              }}
              permitId={permitId}
            />
          )}

          {currentStep === 4 && (
            <ApplicationFeeStep
              data={formData}
              onChange={updateFormData}
            />
          )}

          {currentStep === 5 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="consulted_departments">Government Departments Consulted</Label>
                <Textarea
                  id="consulted_departments"
                  placeholder="List other government departments or statutory bodies consulted"
                  rows={3}
                  value={formData.consulted_departments || ''}
                  onChange={(e) => updateFormData({ consulted_departments: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="required_approvals">Required Government Approvals</Label>
                <Textarea
                  id="required_approvals"
                  placeholder="List other formal government approvals required for this activity"
                  rows={3}
                  value={formData.required_approvals || ''}
                  onChange={(e) => updateFormData({ required_approvals: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="government_agreements">Government Agreements</Label>
                <Textarea
                  id="government_agreements"
                  placeholder="Details of existing agreements with the Government of PNG"
                  rows={3}
                  value={formData.government_agreements_details || ''}
                  onChange={(e) => updateFormData({ government_agreements_details: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="permit_period">Permit Period Required</Label>
                <Input
                  id="permit_period"
                  placeholder="e.g., 5 years"
                  value={formData.permit_period || ''}
                  onChange={(e) => updateFormData({ permit_period: e.target.value })}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstStep}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <Button onClick={handleSaveDraft} variant="outline">
          <Save className="w-4 h-4 mr-2" />
          Save Draft
        </Button>

        {isLastStep ? (
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
            Submit Application
          </Button>
        ) : (
          <Button onClick={handleNext}>
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
