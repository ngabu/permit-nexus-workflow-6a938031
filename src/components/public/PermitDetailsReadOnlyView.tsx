import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, MapPin, CheckCircle, AlertCircle, DollarSign, Building, Users, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ComprehensivePermitDetailsReadOnly } from '@/components/registry/read-only/ComprehensivePermitDetailsReadOnly';
import { ActivityClassificationStep } from '@/components/public/steps/ActivityClassificationStep';
import { useToast } from '@/hooks/use-toast';

interface Permit {
  id: string;
  permit_number?: string;
  permit_type: string;
  title: string;
  description?: string;
  status: string;
  application_date?: string;
  approval_date?: string;
  expiry_date?: string;
  entity_id: string;
  entity_name?: string;
  entity_type?: string;
  activity_id?: string;
  activity_classification?: string;
  activity_category?: string;
  activity_subcategory?: string;
  activity_level?: string;
  permit_period?: string;
  activity_location?: string;
  coordinates?: any;
  proposed_works_description?: string;
  operational_details?: string;
  operational_capacity?: string;
  operating_hours?: string;
  environmental_impact?: string;
  mitigation_measures?: string;
  fee_amount?: number;
  application_fee?: number;
  payment_status?: string;
  commencement_date?: string;
  completion_date?: string;
  estimated_cost_kina?: number;
  eia_required?: boolean;
  eis_required?: boolean;
  consultation_period_start?: string;
  consultation_period_end?: string;
  permit_type_specific?: string;
  permit_specific_fields?: any;
  legal_declaration_accepted?: boolean;
  compliance_commitment?: boolean;
}

interface PermitDetailsReadOnlyViewProps {
  permit: Permit;
}

export function PermitDetailsReadOnlyView({ permit }: PermitDetailsReadOnlyViewProps) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [entity, setEntity] = useState<any>(null);
  const [initialAssessment, setInitialAssessment] = useState<any>(null);
  const [complianceAssessment, setComplianceAssessment] = useState<any>(null);
  const [feePayments, setFeePayments] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [classificationData, setClassificationData] = useState<any>({
    activity_level: permit.activity_level || '',
    activity_id: permit.activity_id || '',
    activity_category: permit.activity_category || '',
    activity_subcategory: permit.activity_subcategory || '',
    activity_classification: permit.activity_classification || '',
    eia_required: permit.eia_required || false,
    eis_required: permit.eis_required || false,
  });
  const [isSavingClassification, setIsSavingClassification] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchAllData = async () => {
      if (!permit.id) return;
      
      try {
        setLoading(true);
        
        // Fetch documents
        const { data: docsData } = await supabase
          .from('documents')
          .select('*')
          .eq('permit_id', permit.id);
        
        if (docsData) setDocuments(docsData);
        
        // Fetch entity details
        if (permit.entity_id) {
          const { data: entityData } = await supabase
            .from('entities')
            .select('*')
            .eq('id', permit.entity_id)
            .single();
          
          if (entityData) setEntity(entityData);
        }
        
        // Fetch initial assessment
        const { data: initialAssessmentData } = await supabase
          .from('initial_assessments')
          .select(`
            *,
            profiles:assessed_by (
              first_name,
              last_name,
              email
            )
          `)
          .eq('permit_application_id', permit.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (initialAssessmentData) setInitialAssessment(initialAssessmentData);
        
        // Fetch compliance assessment
        const { data: complianceAssessmentData } = await supabase
          .from('compliance_assessments')
          .select(`
            *,
            assessed_by_profile:assessed_by (
              first_name,
              last_name,
              email
            ),
            assigned_by_profile:assigned_by (
              first_name,
              last_name,
              email
            )
          `)
          .eq('permit_application_id', permit.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (complianceAssessmentData) setComplianceAssessment(complianceAssessmentData);
        
        // Fetch fee payments
        const { data: feePaymentsData } = await supabase
          .from('fee_payments')
          .select(`
            *,
            calculated_by_profile:calculated_by (
              first_name,
              last_name,
              email
            ),
            approved_by_profile:approved_by (
              first_name,
              last_name,
              email
            )
          `)
          .eq('permit_application_id', permit.id)
          .order('created_at', { ascending: false });
        
        if (feePaymentsData) setFeePayments(feePaymentsData);
        
        // Fetch permit activities
        const { data: activitiesData } = await supabase
          .from('permit_activities')
          .select('*')
          .eq('permit_id', permit.id)
          .order('created_at', { ascending: false });
        
        if (activitiesData) setActivities(activitiesData);
        
      } catch (error) {
        console.error('Error fetching permit details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, [permit.id, permit.entity_id]);

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      under_initial_review: 'bg-yellow-100 text-yellow-800',
      under_technical_review: 'bg-orange-100 text-orange-800',
      requires_clarification: 'bg-amber-100 text-amber-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-orange-100 text-orange-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'Not calculated';
    return `PGK ${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-4">
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-sm text-muted-foreground">Loading permit details...</div>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{permit.title}</h3>
          {permit.permit_number && (
            <p className="text-sm text-muted-foreground">Permit #{permit.permit_number}</p>
          )}
        </div>
        <Badge className={getStatusColor(permit.status)}>
          {permit.status.replace('_', ' ').toUpperCase()}
        </Badge>
      </div>

      <Tabs defaultValue="project" className="w-full">
        <TabsList className="grid w-full grid-cols-8 bg-glass border-glass">
          <TabsTrigger value="project" className="text-xs flex flex-col items-center gap-1 py-2">
            <Building className="w-4 h-4" />
            <span>Project</span>
          </TabsTrigger>
          <TabsTrigger value="location" className="text-xs flex flex-col items-center gap-1 py-2">
            <MapPin className="w-4 h-4" />
            <span>Location</span>
          </TabsTrigger>
          <TabsTrigger value="consultation" className="text-xs flex flex-col items-center gap-1 py-2">
            <Users className="w-4 h-4" />
            <span>Consultation</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-xs flex flex-col items-center gap-1 py-2">
            <FileText className="w-4 h-4" />
            <span>Documents</span>
          </TabsTrigger>
          <TabsTrigger value="classification" className="text-xs flex flex-col items-center gap-1 py-2">
            <Activity className="w-4 h-4" />
            <span>Classification</span>
          </TabsTrigger>
          <TabsTrigger value="compliance" className="text-xs flex flex-col items-center gap-1 py-2">
            <CheckCircle className="w-4 h-4" />
            <span>Compliance</span>
          </TabsTrigger>
          <TabsTrigger value="fees" className="text-xs flex flex-col items-center gap-1 py-2">
            <DollarSign className="w-4 h-4" />
            <span>Fees</span>
          </TabsTrigger>
          <TabsTrigger value="review" className="text-xs flex flex-col items-center gap-1 py-2">
            <CheckCircle className="w-4 h-4" />
            <span>Review</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {/* PROJECT TAB */}
          <TabsContent value="project" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <Building className="w-4 h-4 mr-2" />
                  Project Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Permit Type</label>
                    <p className="text-sm text-foreground">{permit.permit_type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Entity</label>
                    <p className="text-sm text-foreground">{permit.entity_name || 'No Entity'} ({permit.entity_type || 'Unknown'})</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Application Date</label>
                    <p className="text-sm text-foreground">{formatDate(permit.application_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Permit Period</label>
                    <p className="text-sm text-foreground">{permit.permit_period || 'Not specified'}</p>
                  </div>
                  {permit.approval_date && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Approval Date</label>
                      <p className="text-sm text-foreground">{formatDate(permit.approval_date)}</p>
                    </div>
                  )}
                  {permit.expiry_date && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Expiry Date</label>
                      <p className="text-sm text-foreground">{formatDate(permit.expiry_date)}</p>
                    </div>
                  )}
                  {permit.commencement_date && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Commencement Date</label>
                      <p className="text-sm text-foreground">{formatDate(permit.commencement_date)}</p>
                    </div>
                  )}
                  {permit.completion_date && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Completion Date</label>
                      <p className="text-sm text-foreground">{formatDate(permit.completion_date)}</p>
                    </div>
                  )}
                  {permit.estimated_cost_kina && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Estimated Project Cost</label>
                      <p className="text-sm text-foreground">{formatCurrency(permit.estimated_cost_kina)}</p>
                    </div>
                  )}
                </div>
                {permit.description && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p className="text-sm mt-1 text-foreground">{permit.description}</p>
                  </div>
                )}
                {permit.environmental_impact && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Environmental Impact</label>
                    <p className="text-sm mt-1 text-foreground">{permit.environmental_impact}</p>
                  </div>
                )}
                {permit.mitigation_measures && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Mitigation Measures</label>
                    <p className="text-sm mt-1 text-foreground">{permit.mitigation_measures}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <ComprehensivePermitDetailsReadOnly application={permit} />
          </TabsContent>

          {/* LOCATION TAB */}
          <TabsContent value="location" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Location Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {permit.activity_location && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Activity Location</label>
                    <p className="text-sm text-foreground">{permit.activity_location}</p>
                  </div>
                )}
                
                {permit.coordinates && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Coordinates</label>
                    <p className="text-sm text-foreground">
                      Latitude: {permit.coordinates.lat}, Longitude: {permit.coordinates.lng}
                    </p>
                  </div>
                )}

                {permit.proposed_works_description && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Proposed Works Description</label>
                    <p className="text-sm mt-1 text-foreground">{permit.proposed_works_description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* CONSULTATION TAB */}
          <TabsContent value="consultation" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Public Consultation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(permit.consultation_period_start || permit.consultation_period_end) && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Public Consultation Period</label>
                    <p className="text-sm text-foreground">
                      {formatDate(permit.consultation_period_start)} - {formatDate(permit.consultation_period_end)}
                    </p>
                  </div>
                )}
                {(!permit.consultation_period_start && !permit.consultation_period_end) && (
                  <p className="text-sm text-muted-foreground">No public consultation period recorded</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* DOCUMENTS TAB */}
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Supporting Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {documents.length > 0 ? (
                  <div className="space-y-3">
                    {documents.map((doc: any) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-foreground">{doc.filename}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.document_type} • {new Date(doc.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No documents uploaded</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* CLASSIFICATION TAB */}
          <TabsContent value="classification" className="space-y-4">
            <ActivityClassificationStep
              data={classificationData}
              onChange={(updates) => setClassificationData({ ...classificationData, ...updates })}
            />
            
            {(permit.status === 'draft' || permit.status === 'pending') && (
              <div className="flex justify-end">
                <Button 
                  onClick={async () => {
                    setIsSavingClassification(true);
                    try {
                      const { error } = await supabase
                        .from('permit_applications')
                        .update({
                          activity_level: classificationData.activity_level,
                          activity_id: classificationData.activity_id,
                          activity_category: classificationData.activity_category,
                          activity_subcategory: classificationData.activity_subcategory,
                          activity_classification: classificationData.activity_classification,
                          eia_required: classificationData.eia_required,
                          eis_required: classificationData.eis_required,
                          updated_at: new Date().toISOString(),
                        })
                        .eq('id', permit.id);

                      if (error) throw error;

                      toast({
                        title: 'Success',
                        description: 'Activity classification updated successfully',
                      });
                    } catch (error) {
                      console.error('Error updating classification:', error);
                      toast({
                        title: 'Error',
                        description: 'Failed to update activity classification',
                        variant: 'destructive',
                      });
                    } finally {
                      setIsSavingClassification(false);
                    }
                  }}
                  disabled={isSavingClassification}
                >
                  {isSavingClassification ? 'Saving...' : 'Save Classification'}
                </Button>
              </div>
            )}
          </TabsContent>

          {/* COMPLIANCE TAB */}
          <TabsContent value="compliance" className="space-y-4">
            {complianceAssessment ? (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Compliance Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Assessment Status</label>
                      <Badge className={`mt-1 ${
                        complianceAssessment.assessment_status === 'passed' ? 'bg-green-100 text-green-800' :
                        complianceAssessment.assessment_status === 'failed' ? 'bg-red-100 text-red-800' :
                        complianceAssessment.assessment_status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {complianceAssessment.assessment_status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Assessment Date</label>
                      <p className="text-sm text-foreground">{formatDate(complianceAssessment.created_at)}</p>
                    </div>
                    {complianceAssessment.assessed_by_profile && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Assessed By</label>
                        <p className="text-sm text-foreground">
                          {complianceAssessment.assessed_by_profile.first_name} {complianceAssessment.assessed_by_profile.last_name}
                        </p>
                      </div>
                    )}
                    {complianceAssessment.assigned_by_profile && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Assigned By</label>
                        <p className="text-sm text-foreground">
                          {complianceAssessment.assigned_by_profile.first_name} {complianceAssessment.assigned_by_profile.last_name}
                        </p>
                      </div>
                    )}
                    {complianceAssessment.compliance_score !== null && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Compliance Score</label>
                        <p className="text-sm text-foreground">{complianceAssessment.compliance_score}%</p>
                      </div>
                    )}
                    {complianceAssessment.next_review_date && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Next Review Date</label>
                        <p className="text-sm text-foreground">{formatDate(complianceAssessment.next_review_date)}</p>
                      </div>
                    )}
                  </div>
                  
                  {complianceAssessment.assessment_notes && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Assessment Notes</label>
                      <p className="text-sm mt-1 text-foreground whitespace-pre-wrap">{complianceAssessment.assessment_notes}</p>
                    </div>
                  )}
                  
                  {complianceAssessment.recommendations && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Recommendations</label>
                      <p className="text-sm mt-1 text-foreground whitespace-pre-wrap">{complianceAssessment.recommendations}</p>
                    </div>
                  )}
                  
                  {complianceAssessment.violations_found && Array.isArray(complianceAssessment.violations_found) && complianceAssessment.violations_found.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Violations Found</label>
                      <ul className="list-disc list-inside mt-1 text-sm text-foreground">
                        {complianceAssessment.violations_found.map((violation: any, index: number) => (
                          <li key={index}>{typeof violation === 'string' ? violation : JSON.stringify(violation)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Compliance Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {permit.eia_required !== undefined && (
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {permit.eia_required ? (
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        <span className="text-sm text-foreground">EIA Required: {permit.eia_required ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {permit.eis_required ? (
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        <span className="text-sm text-foreground">EIS Required: {permit.eis_required ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  )}
                  {permit.compliance_commitment !== undefined && (
                    <div className="flex items-center space-x-2">
                      <Badge variant={permit.compliance_commitment ? 'default' : 'secondary'}>
                        {permit.compliance_commitment ? 'Compliance Committed' : 'Pending'}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* FEES TAB */}
          <TabsContent value="fees" className="space-y-4">
            {feePayments.length > 0 ? (
              <div className="space-y-4">
                {feePayments.map((payment: any) => (
                  <Card key={payment.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center justify-between">
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-2" />
                          Fee Payment Record
                        </div>
                        <Badge className={`${
                          payment.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                          payment.payment_status === 'waived' ? 'bg-blue-100 text-blue-800' :
                          payment.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {payment.payment_status?.toUpperCase() || 'PENDING'}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Total Fee</label>
                          <p className="text-lg font-semibold text-foreground">{formatCurrency(payment.total_fee)}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Amount Paid</label>
                          <p className="text-lg font-semibold text-foreground">{formatCurrency(payment.amount_paid)}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Balance</label>
                          <p className="text-lg font-semibold text-foreground">
                            {formatCurrency((payment.total_fee || 0) - (payment.amount_paid || 0))}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {payment.payment_method && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
                            <p className="text-sm text-foreground">{payment.payment_method}</p>
                          </div>
                        )}
                        {payment.payment_reference && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Payment Reference</label>
                            <p className="text-sm text-foreground">{payment.payment_reference}</p>
                          </div>
                        )}
                        {payment.receipt_number && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Receipt Number</label>
                            <p className="text-sm text-foreground">{payment.receipt_number}</p>
                          </div>
                        )}
                        {payment.paid_at && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Payment Date</label>
                            <p className="text-sm text-foreground">{formatDate(payment.paid_at)}</p>
                          </div>
                        )}
                        {payment.calculated_by_profile && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Calculated By</label>
                            <p className="text-sm text-foreground">
                              {payment.calculated_by_profile.first_name} {payment.calculated_by_profile.last_name}
                            </p>
                          </div>
                        )}
                        {payment.approved_by_profile && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Approved By</label>
                            <p className="text-sm text-foreground">
                              {payment.approved_by_profile.first_name} {payment.approved_by_profile.last_name}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Created Date</label>
                        <p className="text-sm text-foreground">{formatDate(payment.created_at)}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Financial Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Application Fee</label>
                      <p className="text-sm text-foreground">{formatCurrency(permit.application_fee)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Total Fee Amount</label>
                      <p className="text-sm text-foreground">{formatCurrency(permit.fee_amount)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Payment Status</label>
                      <Badge variant={permit.payment_status === 'paid' ? 'default' : 'secondary'}>
                        {permit.payment_status?.toUpperCase() || 'PENDING'}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">No fee payment records found in the system</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* REVIEW TAB */}
          <TabsContent value="review" className="space-y-4">
            {initialAssessment ? (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Initial Assessment Review
                    </div>
                    <Badge className={`${
                      initialAssessment.assessment_status === 'passed' ? 'bg-green-100 text-green-800' :
                      initialAssessment.assessment_status === 'failed' ? 'bg-red-100 text-red-800' :
                      initialAssessment.assessment_status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {initialAssessment.assessment_status?.toUpperCase() || 'PENDING'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Assessment Outcome</label>
                      <p className="text-sm text-foreground">{initialAssessment.assessment_outcome || 'Not determined'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Assessment Date</label>
                      <p className="text-sm text-foreground">{formatDate(initialAssessment.assessment_date)}</p>
                    </div>
                    {initialAssessment.profiles && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-muted-foreground">Assessed By</label>
                        <p className="text-sm text-foreground">
                          {initialAssessment.profiles.first_name} {initialAssessment.profiles.last_name} ({initialAssessment.profiles.email})
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {initialAssessment.assessment_notes && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Assessment Notes</label>
                      <p className="text-sm mt-1 text-foreground whitespace-pre-wrap bg-muted/30 p-3 rounded-lg">
                        {initialAssessment.assessment_notes}
                      </p>
                    </div>
                  )}
                  
                  {initialAssessment.feedback_provided && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Feedback Provided</label>
                      <p className="text-sm mt-1 text-foreground whitespace-pre-wrap bg-muted/30 p-3 rounded-lg">
                        {initialAssessment.feedback_provided}
                      </p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-medium mb-2 text-sm text-muted-foreground">Legal Declaration</h4>
                      <Badge variant={permit.legal_declaration_accepted ? 'default' : 'secondary'}>
                        {permit.legal_declaration_accepted ? 'Accepted' : 'Pending'}
                      </Badge>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-medium mb-2 text-sm text-muted-foreground">Compliance Commitment</h4>
                      <Badge variant={permit.compliance_commitment ? 'default' : 'secondary'}>
                        {permit.compliance_commitment ? 'Committed' : 'Pending'}
                      </Badge>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-medium mb-2 text-sm text-muted-foreground">Activity Type</h4>
                      <p className="text-sm text-foreground">{initialAssessment.permit_activity_type || 'Not specified'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Application Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium mb-2">Legal Declaration</h4>
                    <Badge variant={permit.legal_declaration_accepted ? 'default' : 'secondary'}>
                      {permit.legal_declaration_accepted ? 'Accepted' : 'Pending'}
                    </Badge>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium mb-2">Compliance Commitment</h4>
                    <Badge variant={permit.compliance_commitment ? 'default' : 'secondary'}>
                      {permit.compliance_commitment ? 'Committed' : 'Pending'}
                    </Badge>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium mb-2">Payment Status</h4>
                    <Badge variant={permit.payment_status === 'paid' ? 'default' : 'secondary'}>
                      {permit.payment_status?.toUpperCase() || 'PENDING'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">No initial assessment record found in the system</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
