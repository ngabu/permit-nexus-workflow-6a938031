
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building } from 'lucide-react';

interface ProjectDetailsTabProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
}

const ProjectDetailsTab: React.FC<ProjectDetailsTabProps> = ({ formData, handleInputChange }) => {

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5 text-primary" />
            Project Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          <div>
            <Label htmlFor="projectDescription">Project Description *</Label>
            <Textarea
              id="projectDescription"
              value={formData.projectDescription}
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
                value={formData.projectStartDate}
                onChange={(e) => handleInputChange('projectStartDate', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="projectEndDate">Project End Date</Label>
              <Input
                id="projectEndDate"
                type="date"
                value={formData.projectEndDate}
                onChange={(e) => handleInputChange('projectEndDate', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="environmentalImpact">Environmental Impact Assessment *</Label>
            <Textarea
              id="environmentalImpact"
              value={formData.environmentalImpact}
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
              value={formData.mitigationMeasures}
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

export default ProjectDetailsTab;
