import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Settings, Loader2, Layers } from 'lucide-react';
import { usePermitTypeFields } from '@/hooks/usePermitTypeFields';
import { usePermitTypes } from '@/hooks/usePermitTypes';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PermitSpecificFieldsStepProps {
  data: any;
  onChange: (data: any) => void;
}

export function PermitSpecificFieldsStep({ data, onChange }: PermitSpecificFieldsStepProps) {
  const { permitTypes, loading: loadingTypes } = usePermitTypes();
  
  // Get selected permit type object
  const selectedPermitType = useMemo(() => 
    permitTypes.find(pt => pt.id === data.permit_type_id),
    [permitTypes, data.permit_type_id]
  );
  
  // Get unique categories
  const categories = useMemo(() => 
    Array.from(new Set(permitTypes.map(pt => pt.category))).sort(),
    [permitTypes]
  );
  
  // Filter permit types by selected category
  const filteredPermitTypes = useMemo(() => 
    data.permit_category 
      ? permitTypes.filter(pt => pt.category === data.permit_category)
      : [],
    [permitTypes, data.permit_category]
  );
  
  const { fields, loading, error } = usePermitTypeFields(selectedPermitType?.name);

  // Store dynamic field data in a dedicated object
  const dynamicFieldsData = data.permit_specific_fields || {};

  const handleDynamicFieldChange = (fieldName: string, value: any) => {
    onChange({
      permit_specific_fields: {
        ...dynamicFieldsData,
        [fieldName]: value
      }
    });
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

  const handleCategoryChange = (category: string) => {
    onChange({
      permit_category: category,
      permit_type_id: undefined,
      permit_specific_fields: {}
    });
  };

  const handlePermitTypeChange = (permitTypeId: string) => {
    onChange({
      permit_type_id: permitTypeId,
      permit_specific_fields: {}
    });
  };

  if (loadingTypes) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Permit-Specific Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading permit types...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading && selectedPermitType) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            {selectedPermitType.display_name} - Specific Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading permit fields...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && selectedPermitType) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-destructive" />
            {selectedPermitType.display_name} - Specific Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load permit fields: {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (fields.length === 0 && selectedPermitType) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            {selectedPermitType.display_name} - Specific Requirements
          </CardTitle>
          <CardDescription>
            Additional fields required for {selectedPermitType.display_name.toLowerCase()} permits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              No specific fields are configured for this permit type yet.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Permit-Specific Requirements
        </CardTitle>
        <CardDescription>
          Select permit type and complete the specific fields for your application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="permit_category" className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Permit Category *
            </Label>
            <Select 
              value={data.permit_category || ''} 
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger id="permit_category">
                <SelectValue placeholder="Select permit category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Permit Type Selection */}
          {data.permit_category && (
            <div className="space-y-2">
              <Label htmlFor="permit_type" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Permit Type *
              </Label>
              <Select 
                value={data.permit_type_id || ''} 
                onValueChange={handlePermitTypeChange}
              >
                <SelectTrigger id="permit_type">
                  <SelectValue placeholder="Select permit type" />
                </SelectTrigger>
                <SelectContent>
                  {filteredPermitTypes.map((permitType) => (
                    <SelectItem key={permitType.id} value={permitType.id}>
                      {permitType.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Dynamic Fields */}
          {selectedPermitType && fields.length > 0 && (
            <div className="space-y-6 pt-4 border-t">
              <div className="space-y-1">
                <h4 className="font-medium text-sm">
                  {selectedPermitType.display_name} Specific Fields
                </h4>
                <p className="text-sm text-muted-foreground">
                  Complete the following fields for your {selectedPermitType.display_name.toLowerCase()} permit
                </p>
              </div>
              {fields.map((field) => (
                <div key={field.id}>
                  {renderDynamicField(field)}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}