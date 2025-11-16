-- Add suspension columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS suspended_by UUID,
ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

-- Create index for suspended users
CREATE INDEX IF NOT EXISTS idx_profiles_suspended ON public.profiles(is_suspended);

-- Drop existing audit logs policy and recreate with correct check
DROP POLICY IF EXISTS "Admin can view audit logs" ON public.audit_logs;
CREATE POLICY "Admin can view audit logs"
ON public.audit_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.user_type IN ('admin', 'super_admin')
  )
);

-- Add RLS policies for admin to manage profiles
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
CREATE POLICY "Admin can view all profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.user_type IN ('admin', 'super_admin')
  )
);

DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;
CREATE POLICY "Admin can update all profiles"
ON public.profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.user_type IN ('admin', 'super_admin')
  )
);

DROP POLICY IF EXISTS "Admin can insert profiles" ON public.profiles;
CREATE POLICY "Admin can insert profiles"
ON public.profiles
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.user_type IN ('admin', 'super_admin')
  )
);

-- Function to freeze entity records when suspended
CREATE OR REPLACE FUNCTION public.freeze_entity_records(
  entity_id_param UUID,
  should_freeze BOOLEAN,
  freeze_reason TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update permit applications to frozen/unfrozen state
  UPDATE permit_applications 
  SET 
    is_frozen = should_freeze,
    frozen_reason = CASE 
      WHEN should_freeze THEN COALESCE(freeze_reason, 'Entity suspended by administrator')
      ELSE NULL 
    END
  WHERE entity_id = entity_id_param;
  
  -- Update entity suspension status
  UPDATE entities 
  SET is_suspended = should_freeze 
  WHERE id = entity_id_param;
END;
$$;