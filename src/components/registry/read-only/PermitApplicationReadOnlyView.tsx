import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocumentViewerCard } from '@/components/DocumentViewerCard';
import { LocationMapDisplay } from './LocationMapDisplay';
import { ActivityClassificationDisplay } from './ActivityClassificationDisplay';
import { BasicInfoReadOnly } from './BasicInfoReadOnly';
import { 
  Building, 
  MapPin, 
  FileText, 
  Calendar, 
  DollarSign, 
  User, 
  Phone, 
  Mail,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  TreePine,
  Shield,
  Calculator
} from 'lucide-react';

interface PermitApplicationData {
  id: string;
  title: string;
  application_number: string | null;
  entity_id?: string | null;
  entity_name: string | null;
  entity_type: string | null;
  status: string;
  permit_type: string;
  description: string | null;
  activity_location: string | null;
  activity_classification: string | null;
  activity_category: string | null;
  activity_subcategory: string | null;
  coordinates: any;
  environmental_impact: string | null;
  mitigation_measures: string | null;
  compliance_checks: any;
  uploaded_files: any;
  application_date?: string;
  estimated_cost_kina?: number;
  commencement_date?: string;
  completion_date?: string;
  permit_period?: string;
  legal_description?: string;
  land_type?: string;
  owner_name?: string;
  tenure?: string;
  existing_permits_details?: string;
  government_agreements_details?: string;
  consulted_departments?: string;
  required_approvals?: string;
  landowner_negotiation_status?: string;
  proposed_works_description?: string;
  application_fee?: number;
  fee_amount?: number;
  fee_breakdown?: any;
  payment_status?: string;
  operational_details?: string;
  operational_capacity?: string;
  operating_hours?: string;
  eia_required?: boolean;
  eis_required?: boolean;
  legal_declaration_accepted?: boolean;
  compliance_commitment?: boolean;
  mandatory_fields_complete?: boolean;
  waste_contaminant_details?: any;
  water_extraction_details?: any;
  ods_details?: any;
  public_consultation_proof?: any;
  consultation_period_start?: string;
  consultation_period_end?: string;
  user_id?: string;
}

interface PermitApplicationReadOnlyViewProps {
  application: PermitApplicationData;
}

export function PermitApplicationReadOnlyView({ application }: PermitApplicationReadOnlyViewProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'under_initial_review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'initial_assessment_passed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'requires_clarification':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getActivityLevel = (classification: string) => {
    const levelMap = {
      'mining': 'Level 3',
      'manufacturing': 'Level 2',
      'energy': 'Level 3',
      'waste_management': 'Level 2',
      'construction': 'Level 2',
      'tourism': 'Level 1',
      'agriculture': 'Level 1',
      'forestry': 'Level 2',
      'aquaculture': 'Level 2',
      'other': 'Level 1'
    };
    return levelMap[classification] || 'Level 1';
  };

  const getLevelColor = (level: string) => {
    const colors = {
      'Level 1': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Level 2': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'Level 3': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };
    return colors[level] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  const activityLevel = application.activity_classification ? getActivityLevel(application.activity_classification) : null;

  return (
    <div className="space-y-6">
      {/* Application Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{application.title}</CardTitle>
              <p className="text-muted-foreground mt-1">
                Application #{application.application_number || 'N/A'}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge className={getStatusColor(application.status)}>
                {application.status.replace(/_/g, ' ')}
              </Badge>
              {activityLevel && (
                <Badge className={getLevelColor(activityLevel)}>
                  {activityLevel}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Entity:</span>
              <span>{application.entity_name || 'Individual'}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Type:</span>
              <span>{application.permit_type}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Submitted:</span>
              <span>
                {application.application_date 
                  ? new Date(application.application_date).toLocaleDateString()
                  : 'N/A'
                }
              </span>
            </div>
            {application.application_fee && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Fee:</span>
                <span>PGK {application.application_fee.toLocaleString()}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="project">Project Details</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="environment">Environment</TabsTrigger>
          <TabsTrigger value="permits">Permits & Legal</TabsTrigger>
          <TabsTrigger value="finances">Financial</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-4">
          <BasicInfoReadOnly permit={{
            id: application.id,
            title: application.title,
            permit_number: application.application_number,
            entity: {
              id: application.entity_id,
              name: application.entity_name || '',
              entity_type: application.entity_type || 'individual'
            },
            status: application.status,
            permit_type: application.permit_type,
            application_date: application.application_date || new Date().toISOString(),
            created_at: application.application_date || new Date().toISOString(),
            updated_at: new Date().toISOString()
          }} />
        </TabsContent>

        {/* Project Details Tab */}
        <TabsContent value="project" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Project Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Project Description</h4>
                <p className="text-sm text-muted-foreground">
                  {application.description || 'No description provided'}
                </p>
              </div>
              
              {application.activity_classification && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Activity Classification
                  </h4>
                  <ActivityClassificationDisplay 
                    activityId={application.activity_classification}
                    activityLevel={activityLevel}
                    getLevelColor={getLevelColor}
                  />
                </div>
              )}

              {(application.activity_category || application.activity_subcategory) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {application.activity_category && (
                    <div>
                      <h4 className="font-medium mb-1">Activity Category</h4>
                      <p className="text-sm text-muted-foreground">{application.activity_category}</p>
                    </div>
                  )}
                  {application.activity_subcategory && (
                    <div>
                      <h4 className="font-medium mb-1">Activity Subcategory</h4>
                      <p className="text-sm text-muted-foreground">{application.activity_subcategory}</p>
                    </div>
                  )}
                </div>
              )}

              {(application.commencement_date || application.completion_date) && (
                <>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {application.commencement_date && (
                      <div>
                        <h4 className="font-medium mb-1 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Commencement Date
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(application.commencement_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {application.completion_date && (
                      <div>
                        <h4 className="font-medium mb-1 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Completion Date
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(application.completion_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {application.estimated_cost_kina && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-1 flex items-center gap-2">
                      <Calculator className="w-4 h-4" />
                      Estimated Cost
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      PGK {application.estimated_cost_kina.toLocaleString()}
                    </p>
                  </div>
                </>
              )}

              {application.proposed_works_description && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Proposed Works Description</h4>
                    <p className="text-sm text-muted-foreground">{application.proposed_works_description}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Location Tab */}
        <TabsContent value="location" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Location Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Activity Location</h4>
                  <p className="text-sm text-muted-foreground">
                    {application.activity_location || 'Location not specified'}
                  </p>
                </div>
                
                {application.coordinates && (
                  <div>
                    <h4 className="font-medium mb-2">Coordinates</h4>
                    <p className="text-sm text-muted-foreground">
                      Latitude: {application.coordinates.lat}, Longitude: {application.coordinates.lng}
                    </p>
                  </div>
                )}

                {(application.legal_description || application.land_type || application.owner_name || application.tenure) && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      {application.legal_description && (
                        <div>
                          <h4 className="font-medium mb-1">Legal Description</h4>
                          <p className="text-sm text-muted-foreground">{application.legal_description}</p>
                        </div>
                      )}
                      {application.land_type && (
                        <div>
                          <h4 className="font-medium mb-1">Land Type</h4>
                          <p className="text-sm text-muted-foreground">{application.land_type}</p>
                        </div>
                      )}
                      {application.owner_name && (
                        <div>
                          <h4 className="font-medium mb-1">Land Owner</h4>
                          <p className="text-sm text-muted-foreground">{application.owner_name}</p>
                        </div>
                      )}
                      {application.tenure && (
                        <div>
                          <h4 className="font-medium mb-1">Tenure</h4>
                          <p className="text-sm text-muted-foreground">{application.tenure}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Map Display */}
            <LocationMapDisplay 
              coordinates={application.coordinates}
              activityLocation={application.activity_location}
            />
          </div>

          {(application.existing_permits_details || application.government_agreements_details || application.consulted_departments || application.required_approvals || application.landowner_negotiation_status) && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Location Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {application.existing_permits_details && (
                    <div>
                      <h4 className="font-medium mb-1">Existing Permits</h4>
                      <p className="text-sm text-muted-foreground">{application.existing_permits_details}</p>
                    </div>
                  )}
                  {application.government_agreements_details && (
                    <div>
                      <h4 className="font-medium mb-1">Government Agreements</h4>
                      <p className="text-sm text-muted-foreground">{application.government_agreements_details}</p>
                    </div>
                  )}
                  {application.consulted_departments && (
                    <div>
                      <h4 className="font-medium mb-1">Consulted Departments</h4>
                      <p className="text-sm text-muted-foreground">{application.consulted_departments}</p>
                    </div>
                  )}
                  {application.required_approvals && (
                    <div>
                      <h4 className="font-medium mb-1">Required Approvals</h4>
                      <p className="text-sm text-muted-foreground">{application.required_approvals}</p>
                    </div>
                  )}
                  {application.landowner_negotiation_status && (
                    <div>
                      <h4 className="font-medium mb-1">Landowner Negotiation Status</h4>
                      <p className="text-sm text-muted-foreground">{application.landowner_negotiation_status}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Environmental Tab */}
        <TabsContent value="environment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TreePine className="w-5 h-5" />
                Environmental Impact Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {application.environmental_impact && (
                <div>
                  <h4 className="font-medium mb-2">Environmental Impact</h4>
                  <p className="text-sm text-muted-foreground">{application.environmental_impact}</p>
                </div>
              )}

              {application.mitigation_measures && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Mitigation Measures</h4>
                    <p className="text-sm text-muted-foreground">{application.mitigation_measures}</p>
                  </div>
                </>
              )}

              {(application.eia_required || application.eis_required) && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Environmental Assessment Requirements</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        {application.eia_required ? (
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        <span className="text-sm">
                          EIA {application.eia_required ? 'Required' : 'Not Required'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {application.eis_required ? (
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        <span className="text-sm">
                          EIS {application.eis_required ? 'Required' : 'Not Required'}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {(application.waste_contaminant_details || application.water_extraction_details || application.ods_details) && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Specific Environmental Details</h4>
                    <div className="space-y-3">
                      {application.waste_contaminant_details && Object.keys(application.waste_contaminant_details).length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium mb-1">Waste/Contaminant Details</h5>
                          <div className="bg-muted/30 p-2 rounded text-sm">
                            <pre>{JSON.stringify(application.waste_contaminant_details, null, 2)}</pre>
                          </div>
                        </div>
                      )}
                      {application.water_extraction_details && Object.keys(application.water_extraction_details).length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium mb-1">Water Extraction Details</h5>
                          <div className="bg-muted/30 p-2 rounded text-sm">
                            <pre>{JSON.stringify(application.water_extraction_details, null, 2)}</pre>
                          </div>
                        </div>
                      )}
                      {application.ods_details && Object.keys(application.ods_details).length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium mb-1">ODS Details</h5>
                          <div className="bg-muted/30 p-2 rounded text-sm">
                            <pre>{JSON.stringify(application.ods_details, null, 2)}</pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permits & Legal Tab */}
        <TabsContent value="permits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Legal & Permit Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {application.existing_permits_details && (
                  <div>
                    <h4 className="font-medium mb-1">Existing Permits</h4>
                    <p className="text-sm text-muted-foreground">{application.existing_permits_details}</p>
                  </div>
                )}
                {application.government_agreements_details && (
                  <div>
                    <h4 className="font-medium mb-1">Government Agreements</h4>
                    <p className="text-sm text-muted-foreground">{application.government_agreements_details}</p>
                  </div>
                )}
                {application.consulted_departments && (
                  <div>
                    <h4 className="font-medium mb-1">Consulted Departments</h4>
                    <p className="text-sm text-muted-foreground">{application.consulted_departments}</p>
                  </div>
                )}
                {application.required_approvals && (
                  <div>
                    <h4 className="font-medium mb-1">Required Approvals</h4>
                    <p className="text-sm text-muted-foreground">{application.required_approvals}</p>
                  </div>
                )}
                {application.landowner_negotiation_status && (
                  <div>
                    <h4 className="font-medium mb-1">Landowner Negotiation Status</h4>
                    <p className="text-sm text-muted-foreground">{application.landowner_negotiation_status}</p>
                  </div>
                )}
              </div>

              {(application.legal_declaration_accepted || application.compliance_commitment) && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Legal Declarations</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {application.legal_declaration_accepted ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-sm">Legal Declaration Accepted</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {application.compliance_commitment ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-sm">Compliance Commitment</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {application.permit_period && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-1">Permit Period</h4>
                    <p className="text-sm text-muted-foreground">{application.permit_period}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="finances" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Financial Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {application.estimated_cost_kina && (
                  <div>
                    <h4 className="font-medium mb-1">Estimated Project Cost</h4>
                    <p className="text-lg font-semibold text-primary">
                      PGK {application.estimated_cost_kina.toLocaleString()}
                    </p>
                  </div>
                )}
                {application.application_fee && (
                  <div>
                    <h4 className="font-medium mb-1">Application Fee</h4>
                    <p className="text-lg font-semibold text-primary">
                      PGK {application.application_fee.toLocaleString()}
                    </p>
                  </div>
                )}
                {application.fee_amount && (
                  <div>
                    <h4 className="font-medium mb-1">Total Fee</h4>
                    <p className="text-lg font-semibold text-primary">
                      PGK {application.fee_amount.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {application.fee_breakdown && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Fee Breakdown</h4>
                    <div className="bg-muted/30 p-3 rounded">
                      <pre className="text-xs">{JSON.stringify(application.fee_breakdown, null, 2)}</pre>
                    </div>
                  </div>
                </>
              )}

              {application.payment_status && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-1">Payment Status</h4>
                    <Badge variant={application.payment_status === 'paid' ? 'default' : 'secondary'}>
                      {application.payment_status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </>
              )}

              {(application.operational_details || application.operational_capacity || application.operating_hours) && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Operational Information</h4>
                    <div className="space-y-2">
                      {application.operational_details && (
                        <div>
                          <h5 className="text-sm font-medium">Operational Details</h5>
                          <p className="text-sm text-muted-foreground">{application.operational_details}</p>
                        </div>
                      )}
                      {application.operational_capacity && (
                        <div>
                          <h5 className="text-sm font-medium">Operational Capacity</h5>
                          <p className="text-sm text-muted-foreground">{application.operational_capacity}</p>
                        </div>
                      )}
                      {application.operating_hours && (
                        <div>
                          <h5 className="text-sm font-medium">Operating Hours</h5>
                          <p className="text-sm text-muted-foreground">{application.operating_hours}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Compliance & Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {application.compliance_checks && (
                <div>
                  <h4 className="font-medium mb-3">Compliance Checks</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(application.compliance_checks).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        {value ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-sm capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {application.mandatory_fields_complete !== undefined && (
                <>
                  <Separator />
                  <div className="flex items-center gap-2">
                    {application.mandatory_fields_complete ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm font-medium">
                      Mandatory Fields {application.mandatory_fields_complete ? 'Complete' : 'Incomplete'}
                    </span>
                  </div>
                </>
              )}

              {application.uploaded_files && application.uploaded_files.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Supporting Documents ({application.uploaded_files.length})
                    </h4>
                    <div className="space-y-2">
                      {application.uploaded_files.map((file: any, index: number) => (
                        <DocumentViewerCard
                          key={index}
                          file={{
                            name: file.name || `Document ${index + 1}`,
                            size: file.size || 0,
                            file_path: file.file_path || file.path,
                            id: file.id || `temp-${index}`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              {(application.public_consultation_proof && application.consultation_period_start && application.consultation_period_end) && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Public Consultation</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium">Consultation Period: </span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(application.consultation_period_start).toLocaleDateString()} - {new Date(application.consultation_period_end).toLocaleDateString()}
                        </span>
                      </div>
                      {application.public_consultation_proof && Array.isArray(application.public_consultation_proof) && application.public_consultation_proof.length > 0 && (
                        <div>
                          <span className="text-sm font-medium">Consultation Proof Documents: </span>
                          <span className="text-sm text-muted-foreground">
                            {application.public_consultation_proof.length} document(s) provided
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}