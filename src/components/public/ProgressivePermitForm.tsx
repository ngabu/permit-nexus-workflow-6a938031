import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FileText, 
  MapPin, 
  Upload, 
  Building, 
  User, 
  CheckCircle, 
  AlertCircle, 
  Save,
  Send
} from 'lucide-react';
import LocationTab from '@/components/permit-application-form/LocationTab';
import ComplianceTab from '@/components/permit-application-form/ComplianceTab';
import DocumentsTab from '@/components/permit-application-form/DocumentsTab';

interface Entity {
  id: string;
  name: string;
  entity_type: string;
}

interface PrescribedActivity {
  id: string;
  category_number: string;
  category_type: string;
  level: number;
  sub_category: string;
  activity_description: string;
}

interface ProgressivePermitFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  permitId?: string; // For editing existing drafts
}

interface FormData {
  // Basic Details
  entity_id: string;
  permit_type: string;
  title: string;
  description: string;
  land_tenure: string;
  existing_permits: string;
  government_agreements: string;
  consulted_departments: string;
  required_approvals: string;
  landowner_negotiations: string;

  // Project Details
  project_scope: string;
  estimated_cost: string;
  commencement_date: string;
  completion_date: string;
  activity_classification: string;
  permit_period: string;

  // Location
  activity_location: string;
  projectLocation: string;
  coordinates: { lat: number; lng: number };
  coordinates_lat: string;
  coordinates_lng: string;
  infrastructure_locations: string;
  discharge_points: string;
  water_extraction_points: string;

  // Documents
  uploaded_files: any[];

  // Compliance
  complianceChecks: {
    environmentalAssessment: boolean;
    publicConsultation: boolean;
    technicalReview: boolean;
    legalCompliance: boolean;
  };
  activity_level: string;
  environmental_risks: string;
  mitigation_measures: string;
  environmental_impact: string;
  legal_description: string;
}

const PERMIT_TYPES = [
  'Environmental Impact Assessment',
  'Mining Permit',
  'Logging Permit',
  'Waste Management License',
  'Water Use Permit',
  'Petroleum Exploration',
  'Infrastructure Development',
  'Manufacturing License'
];

const LAND_TENURE_TYPES = [
  'Customary Land',
  'Alienated Land',
  'State Land',
  'Mixed Tenure'
];

export function ProgressivePermitForm({ onSuccess, onCancel, permitId }: ProgressivePermitFormProps) {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [prescribedActivities, setPrescribedActivities] = useState<PrescribedActivity[]>([]);
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [completedTabs, setCompletedTabs] = useState<string[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState<FormData>({
    entity_id: '',
    permit_type: '',
    title: '',
    description: '',
    land_tenure: '',
    existing_permits: '',
    government_agreements: '',
    consulted_departments: '',
    required_approvals: '',
    landowner_negotiations: '',
    project_scope: '',
    estimated_cost: '',
    commencement_date: '',
    completion_date: '',
    activity_classification: '',
    permit_period: '',
    activity_location: '',
    projectLocation: '',
    coordinates: { lat: -6.314993, lng: 143.95555 },
    coordinates_lat: '',
    coordinates_lng: '',
    infrastructure_locations: '',
    discharge_points: '',
    water_extraction_points: '',
    uploaded_files: [],
    complianceChecks: {
      environmentalAssessment: false,
      publicConsultation: false,
      technicalReview: false,
      legalCompliance: false
    },
    activity_level: '',
    environmental_risks: '',
    mitigation_measures: '',
    environmental_impact: '',
    legal_description: ''
  });

  useEffect(() => {
    fetchEntities();
    fetchPrescribedActivities();
    if (permitId) {
      loadExistingPermit();
    } else {
      loadSavedProgress();
    }
  }, [user, permitId]);

  const fetchEntities = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('entities')
        .select('id, name, entity_type')
        .order('name');

      if (error) throw error;
      setEntities(data || []);
    } catch (error) {
      console.error('Error fetching entities:', error);
    }
  };

  const fetchPrescribedActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('prescribed_activities')
        .select('*')
        .order('level', { ascending: true })
        .order('category_number', { ascending: true });

      if (error) throw error;
      setPrescribedActivities(data || []);
    } catch (error) {
      console.error('Error fetching prescribed activities:', error);
    }
  };

  const loadSavedProgress = () => {
    if (permitId) return; // Don't load saved progress when editing existing permit
    
    const saved = localStorage.getItem(`permit_draft_${user?.id}`);
    if (saved) {
      const savedData = JSON.parse(saved);
      setFormData(savedData.formData);
      setCompletedTabs(savedData.completedTabs || []);
    }
  };

  const loadExistingPermit = async () => {
    if (!permitId || !user) return;

    try {
      const { data, error } = await (supabase as any)
        .from('permit_applications')
        .select('*')
        .eq('id', permitId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      // Load associated documents
      const { data: documents, error: docsError } = await supabase
        .from('documents')
        .select('*')
        .eq('permit_id', permitId);

      if (docsError) {
        console.error('Error loading documents:', docsError);
      }

      // Map the database fields to form fields
      setFormData({
        entity_id: data.entity_id || '',
        permit_type: data.permit_type || '',
        title: data.title || '',
        description: data.description || '',
        land_tenure: data.land_type || '',
        existing_permits: data.existing_permits_details || '',
        government_agreements: data.government_agreements_details || '',
        consulted_departments: data.consulted_departments || '',
        required_approvals: data.required_approvals || '',
        landowner_negotiations: data.landowner_negotiation_status || '',
        project_scope: data.proposed_works_description || '',
        estimated_cost: data.estimated_cost_kina?.toString() || '',
        commencement_date: data.commencement_date || '',
        completion_date: data.completion_date || '',
        activity_classification: data.activity_classification || '',
        permit_period: data.permit_period || '',
        activity_location: data.activity_location || '',
        projectLocation: data.activity_location || '',
        coordinates: data.coordinates || { lat: -6.314993, lng: 143.95555 },
        coordinates_lat: data.coordinates?.lat?.toString() || '',
        coordinates_lng: data.coordinates?.lng?.toString() || '',
        infrastructure_locations: '',
        discharge_points: '',
        water_extraction_points: '',
        uploaded_files: documents?.map(doc => ({
          id: doc.id,
          name: doc.filename,
          size: doc.file_size || 0,
          type: doc.mime_type || '',
          file_path: doc.file_path,
          uploaded_at: doc.uploaded_at
        })) || [],
        complianceChecks: data.compliance_checks || {
          environmentalAssessment: false,
          publicConsultation: false,
          technicalReview: false,
          legalCompliance: false
        },
        activity_level: '',
        environmental_risks: data.environmental_impact || '',
        mitigation_measures: data.mitigation_measures || '',
        environmental_impact: data.environmental_impact || '',
        legal_description: data.legal_description || ''
      });

      // Mark tabs as completed based on available data
      const completed = [];
      if (data.entity_id && data.permit_type && data.title) completed.push('basic');
      if (data.proposed_works_description && data.estimated_cost_kina) completed.push('project');
      if (data.activity_location && data.coordinates) completed.push('location');
      if (documents && documents.length > 0) completed.push('documents');
      if (data.compliance_checks && data.environmental_impact) completed.push('compliance');
      
      setCompletedTabs(completed);
      
    } catch (error) {
      console.error('Error loading existing permit:', error);
      toast({
        title: "Error",
        description: "Failed to load permit data",
        variant: "destructive",
      });
    }
  };

  const saveProgress = () => {
    if (!user) return;

    const progressData = {
      formData,
      completedTabs,
      lastSaved: new Date().toISOString()
    };
    
    localStorage.setItem(`permit_draft_${user.id}`, JSON.stringify(progressData));
    
    toast({
      title: "Progress Saved",
      description: "Your application progress has been saved",
    });
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Handle coordinate updates
    if (field === 'coordinates') {
      setFormData(prev => ({
        ...prev,
        coordinates: value,
        coordinates_lat: value.lat?.toString() || '',
        coordinates_lng: value.lng?.toString() || ''
      }));
    }
  };

  const validateTab = (tabName: string): boolean => {
    switch (tabName) {
      case 'basic':
        return !!(formData.entity_id && formData.permit_type && formData.title);
      case 'project':
        return !!(formData.project_scope && formData.estimated_cost && formData.commencement_date);
      case 'location':
        return !!(formData.projectLocation && formData.coordinates?.lat && formData.coordinates?.lng);
      case 'documents':
        return formData.uploaded_files.length > 0;
      case 'compliance':
        return !!(formData.activity_level && formData.environmental_risks);
      default:
        return false;
    }
  };

  const handleTabChange = (tabName: string) => {
    // Mark current tab as completed if valid
    if (validateTab(activeTab) && !completedTabs.includes(activeTab)) {
      setCompletedTabs(prev => [...prev, activeTab]);
    }
    setActiveTab(tabName);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setLoading(true);
    try {
      const filePromises = files.map(async (file) => {
        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `${user?.id}/permit-documents/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Save document record to database
        const { data: docData, error: docError } = await supabase
          .from('documents')
          .insert({
            filename: file.name,
            file_path: filePath,
            file_size: file.size,
            mime_type: file.type,
            user_id: user?.id,
            permit_id: permitId || null,
          })
          .select()
          .single();

        if (docError) throw docError;

        return {
          id: docData.id,
          name: file.name,
          size: file.size,
          type: file.type,
          file_path: filePath,
          uploaded_at: docData.uploaded_at
        };
      });

      const uploadedFiles = await Promise.all(filePromises);
      handleInputChange('uploaded_files', [...(formData.uploaded_files || []), ...uploadedFiles]);

      toast({
        title: "Files Uploaded",
        description: `${files.length} file(s) uploaded successfully.`,
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload one or more files.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFile = async (fileId: string) => {
    try {
      // Find the file to get its path
      const fileToRemove = formData.uploaded_files?.find((file: any) => file.id === fileId);
      
      if (fileToRemove?.file_path) {
        // Delete from storage
        await supabase.storage.from('documents').remove([fileToRemove.file_path]);
        
        // Delete from database
        await supabase.from('documents').delete().eq('id', fileId);
      }

      // Remove from form state
      const updatedFiles = (formData.uploaded_files || []).filter((file: any) => file.id !== fileId);
      handleInputChange('uploaded_files', updatedFiles);

      toast({
        title: "File Removed",
        description: "File has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error removing file:', error);
      toast({
        title: "Error",
        description: "Failed to remove file.",
        variant: "destructive",
      });
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (isDraft = false) => {
    if (!user) return;

    setLoading(true);
    try {
      // Get entity details for denormalized fields
      const selectedEntity = entities.find(e => e.id === formData.entity_id);
      
      const permitData = {
        user_id: user.id,
        entity_id: formData.entity_id || null,
        entity_name: selectedEntity?.name || '',
        entity_type: selectedEntity?.entity_type || '',
        permit_type: formData.permit_type,
        title: formData.title,
        description: formData.description || null,
        status: isDraft ? 'draft' : 'submitted',
        application_date: new Date().toISOString(),
        activity_location: formData.projectLocation || null,
        estimated_cost_kina: formData.estimated_cost ? parseFloat(formData.estimated_cost) : null,
        commencement_date: formData.commencement_date || null,
        completion_date: formData.completion_date || null,
        activity_classification: formData.activity_classification || null,
        permit_period: formData.permit_period || null,
        coordinates: formData.coordinates || { lat: -6.314993, lng: 143.95555 },
        environmental_impact: formData.environmental_risks || null,
        mitigation_measures: formData.mitigation_measures || null,
        proposed_works_description: formData.project_scope || null,
        land_type: formData.land_tenure || null,
        existing_permits_details: formData.existing_permits || null,
        government_agreements_details: formData.government_agreements || null,
        consulted_departments: formData.consulted_departments || null,
        landowner_negotiation_status: formData.landowner_negotiations || null,
        uploaded_files: formData.uploaded_files || null,
        compliance_checks: formData.complianceChecks || null,
        legal_description: formData.legal_description || null,
        is_draft: isDraft,
        current_step: isDraft ? 1 : 5,
        updated_at: new Date().toISOString(),
      };

      let error;
      
      if (permitId) {
        // Update existing permit
        const result = await (supabase as any)
          .from('permit_applications')
          .update(permitData)
          .eq('id', permitId)
          .eq('user_id', user.id);
        error = result.error;
      } else {
        // Create new permit
        const result = await (supabase as any)
          .from('permit_applications')
          .insert([permitData]);
        error = result.error;
      }

      if (error) throw error;

      // Clear saved progress only for new applications
      if (!permitId) {
        localStorage.removeItem(`permit_draft_${user.id}`);
      }

      toast({
        title: permitId ? (isDraft ? "Draft Updated" : "Application Updated") : (isDraft ? "Draft Saved" : "Application Submitted"),
        description: permitId 
          ? (isDraft ? "Your application draft has been updated" : "Your permit application has been updated successfully")
          : (isDraft ? "Your application has been saved as a draft" : "Your permit application has been submitted successfully"),
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error submitting permit:', error);
      toast({
        title: "Error",
        description: "Failed to submit permit application",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (entities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">You need to create an entity before applying for permits.</p>
        <Button onClick={onCancel} variant="secondary">
          Go to Entity Management
        </Button>
      </div>
    );
  }

  const getTabIcon = (tabName: string) => {
    if (completedTabs.includes(tabName)) {
      return <CheckCircle className="w-4 h-4 text-success" />;
    }
    if (activeTab === tabName) {
      return <AlertCircle className="w-4 h-4 text-primary" />;
    }
    return null;
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{permitId ? 'Edit Draft Application' : 'New Permit Application'}</span>
            <Button variant="outline" onClick={saveProgress} size="sm">
              <Save className="w-4 h-4 mr-2" />
              Save Progress
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                {getTabIcon('basic')}
                <User className="w-4 h-4" />
                Basic Details
              </TabsTrigger>
              <TabsTrigger value="project" className="flex items-center gap-2">
                {getTabIcon('project')}
                <Building className="w-4 h-4" />
                Project Details
              </TabsTrigger>
              <TabsTrigger value="location" className="flex items-center gap-2">
                {getTabIcon('location')}
                <MapPin className="w-4 h-4" />
                Location
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-2">
                {getTabIcon('documents')}
                <Upload className="w-4 h-4" />
                Documents
              </TabsTrigger>
              <TabsTrigger value="compliance" className="flex items-center gap-2">
                {getTabIcon('compliance')}
                <FileText className="w-4 h-4" />
                Compliance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="entity_id">Entity *</Label>
                  <Select value={formData.entity_id} onValueChange={(value) => handleInputChange('entity_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an entity" />
                    </SelectTrigger>
                    <SelectContent>
                      {entities.map((entity) => (
                        <SelectItem key={entity.id} value={entity.id}>
                          {entity.name} ({entity.entity_type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="permit_type">Permit Type *</Label>
                  <Select value={formData.permit_type} onValueChange={(value) => handleInputChange('permit_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select permit type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PERMIT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Application Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Brief description of your permit request"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Detailed description of your permit application"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="land_tenure">Land Tenure *</Label>
                <Select value={formData.land_tenure} onValueChange={(value) => handleInputChange('land_tenure', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select land tenure type" />
                  </SelectTrigger>
                  <SelectContent>
                    {LAND_TENURE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="existing_permits">Existing Permits or Licenses</Label>
                <Textarea
                  id="existing_permits"
                  value={formData.existing_permits}
                  onChange={(e) => handleInputChange('existing_permits', e.target.value)}
                  placeholder="Provide details of any existing permits or licenses held over the area"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="government_agreements">Government Agreements</Label>
                <Textarea
                  id="government_agreements"
                  value={formData.government_agreements}
                  onChange={(e) => handleInputChange('government_agreements', e.target.value)}
                  placeholder="Details of any agreements with the Government of Papua New Guinea"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="consulted_departments">Consulted Government Departments</Label>
                <Textarea
                  id="consulted_departments"
                  value={formData.consulted_departments}
                  onChange={(e) => handleInputChange('consulted_departments', e.target.value)}
                  placeholder="List government agencies that have been consulted"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="landowner_negotiations">Landowner Negotiations Status</Label>
                <Textarea
                  id="landowner_negotiations"
                  value={formData.landowner_negotiations}
                  onChange={(e) => handleInputChange('landowner_negotiations', e.target.value)}
                  placeholder="Details of negotiations with landowner or resource owner groups"
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="project" className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="project_scope">Scope and Description of Proposed Activity *</Label>
                <Textarea
                  id="project_scope"
                  value={formData.project_scope}
                  onChange={(e) => handleInputChange('project_scope', e.target.value)}
                  placeholder="Provide a detailed description (minimum 2 pages) including project activities, environmental context, spatial footprint, and major environmental risks"
                  rows={6}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Minimum 2 pages required. Include detailed project activities, environmental context, spatial footprint, and major environmental risks.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimated_cost">Estimated Cost (Kina) *</Label>
                  <Input
                    id="estimated_cost"
                    type="number"
                    value={formData.estimated_cost}
                    onChange={(e) => handleInputChange('estimated_cost', e.target.value)}
                    placeholder="Enter estimated cost in Kina"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="permit_period">Permit Period Required</Label>
                  <Input
                    id="permit_period"
                    value={formData.permit_period}
                    onChange={(e) => handleInputChange('permit_period', e.target.value)}
                    placeholder="e.g., 5 years, 10 years"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="commencement_date">Commencement Date *</Label>
                  <Input
                    id="commencement_date"
                    type="date"
                    value={formData.commencement_date}
                    onChange={(e) => handleInputChange('commencement_date', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="completion_date">Completion Date</Label>
                  <Input
                    id="completion_date"
                    type="date"
                    value={formData.completion_date}
                    onChange={(e) => handleInputChange('completion_date', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="activity_classification">Activity Classification</Label>
                <Select value={formData.activity_classification} onValueChange={(value) => handleInputChange('activity_classification', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select the most applicable prescribed activity" />
                  </SelectTrigger>
                  <SelectContent>
                    {prescribedActivities.map((activity) => (
                      <SelectItem key={activity.id} value={activity.id}>
                        <div className="flex flex-col">
                          <span>{activity.category_number} - {activity.activity_description}</span>
                          <span className="text-sm text-muted-foreground">
                            Level {activity.level} - {activity.sub_category}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="location" className="space-y-6">
              <LocationTab 
                formData={formData} 
                handleInputChange={handleInputChange}
              />
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              <DocumentsTab 
                formData={formData} 
                handleInputChange={handleInputChange}
                handleFileUpload={handleFileUpload}
                removeFile={removeFile}
                formatFileSize={formatFileSize}
                permitId={permitId}
              />
            </TabsContent>

            <TabsContent value="compliance" className="space-y-6">
              <ComplianceTab 
                formData={formData} 
                handleComplianceChange={handleComplianceChange}
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {completedTabs.length}/5 Sections Completed
              </Badge>
            </div>
            <div className="flex space-x-2">
              <Button type="button" variant="secondary" onClick={onCancel}>
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleSubmit(true)}
                disabled={loading}
              >
                <Save className="w-4 h-4 mr-2" />
                Save as Draft
              </Button>
              <Button 
                onClick={() => handleSubmit(false)}
                disabled={loading || completedTabs.length < 4}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                <Send className="w-4 h-4 mr-2" />
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}