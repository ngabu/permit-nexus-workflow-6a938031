import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Building, 
  MapPin, 
  Calendar, 
  Activity,
  DollarSign,
  Clock,
  User,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Download,
  Eye,
  Globe,
  CreditCard,
  FileCheck,
  Shield,
  Users,
  Briefcase
} from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface ComprehensivePermitApplicationViewProps {
  application: any;
  initialAssessment?: any;
}

export function ComprehensivePermitApplicationView({ application, initialAssessment }: ComprehensivePermitApplicationViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [activeTab, setActiveTab] = useState("basic-info");

  useEffect(() => {
    if (activeTab === "location" && mapContainer.current && !map.current && application?.coordinates) {
      // Using the existing Mapbox token
      mapboxgl.accessToken = 'pk.eyJ1IjoiZ2FidW5vcm1hbiIsImEiOiJjbWJ0emU0cGEwOHR1MmtxdXh2d2wzOTV5In0.RUVMHkS-KaJ6CGWUiB3s4w';
      
      const coordinates = application.coordinates;
      const lng = coordinates?.lng || 143.95555;
      const lat = coordinates?.lat || -6.314993;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: [lng, lat],
        zoom: 12
      });

      // Add marker
      new mapboxgl.Marker()
        .setLngLat([lng, lat])
        .addTo(map.current);

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [activeTab, application]);

  if (!application) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">Application data not available</div>
        </CardContent>
      </Card>
    );
  }

  const getActivityLevelInfo = (level: string | null | undefined) => {
    switch (level) {
      case 'Level 1':
        return { color: 'bg-green-100 text-green-800', description: 'Minimal environmental impact', icon: '🟢' };
      case 'Level 2':
        return { color: 'bg-yellow-100 text-yellow-800', description: 'Moderate environmental impact', icon: '🟡' };
      case 'Level 3':
        return { color: 'bg-red-100 text-red-800', description: 'Significant environmental impact', icon: '🔴' };
      default:
        return { color: 'bg-gray-100 text-gray-800', description: 'Activity level not determined', icon: '⚪' };
    }
  };

  const levelInfo = getActivityLevelInfo(application.activity_level);

  return (
    <div className="space-y-6">
      {/* Application Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{application.title}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">#{application.application_number}</Badge>
                <Badge className={levelInfo.color}>
                  {levelInfo.icon} {application.activity_level || 'Not specified'}
                </Badge>
                <Badge variant="secondary">{application.permit_type}</Badge>
                <Badge 
                  variant={application.status === 'approved' ? 'default' : application.status === 'rejected' ? 'destructive' : 'secondary'}
                >
                  {application.status}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                Applied: {new Date(application.application_date).toLocaleDateString()}
              </p>
              <p className="text-sm font-medium">Entity: {application.entity_name}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 10-Tab Detailed View */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Application Details</CardTitle>
          <p className="text-sm text-muted-foreground">Full permit application information across all sections</p>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
              <TabsTrigger value="basic-info" className="text-xs">Basic Info</TabsTrigger>
              <TabsTrigger value="entity" className="text-xs">Entity</TabsTrigger>
              <TabsTrigger value="location" className="text-xs">Location</TabsTrigger>
              <TabsTrigger value="project" className="text-xs">Project</TabsTrigger>
              <TabsTrigger value="activity" className="text-xs">Activity</TabsTrigger>
              <TabsTrigger value="period" className="text-xs">Period</TabsTrigger>
              <TabsTrigger value="consultation" className="text-xs">Consultation</TabsTrigger>
              <TabsTrigger value="documents" className="text-xs">Documents</TabsTrigger>
              <TabsTrigger value="fees" className="text-xs">Fees</TabsTrigger>
              <TabsTrigger value="compliance" className="text-xs">Compliance</TabsTrigger>
            </TabsList>

            {/* Tab 1: Basic Information */}
            <TabsContent value="basic-info" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Application Title</Label>
                    <p className="text-sm mt-1">{application.title}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Application Number</Label>
                    <p className="text-sm mt-1">{application.application_number || 'Not assigned'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Permit Type</Label>
                    <p className="text-sm mt-1">{application.permit_type}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge className="mt-1">{application.status}</Badge>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Application Date</Label>
                    <p className="text-sm mt-1">{new Date(application.application_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Activity Level</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={levelInfo.color}>
                        {levelInfo.icon} {application.activity_level || 'Not determined'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{levelInfo.description}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm mt-1">{application.description || 'No description provided'}</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: Entity Information */}
            <TabsContent value="entity" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Entity Name</Label>
                    <p className="text-sm mt-1">{application.entity_name || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Entity Type</Label>
                    <p className="text-sm mt-1">{application.entity_type || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab 3: Location */}
            <TabsContent value="location" className="space-y-4 mt-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Activity Location</Label>
                      <p className="text-sm mt-1">{application.activity_location || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Legal Description</Label>
                      <p className="text-sm mt-1">{application.legal_description || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Land Type</Label>
                      <p className="text-sm mt-1">{application.land_type || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Owner Name</Label>
                      <p className="text-sm mt-1">{application.owner_name || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Tenure</Label>
                      <p className="text-sm mt-1">{application.tenure || 'Not specified'}</p>
                    </div>
                    
                    {/* Coordinates Display */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center">
                          <Globe className="w-4 h-4 mr-2" />
                          Project Coordinates
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {application.coordinates ? (
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Latitude:</span>
                              <span className="text-sm font-mono">{application.coordinates.lat}°</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Longitude:</span>
                              <span className="text-sm font-mono">{application.coordinates.lng}°</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              Coordinates Available
                            </Badge>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <MapPin className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                            <p className="text-sm text-muted-foreground">No coordinates provided</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <MapPin className="w-5 h-5 mr-2" />
                          Interactive Location Map
                        </CardTitle>
                        <CardDescription>
                          Project site location on satellite imagery
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {application.coordinates ? (
                          <div ref={mapContainer} className="w-full h-80 rounded-lg border" />
                        ) : (
                          <div className="w-full h-80 rounded-lg border bg-muted/30 flex items-center justify-center">
                            <div className="text-center">
                              <MapPin className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                              <p className="text-sm text-muted-foreground">Map unavailable</p>
                              <p className="text-xs text-muted-foreground">No coordinates provided</p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab 4: Project Details */}
            <TabsContent value="project" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Estimated Cost (PGK)</Label>
                    <p className="text-sm mt-1">
                      {application.estimated_cost_kina ? `PGK ${application.estimated_cost_kina.toLocaleString()}` : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Commencement Date</Label>
                    <p className="text-sm mt-1">
                      {application.commencement_date ? new Date(application.commencement_date).toLocaleDateString() : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Completion Date</Label>
                    <p className="text-sm mt-1">
                      {application.completion_date ? new Date(application.completion_date).toLocaleDateString() : 'Not specified'}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Operational Details</Label>
                    <p className="text-sm mt-1">{application.operational_details || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Operational Capacity</Label>
                    <p className="text-sm mt-1">{application.operational_capacity || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Operating Hours</Label>
                    <p className="text-sm mt-1">{application.operating_hours || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab 5: Activity Classification */}
            <TabsContent value="activity" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Activity Classification</Label>
                    <p className="text-sm mt-1">{application.activity_classification || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Activity Category</Label>
                    <p className="text-sm mt-1">{application.activity_category || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Activity Subcategory</Label>
                    <p className="text-sm mt-1">{application.activity_subcategory || 'Not specified'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Environmental Impact</Label>
                    <p className="text-sm mt-1">{application.environmental_impact || 'Not assessed'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Mitigation Measures</Label>
                    <p className="text-sm mt-1">{application.mitigation_measures || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">EIA Required</Label>
                    <Badge variant={application.eia_required ? "destructive" : "secondary"}>
                      {application.eia_required ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab 6: Permit Period */}
            <TabsContent value="period" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Permit Period</Label>
                    <p className="text-sm mt-1">{application.permit_period || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Approval Date</Label>
                    <p className="text-sm mt-1">
                      {application.approval_date ? new Date(application.approval_date).toLocaleDateString() : 'Not approved yet'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Expiry Date</Label>
                    <p className="text-sm mt-1">
                      {application.expiry_date ? new Date(application.expiry_date).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab 7: Public Consultation */}
            <TabsContent value="consultation" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Consultation Period Start</Label>
                    <p className="text-sm mt-1">
                      {application.consultation_period_start ? new Date(application.consultation_period_start).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Consultation Period End</Label>
                    <p className="text-sm mt-1">
                      {application.consultation_period_end ? new Date(application.consultation_period_end).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Public Consultation Proof</Label>
                    <p className="text-sm mt-1">
                      {application.public_consultation_proof ? 'Documents provided' : 'No documents provided'}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab 8: Documents */}
            <TabsContent value="documents" className="space-y-4 mt-6">
              <div>
                <Label className="text-sm font-medium">Uploaded Documents</Label>
                <div className="mt-4">
                  {application.uploaded_files && Array.isArray(application.uploaded_files) && application.uploaded_files.length > 0 ? (
                    <div className="space-y-2">
                      {application.uploaded_files.map((file: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{file.name || `Document ${index + 1}`}</p>
                              <p className="text-xs text-muted-foreground">
                                {file.type || 'Unknown type'} • {file.size ? `${Math.round(file.size / 1024)}KB` : 'Unknown size'}
                              </p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No documents uploaded</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Tab 9: Fees */}
            <TabsContent value="fees" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Application Fee</Label>
                    <p className="text-sm mt-1">
                      {application.fee_amount ? `PGK ${application.fee_amount.toLocaleString()}` : 'Not calculated'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Payment Status</Label>
                    <Badge variant={application.payment_status === 'paid' ? 'default' : 'secondary'}>
                      {application.payment_status || 'Pending'}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Fee Breakdown</Label>
                    <p className="text-sm mt-1">
                      {application.fee_breakdown ? 'Detailed breakdown available' : 'Not available'}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab 10: Compliance */}
            <TabsContent value="compliance" className="space-y-4 mt-6">
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-medium">Compliance Checks</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">Legal Compliance</span>
                      <Badge variant={application.compliance_checks?.legalCompliance ? 'default' : 'secondary'}>
                        {application.compliance_checks?.legalCompliance ? 'Complete' : 'Pending'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">Technical Review</span>
                      <Badge variant={application.compliance_checks?.technicalReview ? 'default' : 'secondary'}>
                        {application.compliance_checks?.technicalReview ? 'Complete' : 'Pending'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">Environmental Assessment</span>
                      <Badge variant={application.compliance_checks?.environmentalAssessment ? 'default' : 'secondary'}>
                        {application.compliance_checks?.environmentalAssessment ? 'Complete' : 'Pending'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">Public Consultation</span>
                      <Badge variant={application.compliance_checks?.publicConsultation ? 'default' : 'secondary'}>
                        {application.compliance_checks?.publicConsultation ? 'Complete' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Registry Assessment Feedback */}
                {initialAssessment && (
                  <div>
                    <Label className="text-sm font-medium">Registry Assessment</Label>
                    <div className="mt-4 p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {initialAssessment.assessment_status === 'passed' ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-yellow-500" />
                          )}
                          <span className="font-medium">
                            Status: {initialAssessment.assessment_status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(initialAssessment.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <Label className="text-sm font-medium">Assessment Outcome</Label>
                          <p className="text-sm mt-1">{initialAssessment.assessment_outcome}</p>
                        </div>

                        <div className="p-3 bg-muted/50 rounded-lg">
                          <Label className="text-sm font-medium">Registry Notes</Label>
                          <p className="text-sm mt-1">{initialAssessment.assessment_notes}</p>
                        </div>

                        {initialAssessment.feedback_provided && (
                          <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                            <Label className="text-sm font-medium text-blue-800">Specific Feedback</Label>
                            <p className="text-sm mt-1 text-blue-700">{initialAssessment.feedback_provided}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}