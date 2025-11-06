-- Phase 1: Fix Critical Privilege Escalation in profiles table

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can update own profile or super_admin can update any" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile or super_admin can insert any" ON public.profiles;

-- Create secure policies that prevent privilege escalation
CREATE POLICY "Users can update own basic profile info" ON public.profiles
FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid() AND
  -- Prevent users from modifying security-sensitive fields
  user_type = OLD.user_type AND
  staff_unit = OLD.staff_unit AND
  staff_position = OLD.staff_position
);

-- Only super admins can update security-sensitive fields
CREATE POLICY "Super admin can update security fields" ON public.profiles
FOR UPDATE 
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Only super admins can insert new profiles with roles
CREATE POLICY "Super admin can insert profiles" ON public.profiles
FOR INSERT 
WITH CHECK (is_super_admin());

-- Users can insert their own basic profile (for signup)
CREATE POLICY "Users can insert own basic profile" ON public.profiles
FOR INSERT 
WITH CHECK (
  user_id = auth.uid() AND
  user_type = 'public' AND
  staff_unit IS NULL AND
  staff_position IS NULL
);

-- Create secure function for role updates with proper audit logging
CREATE OR REPLACE FUNCTION public.update_user_role_secure_v2(
  target_user_id uuid, 
  new_role text, 
  new_staff_unit text DEFAULT NULL, 
  new_staff_position text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_profile RECORD;
  audit_details jsonb;
  current_user_role text;
BEGIN
  -- Only super_admin can change roles
  SELECT user_type INTO current_user_role
  FROM public.profiles
  WHERE user_id = auth.uid();
  
  IF current_user_role != 'super_admin' THEN
    RAISE EXCEPTION 'Unauthorized: Only super admins can update user roles';
  END IF;

  -- Get old profile data for audit
  SELECT * INTO old_profile
  FROM public.profiles
  WHERE user_id = target_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  -- Prevent modifying super_admin role (prevent lockout)
  IF old_profile.user_type = 'super_admin' AND new_role != 'super_admin' THEN
    RAISE EXCEPTION 'Cannot demote super_admin to prevent system lockout';
  END IF;

  -- Update the profile with elevated privileges
  UPDATE public.profiles
  SET 
    user_type = new_role::user_type,
    staff_unit = new_staff_unit::staff_unit,
    staff_position = new_staff_position::staff_position,
    updated_at = now()
  WHERE user_id = target_user_id;

  -- Create comprehensive audit log
  audit_details := jsonb_build_object(
    'action', 'role_update',
    'target_user_id', target_user_id,
    'target_user_email', old_profile.email,
    'old_role', old_profile.user_type,
    'new_role', new_role,
    'old_staff_unit', old_profile.staff_unit,
    'new_staff_unit', new_staff_unit,
    'old_staff_position', old_profile.staff_position,
    'new_staff_position', new_staff_position,
    'updated_by', auth.uid(),
    'timestamp', now()
  );

  -- Log the audit event
  PERFORM public.log_audit_event(
    auth.uid(),
    'critical_role_update',
    'user_profile',
    target_user_id::text,
    audit_details
  );

  RETURN true;
END;
$$;

-- Create function to generate secure random passwords
CREATE OR REPLACE FUNCTION public.generate_secure_password_v2()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  -- Mix of uppercase, lowercase, numbers, and special characters
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  result text := '';
  i int;
  char_length int := length(chars);
BEGIN
  -- Generate 16-character password
  FOR i IN 1..16 LOOP
    result := result || substr(chars, floor(random() * char_length + 1)::int, 1);
  END LOOP;
  
  -- Ensure at least one of each character type
  result := 'A' || 'a' || '1' || '!' || substr(result, 5);
  
  RETURN result;
END;
$$;

-- Enhanced audit logging for profile changes
CREATE OR REPLACE FUNCTION public.log_profile_security_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  change_details jsonb;
BEGIN
  -- Only log security-sensitive changes
  IF (TG_OP = 'UPDATE' AND (
    OLD.user_type != NEW.user_type OR
    OLD.staff_unit != NEW.staff_unit OR
    OLD.staff_position != NEW.staff_position OR
    OLD.is_active != NEW.is_active
  )) THEN
    
    change_details := jsonb_build_object(
      'operation', TG_OP,
      'table_name', 'profiles',
      'user_email', NEW.email,
      'changed_fields', jsonb_build_object(
        'user_type', jsonb_build_object('old', OLD.user_type, 'new', NEW.user_type),
        'staff_unit', jsonb_build_object('old', OLD.staff_unit, 'new', NEW.staff_unit),
        'staff_position', jsonb_build_object('old', OLD.staff_position, 'new', NEW.staff_position),
        'is_active', jsonb_build_object('old', OLD.is_active, 'new', NEW.is_active)
      ),
      'changed_by', auth.uid(),
      'timestamp', now()
    );

    PERFORM public.log_audit_event(
      auth.uid(),
      'profile_security_change',
      'profiles',
      NEW.user_id::text,
      change_details
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for profile security changes
DROP TRIGGER IF EXISTS profile_security_change_trigger ON public.profiles;
CREATE TRIGGER profile_security_change_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_profile_security_change();

-- Add index for better audit log performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_target 
ON public.audit_logs (action, target_type, created_at DESC);