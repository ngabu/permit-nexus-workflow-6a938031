import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, Activity, FileCheck } from 'lucide-react';
import { EntityDropdownSelector } from '@/components/public/EntityDropdownSelector';
import { useEntityPermits } from '@/hooks/useEntityPermits';

interface ProjectAndSpecificDetailsTabProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
}

const ProjectAndSpecificDetailsTab: React.FC<ProjectAndSpecificDetailsTabProps> = ({ 
  formData, 
  handleInputChange 
}) => {
  const { permits, loading: permitsLoading } = useEntityPermits(formData.entity_id);
  
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

          {/* Existing Permit Selection */}
          {formData.entity_id && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileCheck className="w-4 h-4" />
                Related Existing Permit (Optional)
              </Label>
              {permitsLoading ? (
                <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground text-center">
                  Loading permits...
                </div>
              ) : permits.length > 0 ? (
                <div className="space-y-2 p-3 bg-background border rounded-lg max-h-48 overflow-y-auto">
                  <div 
                    onClick={() => handleInputChange('existing_permit_id', null)}
                    className={`p-3 rounded-md cursor-pointer transition-colors ${
                      !formData.existing_permit_id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <span className="font-medium">None</span>
                    <p className="text-xs opacity-80 mt-1">No existing permit</p>
                  </div>
                  {permits.map((permit) => (
                    <div
                      key={permit.id}
                      onClick={() => handleInputChange('existing_permit_id', permit.id)}
                      className={`p-3 rounded-md cursor-pointer transition-colors ${
                        formData.existing_permit_id === permit.id 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{permit.title}</p>
                          <p className="text-xs opacity-80 mt-1">
                            {permit.permit_number || 'No permit number'} • {permit.permit_type}
                          </p>
                          {permit.approval_date && (
                            <p className="text-xs opacity-70 mt-1">
                              Approved: {new Date(permit.approval_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground text-center">
                  No approved permits found for this entity
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Select an existing permit if this application is related to an amendment, renewal, or transfer
              </p>
            </div>
          )}

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
