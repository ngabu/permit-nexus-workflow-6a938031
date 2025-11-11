import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Building, 
  Calendar, 
  Activity, 
  DollarSign,
  MapPin,
  FileText,
  Users,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

interface ComprehensiveProjectDetailsReadOnlyProps {
  application: any;
}

export function ComprehensiveProjectDetailsReadOnly({ application }: ComprehensiveProjectDetailsReadOnlyProps) {
  return (
    <div className="space-y-6">
      {/* Basic Project Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5 text-primary" />
            Project Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Project Title</label>
            <p className="mt-1 font-semibold text-lg">{application.title}</p>
          </div>
          
          {application.description && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Project Description</label>
              <p className="mt-1 p-3 bg-muted/50 rounded-lg text-sm">{application.description}</p>
            </div>
          )}

          {application.project_description && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Detailed Project Description</label>
              <p className="mt-1 p-3 bg-muted/50 rounded-lg text-sm">{application.project_description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {application.permit_type && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Permit Type</label>
                <Badge variant="secondary" className="mt-1">{application.permit_type}</Badge>
              </div>
            )}
            
            {application.permit_category && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Permit Category</label>
                <Badge variant="outline" className="mt-1">{application.permit_category}</Badge>
              </div>
            )}

            {application.activity_classification && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Activity Classification</label>
                <Badge variant="outline" className="mt-1">{application.activity_classification}</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Project Timeline & Cost */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Project Timeline & Budget
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Timeline</h4>
              {application.commencement_date && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Commencement Date</label>
                  <p className="mt-1 font-medium">
                    {new Date(application.commencement_date).toLocaleDateString()}
                  </p>
                </div>
              )}
              {application.completion_date && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Completion Date</label>
                  <p className="mt-1 font-medium">
                    {new Date(application.completion_date).toLocaleDateString()}
                  </p>
                </div>
              )}
              {application.permit_period && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Permit Period</label>
                  <p className="mt-1 font-medium">{application.permit_period}</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Budget</h4>
              {application.estimated_cost_kina && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Estimated Project Cost</label>
                  <p className="mt-1 font-medium text-lg text-primary">
                    PGK {application.estimated_cost_kina.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location & Site Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Location & Site Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {application.activity_location && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Activity Location</label>
              <p className="mt-1 p-3 bg-muted/50 rounded text-sm">{application.activity_location}</p>
            </div>
          )}
          
          {application.coordinates && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">GPS Coordinates</label>
              <div className="mt-1 p-3 bg-muted/50 rounded text-sm font-mono">
                Latitude: {application.coordinates.lat}, Longitude: {application.coordinates.lng}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Classification Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Activity Classification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {application.activity_category && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Activity Category</label>
                <p className="mt-1 font-medium">{application.activity_category}</p>
              </div>
            )}
            
            {application.activity_subcategory && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Activity Subcategory</label>
                <p className="mt-1 font-medium">{application.activity_subcategory}</p>
              </div>
            )}

            {application.activity_level && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Activity Level</label>
                <Badge className="mt-1">{application.activity_level}</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Compliance & Regulatory */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Regulatory & Compliance Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {application.existing_permits_details && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Existing Permits Details</label>
              <p className="mt-1 p-3 bg-muted/50 rounded text-sm">{application.existing_permits_details}</p>
            </div>
          )}

          {application.government_agreements_details && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Government Agreements</label>
              <p className="mt-1 p-3 bg-muted/50 rounded text-sm">{application.government_agreements_details}</p>
            </div>
          )}

          {application.consulted_departments && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Consulted Departments</label>
              <p className="mt-1 p-3 bg-muted/50 rounded text-sm">{application.consulted_departments}</p>
            </div>
          )}

          {application.required_approvals && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Required Approvals</label>
              <p className="mt-1 p-3 bg-muted/50 rounded text-sm">{application.required_approvals}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Landowner & Community Engagement */}
      {application.landowner_negotiation_status && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Community Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Landowner Negotiation Status</label>
              <p className="mt-1 p-3 bg-muted/50 rounded text-sm">{application.landowner_negotiation_status}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Public Consultation */}
      {(application.consultation_period_start || application.public_consultation_proof) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Public Consultation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {application.consultation_period_start && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Consultation Period</label>
                <p className="mt-1">
                  {new Date(application.consultation_period_start).toLocaleDateString()} 
                  {application.consultation_period_end && 
                    ` - ${new Date(application.consultation_period_end).toLocaleDateString()}`
                  }
                </p>
              </div>
            )}
            
            {application.public_consultation_proof && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Consultation Proof</label>
                <Badge variant="secondary" className="mt-1">
                  {Array.isArray(application.public_consultation_proof) 
                    ? `${application.public_consultation_proof.length} documents uploaded`
                    : 'Documents uploaded'
                  }
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Environmental Impact */}
      {application.environmental_impact && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              Environmental Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="p-3 bg-muted/50 rounded text-sm">{application.environmental_impact}</p>
          </CardContent>
        </Card>
      )}

      {/* Application Status Flags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            Application Status & Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              {application.mandatory_fields_complete ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-500" />
              )}
              <span className="text-sm">Mandatory Fields Complete</span>
            </div>

            <div className="flex items-center gap-2">
              {application.legal_declaration_accepted ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-500" />
              )}
              <span className="text-sm">Legal Declaration</span>
            </div>

            <div className="flex items-center gap-2">
              {application.compliance_commitment ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-500" />
              )}
              <span className="text-sm">Compliance Commitment</span>
            </div>

            <div className="flex items-center gap-2">
              {application.eia_required ? (
                <Info className="w-5 h-5 text-blue-500" />
              ) : (
                <CheckCircle className="w-5 h-5 text-gray-400" />
              )}
              <span className="text-sm">EIA Required</span>
            </div>

            <div className="flex items-center gap-2">
              {application.eis_required ? (
                <Info className="w-5 h-5 text-blue-500" />
              ) : (
                <CheckCircle className="w-5 h-5 text-gray-400" />
              )}
              <span className="text-sm">EIS Required</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
