import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Building, Calendar, Activity, Settings, Layers, Loader2 } from 'lucide-react';
import { usePermitTypeFields } from '@/hooks/usePermitTypeFields';
import { usePermitTypes } from '@/hooks/usePermitTypes';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EntityDropdownSelector } from '@/components/public/EntityDropdownSelector';

interface ProjectAndSpecificDetailsTabProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
}

const ProjectAndSpecificDetailsTab: React.FC<ProjectAndSpecificDetailsTabProps> = ({ 
  formData, 
  handleInputChange 
}) => {
  const { permitTypes, loading: loadingTypes } = usePermitTypes();
  
  // Get selected permit type object
  const selectedPermitType = useMemo(() => 
    permitTypes.find(pt => pt.id === formData.permit_type_id),
    [permitTypes, formData.permit_type_id]
  );
  
  // Get unique categories
  const categories = useMemo(() => 
    Array.from(new Set(permitTypes.map(pt => pt.category))).sort(),
    [permitTypes]
  );
  
  // Filter permit types by selected category
  const filteredPermitTypes = useMemo(() => 
    formData.permit_category 
      ? permitTypes.filter(pt => pt.category === formData.permit_category)
      : [],
    [permitTypes, formData.permit_category]
  );
  
  const { fields, loading, error } = usePermitTypeFields(selectedPermitType?.name);

  // Store dynamic field data in a dedicated object
  const dynamicFieldsData = formData.permit_specific_fields || {};

  const handleDynamicFieldChange = (fieldName: string, value: any) => {
    handleInputChange('permit_specific_fields', {
      ...dynamicFieldsData,
      [fieldName]: value
    });
  };

  const handleCategoryChange = (category: string) => {
    handleInputChange('permit_category', category);
    handleInputChange('permit_type_id', undefined);
    handleInputChange('permit_specific_fields', {});
  };

  const handlePermitTypeChange = (permitTypeId: string) => {
    handleInputChange('permit_type_id', permitTypeId);
    handleInputChange('permit_specific_fields', {});
  };

  const renderDynamicField = (field: any) => {
    const value = dynamicFieldsData[field.field_name] || '';

    switch (field.field_type) {
      case 'text':
      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.field_name}>
              {field.field_label}
              {field.is_mandatory && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={field.field_name}
              type={field.field_type}
              value={value}
              onChange={(e) => handleDynamicFieldChange(field.field_name, e.target.value)}
              placeholder={field.placeholder || ''}
            />
            {field.help_text && (
              <p className="text-sm text-muted-foreground">{field.help_text}</p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.field_name}>
              {field.field_label}
              {field.is_mandatory && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Textarea
              id={field.field_name}
              value={value}
              onChange={(e) => handleDynamicFieldChange(field.field_name, e.target.value)}
              placeholder={field.placeholder || ''}
              rows={4}
            />
            {field.help_text && (
              <p className="text-sm text-muted-foreground">{field.help_text}</p>
            )}
          </div>
        );

      case 'select':
        const options = Array.isArray(field.field_options) ? field.field_options : [];
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.field_name}>
              {field.field_label}
              {field.is_mandatory && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Select
              value={value}
              onValueChange={(val) => handleDynamicFieldChange(field.field_name, val)}
            >
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || 'Select an option'} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option: string) => (
                  <SelectItem key={option} value={option}>
                    {option.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.help_text && (
              <p className="text-sm text-muted-foreground">{field.help_text}</p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="flex items-start space-x-2">
            <Checkbox
              id={field.field_name}
              checked={!!value}
              onCheckedChange={(checked) => handleDynamicFieldChange(field.field_name, checked)}
            />
            <div className="space-y-1 leading-none">
              <Label htmlFor={field.field_name} className="cursor-pointer">
                {field.field_label}
                {field.is_mandatory && <span className="text-destructive ml-1">*</span>}
              </Label>
              {field.help_text && (
                <p className="text-sm text-muted-foreground">{field.help_text}</p>
              )}
            </div>
          </div>
        );

      case 'date':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.field_name}>
              {field.field_label}
              {field.is_mandatory && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={field.field_name}
              type="date"
              value={value}
              onChange={(e) => handleDynamicFieldChange(field.field_name, e.target.value)}
            />
            {field.help_text && (
              <p className="text-sm text-muted-foreground">{field.help_text}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Project Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5 text-primary" />
            Project Overview
          </CardTitle>
          <CardDescription>
            Provide detailed information about your project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Entity Selection */}
          <EntityDropdownSelector
            selectedEntityId={formData.entity_id || null}
            onEntitySelect={(entityId, entityData) => {
              console.log('🏢 EntityDropdownSelector - onEntitySelect:', { entityId, entityData });
              handleInputChange('entity_id', entityId);
              if (entityData) {
                console.log('🏢 Setting entity data:', { 
                  entity_type: entityData.entity_type, 
                  entity_name: entityData.name 
                });
                handleInputChange('entity_type', entityData.entity_type);
                handleInputChange('entity_name', entityData.name);
              }
            }}
            onEntityCreate={() => {
              console.log('Entity created successfully');
            }}
          />

          <div>
            <Label htmlFor="applicationTitle">Application Title *</Label>
            <Input
              id="applicationTitle"
              value={formData.title || formData.applicationTitle || ''}
              onChange={(e) => {
                handleInputChange('title', e.target.value);
                handleInputChange('applicationTitle', e.target.value); // Keep both for compatibility
              }}
              placeholder="Enter a descriptive title for your application"
              required
            />
          </div>

          <div>
            <Label htmlFor="projectDescription">Project Description *</Label>
            <Textarea
              id="projectDescription"
              value={formData.projectDescription || ''}
              onChange={(e) => handleInputChange('projectDescription', e.target.value)}
              placeholder="Provide a detailed description of your project, including objectives, scope, and activities"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="projectStartDate">Project Start Date *</Label>
              <Input
                id="projectStartDate"
                type="date"
                value={formData.projectStartDate || ''}
                onChange={(e) => handleInputChange('projectStartDate', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="projectEndDate">Project End Date</Label>
              <Input
                id="projectEndDate"
                type="date"
                value={formData.projectEndDate || ''}
                onChange={(e) => handleInputChange('projectEndDate', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environmental Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Environmental Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="environmentalImpact">Environmental Impact Assessment *</Label>
            <Textarea
              id="environmentalImpact"
              value={formData.environmentalImpact || ''}
              onChange={(e) => handleInputChange('environmentalImpact', e.target.value)}
              placeholder="Describe the potential environmental impacts of your project"
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="mitigationMeasures">Mitigation Measures *</Label>
            <Textarea
              id="mitigationMeasures"
              value={formData.mitigationMeasures || ''}
              onChange={(e) => handleInputChange('mitigationMeasures', e.target.value)}
              placeholder="Describe the measures you will implement to minimize environmental impacts"
              rows={3}
              required
            />
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default ProjectAndSpecificDetailsTab;
