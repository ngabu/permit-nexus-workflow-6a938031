import React, { useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Activity, AlertTriangle, FileText, Droplets, Leaf, Gauge } from 'lucide-react';
import { usePrescribedActivities } from '@/hooks/usePrescribedActivities';
import { usePermitTypes } from '@/hooks/usePermitTypes';
import { usePermitTypeFields } from '@/hooks/usePermitTypeFields';
import { useIndustrialSectors } from '@/hooks/useIndustrialSectors';

interface ActivityClassificationStepProps {
  data: any;
  onChange: (data: any) => void;
}

const ACTIVITY_LEVELS = [
  { value: 'Level 1', label: 'Level 1 - Low Impact Activities', description: 'Simple activities with minimal environmental impact' },
  { value: 'Level 2', label: 'Level 2 - Moderate Impact Activities', description: 'Moderate to complex activities requiring environmental assessment and review' },
  { value: 'Level 3', label: 'Level 3 - High Impact Activities', description: 'High-impact activities requiring comprehensive EIA and EIS' }
];

export function ActivityClassificationStep({ data, onChange }: ActivityClassificationStepProps) {
  const selectedLevel = ACTIVITY_LEVELS.find(level => level.value === data.activity_level);
  const { data: prescribedActivities, isLoading: activitiesLoading } = usePrescribedActivities();
  const { permitTypes, loading: permitTypesLoading } = usePermitTypes();
  const { industrialSectors, loading: industrialSectorsLoading } = useIndustrialSectors();
  
  const selectedPermitType = permitTypes.find(pt => pt.id === data.permit_type_id);
  const { fields: permitTypeFields, loading: fieldsLoading } = usePermitTypeFields(selectedPermitType?.name);

  const filteredActivities = useMemo(() => {
    if (!data.activity_level || !prescribedActivities) return [];
    const levelNumber = data.activity_level.includes('Level 1') ? 1 :
                       data.activity_level.includes('Level 2') ? 2 :
                       data.activity_level.includes('Level 3') ? 3 : null;
    if (!levelNumber) return [];
    return prescribedActivities.filter(activity => activity.level === levelNumber);
  }, [data.activity_level, prescribedActivities]);
  
  useEffect(() => {
    const updates: any = {
      eia_required: ['Level 2', 'Level 3'].includes(data.activity_level),
      eis_required: data.activity_level === 'Level 3'
    };
    onChange(updates);
  }, [data.activity_level, onChange]);

  const selectedActivity = prescribedActivities?.find(a => a.id === data.prescribed_activity_id);

  const renderField = (field: any) => {
    const fieldValue = data.permit_type_specific_data?.[field.field_name] || '';
    
    const handleFieldChange = (value: string) => {
      const updatedData = { ...data.permit_type_specific_data, [field.field_name]: value };
      onChange({ permit_type_specific_data: updatedData });
    };

    // Determine if field should span full width
    const isFullWidth = field.field_type === 'textarea' || 
                        field.field_label?.toLowerCase().includes('details') ||
                        field.field_label?.toLowerCase().includes('description');
    const wrapperClass = isFullWidth ? "space-y-2 col-span-full" : "space-y-2";

    switch (field.field_type) {
      case 'text':
      case 'number':
      case 'email':
      case 'tel':
        return (
          <div key={field.id} className={wrapperClass}>
            <Label htmlFor={field.field_name}>
              {field.field_label} {field.is_mandatory && <span className="text-destructive">*</span>}
            </Label>
            <Input id={field.field_name} type={field.field_type} value={fieldValue}
              onChange={(e) => handleFieldChange(e.target.value)} placeholder={field.placeholder || ''} />
            {field.help_text && <p className="text-xs text-muted-foreground">{field.help_text}</p>}
          </div>
        );
      case 'textarea':
        return (
          <div key={field.id} className="space-y-2 col-span-full">
            <Label htmlFor={field.field_name}>
              {field.field_label} {field.is_mandatory && <span className="text-destructive">*</span>}
            </Label>
            <Textarea id={field.field_name} value={fieldValue}
              onChange={(e) => handleFieldChange(e.target.value)} placeholder={field.placeholder || ''} rows={4} />
            {field.help_text && <p className="text-xs text-muted-foreground">{field.help_text}</p>}
          </div>
        );
      case 'select':
        const options = field.field_options?.options || [];
        return (
          <div key={field.id} className={wrapperClass}>
            <Label htmlFor={field.field_name}>
              {field.field_label} {field.is_mandatory && <span className="text-destructive">*</span>}
            </Label>
            <Select value={fieldValue} onValueChange={handleFieldChange}>
              <SelectTrigger><SelectValue placeholder={field.placeholder || `Select ${field.field_label}`} /></SelectTrigger>
              <SelectContent>
                {options.map((option: string, idx: number) => (
                  <SelectItem key={idx} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.help_text && <p className="text-xs text-muted-foreground">{field.help_text}</p>}
          </div>
        );
      default:
        return null;
    }
  };

  const getLevelColor = (level: string) => {
    const colors = {
      'Level 1': 'bg-green-100 text-green-800 border-green-200',
      'Level 2': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Level 3': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[level] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getRequirements = (level: string) => {
    const requirements = {
      'Level 1': ['Basic environmental screening', 'Standard compliance documentation', 'Processing: 30-45 days'],
      'Level 2': ['Environmental Impact Assessment (EIA)', 'Technical review and analysis', 'Public consultation may be required', 'Processing: 60-120 days'],
      'Level 3': ['Comprehensive Environmental Impact Statement (EIS)', 'Extensive public consultation process', 'Multiple specialist assessments', 'Independent technical review', 'Processing: 120-180 days']
    };
    return requirements[level] || [];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Activity Classification
        </CardTitle>
        <CardDescription>Select the activity level and prescribed activity according to PNG Environment Act 2000</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="activity_level">Activity Level *</Label>
            <Select value={data.activity_level || ''} onValueChange={(value) => onChange({ activity_level: value })}>
              <SelectTrigger><SelectValue placeholder="Select activity level" /></SelectTrigger>
              <SelectContent>
                {ACTIVITY_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{level.label}</span>
                      <span className="text-xs text-muted-foreground">{level.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {data.activity_level && (
            <div className="space-y-2">
              <Label htmlFor="prescribed_activity">Prescribed Activity *</Label>
              <Select value={data.prescribed_activity_id || ''} 
                onValueChange={(value) => {
                  const selectedActivity = filteredActivities.find(activity => activity.id === value);
                  onChange({ 
                    prescribed_activity_id: value, activity_id: value,
                    activity_category: selectedActivity?.category_type,
                    activity_subcategory: selectedActivity?.sub_category,
                    activity_description: selectedActivity?.activity_description
                  });
                }}
                disabled={activitiesLoading || filteredActivities.length === 0}>
                <SelectTrigger>
                  <SelectValue placeholder={activitiesLoading ? "Loading activities..." : filteredActivities.length === 0 ? "No activities available for this level" : "Select prescribed activity"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredActivities.map((activity) => (
                    <SelectItem key={activity.id} value={activity.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{activity.category_number} - {activity.category_type}</span>
                        <span className="text-xs text-muted-foreground">{activity.activity_description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedActivity && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{selectedActivity.category_type}</Badge>
                  <Badge variant="secondary">Category {selectedActivity.category_number}</Badge>
                  <Badge variant="secondary">Level {selectedActivity.level}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Description:</span> {selectedActivity.activity_description}
                </p>
                {selectedActivity.sub_category && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Subcategory:</span> {selectedActivity.sub_category}
                  </p>
                )}
              </div>
            </div>
          )}

          {data.prescribed_activity_id && (
            <>
              <div className="space-y-2">
                <Label htmlFor="industrial_sector">Industrial Sector *</Label>
                <Select value={data.industrial_sector_id || ''} 
                  onValueChange={(value) => {
                    onChange({ industrial_sector_id: value });
                  }}
                  disabled={industrialSectorsLoading}>
                  <SelectTrigger><SelectValue placeholder={industrialSectorsLoading ? "Loading industrial sectors..." : "Select industrial sector"} /></SelectTrigger>
                  <SelectContent>
                    {industrialSectors.map((sector) => (
                      <SelectItem key={sector.id} value={sector.id}>
                        {sector.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="permit_type">Permit Type *</Label>
                <Select value={data.permit_type_id || ''} 
                  onValueChange={(value) => {
                    const selectedType = permitTypes.find(pt => pt.id === value);
                    onChange({ permit_type_id: value, permit_type: selectedType?.name, permit_type_specific_data: {} });
                  }}
                  disabled={permitTypesLoading}>
                  <SelectTrigger><SelectValue placeholder={permitTypesLoading ? "Loading permit types..." : "Select permit type"} /></SelectTrigger>
                  <SelectContent>
                    {permitTypes.map((permitType) => (
                      <SelectItem key={permitType.id} value={permitType.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{permitType.display_name}</span>
                          <span className="text-xs text-muted-foreground">{permitType.category}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {data.permit_type_id && selectedPermitType && (
            <div className="space-y-4 p-4 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg">{selectedPermitType.display_name} - Specific Information</h3>
              </div>
              {fieldsLoading ? (
                <p className="text-sm text-muted-foreground">Loading fields...</p>
              ) : permitTypeFields.length === 0 ? (
                <p className="text-sm text-muted-foreground">No additional fields required for this permit type.</p>
              ) : (() => {
                // Group fields based on permit type and form structure
                
                // Water Extraction Permit (G2) - Already implemented
                const environmentalValuesFields = permitTypeFields.filter(f => 
                  f.field_name?.startsWith('env_value_') ||
                  f.field_name?.startsWith('water_source_') ||
                  f.field_name?.startsWith('adjacent_land_') ||
                  f.field_name?.startsWith('structures_')
                );
                
                const proposedVolumeFields = permitTypeFields.filter(f => 
                  f.field_name?.startsWith('proposed_use_')
                );
                
                const hydrologicalFields = permitTypeFields.filter(f => 
                  f.field_name?.startsWith('hydro_')
                );
                
                // Water Investigation Permit (G3)
                const proposalDetailsFields = permitTypeFields.filter(f => 
                  f.field_name?.startsWith('proposal_water_source_') ||
                  f.field_name?.startsWith('proposal_map_') ||
                  f.field_name?.startsWith('proposal_legal_') ||
                  f.field_name?.startsWith('proposal_owner_') ||
                  f.field_name?.startsWith('proposal_plan_') ||
                  f.field_name?.startsWith('proposal_other_')
                );
                
                const drillingActivityFields = permitTypeFields.filter(f => 
                  f.field_name?.startsWith('drilling_') ||
                  f.field_name?.startsWith('drill_materials_') ||
                  f.field_name?.startsWith('environmental_impacts_')
                );
                
                // ODS Import Permit (G4)
                const odsSubstanceFields = permitTypeFields.filter(f => 
                  f.field_name?.startsWith('ods_type_') ||
                  f.field_name?.startsWith('ods_cfc_') ||
                  f.field_name?.startsWith('ods_hcfc_') ||
                  f.field_name?.startsWith('ods_methyl_') ||
                  f.field_name?.startsWith('ods_other_')
                );
                
                const odsAttachmentsFields = permitTypeFields.filter(f => 
                  f.field_name?.startsWith('ods_use_') ||
                  f.field_name?.startsWith('ods_label_') ||
                  f.field_name?.startsWith('ods_msds_')
                );
                
                // Pesticide Permit (G5)
                const pesticideProductFields = permitTypeFields.filter(f => 
                  f.field_name?.startsWith('pesticide_type_') ||
                  f.field_name?.startsWith('pesticide_product_') ||
                  f.field_name?.startsWith('pesticide_applicant_') ||
                  f.field_name?.startsWith('pesticide_active_') ||
                  f.field_name?.startsWith('pesticide_formulation_') ||
                  f.field_name?.startsWith('pesticide_use_type_') ||
                  f.field_name?.startsWith('pesticide_overseas_') ||
                  f.field_name?.startsWith('pesticide_manufacturer_') ||
                  f.field_name?.startsWith('pesticide_country_')
                );
                
                const pesticideAttachmentsFields = permitTypeFields.filter(f => 
                  f.field_name?.startsWith('pesticide_attachments_') ||
                  f.field_name?.startsWith('pesticide_use_patterns_') ||
                  f.field_name?.startsWith('pesticide_registration_') ||
                  f.field_name?.startsWith('pesticide_label_') ||
                  f.field_name?.startsWith('pesticide_msds_')
                );
                
                const otherFields = permitTypeFields.filter(f => 
                  !environmentalValuesFields.includes(f) && 
                  !proposedVolumeFields.includes(f) && 
                  !hydrologicalFields.includes(f) &&
                  !proposalDetailsFields.includes(f) &&
                  !drillingActivityFields.includes(f) &&
                  !odsSubstanceFields.includes(f) &&
                  !odsAttachmentsFields.includes(f) &&
                  !pesticideProductFields.includes(f) &&
                  !pesticideAttachmentsFields.includes(f)
                );
                
                // Check if this permit has grouped fields
                const isWaterExtractionPermit = environmentalValuesFields.length > 0 || proposedVolumeFields.length > 0 || hydrologicalFields.length > 0;
                const isWaterInvestigationPermit = proposalDetailsFields.length > 0 || drillingActivityFields.length > 0;
                const isODSImportPermit = odsSubstanceFields.length > 0 || odsAttachmentsFields.length > 0;
                const isPesticidePermit = pesticideProductFields.length > 0 || pesticideAttachmentsFields.length > 0;
                
                if (isWaterExtractionPermit) {
                  return (
                    <div className="space-y-6">
                      {/* Other Fields (Water Source Details, etc.) */}
                      {otherFields.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                          {otherFields.map(field => renderField(field))}
                        </div>
                      )}
                      
                      {/* Environmental Values Section */}
                      {environmentalValuesFields.length > 0 && (
                          <div className="space-y-4 p-4 sm:p-6 border rounded-lg bg-muted/30">
                          <div className="space-y-1">
                            <h4 className="font-medium text-sm flex items-center gap-2">
                              <Leaf className="w-4 h-4 text-primary" />
                              Environmental Values
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Provide comprehensive water source details, legal descriptions, tenure information, and identify environmental values 1km downstream of the proposed extraction site that may be affected by water extraction activities
                            </p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            {environmentalValuesFields.map(field => renderField(field))}
                          </div>
                        </div>
                      )}
                      
                      {/* Proposed Volume Section */}
                      {proposedVolumeFields.length > 0 && (
                        <div className="space-y-4 p-4 sm:p-6 border rounded-lg bg-muted/30">
                          <div className="space-y-1">
                            <h4 className="font-medium text-sm flex items-center gap-2">
                              <Gauge className="w-4 h-4 text-primary" />
                              Proposed Volume
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Specify the estimated quantity and usage pattern of water to be extracted, including return flow estimates to the water source
                            </p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            {proposedVolumeFields.map(field => renderField(field))}
                          </div>
                        </div>
                      )}
                      
                      {/* Hydrological Data Section */}
                      {hydrologicalFields.length > 0 && (
                        <div className="space-y-4 p-4 sm:p-6 border rounded-lg bg-muted/30">
                          <div className="space-y-1">
                            <h4 className="font-medium text-sm flex items-center gap-2">
                              <Droplets className="w-4 h-4 text-primary" />
                              Hydrological Data
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Provide detailed hydrological information for the extraction site including estimated annual, dry weather, and wet weather flow rates
                            </p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            {hydrologicalFields.map(field => renderField(field))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
                
                if (isWaterInvestigationPermit) {
                  return (
                    <div className="space-y-6">
                      {/* Other Fields */}
                      {otherFields.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                          {otherFields.map(field => renderField(field))}
                        </div>
                      )}
                      
                      {/* Details of Proposal Section */}
                      {proposalDetailsFields.length > 0 && (
                        <div className="space-y-4 p-4 sm:p-6 border rounded-lg bg-muted/30">
                          <div className="space-y-1">
                            <h4 className="font-medium text-sm flex items-center gap-2">
                              <FileText className="w-4 h-4 text-primary" />
                              Details of Proposal
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Provide water source description, map coordinates, legal description of land, ownership details, and plan of structures for conducting hydrological investigation
                            </p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            {proposalDetailsFields.map(field => renderField(field))}
                          </div>
                        </div>
                      )}
                      
                      {/* Drilling Activity and Potential Impacts Section */}
                      {drillingActivityFields.length > 0 && (
                        <div className="space-y-4 p-4 sm:p-6 border rounded-lg bg-muted/30">
                          <div className="space-y-1">
                            <h4 className="font-medium text-sm flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-primary" />
                              Drilling Activity and Potential Impacts
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Specify details of drill materials (drill mud, fluids, etc.), their chemical composition, and potential environmental impacts of the investigation activities
                            </p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            {drillingActivityFields.map(field => renderField(field))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
                
                if (isODSImportPermit) {
                  return (
                    <div className="space-y-6">
                      {/* Other Fields */}
                      {otherFields.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                          {otherFields.map(field => renderField(field))}
                        </div>
                      )}
                      
                      {/* Ozone Depleting Substance Details Section */}
                      {odsSubstanceFields.length > 0 && (
                        <div className="space-y-4 p-4 sm:p-6 border rounded-lg bg-muted/30">
                          <div className="space-y-1">
                            <h4 className="font-medium text-sm flex items-center gap-2">
                              <Activity className="w-4 h-4 text-primary" />
                              Ozone Depleting Substance Details
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Specify the type and name of ozone depleting substance (CFC, HCFC, Methyl Bromide, or Others) that you wish to import
                            </p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            {odsSubstanceFields.map(field => renderField(field))}
                          </div>
                        </div>
                      )}
                      
                      {/* Required Attachments Section */}
                      {odsAttachmentsFields.length > 0 && (
                        <div className="space-y-4 p-4 sm:p-6 border rounded-lg bg-muted/30">
                          <div className="space-y-1">
                            <h4 className="font-medium text-sm flex items-center gap-2">
                              <FileText className="w-4 h-4 text-primary" />
                              Required Attachments
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Provide summary of intended use patterns, 2 original copies of labels, and copy of current MSDS (Material Safety Data Sheet) for the ODS
                            </p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            {odsAttachmentsFields.map(field => renderField(field))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
                
                if (isPesticidePermit) {
                  return (
                    <div className="space-y-6">
                      {/* Other Fields */}
                      {otherFields.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                          {otherFields.map(field => renderField(field))}
                        </div>
                      )}
                      
                      {/* Product Details Section */}
                      {pesticideProductFields.length > 0 && (
                        <div className="space-y-4 p-4 sm:p-6 border rounded-lg bg-muted/30">
                          <div className="space-y-1">
                            <h4 className="font-medium text-sm flex items-center gap-2">
                              <Activity className="w-4 h-4 text-primary" />
                              Product Details
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Provide comprehensive pesticide product information including type of permit, product name, active ingredients, formulation, use type, overseas registration, and manufacturer details
                            </p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            {pesticideProductFields.map(field => renderField(field))}
                          </div>
                        </div>
                      )}
                      
                      {/* Required Attachments Section */}
                      {pesticideAttachmentsFields.length > 0 && (
                        <div className="space-y-4 p-4 sm:p-6 border rounded-lg bg-muted/30">
                          <div className="space-y-1">
                            <h4 className="font-medium text-sm flex items-center gap-2">
                              <FileText className="w-4 h-4 text-primary" />
                              Required Attachments
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Provide summary of intended use patterns, evidence of overseas registration, 2 original copies of labels, and copy of current MSDS (Material Safety Data Sheet)
                            </p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            {pesticideAttachmentsFields.map(field => renderField(field))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
                
                
                // No grouping needed for other permit types
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    {permitTypeFields.map(field => renderField(field))}
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {selectedLevel && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border ${getLevelColor(data.activity_level)}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold">{selectedLevel.label}</h4>
                  <p className="text-sm mt-1">{selectedLevel.description}</p>
                </div>
                <Badge variant="outline" className="border-current">{data.activity_level}</Badge>
              </div>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />Assessment Requirements
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                {getRequirements(data.activity_level).map((requirement, index) => (
                  <li key={index}>• {requirement}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
