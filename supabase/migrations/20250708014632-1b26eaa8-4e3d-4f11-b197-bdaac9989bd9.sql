-- Fix infinite recursion in profiles table RLS policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can insert staff profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update staff profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can delete staff profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create a security definer function to check user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create a security definer function to check if user is CEPA staff
CREATE OR REPLACE FUNCTION public.is_cepa_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('cepa_staff', 'admin', 'system_admin')
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create non-recursive policies
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (id = auth.uid());

CREATE POLICY "Admin can view all profiles"
ON public.profiles
FOR SELECT
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admin can insert staff profiles"
ON public.profiles
FOR INSERT
WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Admin can update staff profiles"
ON public.profiles
FOR UPDATE
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admin can delete staff profiles"
ON public.profiles
FOR DELETE
USING (public.get_current_user_role() = 'admin');