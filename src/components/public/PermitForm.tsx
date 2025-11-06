
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Entity {
  id: string;
  name: string;
  entity_type: string;
}

interface PermitFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const PERMIT_TYPES = [
  'Logging Permit',
  'Mining Permit',
  'Fishing License',
  'Environmental Impact Assessment',
  'Waste Management License',
  'Water Use Permit',
  'Land Use Permit',
  'Conservation Permit'
];

export function PermitForm({ onSuccess, onCancel }: PermitFormProps) {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [formData, setFormData] = useState({
    entity_id: '',
    permit_type: '',
    title: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchEntities();
  }, [user]);

  const fetchEntities = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('entities')
        .select('id, name, entity_type')
        .order('name');

      if (error) throw error;
      setEntities(data || []);
    } catch (error) {
      console.error('Error fetching entities:', error);
      toast({
        title: "Error",
        description: "Failed to load entities",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('permit_applications' as any)
        .insert([{
          user_id: user.id,
          entity_id: formData.entity_id,
          permit_type: formData.permit_type,
          title: formData.title,
          description: formData.description || null,
          status: 'draft',
          application_date: new Date().toISOString(),
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Permit application created successfully",
      });
      onSuccess();
    } catch (error) {
      console.error('Error creating permit:', error);
      toast({
        title: "Error",
        description: "Failed to create permit application",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (entities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-forest-600 mb-4">You need to create an entity before applying for permits.</p>
        <Button onClick={onCancel} variant="secondary">
          Go to Entity Management
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="entity_id">Entity *</Label>
        <Select value={formData.entity_id} onValueChange={(value) => setFormData({ ...formData, entity_id: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select an entity" />
          </SelectTrigger>
          <SelectContent>
            {entities.map((entity) => (
              <SelectItem key={entity.id} value={entity.id}>
                {entity.name} ({entity.entity_type})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="permit_type">Permit Type *</Label>
        <Select value={formData.permit_type} onValueChange={(value) => setFormData({ ...formData, permit_type: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select permit type" />
          </SelectTrigger>
          <SelectContent>
            {PERMIT_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Application Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Brief description of your permit request"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Detailed description of your permit application"
          rows={4}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={loading || !formData.entity_id || !formData.permit_type || !formData.title}
          className="bg-gradient-to-r from-forest-600 to-nature-600 hover:from-forest-700 hover:to-nature-700"
        >
          {loading ? 'Creating...' : 'Create Application'}
        </Button>
      </div>
    </form>
  );
}
