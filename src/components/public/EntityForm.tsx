
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface EntityFormProps {
  entity?: {
    id: string;
    entity_type: 'individual' | 'company';
    name: string;
    email?: string;
    phone?: string;
    registration_number?: string;
    tax_number?: string;
    contact_person?: string;
    contact_person_phone?: string;
    contact_person_email?: string;
    postal_address?: string;
    registered_address?: string;
  } | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EntityForm({ entity, onSuccess, onCancel }: EntityFormProps) {
  const [formData, setFormData] = useState({
    entity_type: 'individual' as 'individual' | 'company',
    name: '',
    email: '',
    phone: '',
    registration_number: '',
    tax_number: '',
    contact_person: '',
    contact_person_phone: '',
    contact_person_email: '',
    postal_address: '',
    registered_address: '',
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (entity) {
      setFormData({
        entity_type: entity.entity_type,
        name: entity.name,
        email: entity.email || '',
        phone: entity.phone || '',
        registration_number: entity.registration_number || '',
        tax_number: entity.tax_number || '',
        contact_person: entity.contact_person || '',
        contact_person_phone: entity.contact_person_phone || '',
        contact_person_email: entity.contact_person_email || '',
        postal_address: entity.postal_address || '',
        registered_address: entity.registered_address || '',
      });
    }
  }, [entity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const entityData = {
        user_id: user.id,
        entity_type: formData.entity_type,
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        registration_number: formData.registration_number || null,
        tax_number: formData.tax_number || null,
        contact_person: formData.contact_person || null,
        contact_person_phone: formData.contact_person_phone ? parseFloat(formData.contact_person_phone) : null,
        contact_person_email: formData.contact_person_email || null,
        postal_address: formData.postal_address || null,
        'registered address': formData.registered_address || null,
        updated_at: new Date().toISOString(),
      };

      if (entity) {
        const { error } = await supabase
          .from('entities')
          .update(entityData)
          .eq('id', entity.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('entities')
          .insert([entityData]);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Entity ${entity ? 'updated' : 'created'} successfully`,
      });
      onSuccess();
    } catch (error) {
      console.error('Error saving entity:', error);
      toast({
        title: "Error",
        description: `Failed to ${entity ? 'update' : 'create'} entity`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <Label className="text-card-foreground">Entity Type</Label>
        <RadioGroup
          value={formData.entity_type}
          onValueChange={(value) => setFormData({ ...formData, entity_type: value as 'individual' | 'company' })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="individual" id="individual" />
            <Label htmlFor="individual" className="text-card-foreground">Individual</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="company" id="company" />
            <Label htmlFor="company" className="text-card-foreground">Company</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name" className="text-card-foreground">
          {formData.entity_type === 'company' ? 'Company Name' : 'Full Name'} *
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-card-foreground">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-card-foreground">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="registered_address" className="text-card-foreground">Registered Address (Street Address)</Label>
        <Textarea
          id="registered_address"
          value={formData.registered_address}
          onChange={(e) => setFormData({ ...formData, registered_address: e.target.value })}
          rows={3}
          placeholder="Enter registered street address"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="postal_address" className="text-card-foreground">Postal Address</Label>
        <Textarea
          id="postal_address"
          value={formData.postal_address}
          onChange={(e) => setFormData({ ...formData, postal_address: e.target.value })}
          rows={3}
          placeholder="Enter postal address"
        />
      </div>

      {formData.entity_type === 'company' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="registration_number" className="text-card-foreground">Registration Number</Label>
              <Input
                id="registration_number"
                value={formData.registration_number}
                onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_person" className="text-card-foreground">Contact Person</Label>
              <Input
                id="contact_person"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_person_phone" className="text-card-foreground">Contact Person Phone</Label>
              <Input
                id="contact_person_phone"
                value={formData.contact_person_phone}
                onChange={(e) => setFormData({ ...formData, contact_person_phone: e.target.value })}
                placeholder="+675 XXX XXXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_person_email" className="text-card-foreground">Contact Person Email</Label>
              <Input
                id="contact_person_email"
                type="email"
                value={formData.contact_person_email}
                onChange={(e) => setFormData({ ...formData, contact_person_email: e.target.value })}
                placeholder="contact@company.com"
              />
            </div>
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="tax_number" className="text-card-foreground">Tax Number</Label>
        <Input
          id="tax_number"
          value={formData.tax_number}
          onChange={(e) => setFormData({ ...formData, tax_number: e.target.value })}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={loading}
          className="bg-gradient-to-r from-forest-600 to-nature-600 hover:from-forest-700 hover:to-nature-700"
        >
          {loading ? 'Saving...' : entity ? 'Update Entity' : 'Create Entity'}
        </Button>
      </div>
    </form>
  );
}
