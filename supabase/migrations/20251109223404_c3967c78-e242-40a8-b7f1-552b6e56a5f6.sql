-- Create registry audit trail table
CREATE TABLE IF NOT EXISTS public.registry_audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  permit_application_id UUID NOT NULL REFERENCES public.permit_applications(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES public.initial_assessments(id) ON DELETE SET NULL,
  officer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  officer_name TEXT,
  officer_email TEXT,
  action_type TEXT NOT NULL,
  previous_status TEXT,
  new_status TEXT,
  previous_outcome TEXT,
  new_outcome TEXT,
  assessment_notes TEXT,
  feedback_provided TEXT,
  changes_made JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.registry_audit_trail ENABLE ROW LEVEL SECURITY;

-- Create indexes for better query performance
CREATE INDEX idx_registry_audit_permit_id ON public.registry_audit_trail(permit_application_id);
CREATE INDEX idx_registry_audit_officer_id ON public.registry_audit_trail(officer_id);
CREATE INDEX idx_registry_audit_created_at ON public.registry_audit_trail(created_at DESC);

-- RLS Policies
CREATE POLICY "Registry staff can view audit trail"
  ON public.registry_audit_trail
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
      AND staff_unit = 'registry'
      AND user_type = 'staff'
    )
  );

CREATE POLICY "Compliance staff can view audit trail for forwarded applications"
  ON public.registry_audit_trail
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
      AND staff_unit = 'compliance'
      AND user_type = 'staff'
    )
  );

CREATE POLICY "Super admins can view all audit trails"
  ON public.registry_audit_trail
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
      AND user_type = 'super_admin'
    )
  );

CREATE POLICY "System can create audit trail entries"
  ON public.registry_audit_trail
  FOR INSERT
  WITH CHECK (true);

-- Create function to log registry actions
CREATE OR REPLACE FUNCTION public.log_registry_action(
  p_permit_application_id UUID,
  p_assessment_id UUID,
  p_officer_id UUID,
  p_action_type TEXT,
  p_previous_status TEXT DEFAULT NULL,
  p_new_status TEXT DEFAULT NULL,
  p_previous_outcome TEXT DEFAULT NULL,
  p_new_outcome TEXT DEFAULT NULL,
  p_assessment_notes TEXT DEFAULT NULL,
  p_feedback_provided TEXT DEFAULT NULL,
  p_changes_made JSONB DEFAULT '{}'::JSONB,
  p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_audit_id UUID;
  v_officer_name TEXT;
  v_officer_email TEXT;
BEGIN
  -- Get officer details
  SELECT 
    COALESCE(first_name || ' ' || last_name, email),
    email
  INTO v_officer_name, v_officer_email
  FROM public.profiles
  WHERE user_id = p_officer_id;

  -- Insert audit record
  INSERT INTO public.registry_audit_trail (
    permit_application_id,
    assessment_id,
    officer_id,
    officer_name,
    officer_email,
    action_type,
    previous_status,
    new_status,
    previous_outcome,
    new_outcome,
    assessment_notes,
    feedback_provided,
    changes_made,
    metadata
  ) VALUES (
    p_permit_application_id,
    p_assessment_id,
    p_officer_id,
    v_officer_name,
    v_officer_email,
    p_action_type,
    p_previous_status,
    p_new_status,
    p_previous_outcome,
    p_new_outcome,
    p_assessment_notes,
    p_feedback_provided,
    p_changes_made,
    p_metadata
  ) RETURNING id INTO v_audit_id;

  RETURN v_audit_id;
END;
$$;

-- Create trigger function to automatically log assessment changes
CREATE OR REPLACE FUNCTION public.track_initial_assessment_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_changes_made JSONB := '{}'::JSONB;
  v_action_type TEXT;
BEGIN
  -- Determine action type
  IF TG_OP = 'INSERT' THEN
    v_action_type := 'assessment_created';
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.assessment_status != NEW.assessment_status THEN
      v_action_type := 'status_changed';
    ELSIF OLD.assessment_notes != NEW.assessment_notes OR OLD.feedback_provided != NEW.feedback_provided THEN
      v_action_type := 'assessment_updated';
    ELSE
      v_action_type := 'assessment_modified';
    END IF;
  END IF;

  -- Build changes object
  IF TG_OP = 'UPDATE' THEN
    IF OLD.assessment_status != NEW.assessment_status THEN
      v_changes_made := v_changes_made || jsonb_build_object('status_changed', true);
    END IF;
    IF OLD.assessment_outcome != NEW.assessment_outcome THEN
      v_changes_made := v_changes_made || jsonb_build_object('outcome_changed', true);
    END IF;
    IF OLD.assessment_notes != NEW.assessment_notes THEN
      v_changes_made := v_changes_made || jsonb_build_object('notes_changed', true);
    END IF;
    IF OLD.feedback_provided != NEW.feedback_provided THEN
      v_changes_made := v_changes_made || jsonb_build_object('feedback_changed', true);
    END IF;
  END IF;

  -- Log the action
  PERFORM public.log_registry_action(
    NEW.permit_application_id,
    NEW.id,
    NEW.assessed_by,
    v_action_type,
    CASE WHEN TG_OP = 'UPDATE' THEN OLD.assessment_status ELSE NULL END,
    NEW.assessment_status,
    CASE WHEN TG_OP = 'UPDATE' THEN OLD.assessment_outcome ELSE NULL END,
    NEW.assessment_outcome,
    NEW.assessment_notes,
    NEW.feedback_provided,
    v_changes_made,
    jsonb_build_object(
      'operation', TG_OP,
      'assessment_date', NEW.assessment_date,
      'permit_activity_type', NEW.permit_activity_type
    )
  );

  RETURN NEW;
END;
$$;

-- Create trigger to track initial assessment changes
DROP TRIGGER IF EXISTS track_initial_assessment_audit ON public.initial_assessments;
CREATE TRIGGER track_initial_assessment_audit
  AFTER INSERT OR UPDATE ON public.initial_assessments
  FOR EACH ROW
  WHEN (NEW.assessed_by != '00000000-0000-0000-0000-000000000000'::UUID)
  EXECUTE FUNCTION public.track_initial_assessment_changes();

-- Create trigger function to log permit application assignment changes
CREATE OR REPLACE FUNCTION public.track_permit_assignment_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log officer assignment
  IF TG_OP = 'UPDATE' AND (OLD.assigned_officer_id IS DISTINCT FROM NEW.assigned_officer_id) THEN
    PERFORM public.log_registry_action(
      NEW.id,
      NULL,
      COALESCE(auth.uid(), NEW.assigned_officer_id),
      'officer_assigned',
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      jsonb_build_object(
        'old_officer_id', OLD.assigned_officer_id,
        'new_officer_id', NEW.assigned_officer_id
      ),
      jsonb_build_object(
        'assigned_at', NOW()
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger to track permit assignment
DROP TRIGGER IF EXISTS track_permit_assignment_audit ON public.permit_applications;
CREATE TRIGGER track_permit_assignment_audit
  AFTER UPDATE ON public.permit_applications
  FOR EACH ROW
  WHEN (OLD.assigned_officer_id IS DISTINCT FROM NEW.assigned_officer_id)
  EXECUTE FUNCTION public.track_permit_assignment_changes();