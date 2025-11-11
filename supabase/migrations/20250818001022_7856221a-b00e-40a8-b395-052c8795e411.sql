-- Remove duplicate compliance assessments - keep the latest one
DELETE FROM public.compliance_assessments 
WHERE id = 'b3df7b66-93b7-4fe1-84a6-9593cff596e0';

-- Update the trigger to prevent duplicates by adding a better check
DROP TRIGGER IF EXISTS trigger_initial_assessment_completion ON public.initial_assessments;

CREATE OR REPLACE FUNCTION public.handle_initial_assessment_completion()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if assessment is passed and approved for next stage
  IF NEW.assessment_status = 'passed' 
     AND NEW.assessment_outcome = 'Approved for Next Stage'
     AND (OLD.assessment_status IS NULL OR OLD.assessment_status != 'passed' 
          OR OLD.assessment_outcome IS NULL OR OLD.assessment_outcome != 'Approved for Next Stage') THEN
    
    -- Update permit application status to under_technical_review
    UPDATE public.permit_applications 
    SET 
      status = 'under_technical_review',
      updated_at = now()
    WHERE id = NEW.permit_application_id;
    
    -- Only create compliance assessment if one doesn't already exist for this permit application
    IF NOT EXISTS (
      SELECT 1 FROM public.compliance_assessments 
      WHERE permit_application_id = NEW.permit_application_id
    ) THEN
      -- Create compliance assessment entry
      INSERT INTO public.compliance_assessments (
        permit_application_id,
        assessed_by,           -- Will be assigned by compliance manager
        assigned_by,           -- Registry officer who completed initial assessment
        assessment_status,
        assessment_notes
      ) VALUES (
        NEW.permit_application_id,
        '00000000-0000-0000-0000-000000000000',  -- Placeholder, will be updated when assigned
        NEW.assessed_by,       -- Registry officer who completed the assessment
        'pending',
        'Forwarded from registry - ' || COALESCE(NEW.assessment_notes, 'Initial assessment completed successfully')
      );
      
      -- Create manager notification for compliance unit
      INSERT INTO public.manager_notifications (
        type,
        message,
        related_id,
        target_unit,
        metadata
      ) VALUES (
        'new_compliance_assessment',
        'New application forwarded from registry requires compliance officer assignment',
        NEW.permit_application_id,
        'compliance',
        jsonb_build_object(
          'permit_application_id', NEW.permit_application_id,
          'forwarded_by', NEW.assessed_by,
          'initial_assessment_id', NEW.id,
          'forwarded_date', NOW(),
          'previous_status', 'submitted',
          'new_status', 'under_technical_review'
        )
      );
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create the trigger
CREATE TRIGGER trigger_initial_assessment_completion
  AFTER UPDATE ON public.initial_assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_initial_assessment_completion();