import { useState, useEffect } from 'react';
import { useInitialAssessments } from './hooks/useInitialAssessments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { createUserNotification } from '@/services/userNotificationsService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface InitialAssessmentFormProps {
  permitId: string;
  assessmentId?: string;
  onAssessmentComplete?: () => void;
}

export function InitialAssessmentForm({ permitId, assessmentId, onAssessmentComplete }: InitialAssessmentFormProps) {
  const [assessmentNotes, setAssessmentNotes] = useState('');
  const [assessmentStatus, setAssessmentStatus] = useState<'passed' | 'failed' | 'requires_clarification'>('passed');
  const [assessmentOutcome, setAssessmentOutcome] = useState('Approved for Next Stage');
  const [feedbackProvided, setFeedbackProvided] = useState('');
  const [loading, setLoading] = useState(false);
  const [permitApplication, setPermitApplication] = useState<any>(null);
  
  const { createInitialAssessment } = useInitialAssessments();
  const { toast } = useToast();
  const { profile } = useAuth();

  useEffect(() => {
    const fetchPermitApplication = async () => {
      try {
        const { data, error } = await supabase
          .from('permit_applications')
          .select('*')
          .eq('id', permitId)
          .single();

        if (error) throw error;
        setPermitApplication(data);
      } catch (error) {
        console.error('Error fetching permit application:', error);
      }
    };

    fetchPermitApplication();
  }, [permitId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!assessmentNotes.trim()) {
      toast({
        title: "Error",
        description: "Assessment notes are required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    const result = await createInitialAssessment(permitId, {
      assessment_notes: assessmentNotes,
      assessment_status: assessmentStatus,
      assessment_outcome: assessmentOutcome,
      feedback_provided: feedbackProvided || null
    });

    if (result.success) {
      // Create user notification
      if (permitApplication?.user_id) {
        try {
          let notificationTitle = '';
          let notificationMessage = '';
          let notificationType = '';

          switch (assessmentStatus) {
            case 'passed':
              notificationTitle = 'Initial Assessment Completed';
              notificationMessage = `Your application "${permitApplication.title}" has passed the initial assessment and is now proceeding to technical review.`;
              notificationType = 'assessment_passed';
              break;
            case 'failed':
              notificationTitle = 'Initial Assessment Failed';
              notificationMessage = `Your application "${permitApplication.title}" did not pass the initial assessment. ${feedbackProvided || assessmentNotes}`;
              notificationType = 'assessment_failed';
              break;
            case 'requires_clarification':
              notificationTitle = 'Clarification Required';
              notificationMessage = `Your application "${permitApplication.title}" requires additional information. ${feedbackProvided || assessmentNotes}`;
              notificationType = 'clarification_required';
              break;
          }

          await createUserNotification(
            permitApplication.user_id,
            notificationTitle,
            notificationMessage,
            notificationType,
            permitApplication.id
          );
        } catch (notificationError) {
          console.error('Failed to create user notification:', notificationError);
        }
      }

      toast({
        title: "Success",
        description: "Initial assessment submitted successfully and applicant notified"
      });
      
      // Reset form
      setAssessmentNotes('');
      setFeedbackProvided('');
      setAssessmentStatus('passed');
      
      onAssessmentComplete?.();
    } else {
      toast({
        title: "Error",
        description: "Failed to submit assessment",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Initial Assessment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Assessment Status *
            </label>
            <Select value={assessmentStatus} onValueChange={(value: any) => setAssessmentStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="passed">Pass - Ready for Technical Assessment</SelectItem>
                <SelectItem value="failed">Fail - Rejected</SelectItem>
                <SelectItem value="requires_clarification">Requires Clarification</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {assessmentStatus === 'passed' && (
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Assessment Outcome *
              </label>
              <Select value={assessmentOutcome} onValueChange={setAssessmentOutcome}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Approved for Next Stage">Approved for Next Stage</SelectItem>
                  <SelectItem value="approved_with_conditions">Approved with Conditions</SelectItem>
                  <SelectItem value="needs_revision">Needs Revision</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Assessment Notes *
            </label>
            <Textarea
              value={assessmentNotes}
              onChange={(e) => setAssessmentNotes(e.target.value)}
              placeholder="Provide detailed assessment notes..."
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Feedback to Applicant
            </label>
            <Textarea
              value={feedbackProvided}
              onChange={(e) => setFeedbackProvided(e.target.value)}
              placeholder="Feedback that will be shared with the applicant..."
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Assessment'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}