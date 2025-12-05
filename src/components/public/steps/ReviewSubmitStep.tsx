import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, AlertTriangle, FileText, User, MapPin, DollarSign, Download, Printer, ClipboardCheck, List, Activity, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useIndustrialSectors } from '@/hooks/useIndustrialSectors';

interface ReviewSubmitStepProps {
  data: any;
  onChange: (data: any) => void;
}

export function ReviewSubmitStep({ data, onChange }: ReviewSubmitStepProps) {
  const { industrialSectors } = useIndustrialSectors();
  const selectedSector = industrialSectors.find(s => s.id === data.industrial_sector_id);

  const checkMandatoryFields = () => {
    const mandatory = {
      'Basic Information': [
        { field: 'applicationTitle', label: 'Application Title', value: data.applicationTitle },
        { field: 'entity_name', label: 'Entity', value: data.entity_name || data.organizationName },
        { field: 'applicantEmail', label: 'Email Address', value: data.applicantEmail },
        { field: 'applicantPhone', label: 'Phone Number', value: data.applicantPhone }
      ],
      'Activity Classification': [
        { field: 'activity_level', label: 'Activity Level', value: data.activity_level },
        { field: 'permit_type_specific', label: 'Permit Type', value: data.permit_type_specific }
      ],
      'Project Details': [
        { field: 'projectDescription', label: 'Project Description', value: data.projectDescription },
        { field: 'projectStartDate', label: 'Project Start Date', value: data.projectStartDate }
      ],
      'Location': [
        { field: 'projectLocation', label: 'Project Location', value: data.projectLocation }
      ]
    };

    // Add public consultation requirements for Level 2/3
    if (['Level 2', 'Level 3'].includes(data.activity_level)) {
      mandatory['Public Consultation'] = [
        { field: 'consultation_period_start', label: 'Consultation Start Date', value: data.consultation_period_start },
        { field: 'consultation_period_end', label: 'Consultation End Date', value: data.consultation_period_end },
        { field: 'public_consultation_proof', label: 'Consultation Proof Documents', value: data.public_consultation_proof?.length > 0 }
      ];
    }

    return mandatory;
  };

  const mandatoryFields = checkMandatoryFields();
  const allSectionsComplete = Object.values(mandatoryFields).every(section =>
    section.every(field => field.value)
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PG', {
      style: 'currency',
      currency: 'PGK'
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
    toast({ title: 'Print dialog opened' });
  };

  const handleDownload = () => {
    // Create a printable HTML version
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const content = document.getElementById('application-summary')?.innerHTML || '';
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Application Summary - ${data.applicationTitle || 'Permit Application'}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #1a1a1a; border-bottom: 2px solid #0ea5e9; padding-bottom: 10px; }
              h2 { color: #0ea5e9; margin-top: 20px; }
              .section { margin: 20px 0; }
              .field { margin: 10px 0; }
              .label { font-weight: bold; color: #666; }
              .value { margin-left: 10px; }
              table { width: 100%; border-collapse: collapse; margin: 10px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f0f9ff; }
            </style>
          </head>
          <body>
            <h1>Environmental Permit Application Summary</h1>
            ${content}
            <p style="margin-top: 30px; color: #666; font-size: 12px;">
              Generated on: ${new Date().toLocaleString('en-PG')}
            </p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      toast({ title: 'Download initiated' });
    }
  };

  const renderPermitSpecificFields = () => {
    const permitSpecific = data.permit_specific_fields || data.permitSpecificFields;
    if (!permitSpecific || Object.keys(permitSpecific).length === 0) return null;

    return (
      <div>
        <h4 className="font-medium flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4" />
          Permit Specific Requirements
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {Object.entries(permitSpecific).map(([key, value]) => (
            <div key={key}>
              <span className="text-muted-foreground capitalize">
                {key.replace(/_/g, ' ')}:
              </span>
              <p className="font-medium text-orange-600">{String(value) || 'Not specified'}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Tabbed Section for Completeness Check and Summary */}
      <Tabs defaultValue="completeness" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="completeness" className="gap-2">
            <ClipboardCheck className="w-4 h-4" />
            Completeness Check
          </TabsTrigger>
          <TabsTrigger value="summary" className="gap-2">
            <List className="w-4 h-4" />
            Summary
          </TabsTrigger>
        </TabsList>

        {/* Completeness Check Tab */}
        <TabsContent value="completeness" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {allSectionsComplete ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                )}
                Application Completeness Check
              </CardTitle>
              <CardDescription>
                Review the status of each required field below. All fields must be completed before submission.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(mandatoryFields).map(([sectionName, fields]) => {
                const sectionComplete = fields.every(field => field.value);
                const completedCount = fields.filter(field => field.value).length;
                return (
                  <div key={sectionName} className="space-y-2 p-3 bg-muted/30 rounded-lg border border-border/50">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium flex items-center gap-2">
                        {sectionComplete ? (
                          <div className="w-4 h-4 rounded-full bg-green-600 flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-amber-500 bg-amber-100" />
                        )}
                        {sectionName}
                      </h4>
                      <Badge variant={sectionComplete ? "default" : "secondary"} className="text-xs">
                        {completedCount}/{fields.length} completed
                      </Badge>
                    </div>
                    <div className="ml-6 space-y-1.5">
                      {fields.map((field) => (
                        <div key={field.field} className="flex items-center gap-3 text-sm">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            field.value 
                              ? 'border-green-600 bg-green-600' 
                              : 'border-muted-foreground/40 bg-background'
                          }`}>
                            {field.value && (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>
                          <span className={field.value ? 'text-foreground' : 'text-muted-foreground'}>
                            {field.label}
                          </span>
                          {field.value && (
                            <CheckCircle className="w-3 h-3 text-green-600 ml-auto" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Documents Section */}
              <div className="space-y-2 p-3 bg-muted/30 rounded-lg border border-border/50">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium flex items-center gap-2">
                    {data.uploaded_files && data.uploaded_files.length > 0 ? (
                      <div className="w-4 h-4 rounded-full bg-green-600 flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-amber-500 bg-amber-100" />
                    )}
                    Documents
                  </h4>
                  <Badge variant={data.uploaded_files?.length > 0 ? "default" : "secondary"} className="text-xs">
                    {data.uploaded_files?.length || 0} uploaded
                  </Badge>
                </div>
                <div className="ml-6 space-y-1.5">
                  {data.uploaded_files && data.uploaded_files.length > 0 ? (
                    data.uploaded_files.map((file: any, index: number) => (
                      <div key={index} className="flex items-center gap-3 text-sm">
                        <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center border-green-600 bg-green-600">
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                        <span className="text-foreground">
                          {file.name || file.filename || `Document ${index + 1}`}
                        </span>
                        <CheckCircle className="w-3 h-3 text-green-600 ml-auto" />
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/40 bg-background" />
                      <span className="text-muted-foreground">No documents uploaded</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary" className="mt-4 space-y-4">
          {/* Action Buttons */}
          <div className="flex justify-end gap-2 print:hidden">
            <Button variant="secondary" onClick={handlePrint} className="gap-2">
              <Printer className="w-4 h-4" />
              Print
            </Button>
            <Button variant="secondary" onClick={handleDownload} className="gap-2">
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>

          {/* Application Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Application Summary
              </CardTitle>
              <CardDescription>
                Review all information before submitting your environmental permit application
              </CardDescription>
            </CardHeader>
        <CardContent id="application-summary" className="space-y-6">
          {/* Basic Info Summary */}
          <div>
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <User className="w-4 h-4" />
              Application Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Application Title:</span>
                <p className="font-medium text-orange-600">{data.applicationTitle || 'Not specified'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Entity:</span>
                <p className="font-medium text-orange-600">{data.entity_name || data.organizationName || 'Not specified'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>
                <p className="font-medium text-orange-600">{data.applicantEmail || 'Not specified'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Phone:</span>
                <p className="font-medium text-orange-600">{data.applicantPhone || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Activity Classification Summary */}
          {(data.activity_level || data.permit_type || data.activity_description || data.industrial_sector_id) && (
            <div>
              <h4 className="font-medium flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4" />
                Activity Classification
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Activity Level:</span>
                  <p className="font-medium text-orange-600">
                    {data.activity_level ? (
                      <Badge variant="outline" className="text-orange-600 border-orange-600">{data.activity_level}</Badge>
                    ) : 'Not selected'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Permit Type:</span>
                  <p className="font-medium text-orange-600">{data.permit_type || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Industrial Sector:</span>
                  <p className="font-medium text-orange-600">{selectedSector?.name || 'Not specified'}</p>
                </div>
                <div className="col-span-full">
                  <span className="text-muted-foreground">Description of Prescribed Activity:</span>
                  <p className="font-medium text-orange-600">{data.activity_description || 'Not specified'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Public Consultation Summary - only for Level 2/3 */}
          {['Level 2', 'Level 3'].includes(data.activity_level) && (data.consultation_period_start || data.consultation_period_end) && (
            <div>
              <h4 className="font-medium flex items-center gap-2 mb-3">
                <Users className="w-4 h-4" />
                Public Consultation
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Consultation Start Date:</span>
                  <p className="font-medium text-orange-600">{data.consultation_period_start || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Consultation End Date:</span>
                  <p className="font-medium text-orange-600">{data.consultation_period_end || 'Not specified'}</p>
                </div>
                {data.public_consultation_proof && data.public_consultation_proof.length > 0 && (
                  <div className="col-span-full">
                    <span className="text-muted-foreground">Consultation Documents:</span>
                    <p className="font-medium text-orange-600">{data.public_consultation_proof.length} document(s) uploaded</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Project Summary */}
          <div>
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4" />
              Project Details
            </h4>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground">Location:</span>
                  <p className="font-medium text-orange-600">{data.projectLocation || data.activity_location || 'Not specified'}</p>
                </div>
                {data.coordinates && (
                  <div>
                    <span className="text-muted-foreground">Coordinates:</span>
                    <p className="font-medium text-orange-600">
                      Lat: {data.coordinates.lat}, Lng: {data.coordinates.lng}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Always show core project fields */}
              <div>
                <span className="text-muted-foreground">Project Description:</span>
                <p className="font-medium text-orange-600 whitespace-pre-wrap">
                  {data.projectDescription || data.description || 'Not provided'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-muted-foreground">Start Date:</span>
                  <p className="font-medium text-orange-600">{data.projectStartDate || data.commencement_date || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">End Date:</span>
                  <p className="font-medium text-orange-600">{data.projectEndDate || data.completion_date || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Permit Period:</span>
                  <p className="font-medium text-orange-600">{data.permit_period || 'Not specified'}</p>
                </div>
              </div>


              {/* Optional fields - only show if filled */}
              {(data.operational_details || data.operational_capacity || data.operating_hours) && (
                <div className="pt-3 border-t">
                  <h5 className="font-medium mb-2">Operational Information</h5>
                  <div className="space-y-2">
                    {data.operational_details && (
                      <div>
                        <span className="text-muted-foreground">Operational Details:</span>
                        <p className="font-medium text-orange-600">{data.operational_details}</p>
                      </div>
                    )}
                    {data.operational_capacity && (
                      <div>
                        <span className="text-muted-foreground">Operational Capacity:</span>
                        <p className="font-medium text-orange-600">{data.operational_capacity}</p>
                      </div>
                    )}
                    {data.operating_hours && (
                      <div>
                        <span className="text-muted-foreground">Operating Hours:</span>
                        <p className="font-medium text-orange-600">{data.operating_hours}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {data.estimated_cost_kina && data.estimated_cost_kina > 0 && (
                <div className="pt-3 border-t">
                  <span className="text-muted-foreground">Estimated Project Cost:</span>
                  <p className="font-medium text-lg text-orange-600">{formatCurrency(data.estimated_cost_kina)}</p>
                </div>
              )}


              {/* Compliance and Approvals */}
              {(data.existing_permits_details || data.government_agreements_details || data.required_approvals) && (
                <div className="pt-3 border-t">
                  <h5 className="font-medium mb-2">Compliance & Approvals</h5>
                  {data.existing_permits_details && (
                    <div className="mb-2">
                      <span className="text-muted-foreground">Existing Permits:</span>
                      <p className="font-medium text-orange-600">{data.existing_permits_details}</p>
                    </div>
                  )}
                  {data.government_agreements_details && (
                    <div className="mb-2">
                      <span className="text-muted-foreground">Government Agreements:</span>
                      <p className="font-medium text-orange-600">{data.government_agreements_details}</p>
                    </div>
                  )}
                  {data.required_approvals && (
                    <div className="mb-2">
                      <span className="text-muted-foreground">Required Approvals:</span>
                      <p className="font-medium text-orange-600">{data.required_approvals}</p>
                    </div>
                  )}
                  {data.consulted_departments && (
                    <div className="mb-2">
                      <span className="text-muted-foreground">Consulted Departments:</span>
                      <p className="font-medium text-orange-600">{data.consulted_departments}</p>
                    </div>
                  )}
                  {data.landowner_negotiation_status && (
                    <div>
                      <span className="text-muted-foreground">Landowner Negotiation Status:</span>
                      <p className="font-medium text-orange-600">{data.landowner_negotiation_status}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Land Details */}
              {(data.legal_description || data.land_type || data.owner_name || data.tenure) && (
                <div className="pt-3 border-t">
                  <h5 className="font-medium mb-2">Land Details</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.legal_description && (
                      <div>
                        <span className="text-muted-foreground">Legal Description:</span>
                        <p className="font-medium text-orange-600">{data.legal_description}</p>
                      </div>
                    )}
                    {data.land_type && (
                      <div>
                        <span className="text-muted-foreground">Land Type:</span>
                        <p className="font-medium text-orange-600">{data.land_type}</p>
                      </div>
                    )}
                    {data.owner_name && (
                      <div>
                        <span className="text-muted-foreground">Owner Name:</span>
                        <p className="font-medium text-orange-600">{data.owner_name}</p>
                      </div>
                    )}
                    {data.tenure && (
                      <div>
                        <span className="text-muted-foreground">Tenure:</span>
                        <p className="font-medium text-orange-600">{data.tenure}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Permit Specific Fields */}
          {renderPermitSpecificFields()}

          {/* Uploaded Documents Summary */}
          {data.uploaded_files && data.uploaded_files.length > 0 && (
            <div>
              <h4 className="font-medium flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4" />
                Uploaded Documents
              </h4>
              <div className="space-y-1 text-sm">
                {data.uploaded_files.map((file: any, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <span className="text-orange-600">{file.name || file.filename || `Document ${index + 1}`}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fee Summary */}
          {data.calculatedFees && (
            <div>
              <h4 className="font-medium flex items-center gap-2 mb-3">
                <DollarSign className="w-4 h-4" />
                Fee Summary
              </h4>
              <div className="p-4 bg-muted/50 border border-border rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Administration Fee:</span>
                    <p className="font-medium text-orange-600">{formatCurrency(data.calculatedFees.administrationFee)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Technical Fee:</span>
                    <p className="font-medium text-orange-600">{formatCurrency(data.calculatedFees.technicalFee)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Fee:</span>
                    <p className="font-semibold text-lg text-orange-600">{formatCurrency(data.calculatedFees.totalFee)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          </CardContent>
        </Card>
        </TabsContent>
      </Tabs>

      {/* Legal Declaration */}
      <Card className="print:hidden">
        <CardHeader>
          <CardTitle>Legal Declaration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Papua New Guinea Environment Act 2000</h4>
            <p className="text-sm text-blue-700">
              By submitting this application, you acknowledge that you understand and will comply with all provisions 
              of the Environment Act 2000 and associated regulations. Providing false or misleading information 
              is an offense under the Act and may result in penalties including fines and imprisonment.
            </p>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="legal_declaration"
              checked={data.legal_declaration_accepted || false}
              onCheckedChange={(checked) => onChange({ legal_declaration_accepted: checked })}
              className="mt-1"
            />
            <div className="space-y-1">
              <label htmlFor="legal_declaration" className="text-sm font-medium cursor-pointer">
                I declare that the information provided in this application is true and accurate *
              </label>
              <p className="text-xs text-muted-foreground">
                I understand that providing false information is an offense under the Environment Act 2000
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="compliance_commitment"
              checked={data.compliance_commitment || false}
              onCheckedChange={(checked) => onChange({ compliance_commitment: checked })}
              className="mt-1"
            />
            <div className="space-y-1">
              <label htmlFor="compliance_commitment" className="text-sm font-medium cursor-pointer">
                I commit to comply with all conditions of the permit if granted *
              </label>
              <p className="text-xs text-muted-foreground">
                This includes environmental monitoring, reporting requirements, and mitigation measures
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submission Status */}
      <Card className="print:hidden">
        <CardContent className="pt-6">
          <div className={`flex items-center gap-3 p-4 rounded-lg border ${
            allSectionsComplete && data.legal_declaration_accepted && data.compliance_commitment
              ? 'bg-green-50 border-green-200' 
              : 'bg-amber-50 border-amber-200'
          }`}>
            {allSectionsComplete && data.legal_declaration_accepted && data.compliance_commitment ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Ready for Submission</p>
                  <p className="text-sm text-green-700">
                    All required information has been provided. You can now submit your application.
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-800">Application Incomplete</p>
                  <p className="text-sm text-amber-700">
                    Please complete all mandatory fields and accept the legal declarations before submitting.
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}