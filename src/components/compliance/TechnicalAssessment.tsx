import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TechnicalAssessmentProps {
  assessment: any;
  onUpdate: () => void;
  onCancel: () => void;
}

export function TechnicalAssessment({ assessment, onUpdate, onCancel }: TechnicalAssessmentProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    assessment_status: assessment.assessment_status || 'pending',
    assessment_notes: assessment.assessment_notes || '',
    recommendations: assessment.recommendations || '',
    compliance_score: assessment.compliance_score?.toString() || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const updateData: any = {
        assessment_status: formData.assessment_status,
        assessment_notes: formData.assessment_notes,
        recommendations: formData.recommendations,
        updated_at: new Date().toISOString()
      };

      if (formData.compliance_score) {
        updateData.compliance_score = parseInt(formData.compliance_score);
      }

      const { error } = await supabase
        .from('compliance_assessments')
        .update(updateData)
        .eq('id', assessment.id);

      if (error) throw error;

      toast({
        title: "Assessment updated",
        description: "Technical assessment has been successfully updated",
      });

      onUpdate();
    } catch (error) {
      console.error('Error updating assessment:', error);
      toast({
        title: "Update failed",
        description: "Failed to update technical assessment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Technical Assessment</CardTitle>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              Save Assessment
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label>Assessment Status</Label>
              <Select 
                value={formData.assessment_status} 
                onValueChange={(value) => setFormData({...formData, assessment_status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="requires_revision">Requires Revision</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Compliance Score (0-100)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.compliance_score}
                onChange={(e) => setFormData({...formData, compliance_score: e.target.value})}
                placeholder="Enter compliance score"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Assessment Notes</Label>
              <Textarea
                value={formData.assessment_notes}
                onChange={(e) => setFormData({...formData, assessment_notes: e.target.value})}
                placeholder="Enter detailed assessment notes..."
                rows={6}
              />
            </div>
          </div>
        </div>

        <div>
          <Label>Recommendations</Label>
          <Textarea
            value={formData.recommendations}
            onChange={(e) => setFormData({...formData, recommendations: e.target.value})}
            placeholder="Enter recommendations for the applicant..."
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
}