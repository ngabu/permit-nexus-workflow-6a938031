
import { useState, useEffect } from 'react';
import { usePermitApplicationDetails } from '@/hooks/usePermitApplicationDetails';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Send, FileText, MapPin, Upload, Building, User, Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BasicInformationStep } from './steps/BasicInformationStep';
import { ApplicationDetailsStep } from './steps/ApplicationDetailsStep';
import { ActivityDetailsStep } from './steps/ActivityDetailsStep';
import { PermitPeriodStep } from './steps/PermitPeriodStep';
import { ApplicationFeeStep } from './steps/ApplicationFeeStep';
import DocumentsTab from '@/components/permit-application-form/DocumentsTab';

interface ComprehensiveDraftEditorProps {
  permitId: string;
  onSave: () => void;
  onCancel: () => void;
}

export function ComprehensiveDraftEditor({ permitId, onSave, onCancel }: ComprehensiveDraftEditorProps) {
  const { details, permitInfo, loading, saveDetails } = usePermitApplicationDetails(permitId);
  const [activeTab, setActiveTab] = useState('basic');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    title: '',
    permit_type: '',
    description: '',
    
    // Step 2: Application Details
    legal_description: '',
    land_type: '',
    owner_name: '',
    tenure: '',
    existing_permits_details: '',
    government_agreements_details: '',
    consulted_departments: '',
    required_approvals: '',
    landowner_negotiation_status: '',
    
    // Step 3: Activity Details
    proposed_works_description: '',
    activity_location: '',
    estimated_cost_kina: 0,
    commencement_date: '',
    completion_date: '',
    activity_classification: '',
    activity_category: '',
    activity_subcategory: '',
    
    // Step 4: Permit Period
    permit_period: '',
    
    // Step 5: Application Fee
    application_fee: 0,
    
    // Progress tracking
    current_step: 1,
    completed_steps: [] as number[]
  });

  // Load existing data when component mounts or details change
  useEffect(() => {
    if (details) {
      setFormData({
        title: permitInfo?.title || '',
        permit_type: permitInfo?.permit_type || '',
        description: '',
        legal_description: details.legal_description || '',
        land_type: details.land_type || '',
        owner_name: details.owner_name || '',
        tenure: details.tenure || '',
        existing_permits_details: details.existing_permits_details || '',
        government_agreements_details: details.government_agreements_details || '',
        consulted_departments: details.consulted_departments || '',
        required_approvals: details.required_approvals || '',
        landowner_negotiation_status: details.landowner_negotiation_status || '',
        proposed_works_description: details.proposed_works_description || '',
        activity_location: details.activity_location || '',
        estimated_cost_kina: details.estimated_cost_kina || 0,
        commencement_date: details.commencement_date || '',
        completion_date: details.completion_date || '',
        activity_classification: details.activity_classification || '',
        activity_category: details.activity_category || '',
        activity_subcategory: details.activity_subcategory || '',
        permit_period: details.permit_period || '',
        application_fee: details.application_fee || 0,
        current_step: details.current_step || 1,
        completed_steps: details.completed_steps || []
      });
    }
  }, [details, permitInfo]);

  const handleStepDataChange = (stepData: any) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  };

  const handleSave = async (isDraft = true) => {
    setSaving(true);
    try {
      await saveDetails({
        ...formData,
        is_draft: isDraft,
        current_step: getCurrentStepNumber(),
        completed_steps: getCompletedSteps()
      });

      toast({
        title: isDraft ? "Draft Saved" : "Application Submitted",
        description: isDraft 
          ? "Your application has been saved as a draft" 
          : "Your application has been submitted successfully"
      });

      if (!isDraft) {
        onSave();
      }
    } catch (error) {
      console.error('Error saving application:', error);
    } finally {
      setSaving(false);
    }
  };

  const getCurrentStepNumber = () => {
    const stepMap: { [key: string]: number } = {
      'basic': 1,
      'details': 2,
      'activity': 3,
      'documents': 4,
      'period': 5,
      'fee': 6
    };
    return stepMap[activeTab] || 1;
  };

  const getCompletedSteps = () => {
    const completed = [];
    if (formData.title && formData.permit_type) completed.push(1);
    if (formData.legal_description) completed.push(2);
    if (formData.proposed_works_description) completed.push(3);
    // Documents step (4) is considered complete if any documents exist
    if (formData.permit_period) completed.push(5);
    if (formData.application_fee > 0) completed.push(6);
    return completed;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading application details...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-forest-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-forest-800">Edit Draft Application</CardTitle>
              <CardDescription>
                Complete your permit application form
              </CardDescription>
            </div>
            <Button variant="secondary" onClick={onCancel}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-6">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Details
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Documents
              </TabsTrigger>
              <TabsTrigger value="period" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Period
              </TabsTrigger>
              <TabsTrigger value="fee" className="flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Fee
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <BasicInformationStep 
                data={formData} 
                onChange={handleStepDataChange}
              />
            </TabsContent>

            <TabsContent value="details">
              <ApplicationDetailsStep 
                data={formData} 
                onChange={handleStepDataChange}
              />
            </TabsContent>

            <TabsContent value="activity">
              <ActivityDetailsStep 
                data={formData} 
                onChange={handleStepDataChange}
              />
            </TabsContent>

            <TabsContent value="documents">
              <DocumentsTab 
                formData={formData} 
                handleInputChange={(field, value) => handleStepDataChange({ [field]: value })}
                handleFileUpload={async (event: React.ChangeEvent<HTMLInputElement>) => {
                  // File upload will be handled by the useDocuments hook
                  console.log('File upload handled by useDocuments hook');
                }}
                removeFile={async (fileId: string) => {
                  // File removal will be handled by the useDocuments hook
                  console.log('File removal handled by useDocuments hook');
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
            </TabsContent>

            <TabsContent value="period">
              <PermitPeriodStep 
                data={formData} 
                onChange={handleStepDataChange}
              />
            </TabsContent>

            <TabsContent value="fee">
              <ApplicationFeeStep 
                data={formData} 
                onChange={handleStepDataChange}
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
            <Button 
              variant="outline" 
              onClick={() => handleSave(true)}
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button 
              onClick={() => handleSave(false)}
              disabled={saving}
              className="bg-gradient-to-r from-forest-600 to-nature-600 hover:from-forest-700 hover:to-nature-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Application
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
