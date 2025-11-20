-- Create directorate_approvals table for MD approval tracking
CREATE TABLE IF NOT EXISTS public.directorate_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.permit_applications(id) ON DELETE CASCADE,
  application_type TEXT NOT NULL, -- 'new', 'renewal', 'transfer', 'surrender', 'amendment', 'amalgamation', 'enforcement'
  intent_registration_id UUID REFERENCES public.intent_registrations(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  approval_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'revoked', 'cancelled'
  approval_notes TEXT,
  letter_signed BOOLEAN DEFAULT false,
  letter_signed_at TIMESTAMP WITH TIME ZONE,
  docusign_envelope_id TEXT,
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create directorate_notifications table
CREATE TABLE IF NOT EXISTS public.directorate_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- 'approval_required', 'letter_signing', 'urgent_review', 'general'
  related_approval_id UUID REFERENCES public.directorate_approvals(id) ON DELETE CASCADE,
  related_application_id UUID REFERENCES public.permit_applications(id) ON DELETE CASCADE,
  priority TEXT DEFAULT 'normal',
  is_read BOOLEAN NOT NULL DEFAULT false,
  action_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.directorate_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.directorate_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for directorate_approvals
CREATE POLICY "Directorate staff can view all approvals"
  ON public.directorate_approvals
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.staff_unit = 'directorate'
      AND profiles.user_type IN ('staff', 'admin')
    )
  );

CREATE POLICY "Directorate management can update approvals"
  ON public.directorate_approvals
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.staff_unit = 'directorate'
      AND profiles.staff_position IN ('manager', 'director', 'managing_director')
      AND profiles.user_type IN ('staff', 'admin')
    )
  );

CREATE POLICY "System can create approvals"
  ON public.directorate_approvals
  FOR INSERT
  WITH CHECK (true);

-- RLS Policies for directorate_notifications
CREATE POLICY "Users can view their own directorate notifications"
  ON public.directorate_notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own directorate notifications"
  ON public.directorate_notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can create directorate notifications"
  ON public.directorate_notifications
  FOR INSERT
  WITH CHECK (true);

-- Create trigger to update updated_at
CREATE TRIGGER update_directorate_approvals_updated_at
  BEFORE UPDATE ON public.directorate_approvals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to notify MD when approval is needed
CREATE OR REPLACE FUNCTION public.notify_md_approval_required()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  md_user_id UUID;
  app_title TEXT;
BEGIN
  -- Get MD user ID (admin@cepa.gov.pg or any user with managing_director position)
  SELECT user_id INTO md_user_id
  FROM profiles
  WHERE staff_position = 'managing_director'
    OR email = 'admin@cepa.gov.pg'
  LIMIT 1;

  IF md_user_id IS NOT NULL THEN
    -- Get application title
    SELECT title INTO app_title
    FROM permit_applications
    WHERE id = NEW.application_id;

    -- Create notification for MD
    INSERT INTO directorate_notifications (
      user_id,
      title,
      message,
      type,
      related_approval_id,
      related_application_id,
      priority,
      action_required
    ) VALUES (
      md_user_id,
      'Approval Required: ' || NEW.application_type,
      'Application "' || COALESCE(app_title, 'Untitled') || '" requires your approval and signature.',
      'approval_required',
      NEW.id,
      NEW.application_id,
      NEW.priority,
      true
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for new approvals
CREATE TRIGGER notify_md_on_new_approval
  AFTER INSERT ON public.directorate_approvals
  FOR EACH ROW
  WHEN (NEW.approval_status = 'pending')
  EXECUTE FUNCTION public.notify_md_approval_required();

-- Create indexes for performance
CREATE INDEX idx_directorate_approvals_status ON public.directorate_approvals(approval_status);
CREATE INDEX idx_directorate_approvals_application ON public.directorate_approvals(application_id);
CREATE INDEX idx_directorate_notifications_user ON public.directorate_notifications(user_id, is_read);
CREATE INDEX idx_directorate_notifications_created ON public.directorate_notifications(created_at DESC);