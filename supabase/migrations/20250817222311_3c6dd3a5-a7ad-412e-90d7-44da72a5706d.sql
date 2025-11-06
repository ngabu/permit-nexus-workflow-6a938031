-- Fix function search paths to address security warnings

-- Fix existing functions by adding SET search_path = public
CREATE OR REPLACE FUNCTION public.log_audit_event(p_user_id uuid, p_action text, p_target_type text DEFAULT NULL::text, p_target_id text DEFAULT NULL::text, p_details jsonb DEFAULT NULL::jsonb, p_ip_address inet DEFAULT NULL::inet, p_user_agent text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    user_id, action, target_type, target_id, details, ip_address, user_agent
  ) VALUES (
    p_user_id, p_action, p_target_type, p_target_id, p_details, p_ip_address, p_user_agent
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin_user()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles 
    WHERE user_id = auth.uid() 
      AND user_type = 'admin'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_super_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE user_id = auth.uid()
          AND user_type IN ('admin', 'super_admin')
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND user_type = 'super_admin'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_registry_staff()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND staff_unit = 'registry'
    AND user_type = 'staff'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_staff_unit()
 RETURNS text
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $$
DECLARE
  unit text;
BEGIN
  SELECT staff_unit INTO unit 
  FROM public.profiles 
  WHERE user_id = auth.uid();
  RETURN unit;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_public_user()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND user_type = 'public'
  );
END;
$$;