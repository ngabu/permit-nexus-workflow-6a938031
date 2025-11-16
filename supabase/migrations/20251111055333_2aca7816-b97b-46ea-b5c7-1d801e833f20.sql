-- Create inspections table for tracking scheduled permit inspections
CREATE TABLE IF NOT EXISTS public.inspections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  permit_application_id UUID NOT NULL,
  inspection_type TEXT NOT NULL,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  inspector_id UUID,
  status TEXT NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  findings TEXT,
  completed_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_inspections_permit ON public.inspections(permit_application_id);
CREATE INDEX IF NOT EXISTS idx_inspections_status ON public.inspections(status);
CREATE INDEX IF NOT EXISTS idx_inspections_scheduled_date ON public.inspections(scheduled_date);

-- Enable RLS
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;

-- Public users can view inspections for their permits
CREATE POLICY "Users can view inspections for their permits"
ON public.inspections
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM permit_applications pa
    WHERE pa.id = inspections.permit_application_id
    AND pa.user_id = auth.uid()
  )
);

-- Staff can view all inspections
CREATE POLICY "Staff can view all inspections"
ON public.inspections
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.user_type = 'staff'
  )
);

-- Staff can create inspections
CREATE POLICY "Staff can create inspections"
ON public.inspections
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.user_type = 'staff'
  )
);

-- Staff can update inspections
CREATE POLICY "Staff can update inspections"
ON public.inspections
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.user_type = 'staff'
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_inspections_updated_at
BEFORE UPDATE ON public.inspections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();