-- Create the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create intent_registrations table for tracking Notice of Intent (Section 48)
CREATE TABLE public.intent_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entity_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  activity_level TEXT NOT NULL CHECK (activity_level IN ('Level 2', 'Level 3')),
  activity_description TEXT NOT NULL,
  preparatory_work_description TEXT NOT NULL,
  commencement_date DATE NOT NULL,
  completion_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'under_review')),
  reviewed_by UUID,
  review_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.intent_registrations ENABLE ROW LEVEL SECURITY;

-- Public users can view their own intent registrations
CREATE POLICY "Public users can view their own intent registrations"
ON public.intent_registrations
FOR SELECT
USING (auth.uid() = user_id AND is_public_user());

-- Public users can create their own intent registrations
CREATE POLICY "Public users can create their own intent registrations"
ON public.intent_registrations
FOR INSERT
WITH CHECK (auth.uid() = user_id AND is_public_user());

-- Public users can update their own draft intent registrations
CREATE POLICY "Public users can update their own intent registrations"
ON public.intent_registrations
FOR UPDATE
USING (auth.uid() = user_id AND is_public_user() AND status = 'pending');

-- Staff can view all intent registrations
CREATE POLICY "Staff can view all intent registrations"
ON public.intent_registrations
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.user_id = auth.uid()
  AND profiles.user_type = 'staff'
));

-- Staff can update intent registrations
CREATE POLICY "Staff can update intent registrations"
ON public.intent_registrations
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.user_id = auth.uid()
  AND profiles.user_type = 'staff'
  AND profiles.staff_unit IN ('registry', 'compliance')
));

-- Create trigger for updated_at
CREATE TRIGGER update_intent_registrations_updated_at
BEFORE UPDATE ON public.intent_registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for faster queries
CREATE INDEX idx_intent_registrations_user_id ON public.intent_registrations(user_id);
CREATE INDEX idx_intent_registrations_status ON public.intent_registrations(status);
CREATE INDEX idx_intent_registrations_entity_id ON public.intent_registrations(entity_id);