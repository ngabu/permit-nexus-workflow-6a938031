-- Create triggers for assessment status changes and user notifications

-- Function to handle initial assessment status changes
CREATE OR REPLACE FUNCTION public.handle_assessment_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  permit_app RECORD;
BEGIN
  -- Get permit application details
  SELECT pa.*, pr.first_name, pr.last_name, pr.email
  INTO permit_app
  FROM public.permit_applications pa
  LEFT JOIN public.profiles pr ON pa.user_id = pr.user_id
  WHERE pa.id = NEW.permit_application_id;

  -- Update permit application status based on assessment status
  IF NEW.assessment_status != OLD.assessment_status THEN
    CASE NEW.assessment_status
      WHEN 'passed' THEN
        -- Update permit status and create user notification
        UPDATE public.permit_applications 
        SET 
          status = 'under_technical_review',
          updated_at = now()
        WHERE id = NEW.permit_application_id;
        
        -- Create user notification for successful registry assessment
        INSERT INTO public.notifications (
          user_id,
          title,
          message,
          type,
          related_permit_id
        ) VALUES (
          permit_app.user_id,
          'Application Assessment Completed',
          'Your application "' || permit_app.title || '" has passed initial registry assessment and is now proceeding to technical review.',
          'assessment_passed',
          permit_app.id
        );
        
      WHEN 'failed' THEN
        -- Update permit status and create user notification
        UPDATE public.permit_applications 
        SET 
          status = 'rejected',
          updated_at = now()
        WHERE id = NEW.permit_application_id;
        
        -- Create user notification for failed assessment
        INSERT INTO public.notifications (
          user_id,
          title,
          message,
          type,
          related_permit_id
        ) VALUES (
          permit_app.user_id,
          'Application Assessment Failed',
          'Your application "' || permit_app.title || '" did not pass the initial registry assessment. Please review the feedback provided.',
          'assessment_failed',
          permit_app.id
        );
        
      WHEN 'requires_clarification' THEN
        -- Update permit status and create user notification
        UPDATE public.permit_applications 
        SET 
          status = 'requires_clarification',
          updated_at = now()
        WHERE id = NEW.permit_application_id;
        
        -- Create user notification for clarification required
        INSERT INTO public.notifications (
          user_id,
          title,
          message,
          type,
          related_permit_id
        ) VALUES (
          permit_app.user_id,
          'Application Requires Clarification',
          'Your application "' || permit_app.title || '" requires additional information. Please review the feedback and update your application.',
          'clarification_required',
          permit_app.id
        );
    END CASE;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for initial assessment status changes
DROP TRIGGER IF EXISTS trigger_assessment_status_change ON public.initial_assessments;
CREATE TRIGGER trigger_assessment_status_change
  AFTER UPDATE ON public.initial_assessments
  FOR EACH ROW
  WHEN (OLD.assessment_status IS DISTINCT FROM NEW.assessment_status)
  EXECUTE FUNCTION public.handle_assessment_status_change();

-- Function to handle compliance assessment status changes  
CREATE OR REPLACE FUNCTION public.handle_compliance_assessment_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  permit_app RECORD;
BEGIN
  -- Get permit application details
  SELECT pa.*, pr.first_name, pr.last_name, pr.email
  INTO permit_app
  FROM public.permit_applications pa
  LEFT JOIN public.profiles pr ON pa.user_id = pr.user_id
  WHERE pa.id = NEW.permit_application_id;

  -- Update permit application status and create notifications based on assessment status
  IF NEW.assessment_status != COALESCE(OLD.assessment_status, 'pending') THEN
    CASE NEW.assessment_status
      WHEN 'passed' THEN
        -- Update permit status to approved
        UPDATE public.permit_applications 
        SET 
          status = 'approved',
          approval_date = now(),
          updated_at = now()
        WHERE id = NEW.permit_application_id;
        
        -- Create user notification for approval
        INSERT INTO public.notifications (
          user_id,
          title,
          message,
          type,
          related_permit_id
        ) VALUES (
          permit_app.user_id,
          'Application Approved!',
          'Congratulations! Your application "' || permit_app.title || '" has been approved after completing all required assessments.',
          'application_approved',
          permit_app.id
        );
        
      WHEN 'failed' THEN
        -- Update permit status to rejected
        UPDATE public.permit_applications 
        SET 
          status = 'rejected',
          updated_at = now()
        WHERE id = NEW.permit_application_id;
        
        -- Create user notification for rejection
        INSERT INTO public.notifications (
          user_id,
          title,
          message,
          type,
          related_permit_id
        ) VALUES (
          permit_app.user_id,
          'Application Rejected',
          'Your application "' || permit_app.title || '" has been rejected after technical review. Please review the assessment feedback.',
          'application_rejected',
          permit_app.id
        );
        
      WHEN 'requires_clarification' THEN
        -- Update permit status 
        UPDATE public.permit_applications 
        SET 
          status = 'requires_clarification',
          updated_at = now()
        WHERE id = NEW.permit_application_id;
        
        -- Create user notification
        INSERT INTO public.notifications (
          user_id,
          title,
          message,
          type,
          related_permit_id
        ) VALUES (
          permit_app.user_id,
          'Technical Assessment Requires Clarification',
          'Your application "' || permit_app.title || '" requires additional technical information. Please review the compliance officer feedback.',
          'technical_clarification_required',
          permit_app.id
        );
    END CASE;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for compliance assessment status changes
DROP TRIGGER IF EXISTS trigger_compliance_assessment_change ON public.compliance_assessments;
CREATE TRIGGER trigger_compliance_assessment_change
  AFTER UPDATE ON public.compliance_assessments
  FOR EACH ROW
  WHEN (OLD.assessment_status IS DISTINCT FROM NEW.assessment_status)
  EXECUTE FUNCTION public.handle_compliance_assessment_change();