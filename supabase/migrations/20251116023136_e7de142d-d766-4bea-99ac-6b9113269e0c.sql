-- Add missing columns for entity suspension feature
ALTER TABLE public.entities 
ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false;

-- Add missing columns for permit freezing feature
ALTER TABLE public.permit_applications
ADD COLUMN IF NOT EXISTS is_frozen BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS frozen_reason TEXT;

-- Add RLS policy for admin/super_admin to view all entities
CREATE POLICY "Admin can view all entities"
ON public.entities
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.user_type IN ('admin', 'super_admin')
  )
);

-- Add RLS policy for admin/super_admin to update entities (for suspension)
CREATE POLICY "Admin can update all entities"
ON public.entities
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.user_type IN ('admin', 'super_admin')
  )
);

-- Add index for is_suspended queries
CREATE INDEX IF NOT EXISTS idx_entities_suspended ON public.entities(is_suspended);
CREATE INDEX IF NOT EXISTS idx_permit_applications_frozen ON public.permit_applications(is_frozen);