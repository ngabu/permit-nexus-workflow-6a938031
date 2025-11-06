-- Fix the database trigger to use valid notification types
CREATE OR REPLACE FUNCTION public.handle_assessment_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  permit_app RECORD;
  feedback_message TEXT;
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
          'Initial Assessment Passed',
          'Your application "' || permit_app.title || '" has passed initial registry assessment and is now proceeding to technical review. Application remains in read-only mode during technical assessment.',
          'success',
          permit_app.id
        );
        
      WHEN 'failed' THEN
        -- Update permit status and create user notification
        UPDATE public.permit_applications 
        SET 
          status = 'rejected',
          updated_at = now()
        WHERE id = NEW.permit_application_id;
        
        -- Create comprehensive feedback message
        feedback_message := 'Your application "' || permit_app.title || '" did not pass the initial registry assessment.';
        
        IF NEW.feedback_provided IS NOT NULL AND NEW.feedback_provided != '' THEN
          feedback_message := feedback_message || ' Registry Feedback: ' || NEW.feedback_provided;
        END IF;
        
        IF NEW.assessment_notes IS NOT NULL AND NEW.assessment_notes != '' THEN
          feedback_message := feedback_message || ' Additional Notes: ' || NEW.assessment_notes;
        END IF;
        
        feedback_message := feedback_message || ' You may delete this application and create a new one, or contact support for assistance.';
        
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
          feedback_message,
          'error',
          permit_app.id
        );
        
      WHEN 'requires_clarification' THEN
        -- Update permit status and create user notification
        UPDATE public.permit_applications 
        SET 
          status = 'requires_clarification',
          updated_at = now()
        WHERE id = NEW.permit_application_id;
        
        -- Create comprehensive feedback message with clarification requirements
        feedback_message := 'Your application "' || permit_app.title || '" requires additional information before it can proceed.';
        
        IF NEW.feedback_provided IS NOT NULL AND NEW.feedback_provided != '' THEN
          feedback_message := feedback_message || ' Required Changes: ' || NEW.feedback_provided;
        END IF;
        
        IF NEW.assessment_notes IS NOT NULL AND NEW.assessment_notes != '' THEN
          feedback_message := feedback_message || ' Assessment Notes: ' || NEW.assessment_notes;
        END IF;
        
        feedback_message := feedback_message || ' Please review the feedback, make the necessary changes, and resubmit your application. You can also delete the application if you prefer to start fresh.';
        
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
          feedback_message,
          'warning',
          permit_app.id
        );
    END CASE;
  END IF;
  
  RETURN NEW;
END;
$function$;