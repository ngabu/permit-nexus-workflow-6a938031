import React, { useState, useEffect } from 'react';
import { FileText, MapPin, Upload, Save, Send, Building, User, AlertCircle, CheckCircle, Activity, Users, Settings, DollarSign, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import ProjectAndSpecificDetailsTab from '@/components/permit-application-form/ProjectAndSpecificDetailsTab';
import LocationTab from '@/components/permit-application-form/LocationTab';
import DocumentsTab from '@/components/permit-application-form/DocumentsTab';
import ComplianceTab from '@/components/permit-application-form/ComplianceTab';
import { ActivityClassificationStep } from '@/components/public/steps/ActivityClassificationStep';
import { ApplicationFeeStep } from '@/components/public/steps/ApplicationFeeStep';
import { PublicConsultationStep } from '@/components/public/steps/PublicConsultationStep';

import { ReviewSubmitStep } from '@/components/public/steps/ReviewSubmitStep';

const generateApplicationNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const randomSuffix = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `CEPA-APP-${year}${month}${day}-${randomSuffix}`;
};

interface ComprehensivePermitFormProps {
  permitId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  isStandalone?: boolean;
  draftId?: string; // Add this to load existing drafts
}

export function ComprehensivePermitForm({ permitId, onSuccess, onCancel, isStandalone = false, draftId }: ComprehensivePermitFormProps) {
  const { toast } = useToast();
  const [applicationNumber, setApplicationNumber] = useState('');

  useEffect(() => {
    if (!permitId) {
      setApplicationNumber(generateApplicationNumber());
    }
  }, [permitId]);
  
  const initialFormData = {
    applicationNumber: applicationNumber,
    applicationTitle: '',
    applicantName: '',
    applicantEmail: '',
    applicantPhone: '',
    organizationName: '',
    projectDescription: '',
    projectLocation: '',
    coordinates: { lat: -6.314993, lng: 143.95555 }, // Default to Papua New Guinea center
    // Land Information fields
    land_type: '',
    owner_name: '',
    legal_description: '',
    tenure: '',
    prescribedActivity: '',
    feeCategory: 'Green Category',
    projectStartDate: '',
    projectEndDate: '',
    environmentalImpact: '',
    mitigationMeasures: '',
    uploadedFiles: [],
    calculatedFees: null,
    // PNG Environment Act 2000 fields - Activity Classification
    activity_level: '',
    prescribed_activity_id: '', // Add this field for document requirements
    activity_category: '', // Add activity category field
    activity_subcategory: '', // Add activity subcategory field
    activity_description: '', // Add activity description field
    entity_type: '', // Add this field for document requirements
    entity_id: '', // Add entity_id field
    entity_name: '', // Add entity_name field
    existing_permit_id: null, // Add existing permit reference
    permit_category: '',
    permit_type_id: '',
    // PNG Environment Act 2000 fields - Public Consultation
    public_consultation_proof: [],
    consultation_period_start: '',
    consultation_period_end: '',
    // PNG Environment Act 2000 fields - Fees
    fee_amount: 0,
    fee_breakdown: null,
    // PNG Environment Act 2000 fields - Requirements & Legal
    eia_required: false,
    eis_required: false,
    legal_declaration_accepted: false,
    compliance_commitment: false,
    payment_status: 'pending',
    mandatory_fields_complete: false,
    complianceChecks: {
      environmentalAssessment: false,
      publicConsultation: false,
      technicalReview: false,
      legalCompliance: false
    }
  };

  const [formData, setFormData] = useState(initialFormData);
  const [lastSavedDraftId, setLastSavedDraftId] = useState<string | null>(draftId || null);
  
  // Load existing draft data
  useEffect(() => {
    const loadDraftData = async () => {
      if (draftId || permitId) {
        try {
          const { data, error } = await supabase
            .from('permit_applications')
            .select('*')
            .eq('id', draftId || permitId)
            .single();
          
          if (error) throw error;
          
          if (data) {
            console.log('📥 Loading existing draft:', data);
            setFormData({
              applicationNumber: data.application_number || '',
              applicationTitle: data.title || '',
              applicantName: '', // Not stored in DB
              applicantEmail: '', // Not stored in DB currently
              applicantPhone: '', // Not stored in DB currently
              organizationName: data.entity_name || '',
              projectDescription: data.project_description || data.description || '',
              projectLocation: data.activity_location || '',
              coordinates: (typeof data.coordinates === 'object' && data.coordinates && 'lat' in data.coordinates) 
                ? data.coordinates as { lat: number; lng: number }
                : { lat: -6.314993, lng: 143.95555 },
              // Land Information fields - not available in current schema
              land_type: '',
              owner_name: '',
              legal_description: '',
              tenure: '',
              prescribedActivity: data.permit_type || '',
              feeCategory: 'Green Category',
              projectStartDate: data.project_start_date || data.commencement_date || '',
              projectEndDate: data.project_end_date || data.completion_date || '',
              environmentalImpact: data.environmental_impact || '',
              mitigationMeasures: data.mitigation_measures || '',
              uploadedFiles: Array.isArray(data.uploaded_files) ? data.uploaded_files : [],
              calculatedFees: data.fee_breakdown,
              activity_level: data.activity_level || '',
              prescribed_activity_id: data.activity_id || '', // Map activity_id to prescribed_activity_id
              activity_category: data.activity_category || '', // Add activity_category mapping
              activity_subcategory: data.activity_subcategory || '', // Add activity_subcategory mapping
              activity_description: data.activity_classification || '', // Map activity_classification to activity_description
              entity_type: data.entity_type || '', // Add entity_type mapping
              entity_id: data.entity_id || '', // Add entity_id mapping
              entity_name: data.entity_name || '', // Add entity_name mapping
              existing_permit_id: data.existing_permit_id || null, // Add existing permit mapping
              permit_category: data.permit_category || '',
              permit_type_id: data.permit_type_id || '',
              public_consultation_proof: Array.isArray(data.public_consultation_proof) ? data.public_consultation_proof : [],
              consultation_period_start: data.consultation_period_start || '',
              consultation_period_end: data.consultation_period_end || '',
              fee_amount: data.fee_amount || 0,
              fee_breakdown: data.fee_breakdown,
              eia_required: data.eia_required || false,
              eis_required: data.eis_required || false,
              legal_declaration_accepted: data.legal_declaration_accepted || false,
              compliance_commitment: data.compliance_commitment || false,
              payment_status: data.payment_status || 'pending',
              mandatory_fields_complete: data.mandatory_fields_complete || false,
              complianceChecks: (typeof data.compliance_checks === 'object' && data.compliance_checks && 
                'environmentalAssessment' in data.compliance_checks) 
                ? data.compliance_checks as { environmentalAssessment: boolean; publicConsultation: boolean; technicalReview: boolean; legalCompliance: boolean; }
                : {
                    environmentalAssessment: false,
                    publicConsultation: false,
                    technicalReview: false,
                    legalCompliance: false
                  }
            });
            setLastSavedDraftId(data.id);
          }
        } catch (error) {
          console.error('Error loading draft:', error);
          toast({
            title: "Error Loading Draft",
            description: "Could not load your saved draft. Starting with a new form.",
            variant: "destructive",
          });
        }
      }
    };
    
    loadDraftData();
  }, [draftId, permitId]);
  
  useEffect(() => {
    if (applicationNumber && !draftId && !permitId) {
      setFormData(prev => ({ ...prev, applicationNumber }));
    }
  }, [applicationNumber, draftId, permitId]);

  const [activeTab, setActiveTab] = useState('project');

  const handleInputChange = async (field: string | Record<string, any>, value?: any) => {
    console.log('🔄 ComprehensivePermitForm - handleInputChange:', { field, value, currentFormData: formData });
    
    setFormData(prev => {
      // Handle object with multiple fields (from steps that update multiple fields at once)
      if (typeof field === 'object' && field !== null) {
        console.log('📦 Multiple fields update:', field);
        const updatedData = {
          ...prev,
          ...field
        };
        
        // Auto-save draft when editing existing permit/draft
        if (lastSavedDraftId || permitId) {
          saveDraftChanges(updatedData);
        }
        
        return updatedData;
      }
      
      // Handle single field update
      const fieldName = field as string;
      
      const newFormData = {
        ...prev,
        [fieldName]: value
      };
      
      console.log('🔄 ComprehensivePermitForm - Updated formData:', newFormData);
      
      // Auto-save draft when editing existing permit/draft
      if (lastSavedDraftId || permitId) {
        saveDraftChanges(newFormData);
      }
      
      return newFormData;
    });
  };

  // Auto-save function for draft changes
  const saveDraftChanges = async (updatedFormData: typeof formData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updateId = permitId || lastSavedDraftId;
      if (!updateId) return;

      const applicationData = {
        title: updatedFormData.applicationTitle,
        permit_type: updatedFormData.prescribedActivity || 'General Permit',
        description: updatedFormData.projectDescription,
        status: 'draft',
        user_id: user.id,
        entity_id: updatedFormData.entity_id || null,
        entity_name: updatedFormData.entity_name || updatedFormData.organizationName,
        entity_type: updatedFormData.entity_type || (updatedFormData.organizationName ? 'COMPANY' : 'INDIVIDUAL'),
        existing_permit_id: updatedFormData.existing_permit_id || null,
        project_description: updatedFormData.projectDescription,
        project_start_date: updatedFormData.projectStartDate || null,
        project_end_date: updatedFormData.projectEndDate || null,
        environmental_impact: updatedFormData.environmentalImpact || null,
        mitigation_measures: updatedFormData.mitigationMeasures || null,
        activity_location: updatedFormData.projectLocation,
        estimated_cost_kina: 0,
        compliance_checks: updatedFormData.complianceChecks,
        coordinates: updatedFormData.coordinates,
        uploaded_files: updatedFormData.uploadedFiles,
        is_draft: true,
        current_step: 10,
        application_number: updatedFormData.applicationNumber,
        activity_level: updatedFormData.activity_level || null,
        activity_id: updatedFormData.prescribed_activity_id || null,
        activity_category: updatedFormData.activity_category || null,
        activity_subcategory: updatedFormData.activity_subcategory || null,
        activity_classification: updatedFormData.activity_description || null,
        permit_category: updatedFormData.permit_category || null,
        permit_type_id: updatedFormData.permit_type_id || null,
        eia_required: updatedFormData.eia_required,
        eis_required: updatedFormData.eis_required,
        public_consultation_proof: updatedFormData.public_consultation_proof,
        consultation_period_start: updatedFormData.consultation_period_start || null,
        consultation_period_end: updatedFormData.consultation_period_end || null,
        legal_declaration_accepted: updatedFormData.legal_declaration_accepted,
        compliance_commitment: updatedFormData.compliance_commitment,
        payment_status: updatedFormData.payment_status,
        mandatory_fields_complete: updatedFormData.mandatory_fields_complete,
        commencement_date: updatedFormData.projectStartDate || null,
        completion_date: updatedFormData.projectEndDate || null,
        fee_amount: updatedFormData.fee_amount || 0,
        fee_breakdown: updatedFormData.fee_breakdown || null,
      };

      await supabase
        .from('permit_applications')
        .update(applicationData)
        .eq('id', updateId);

      console.log('💾 Auto-saved draft changes');
    } catch (error) {
      console.error('Error auto-saving draft:', error);
    }
  };

  const handleComplianceChange = (field: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      complianceChecks: {
        ...prev.complianceChecks,
        [field]: checked
      }
    }));
  };

  const handleSubmit = async (isDraft = false) => {
    try {
      console.log('🚀 handleSubmit called with isDraft:', isDraft);
      console.log('🚀 Current formData:', formData);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ No authenticated user found');
        toast({
          title: "Authentication Required",
          description: "Please log in to submit an application.",
          variant: "destructive",
        });
        return;
      }
      
      console.log('✅ User authenticated:', user.id);

      // Generate application number only when submitting (not draft)
      const generatedAppNumber = isDraft ? formData.applicationNumber : `PAN-${Date.now()}`;
      
      console.log('🔍 Form data before submission:', {
        consultation_period_start: formData.consultation_period_start,
        consultation_period_end: formData.consultation_period_end,
        projectStartDate: formData.projectStartDate,
        projectEndDate: formData.projectEndDate
      });
      
      const applicationData = {
        title: formData.applicationTitle,
        permit_type: formData.prescribedActivity || 'General Permit',
        description: formData.projectDescription,
        status: isDraft ? 'draft' : 'submitted',
        user_id: user.id,
        entity_id: formData.entity_id || null,
        entity_name: formData.entity_name || formData.organizationName,
        entity_type: formData.entity_type || (formData.organizationName ? 'COMPANY' : 'INDIVIDUAL'),
        existing_permit_id: formData.existing_permit_id || null,
        // Project details - use correct database columns
        project_description: formData.projectDescription,
        project_start_date: formData.projectStartDate || null,
        project_end_date: formData.projectEndDate || null,
        environmental_impact: formData.environmentalImpact || null,
        mitigation_measures: formData.mitigationMeasures || null,
        activity_location: formData.projectLocation,
        estimated_cost_kina: 0,
        compliance_checks: formData.complianceChecks,
        coordinates: formData.coordinates,
        uploaded_files: formData.uploadedFiles,
        is_draft: isDraft,
        current_step: 10,
        application_number: generatedAppNumber,
        application_date: isDraft ? null : new Date().toISOString(),
        // PNG Environment Act 2000 fields - Activity Classification & Requirements
        activity_level: formData.activity_level || null,
        activity_id: formData.prescribed_activity_id || null,
        activity_category: formData.activity_category || null,
        activity_subcategory: formData.activity_subcategory || null,
        activity_classification: formData.activity_description || null,
        permit_category: formData.permit_category || null,
        permit_type_id: formData.permit_type_id || null,
        eia_required: formData.eia_required,
        eis_required: formData.eis_required,
        // PNG Environment Act 2000 fields - Public Consultation
        public_consultation_proof: formData.public_consultation_proof,
        consultation_period_start: formData.consultation_period_start || null,
        consultation_period_end: formData.consultation_period_end || null,
        // PNG Environment Act 2000 fields - Legal Compliance
        legal_declaration_accepted: formData.legal_declaration_accepted,
        compliance_commitment: formData.compliance_commitment,
        payment_status: formData.payment_status,
        mandatory_fields_complete: formData.mandatory_fields_complete,
        // Date fields - ensure null for empty dates
        commencement_date: formData.projectStartDate || null,
        completion_date: formData.projectEndDate || null,
      };

      let result;
      if (permitId || (isDraft && lastSavedDraftId)) {
        // Update existing application
        const updateId = permitId || lastSavedDraftId;
        result = await supabase
          .from('permit_applications')
          .update(applicationData)
          .eq('id', updateId)
          .select()
          .single();
      } else {
        // Create new application
        result = await supabase
          .from('permit_applications')
          .insert(applicationData)
          .select()
          .single();
      }

      const { data: permitApp, error: permitError } = result;
      if (permitError) throw permitError;

      toast({
        title: isDraft ? "Draft Saved!" : "Application Submitted!",
        description: isDraft 
          ? `Application has been saved as a draft.` 
          : `Application ${generatedAppNumber} has been submitted successfully.`,
      });
      
      // For drafts, update the saved draft ID so subsequent saves update the same record
      if (isDraft && permitApp?.id) {
        setLastSavedDraftId(permitApp.id);
        console.log('💾 Draft saved with ID:', permitApp.id);
      }
      
      // Only reset form for new applications (not drafts) in standalone mode
      if (isStandalone && !isDraft) {
        const newAppNum = generateApplicationNumber();
        setApplicationNumber(newAppNum);
        setFormData({...initialFormData, applicationNumber: newAppNum});
        setLastSavedDraftId(null);
      } else if (onSuccess) {
        onSuccess();
      }

      // Force page refresh for successful submissions to update dashboard data
      if (!isDraft) {
        setTimeout(() => {
          window.location.reload();
        }, 1500); // Give time for toast to show
      }

    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (lastSavedDraftId) {
      // If we have a saved draft, upload files to storage and database
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) throw new Error('Not authenticated');

        const uploadedFileData = [];
        
        for (const file of files) {
          // Upload file to storage
          const fileName = `${Date.now()}-${Math.random()}.${file.name.split('.').pop()}`;
          const filePath = `${user.user.id}/permit-documents/${fileName}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) throw uploadError;

          // Save document record to database
          const { data: docData, error: docError } = await supabase
            .from('documents')
            .insert({
              filename: file.name,
              file_path: filePath,
              file_size: file.size,
              mime_type: file.type,
              user_id: user.user.id,
              permit_id: lastSavedDraftId
            })
            .select()
            .single();

          if (docError) throw docError;
          
          uploadedFileData.push({
            id: docData.id,
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            fromDatabase: true
          });
        }
        
        toast({
          title: "Files Uploaded",
          description: `${files.length} file(s) uploaded successfully to storage.`
        });
        
        // Update form data with uploaded files
        handleInputChange('uploadedFiles', [...(formData.uploadedFiles || []), ...uploadedFileData]);
        
      } catch (error) {
        console.error('Error uploading files:', error);
        toast({
          title: "Upload Error",
          description: "Failed to upload files to storage. Saving as metadata only.",
          variant: "destructive"
        });
        
        // Fallback to metadata-only storage
        const fileData = files.map(file => ({
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        }));
        
        handleInputChange('uploadedFiles', [...(formData.uploadedFiles || []), ...fileData]);
      }
    } else {
      // For new forms without a saved draft, just store metadata
      const fileData = files.map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      }));
      
      handleInputChange('uploadedFiles', [...(formData.uploadedFiles || []), ...fileData]);
    }
  };

  const removeFile = async (fileId: string) => {
    const fileToRemove = (formData.uploadedFiles || []).find((file: any) => file.id === fileId);
    
    if (fileToRemove && fileToRemove.fromDatabase) {
      // If file is from database, also delete from storage and database
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('file_path')
          .eq('id', fileId)
          .single();
          
        if (error) throw error;
        
        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove([data.file_path]);

        if (storageError) {
          console.warn('Failed to delete from storage:', storageError);
        }

        // Delete from database
        const { error: dbError } = await supabase
          .from('documents')
          .delete()
          .eq('id', fileId);

        if (dbError) throw dbError;
        
        toast({
          title: "File Deleted",
          description: "File removed from storage and database."
        });
      } catch (error) {
        console.error('Error deleting file:', error);
        toast({
          title: "Delete Error",
          description: "Failed to delete file from storage.",
          variant: "destructive"
        });
      }
    }
    
    const updatedFiles = (formData.uploadedFiles || []).filter((file: any) => file.id !== fileId);
    handleInputChange('uploadedFiles', updatedFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const tabComponents = {
    classification: (
      <div className="space-y-4">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-amber-600" />
            <div>
              <h4 className="font-medium text-amber-800">Read-Only: Registry Assessment Required</h4>
              <p className="text-sm text-amber-700 mt-1">
                Activity classification will be determined by registry staff during initial assessment. You can view the classification once assigned.
              </p>
            </div>
          </div>
        </div>
        <ActivityClassificationStep 
          data={formData} 
          onChange={(updates) => setFormData(prev => ({ ...prev, ...updates }))}
        />
      </div>
    ),
    project: <ProjectAndSpecificDetailsTab formData={formData} handleInputChange={handleInputChange} />,
    location: <LocationTab formData={formData} handleInputChange={handleInputChange} />,
    consultation: <PublicConsultationStep data={formData} onChange={(updates) => setFormData(prev => ({ ...prev, ...updates }))} />,
    documents: <DocumentsTab formData={formData} handleInputChange={handleInputChange} handleFileUpload={handleFileUpload} removeFile={removeFile} formatFileSize={formatFileSize} permitId={permitId || lastSavedDraftId} />,
    fees: (
      <div className="space-y-4">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-amber-600" />
            <div>
              <h4 className="font-medium text-amber-800">Read-Only: Registry Fee Calculation</h4>
              <p className="text-sm text-amber-700 mt-1">
                Application fees will be calculated by registry staff based on activity classification and permit requirements. You will be notified once fees are determined.
              </p>
            </div>
          </div>
        </div>
        <ApplicationFeeStep 
          data={formData} 
          onChange={() => {}} // Disabled for public users
        />
      </div>
    ),
    
    compliance: (
      <div className="space-y-4">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-amber-600" />
            <div>
              <h4 className="font-medium text-amber-800">Read-Only: Compliance Assessment Required</h4>
              <p className="text-sm text-amber-700 mt-1">
                Compliance requirements will be assessed and verified by the Compliance division staff during the review process. You can view the compliance status once it has been evaluated.
              </p>
            </div>
          </div>
        </div>
        <ComplianceTab 
          formData={formData} 
          handleComplianceChange={handleComplianceChange}
          handleInputChange={handleInputChange}
          onNavigateToTab={setActiveTab}
        />
      </div>
    ),
    review: <ReviewSubmitStep data={formData} onChange={(updates) => setFormData(prev => ({ ...prev, ...updates }))} />,
  };

  const content = (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {isStandalone ? 'New Permit Application' : 'PNG Environment Act 2000 Permit Application'}
        </h1>
        <p className="text-muted-foreground text-lg">
          {isStandalone 
            ? 'Complete the form below to apply for an environmental permit under PNG Environment Act 2000.'
            : 'Complete all 10 steps to apply for an environmental permit'
          }
        </p>
      </div>

      <div className={`${isStandalone ? 'mb-6' : 'mb-4'} p-${isStandalone ? '4' : '3'} bg-secondary/30 rounded-lg border border-border`}>
        <Label htmlFor="applicationNumber" className="text-sm font-medium text-primary">Application Number</Label>
        <Input
          id="applicationNumber"
          type="text"
          value={formData.applicationNumber}
          readOnly
          className={`mt-1 bg-background/70 border-border/50 ${isStandalone ? 'text-lg' : ''} font-semibold`}
        />
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full grid-cols-5 md:grid-cols-9 ${isStandalone ? 'mb-8' : 'mb-6'} bg-muted/50 h-auto p-1`}>
            <TabsTrigger value="project" className="flex flex-col items-center gap-1 text-xs h-auto py-2">
              <Building className="w-4 h-4" />
              <span className="hidden sm:inline">Project</span>
              <span className="sm:hidden">Project</span>
            </TabsTrigger>
            <TabsTrigger value="location" className="flex flex-col items-center gap-1 text-xs h-auto py-2">
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">Location</span>
              <span className="sm:hidden">Location</span>
            </TabsTrigger>
            <TabsTrigger value="consultation" className="flex flex-col items-center gap-1 text-xs h-auto py-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Consultation</span>
              <span className="sm:hidden">Consult</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex flex-col items-center gap-1 text-xs h-auto py-2">
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Documents</span>
              <span className="sm:hidden">Docs</span>
            </TabsTrigger>
            <TabsTrigger value="classification" className="flex flex-col items-center gap-1 text-xs h-auto py-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Classification</span>
              <span className="sm:hidden">Class</span>
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex flex-col items-center gap-1 text-xs h-auto py-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Compliance</span>
              <span className="sm:hidden">Comply</span>
            </TabsTrigger>
            <TabsTrigger value="fees" className="flex flex-col items-center gap-1 text-xs h-auto py-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Fees</span>
              <span className="sm:hidden">Fees</span>
            </TabsTrigger>
            <TabsTrigger value="review" className="flex flex-col items-center gap-1 text-xs h-auto py-2">
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Review</span>
              <span className="sm:hidden">Review</span>
            </TabsTrigger>
          </TabsList>

          {Object.entries(tabComponents).map(([tabKey, TabComponent]) => (
            <TabsContent key={tabKey} value={tabKey}>
              {TabComponent}
            </TabsContent>
          ))}
        </Tabs>

        <div className={`flex flex-col sm:flex-row justify-between items-center ${isStandalone ? 'mt-8 pt-6' : 'mt-6 pt-4'} border-t border-border/50 gap-4`}>
          <div className="text-sm text-muted-foreground flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 text-yellow-400" />
            All fields marked with * are required.
          </div>
          <div className="flex gap-4">
            {!isStandalone && (
              <Button
                variant="outline"
                onClick={onCancel}
                className="border-muted-foreground/30 text-muted-foreground hover:bg-muted/50"
              >
                Cancel
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => handleSubmit(true)}
              className="border-primary/70 text-primary hover:bg-primary/10 hover:text-primary"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button
              onClick={() => handleSubmit(false)}
              disabled={!formData.legal_declaration_accepted || !formData.compliance_commitment}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground disabled:opacity-50"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Application
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  if (isStandalone) {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            {content}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return content;
}