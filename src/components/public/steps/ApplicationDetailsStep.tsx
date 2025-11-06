
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';

interface ApplicationDetailsStepProps {
  data: any;
  onChange: (data: any) => void;
}

export function ApplicationDetailsStep({ data, onChange }: ApplicationDetailsStepProps) {
  const [formData, setFormData] = useState({
    legal_description: data.legal_description || '',
    land_type: data.land_type || '',
    owner_name: data.owner_name || '',
    tenure: data.tenure || '',
    existing_permits_details: data.existing_permits_details || '',
    government_agreements_details: data.government_agreements_details || '',
    consulted_departments: data.consulted_departments || '',
    required_approvals: data.required_approvals || '',
    landowner_negotiation_status: data.landowner_negotiation_status || '',
  });

  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Step 2: Details of Application</CardTitle>
          <CardDescription>
            Provide detailed information about the land and existing permits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="legal_description">2.1 Legal Description of Land Involved</Label>
            <Textarea
              id="legal_description"
              value={formData.legal_description}
              onChange={(e) => handleChange('legal_description', e.target.value)}
              placeholder="Enter the legal description of the land"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="land_type">Land Type</Label>
              <Select value={formData.land_type} onValueChange={(value) => handleChange('land_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select land type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customary">Customary</SelectItem>
                  <SelectItem value="alienated">Alienated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner_name">(a) Name of Owner</Label>
              <Input
                id="owner_name"
                value={formData.owner_name}
                onChange={(e) => handleChange('owner_name', e.target.value)}
                placeholder="Enter owner name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tenure">(b) Tenure</Label>
            <Input
              id="tenure"
              value={formData.tenure}
              onChange={(e) => handleChange('tenure', e.target.value)}
              placeholder="Enter tenure details"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="existing_permits_details">2.2 Details of Existing Permits and Licenses</Label>
            <Textarea
              id="existing_permits_details"
              value={formData.existing_permits_details}
              onChange={(e) => handleChange('existing_permits_details', e.target.value)}
              placeholder="List any existing permits and licenses held over the area"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="government_agreements_details">2.3 Details of Government Agreements</Label>
            <Textarea
              id="government_agreements_details"
              value={formData.government_agreements_details}
              onChange={(e) => handleChange('government_agreements_details', e.target.value)}
              placeholder="Details of any existing agreements with the Government of PNG"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="consulted_departments">2.4 Government Departments Consulted</Label>
            <Textarea
              id="consulted_departments"
              value={formData.consulted_departments}
              onChange={(e) => handleChange('consulted_departments', e.target.value)}
              placeholder="List other Government Departments or Statutory Bodies consulted"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="required_approvals">2.5 Other Formal Government Approvals Required</Label>
            <Textarea
              id="required_approvals"
              value={formData.required_approvals}
              onChange={(e) => handleChange('required_approvals', e.target.value)}
              placeholder="List other formal Government approvals required"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="landowner_negotiation_status">2.6 Status of Negotiation with Landowner Groups</Label>
            <Textarea
              id="landowner_negotiation_status"
              value={formData.landowner_negotiation_status}
              onChange={(e) => handleChange('landowner_negotiation_status', e.target.value)}
              placeholder="Describe the status of negotiations with landowner groups (if applicable)"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
