
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Save, ArrowLeft } from 'lucide-react';

interface DraftApplication {
  id: string;
  title: string;
  permit_type: string;
  description?: string;
  status: string;
  entity_id: string;
  entities: {
    name: string;
    entity_type: string;
  };
}

interface DraftApplicationEditorProps {
  application: DraftApplication;
  onSave: () => void;
  onCancel: () => void;
}

export function DraftApplicationEditor({ application, onSave, onCancel }: DraftApplicationEditorProps) {
  const [formData, setFormData] = useState({
    title: application.title,
    permit_type: application.permit_type,
    description: application.description || '',
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const permitTypes = [
    'environmental_impact_assessment',
    'discharge_permit',
    'waste_management_permit',
    'air_quality_permit',
    'mining_permit',
    'forestry_permit',
    'other'
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('permit_applications' as any)
        .update({
          title: formData.title,
          permit_type: formData.permit_type,
          description: formData.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', application.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Draft application updated successfully",
      });
      
      onSave();
    } catch (error) {
      console.error('Error updating application:', error);
      toast({
        title: "Error",
        description: "Failed to update application",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-forest-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-forest-800">Edit Draft Application</CardTitle>
            <CardDescription>Make changes to your draft application</CardDescription>
          </div>
          <Button variant="secondary" onClick={onCancel}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Application Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter application title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="permit_type">Permit Type</Label>
          <Select 
            value={formData.permit_type} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, permit_type: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select permit type" />
            </SelectTrigger>
            <SelectContent>
              {permitTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter application description"
            rows={4}
          />
        </div>

        <div className="p-3 bg-forest-50 rounded-lg">
          <p className="text-sm text-forest-600">
            <strong>Entity:</strong> {application.entities.name} ({application.entities.entity_type})
          </p>
        </div>

        <div className="flex space-x-4 pt-4">
          <Button 
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-forest-600 to-nature-600 hover:from-forest-700 hover:to-nature-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
