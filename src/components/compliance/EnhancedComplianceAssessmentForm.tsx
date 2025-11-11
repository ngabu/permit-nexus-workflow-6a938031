import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAssessmentDetail } from './hooks/useAssessmentDetail';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useFeeCalculation } from '@/hooks/useFeeCalculation';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Building,
  MapPin,
  Calendar,
  User,
  Save,
  Send,
  DollarSign,
  FileText,
  Receipt,
  XCircle,
  MessageSquare,
  Calculator
} from 'lucide-react';
import { ApplicationDetailView } from './ApplicationDetailView';
import { DocumentViewerCard } from '@/components/DocumentViewerCard';

interface AssessmentFormData {
  assessment_status: string;
  assessment_notes: string;
  compliance_score: number;
  recommendations: string;
  violations_found: string[];
  next_review_date: string;
  environmental_compliance: boolean;
  technical_compliance: boolean;
  legal_compliance: boolean;
  safety_compliance: boolean;
  waste_management_compliance: boolean;
  emission_compliance: boolean;
  water_quality_compliance: boolean;
  soil_protection_compliance: boolean;
  biodiversity_compliance: boolean;
  public_consultation_compliance: boolean;
  final_fee_amount: number;
}

interface EnhancedComplianceAssessmentFormProps {
  assessmentId: string;
  onComplete?: () => void;
}

export function EnhancedComplianceAssessmentForm({ assessmentId, onComplete }: EnhancedComplianceAssessmentFormProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { assessment: assessmentData, loading, error, updateAssessment } = useAssessmentDetail(assessmentId);
  const { calculateFees } = useFeeCalculation();
  const [saving, setSaving] = useState(false);
  const [customViolation, setCustomViolation] = useState('');
  const [documents, setDocuments] = useState<any[]>([]);
  const [prescribedActivity, setPrescribedActivity] = useState<any>(null);
  const [prescribedActivities, setPrescribedActivities] = useState<any[]>([]);
  const [calculatedFees, setCalculatedFees] = useState<any>(null);
  const [calculating, setCalculating] = useState(false);
  const [feeParameters, setFeeParameters] = useState({
    activityType: '',
    activitySubCategory: '',
    permitType: '',
    activityLevel: '',
    prescribedActivityId: '',
    duration: 1,
    projectCost: 0,
    landArea: 0,
    odsChemicalType: '',
    wasteType: ''
  });

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<AssessmentFormData>({
    defaultValues: {
      assessment_status: 'in_progress',
      assessment_notes: '',
      compliance_score: 0,
      recommendations: '',
      violations_found: [],
      next_review_date: '',
      environmental_compliance: false,
      technical_compliance: false,
      legal_compliance: false,
      safety_compliance: false,
      waste_management_compliance: false,
      emission_compliance: false,
      water_quality_compliance: false,
      soil_protection_compliance: false,
      biodiversity_compliance: false,
      public_consultation_compliance: false,
      final_fee_amount: 0,
    }
  });

  const watchedViolations = watch('violations_found') || [];
  const watchedFinalFee = watch('final_fee_amount');

  const complianceChecks = [
    { key: 'environmental_compliance', label: 'Environmental Impact Assessment', icon: '🌍', description: 'Comprehensive environmental assessment completed' },
    { key: 'technical_compliance', label: 'Technical Specifications', icon: '⚙️', description: 'Technical requirements and specifications verified' },
    { key: 'legal_compliance', label: 'Legal & Regulatory Requirements', icon: '⚖️', description: 'All legal and regulatory requirements met' },
    { key: 'safety_compliance', label: 'Health & Safety Standards', icon: '🦺', description: 'Health and safety protocols adequate' },
    { key: 'waste_management_compliance', label: 'Waste Management Plan', icon: '♻️', description: 'Waste management plan comprehensive and compliant' },
    { key: 'emission_compliance', label: 'Emission Controls', icon: '💨', description: 'Emission control measures adequate' },
    { key: 'water_quality_compliance', label: 'Water Quality Standards', icon: '💧', description: 'Water quality protection measures adequate' },
    { key: 'soil_protection_compliance', label: 'Soil Protection Measures', icon: '🌱', description: 'Soil protection and restoration plans adequate' },
    { key: 'biodiversity_compliance', label: 'Biodiversity Conservation', icon: '🦋', description: 'Biodiversity conservation measures adequate' },
    { key: 'public_consultation_compliance', label: 'Public Consultation', icon: '👥', description: 'Public consultation process completed satisfactorily' },
  ];

  const commonViolations = [
    'Incomplete Environmental Impact Assessment',
    'Missing Technical Documentation',
    'Inadequate Waste Management Plan',
    'Insufficient Emission Control Measures',
    'Non-compliance with Water Quality Standards',
    'Lack of Public Consultation Evidence',
    'Missing Safety Protocols',
    'Inadequate Biodiversity Protection Measures',
    'Incomplete Financial Guarantees',
    'Non-compliance with Zoning Regulations',
    'Missing Required Permits/Licenses',
    'Inadequate Monitoring Plans',
    'Insufficient Emergency Response Procedures'
  ];

  useEffect(() => {
    if (assessmentData) {
      // Pre-populate form with existing data
      reset({
        assessment_status: assessmentData.assessment_status || 'in_progress',
        assessment_notes: assessmentData.assessment_notes || '',
        compliance_score: assessmentData.compliance_score || 0,
        recommendations: assessmentData.recommendations || '',
        violations_found: Array.isArray(assessmentData.violations_found) 
          ? assessmentData.violations_found.map(v => String(v))
          : [],
        next_review_date: assessmentData.next_review_date ? assessmentData.next_review_date.split('T')[0] : '',
        final_fee_amount: (assessmentData as any).final_fee_amount || 0,
        ...Object.fromEntries(complianceChecks.map(check => [check.key, false]))
      });

      // Pre-populate fee parameters from application data
      const appData = assessmentData.permit_application as any;
      setFeeParameters({
        activityType: 'new', // Default for new applications
        activitySubCategory: appData?.activity_classification || appData?.activity_subcategory || '',
        permitType: appData?.permit_type || '',
        activityLevel: appData?.activity_level || '',
        prescribedActivityId: appData?.activity_id || '',
        duration: parseInt(appData?.permit_period?.split(' ')[0]) || 1,
        projectCost: appData?.estimated_cost_kina || 0,
        landArea: 0,
        odsChemicalType: appData?.ods_details?.chemical_type || '',
        wasteType: appData?.waste_contaminant_details?.type || ''
      });

      // Fetch additional data
      fetchDocuments();
      fetchPrescribedActivity();
      fetchPrescribedActivities();
    }
  }, [assessmentData, reset]);

  const fetchDocuments = async () => {
    if (!assessmentData?.permit_application?.uploaded_files) return;
    
    const fileData = Array.isArray(assessmentData.permit_application.uploaded_files) 
      ? assessmentData.permit_application.uploaded_files.map((file: any, index: number) => ({
          id: `doc-${index}`,
          name: file.name || `Document ${index + 1}`,
          size: file.size || 0,
          file_path: file.path || file.file_path || ''
        }))
      : [];
    
    setDocuments(fileData);
  };

  const fetchPrescribedActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('prescribed_activities')
        .select('*')
        .order('category_number');
      
      if (!error && data) {
        setPrescribedActivities(data);
      }
    } catch (error) {
      console.error('Error fetching prescribed activities:', error);
    }
  };

  const fetchPrescribedActivity = async () => {
    if (!assessmentData?.permit_application?.activity_id) return;

    try {
      const { data, error } = await supabase
        .from('prescribed_activities')
        .select('*')
        .eq('id', assessmentData.permit_application.activity_id)
        .single();

      if (!error && data) {
        setPrescribedActivity(data);
      }
    } catch (error) {
      console.error('Error fetching prescribed activity:', error);
    }
  };

  const calculateApplicationFees = async (feeParams = feeParameters) => {
    try {
      setCalculating(true);
      
      // Use existing fee calculation method with enhanced display
      console.log('Using enhanced fee calculation with fallback method');
      const fees = calculateFees(feeParams.activityType, feeParams.permitType, 'Green Category');
      
      if (!fees) {
        throw new Error('No fee structure found for the selected parameters');
      }

      const components = [
        {
          component_id: '1',
          component_name: 'Administration Fee',
          fee_category: 'Administration',
          calculation_method: 'Daily Rate × Processing Days',
          base_amount: fees.administrationFee,
          calculated_amount: fees.administrationFee,
          formula_used: '(Annual Recurrent Fee ÷ 365) × Processing Days',
          is_mandatory: true,
          notes: `Processing time: ${fees.processingDays} days. Form: ${fees.administrationForm}`
        },
        {
          component_id: '2',
          component_name: 'Technical Fee',
          fee_category: 'Technical',
          calculation_method: 'Work Plan Based',
          base_amount: fees.technicalFee,
          calculated_amount: fees.technicalFee,
          formula_used: 'Work Plan Amount',
          is_mandatory: true,
          notes: `Form: ${fees.technicalForm}. Enhanced assessment for ${feeParams.activityLevel} permit`
        }
      ];

      // Add special fees
      const specialFees = calculateSpecialFees(feeParams);
      components.push(...specialFees);

      const totalFee = components.reduce((sum, comp) => sum + comp.calculated_amount, 0);

      setCalculatedFees({
        totalFee,
        components,
        processingDays: 30,
        administrationForm: 'CEPA-ADM-001',
        technicalForm: 'CEPA-TECH-001'
      });
      setValue('final_fee_amount', totalFee);

      toast({
        title: "Fees Calculated Successfully",
        description: `Total fee: K${totalFee.toFixed(2)} with enhanced breakdown`,
      });

    } catch (error: any) {
      console.error('Error calculating fees:', error);
      toast({
        title: "Fee Calculation Error",
        description: error.message || "Failed to calculate fees. Please check parameters and try again.",
        variant: "destructive"
      });
    } finally {
      setCalculating(false);
    }
  };

  const calculateSpecialFees = (feeParams: any) => {
    const specialFees = [];

    // ODS Chemical Surcharge
    if (feeParams.odsChemicalType) {
      const odsSurcharge = calculateODSSurcharge(feeParams.odsChemicalType, feeParams.projectCost);
      if (odsSurcharge > 0) {
        specialFees.push({
          component_id: 'ods-surcharge',
          component_name: 'ODS Chemical Surcharge',
          fee_category: 'Special',
          calculation_method: 'Chemical Type Based',
          base_amount: odsSurcharge,
          calculated_amount: odsSurcharge,
          formula_used: `ODS ${feeParams.odsChemicalType} surcharge`,
          is_mandatory: true,
          notes: `Special fee for ${feeParams.odsChemicalType} chemical handling`
        });
      }
    }

    // Waste Management Fee
    if (feeParams.wasteType) {
      const wasteFee = calculateWasteFee(feeParams.wasteType, feeParams.landArea);
      if (wasteFee > 0) {
        specialFees.push({
          component_id: 'waste-fee',
          component_name: 'Waste Management Fee',
          fee_category: 'Special',
          calculation_method: 'Waste Type Based',
          base_amount: wasteFee,
          calculated_amount: wasteFee,
          formula_used: `${feeParams.wasteType} waste processing fee`,
          is_mandatory: true,
          notes: `Special fee for ${feeParams.wasteType} waste management`
        });
      }
    }

    return specialFees;
  };

  const calculateODSSurcharge = (chemicalType: string, projectCost: number): number => {
    const surchargeRates: Record<string, number> = {
      'CFC': 500,
      'HCFC': 300,
      'HFC': 200,
      'Halons': 800,
      'other': 250
    };
    
    const baseRate = surchargeRates[chemicalType] || surchargeRates['other'];
    const costMultiplier = projectCost > 100000 ? 1.5 : 1.0;
    
    return baseRate * costMultiplier;
  };

  const calculateWasteFee = (wasteType: string, landArea: number): number => {
    const wasteRates: Record<string, number> = {
      'hazardous': 1000,
      'industrial': 500,
      'chemical': 800,
      'medical': 1200,
      'radioactive': 2000,
      'other': 300
    };
    
    const baseRate = wasteRates[wasteType] || wasteRates['other'];
    const areaMultiplier = landArea > 5000 ? 1.3 : landArea > 1000 ? 1.1 : 1.0;
    
    return baseRate * areaMultiplier;
  };

  useEffect(() => {
    if (feeParameters.activityType && feeParameters.activitySubCategory && feeParameters.permitType && feeParameters.activityLevel) {
      calculateApplicationFees();
    }
  }, [feeParameters]);

  const addViolation = (violation: string) => {
    const currentViolations = watchedViolations;
    if (!currentViolations.includes(violation)) {
      setValue('violations_found', [...currentViolations, violation]);
    }
  };

  const removeViolation = (violation: string) => {
    const currentViolations = watchedViolations;
    setValue('violations_found', currentViolations.filter(v => v !== violation));
  };

  const addCustomViolation = () => {
    if (customViolation.trim() && !watchedViolations.includes(customViolation.trim())) {
      addViolation(customViolation.trim());
      setCustomViolation('');
    }
  };

  const calculateComplianceScore = () => {
    const totalChecks = complianceChecks.length;
    const passedChecks = complianceChecks.filter(check => 
      watch(check.key as keyof AssessmentFormData)
    ).length;
    
    const baseScore = (passedChecks / totalChecks) * 100;
    const violationPenalty = watchedViolations.length * 5; // 5 points per violation
    
    return Math.max(0, Math.round(baseScore - violationPenalty));
  };

  const generateInvoice = async () => {
    if (!assessmentData?.permit_application || !watchedFinalFee || watchedFinalFee <= 0) return;

    try {
      const invoiceNumber = `INV-${Date.now()}`;
      const { error } = await supabase
        .from('financial_transactions')
        .insert({
          user_id: assessmentData.permit_application.user_id,
          permit_id: assessmentData.permit_application.id,
          transaction_type: 'permit_fee',
          transaction_number: invoiceNumber,
          amount: watchedFinalFee,
          currency: 'PGK',
          status: 'pending',
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        });

      if (error) throw error;

      toast({
        title: "Invoice Generated",
        description: `Invoice ${invoiceNumber} has been generated for K${watchedFinalFee.toFixed(2)}`,
      });
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast({
        title: "Error",
        description: "Failed to generate invoice",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: AssessmentFormData, isSubmission = false) => {
    try {
      setSaving(true);
      
      const finalComplianceScore = calculateComplianceScore();
      
      const updateData = {
        assessment_status: isSubmission ? data.assessment_status : 'in_progress',
        assessment_notes: data.assessment_notes,
        compliance_score: finalComplianceScore,
        recommendations: data.recommendations,
        violations_found: data.violations_found,
        next_review_date: data.next_review_date || null,
      };

      const result = await updateAssessment(updateData);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Generate invoice if assessment is approved and fee is set
      if (isSubmission && data.assessment_status === 'passed' && data.final_fee_amount > 0) {
        await generateInvoice();
      }

      toast({
        title: isSubmission ? "Assessment Submitted" : "Assessment Saved",
        description: isSubmission 
          ? "The compliance assessment has been submitted successfully."
          : "Assessment progress has been saved.",
      });

      if (isSubmission && onComplete) {
        onComplete();
      }

    } catch (error: any) {
      console.error('Error saving assessment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save assessment.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex justify-center items-center">
            <Clock className="w-6 h-6 mr-2 animate-spin" />
            Loading assessment data...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !assessmentData) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <h3 className="text-lg font-medium mb-2">Assessment Not Found</h3>
            <p className="text-muted-foreground">
              {error || "The requested assessment could not be found."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data, false))}>
      <div className="space-y-6">
        {/* Assessment Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary" />
                <div>
                  <CardTitle className="text-xl">
                    {assessmentData.permit_application?.title || 'Compliance Assessment'}
                  </CardTitle>
                  <CardDescription>
                    Application #{assessmentData.permit_application?.application_number} • {assessmentData.permit_application?.permit_type}
                    {prescribedActivity && ` • Level ${prescribedActivity.level}`}
                  </CardDescription>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="mb-2">
                  Compliance Score: {calculateComplianceScore()}%
                </Badge>
                <div className="text-sm text-muted-foreground">
                  Status: <span className="font-medium">{assessmentData.assessment_status}</span>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="application" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="application">Application</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="registry">Registry Feedback</TabsTrigger>
            <TabsTrigger value="compliance">Compliance Review</TabsTrigger>
            <TabsTrigger value="fees">Fees & Invoice</TabsTrigger>
            <TabsTrigger value="decision">Final Decision</TabsTrigger>
          </TabsList>

          <TabsContent value="application">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="w-5 h-5 mr-2" />
                    Application Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ApplicationDetailView 
                    application={assessmentData.permit_application}
                    initialAssessment={assessmentData.initial_assessment}
                  />
                </CardContent>
              </Card>

              {prescribedActivity && (
                <Card>
                  <CardHeader>
                    <CardTitle>Prescribed Activity Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Category Number</Label>
                        <p className="text-sm">{prescribedActivity.category_number}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Level</Label>
                        <Badge variant="outline">Level {prescribedActivity.level}</Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Activity Description</Label>
                      <p className="text-sm text-muted-foreground">{prescribedActivity.activity_description}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Category Type</Label>
                      <p className="text-sm">{prescribedActivity.category_type}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Submitted Documents Review
                </CardTitle>
                <CardDescription>
                  Review all documents submitted with the application for compliance verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                {documents.length > 0 ? (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <DocumentViewerCard key={doc.id} file={doc} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-8 h-8 mx-auto mb-2" />
                    <p>No documents submitted with this application</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="registry">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Registry Assessment & Feedback
                </CardTitle>
                <CardDescription>
                  Comprehensive review of registry team's initial assessment, findings, and specific requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                {assessmentData.initial_assessment ? (
                  <div className="space-y-6">
                    {/* Assessment Status Overview */}
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                      <div className="flex items-center gap-3">
                        {assessmentData.initial_assessment.assessment_status === 'passed' ? (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        ) : assessmentData.initial_assessment.assessment_status === 'failed' ? (
                          <XCircle className="w-6 h-6 text-red-500" />
                        ) : (
                          <AlertTriangle className="w-6 h-6 text-yellow-500" />
                        )}
                        <div>
                          <span className="font-semibold text-lg">
                            Registry Status: {assessmentData.initial_assessment.assessment_status.replace('_', ' ').toUpperCase()}
                          </span>
                          <p className="text-sm text-muted-foreground">
                            Assessment completed on {new Date(assessmentData.initial_assessment.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant={
                          assessmentData.initial_assessment.assessment_status === 'passed' ? 'default' : 
                          assessmentData.initial_assessment.assessment_status === 'failed' ? 'destructive' : 'secondary'
                        }
                        className="text-sm px-3 py-1"
                      >
                        {assessmentData.initial_assessment.assessment_status === 'passed' ? 'APPROVED' :
                         assessmentData.initial_assessment.assessment_status === 'failed' ? 'REJECTED' : 'PENDING'}
                      </Badge>
                    </div>

                    {/* Assessment Details Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Assessment Outcome */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                            Assessment Outcome
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm leading-relaxed">{assessmentData.initial_assessment.assessment_outcome}</p>
                        </CardContent>
                      </Card>

                      {/* Registry Notes */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center">
                            <MessageSquare className="w-4 h-4 mr-2 text-blue-500" />
                            Registry Assessment Notes
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm leading-relaxed">{assessmentData.initial_assessment.assessment_notes}</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Specific Feedback Section */}
                    {assessmentData.initial_assessment.feedback_provided && (
                      <Card className="border-l-4 border-l-blue-500">
                        <CardHeader className="bg-blue-50/50">
                          <CardTitle className="text-base flex items-center text-blue-800">
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            🎯 Priority Focus Areas for Compliance Assessment
                          </CardTitle>
                          <CardDescription className="text-blue-600">
                            Specific guidance from registry team to prioritize your technical assessment
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="bg-blue-50/30">
                          <div className="p-4 bg-white rounded-lg border border-blue-200">
                            <p className="text-sm leading-relaxed text-blue-900">
                              {assessmentData.initial_assessment.feedback_provided}
                            </p>
                          </div>
                          <div className="mt-3 flex items-start gap-2">
                            <div className="text-blue-600 text-xs font-medium">💡 Assessment Tip:</div>
                            <p className="text-xs text-blue-600 leading-relaxed">
                              Use this guidance to structure your compliance review and ensure all priority areas are thoroughly assessed
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Assessment Timeline & Metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg">
                        <Label className="text-sm font-medium text-muted-foreground">Assessment Date</Label>
                        <p className="text-sm font-medium mt-1">
                          {new Date(assessmentData.initial_assessment.created_at).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <Label className="text-sm font-medium text-muted-foreground">Activity Type</Label>
                        <p className="text-sm font-medium mt-1">
                          Standard Assessment
                        </p>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <Label className="text-sm font-medium text-muted-foreground">Forwarded to Compliance</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {assessmentData.initial_assessment.assessment_status === 'passed' ? 'Yes' : 'No'}
                          </Badge>
                          {assessmentData.initial_assessment.assessment_status === 'passed' && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Items for Compliance Officer */}
                    <Card className="bg-green-50/50 border-green-200">
                      <CardHeader>
                        <CardTitle className="text-base text-green-800 flex items-center">
                          <Shield className="w-4 h-4 mr-2" />
                          Compliance Officer Action Items
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                            <p className="text-sm text-green-800">
                              Review registry assessment findings and incorporate into technical evaluation
                            </p>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                            <p className="text-sm text-green-800">
                              Focus on priority areas highlighted in registry feedback
                            </p>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                            <p className="text-sm text-green-800">
                              Ensure all technical compliance requirements are verified based on activity classification
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">No Registry Assessment Available</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      This application has not yet been processed by the registry team. 
                      Registry assessment must be completed before compliance review can proceed.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance">
            <div className="space-y-6">
              {/* Compliance Checklist */}
              <Card>
                <CardHeader>
                  <CardTitle>Technical Compliance Assessment</CardTitle>
                  <CardDescription>
                    Conduct systematic review based on permit type, activity level, and registry guidance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {complianceChecks.map((check) => (
                      <div key={check.key} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          id={check.key}
                          {...register(check.key as keyof AssessmentFormData)}
                          onCheckedChange={(checked) => setValue(check.key as keyof AssessmentFormData, !!checked)}
                        />
                        <div className="flex-1">
                          <Label htmlFor={check.key} className="text-sm font-medium cursor-pointer flex items-center">
                            <span className="mr-2">{check.icon}</span>
                            {check.label}
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">{check.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Violations and Issues */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Violations & Non-Compliance Issues
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Common Violations</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {commonViolations.map((violation) => (
                        <Button
                          key={violation}
                          type="button"
                          variant={watchedViolations.includes(violation) ? "default" : "outline"}
                          size="sm"
                          onClick={() => 
                            watchedViolations.includes(violation) 
                              ? removeViolation(violation)
                              : addViolation(violation)
                          }
                          className="justify-start text-left h-auto py-2 px-3"
                        >
                          {violation}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Add custom violation..."
                      value={customViolation}
                      onChange={(e) => setCustomViolation(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomViolation())}
                    />
                    <Button type="button" onClick={addCustomViolation}>Add</Button>
                  </div>

                  {watchedViolations.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Selected Violations:</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {watchedViolations.map((violation) => (
                          <Badge
                            key={violation}
                            variant="destructive"
                            className="cursor-pointer"
                            onClick={() => removeViolation(violation)}
                          >
                            {violation} ×
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Assessment Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Assessment Notes & Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="assessment_notes">Detailed Assessment Notes</Label>
                    <Textarea
                      id="assessment_notes"
                      {...register('assessment_notes')}
                      placeholder="Provide detailed notes on your technical assessment..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="recommendations">Recommendations</Label>
                    <Textarea
                      id="recommendations"
                      {...register('recommendations')}
                      placeholder="Provide recommendations for approval, modifications, or rejection..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="next_review_date">Next Review Date (if applicable)</Label>
                    <Input
                      id="next_review_date"
                      type="date"
                      {...register('next_review_date')}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="fees">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Fee Calculation & Invoice Generation
                </CardTitle>
                <CardDescription>
                  Review and adjust fee parameters based on compliance assessment, then generate invoice
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Fee Parameters Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Fee Calculation Parameters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="activityType">Activity Type</Label>
                        <Select
                          value={feeParameters.activityType}
                          onValueChange={(value) => setFeeParameters(prev => ({ ...prev, activityType: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select activity type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New Application</SelectItem>
                            <SelectItem value="amendment">Amendment</SelectItem>
                            <SelectItem value="transfer">Transfer</SelectItem>
                            <SelectItem value="amalgamation">Amalgamation</SelectItem>
                            <SelectItem value="renewal">Renewal</SelectItem>
                            <SelectItem value="surrender">Surrender</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="prescribedActivity">Prescribed Activity</Label>
                        <Select
                          value={feeParameters.prescribedActivityId || ''}
                          onValueChange={(value) => {
                            const activity = prescribedActivities?.find(a => a.id === value);
                            setFeeParameters(prev => ({ 
                              ...prev, 
                              prescribedActivityId: value,
                              activitySubCategory: activity?.activity_description || ''
                            }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select prescribed activity" />
                          </SelectTrigger>
                          <SelectContent>
                            {prescribedActivities?.filter(activity => activity.id && activity.id.trim() !== '').map((activity) => (
                              <SelectItem key={activity.id} value={activity.id}>
                                {activity.category_number} - {activity.activity_description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="permitType">Permit Type</Label>
                        <Select
                          value={feeParameters.permitType}
                          onValueChange={(value) => setFeeParameters(prev => ({ ...prev, permitType: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select permit type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Environment Permit">Environment Permit</SelectItem>
                            <SelectItem value="Water Permit">Water Permit</SelectItem>
                            <SelectItem value="Waste Permit">Waste Permit</SelectItem>
                            <SelectItem value="Air Permit">Air Permit</SelectItem>
                            <SelectItem value="Mining Permit">Mining Permit</SelectItem>
                            <SelectItem value="Industrial Permit">Industrial Permit</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="activityLevel">Activity Level</Label>
                        <Select
                          value={feeParameters.activityLevel}
                          onValueChange={(value) => setFeeParameters(prev => ({ ...prev, activityLevel: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select activity level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Level 1</SelectItem>
                            <SelectItem value="2">Level 2</SelectItem>
                            <SelectItem value="3">Level 3</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                    <div>
                      <Label htmlFor="duration">Duration (Years)</Label>
                      <Input
                        type="number"
                        value={feeParameters.duration}
                        onChange={(e) => setFeeParameters(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))}
                        min="1"
                        max="25"
                      />
                    </div>

                    <div>
                      <Label htmlFor="projectCost">Project Cost (PGK)</Label>
                      <Input
                        type="number"
                        value={feeParameters.projectCost}
                        onChange={(e) => setFeeParameters(prev => ({ ...prev, projectCost: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <Label htmlFor="landArea">Land Area (sqm)</Label>
                      <Input
                        type="number"
                        value={feeParameters.landArea}
                        onChange={(e) => setFeeParameters(prev => ({ ...prev, landArea: parseFloat(e.target.value) || 0 }))}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <Label htmlFor="odsChemicalType">ODS Chemical Type</Label>
                      <Select
                        value={feeParameters.odsChemicalType}
                        onValueChange={(value) => setFeeParameters(prev => ({ ...prev, odsChemicalType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select if applicable" />
                        </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="none">None</SelectItem>
                          <SelectItem value="CFC">CFC (Chlorofluorocarbons)</SelectItem>
                          <SelectItem value="HCFC">HCFC (Hydrochlorofluorocarbons)</SelectItem>
                          <SelectItem value="HFC">HFC (Hydrofluorocarbons)</SelectItem>
                          <SelectItem value="Halons">Halons</SelectItem>
                          <SelectItem value="other">Other ODS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="wasteType">Waste Type</Label>
                      <Select
                        value={feeParameters.wasteType}
                        onValueChange={(value) => setFeeParameters(prev => ({ ...prev, wasteType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select if applicable" />
                        </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="none">None</SelectItem>
                          <SelectItem value="hazardous">Hazardous Waste</SelectItem>
                          <SelectItem value="industrial">Industrial Waste</SelectItem>
                          <SelectItem value="chemical">Chemical Waste</SelectItem>
                          <SelectItem value="medical">Medical Waste</SelectItem>
                          <SelectItem value="radioactive">Radioactive Waste</SelectItem>
                          <SelectItem value="other">Other Waste</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      onClick={() => calculateApplicationFees()}
                      disabled={calculating}
                      className="flex-1"
                    >
                      {calculating ? (
                        <>
                          <Calculator className="w-4 h-4 mr-2 animate-spin" />
                          Calculating...
                        </>
                      ) : (
                        <>
                          <Calculator className="w-4 h-4 mr-2" />
                          Calculate Enhanced Fees
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Parameter Validation */}
                  {(!feeParameters.activityType || !feeParameters.permitType || !feeParameters.activityLevel) && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-destructive">Missing Required Parameters</p>
                          <ul className="list-disc list-inside mt-1 text-destructive/80">
                            {!feeParameters.activityType && <li>Activity Type is required</li>}
                            {!feeParameters.permitType && <li>Permit Type is required</li>}
                            {!feeParameters.activityLevel && <li>Activity Level is required</li>}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Fee Display Section */}
                {calculatedFees ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Calculated Fees</h3>
                    
                    {calculatedFees.components && calculatedFees.components.length > 0 && (
                      <div className="space-y-3">
                        {calculatedFees.components.map((component: any, index: number) => (
                          <div key={component.component_id || index} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Label className="text-sm font-medium">{component.component_name}</Label>
                                  <Badge variant={component.is_mandatory ? "default" : "secondary"} className="text-xs">
                                    {component.is_mandatory ? "Mandatory" : "Optional"}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">{component.fee_category}</Badge>
                                </div>
                                
                                <div className="space-y-1">
                                  <p className="text-xs text-muted-foreground">
                                    <strong>Method:</strong> {component.calculation_method}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    <strong>Formula:</strong> {component.formula_used}
                                  </p>
                                  {component.notes && (
                                    <p className="text-xs text-blue-600 flex items-start gap-1">
                                      <span className="text-blue-500">ℹ</span>
                                      {component.notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              <div className="text-right ml-4">
                                <p className="text-lg font-semibold">
                                  K{component.calculated_amount.toFixed(2)}
                                </p>
                                {component.base_amount !== component.calculated_amount && (
                                  <p className="text-xs text-muted-foreground">
                                    Base: K{component.base_amount.toFixed(2)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <Label className="text-sm font-medium">Total Calculated Fee</Label>
                          <p className="text-2xl font-bold text-primary">K{calculatedFees.totalFee.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="final_fee_amount">Final Fee Amount (K)</Label>
                      <Input
                        id="final_fee_amount"
                        type="number"
                        step="0.01"
                        {...register('final_fee_amount', { valueAsNumber: true })}
                        placeholder="Confirm or adjust final fee amount"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Adjust if necessary based on assessment findings
                      </p>
                    </div>

                    {watchedFinalFee > 0 && (
                      <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div>
                          <Label className="text-sm font-medium text-green-800">Ready to Generate Invoice</Label>
                          <p className="text-sm text-green-700">Invoice will be created for K{watchedFinalFee.toFixed(2)}</p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          onClick={generateInvoice}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Receipt className="w-4 h-4 mr-2" />
                          Generate Invoice
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                    <p>Complete the fee parameters above and click "Recalculate Fees" to see fee breakdown</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="decision">
            <Card>
              <CardHeader>
                <CardTitle>Final Assessment Decision</CardTitle>
                <CardDescription>
                  Make final decision based on technical assessment and compliance review
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="assessment_status">Assessment Decision</Label>
                  <Select
                    onValueChange={(value) => setValue('assessment_status', value)}
                    defaultValue={watch('assessment_status')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select final decision" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="passed">✅ Approve Application</SelectItem>
                      <SelectItem value="failed">❌ Reject Application</SelectItem>
                      <SelectItem value="requires_clarification">📋 Request Clarification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="font-medium">Compliance Score</Label>
                      <p className="text-lg font-bold text-primary">{calculateComplianceScore()}%</p>
                    </div>
                    <div>
                      <Label className="font-medium">Violations Found</Label>
                      <p className="text-lg font-bold text-destructive">{watchedViolations.length}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSubmit((data) => onSubmit(data, false))}
                    disabled={saving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Progress
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSubmit((data) => onSubmit(data, true))}
                    disabled={saving || !watch('assessment_status') || watch('assessment_status') === 'in_progress'}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit Final Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </form>
  );
}