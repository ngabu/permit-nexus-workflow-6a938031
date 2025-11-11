import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEntities } from '@/hooks/useEntities';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Building, User, Calendar, FileText, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function IntentRegistration() {
  const { user } = useAuth();
  const { entities, loading: entitiesLoading } = useEntities();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    entity_id: '',
    activity_level: '',
    activity_description: '',
    preparatory_work_description: '',
    commencement_date: '',
    completion_date: '',
  });
  
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit an intent registration.",
        variant: "destructive",
      });
      return;
    }

    // Validate dates
    if (new Date(formData.commencement_date) >= new Date(formData.completion_date)) {
      toast({
        title: "Invalid Dates",
        description: "Completion date must be after commencement date.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data, error } = await (supabase as any)
        .from('intent_registrations')
        .insert({
          user_id: user.id,
          entity_id: formData.entity_id,
          activity_level: formData.activity_level,
          activity_description: formData.activity_description,
          preparatory_work_description: formData.preparatory_work_description,
          commencement_date: formData.commencement_date,
          completion_date: formData.completion_date,
          status: 'pending',
        })
        .select()
        .maybeSingle();

      if (error) throw error;

      toast({
        title: "Intent Registration Submitted",
        description: "Your registration of intent has been submitted successfully.",
      });

      // Reset form
      setFormData({
        entity_id: '',
        activity_level: '',
        activity_description: '',
        preparatory_work_description: '',
        commencement_date: '',
        completion_date: '',
      });
    } catch (error) {
      console.error('Error submitting intent registration:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit intent registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedEntity = entities.find(e => e.id === formData.entity_id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Intent Registration</h2>
        <p className="text-muted-foreground mt-2">
          Register your intention to carry out preparatory work for Level 2 or Level 3 activities (Section 48, Environment Act 2000)
        </p>
      </div>

      <Alert className="bg-primary/5 border-primary/20">
        <AlertCircle className="h-4 w-4 text-primary" />
        <AlertDescription className="text-foreground">
          <strong>Important:</strong> Registration of Intent is mandatory before lodging a permit application for Level 2 or Level 3 activities involving preparatory work.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit}>
        <Card className="bg-glass/50 backdrop-blur-sm border-glass">
          <CardHeader>
            <CardTitle>Registration Details</CardTitle>
            <CardDescription>
              Provide details about your intended preparatory work
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Entity Selection */}
            <div className="space-y-2">
              <Label htmlFor="entity_id">
                Entity (Individual or Organization) *
              </Label>
              <Select
                value={formData.entity_id}
                onValueChange={(value) => setFormData({ ...formData, entity_id: value })}
                required
                disabled={entitiesLoading}
              >
                <SelectTrigger id="entity_id" className="bg-glass/50">
                  <SelectValue placeholder="Select an entity" />
                </SelectTrigger>
                <SelectContent>
                  {entities.length === 0 ? (
                    <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                      No entities found. Please create one first.
                    </div>
                  ) : (
                    entities.map((entity) => (
                      <SelectItem key={entity.id} value={entity.id}>
                        <div className="flex items-center gap-2">
                          {entity.entity_type === 'company' ? (
                            <Building className="w-4 h-4" />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                          <span>{entity.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            ({entity.entity_type === 'company' ? 'Organization' : 
                              entity.entity_type === 'government' ? 'Government' : 'Individual'})
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Activity Level */}
            <div className="space-y-2">
              <Label htmlFor="activity_level">
                Activity Level *
              </Label>
              <Select
                value={formData.activity_level}
                onValueChange={(value) => setFormData({ ...formData, activity_level: value })}
                required
              >
                <SelectTrigger id="activity_level" className="bg-glass/50">
                  <SelectValue placeholder="Select activity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Level 2">Level 2 Activity</SelectItem>
                  <SelectItem value="Level 3">Level 3 Activity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Activity Description */}
            <div className="space-y-2">
              <Label htmlFor="activity_description">
                Activity Description *
              </Label>
              <Textarea
                id="activity_description"
                value={formData.activity_description}
                onChange={(e) => setFormData({ ...formData, activity_description: e.target.value })}
                placeholder="Describe the main activity you intend to carry out..."
                required
                rows={4}
                className="bg-glass/50"
              />
            </div>

            {/* Preparatory Work Description */}
            <div className="space-y-2">
              <Label htmlFor="preparatory_work_description">
                Preparatory Work Description *
              </Label>
              <Textarea
                id="preparatory_work_description"
                value={formData.preparatory_work_description}
                onChange={(e) => setFormData({ ...formData, preparatory_work_description: e.target.value })}
                placeholder="Provide a 1-2 page description of the preparatory work to be undertaken..."
                required
                rows={8}
                className="bg-glass/50"
              />
              <p className="text-sm text-muted-foreground">
                Describe the initial site work to be undertaken before the main activity begins.
              </p>
            </div>

            {/* Date Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="commencement_date" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Proposed Commencement Date *
                </Label>
                <Input
                  id="commencement_date"
                  type="date"
                  value={formData.commencement_date}
                  onChange={(e) => setFormData({ ...formData, commencement_date: e.target.value })}
                  required
                  className="bg-glass/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="completion_date" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Proposed Completion Date *
                </Label>
                <Input
                  id="completion_date"
                  type="date"
                  value={formData.completion_date}
                  onChange={(e) => setFormData({ ...formData, completion_date: e.target.value })}
                  required
                  className="bg-glass/50"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-6 border-t border-glass">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormData({
                  entity_id: '',
                  activity_level: '',
                  activity_description: '',
                  preparatory_work_description: '',
                  commencement_date: '',
                  completion_date: '',
                })}
              >
                Clear Form
              </Button>
              <Button
                type="submit"
                disabled={submitting || entitiesLoading}
              >
                {submitting ? 'Submitting...' : 'Submit Registration'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
