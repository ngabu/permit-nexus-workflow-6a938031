-- Drop existing recursive policies on profiles table
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own basic profile info" ON public.profiles;
DROP POLICY IF EXISTS "Registry staff can view registry profiles" ON public.profiles;

-- Create security definer functions to check roles (these bypass RLS)
CREATE OR REPLACE FUNCTION public.is_admin_or_super_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND user_type IN ('admin', 'super_admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_type()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_type::text FROM public.profiles WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_user_staff_unit()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT staff_unit::text FROM public.profiles WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_user_staff_position()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT staff_position::text FROM public.profiles WHERE user_id = auth.uid();
$$;

-- Create new non-recursive policies using security definer functions

-- SELECT policies
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO public
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO public
USING (is_admin_or_super_admin_user());

-- INSERT policies
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO public
WITH CHECK (
  user_id = auth.uid() 
  AND user_type = 'public'
  AND staff_unit IS NULL 
  AND staff_position IS NULL
);

CREATE POLICY "Admins can insert any profile"
ON public.profiles
FOR INSERT
TO public
WITH CHECK (is_admin_or_super_admin_user());

-- UPDATE policies
CREATE POLICY "Users can update own basic profile"
ON public.profiles
FOR UPDATE
TO public
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid()
  AND user_type::text = get_user_type()
  AND COALESCE(staff_unit::text, '') = COALESCE(get_user_staff_unit(), '')
  AND COALESCE(staff_position::text, '') = COALESCE(get_user_staff_position(), '')
);

CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
TO public
USING (is_admin_or_super_admin_user())
WITH CHECK (is_admin_or_super_admin_user());

-- DELETE policies remain the same
-- "Users can delete own profile or super_admin can delete any" and "Super admin can update security fields" are already fine