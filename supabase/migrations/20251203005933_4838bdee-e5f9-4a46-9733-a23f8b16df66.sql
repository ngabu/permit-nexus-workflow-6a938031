-- Create security definer functions for checking staff unit and position
CREATE OR REPLACE FUNCTION public.is_registry_staff_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND staff_unit = 'registry'
    AND user_type = 'staff'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_compliance_staff_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND staff_unit = 'compliance'
    AND user_type = 'staff'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_revenue_staff_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND staff_unit = 'revenue'
    AND user_type = 'staff'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_managing_director()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND staff_position = 'managing_director'
  );
$$;

-- Drop existing update policies on intent_registrations if any conflict
DROP POLICY IF EXISTS "Registry staff can update registry review fields" ON public.intent_registrations;
DROP POLICY IF EXISTS "Compliance staff can update compliance review fields" ON public.intent_registrations;
DROP POLICY IF EXISTS "Managing director can update MD review fields" ON public.intent_registrations;
DROP POLICY IF EXISTS "Staff can view all intent registrations" ON public.intent_registrations;

-- Create SELECT policy for all staff to view intent registrations
CREATE POLICY "Staff can view all intent registrations"
ON public.intent_registrations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND user_type IN ('staff', 'admin', 'super_admin')
  )
);

-- Registry staff can update registry review fields
CREATE POLICY "Registry staff can update registry review fields"
ON public.intent_registrations
FOR UPDATE
TO authenticated
USING (public.is_registry_staff_user() OR public.is_admin_or_super_admin_user())
WITH CHECK (public.is_registry_staff_user() OR public.is_admin_or_super_admin_user());

-- Compliance staff can update compliance review fields  
CREATE POLICY "Compliance staff can update compliance review fields"
ON public.intent_registrations
FOR UPDATE
TO authenticated
USING (public.is_compliance_staff_user() OR public.is_admin_or_super_admin_user())
WITH CHECK (public.is_compliance_staff_user() OR public.is_admin_or_super_admin_user());

-- Managing Director can update MD review fields
CREATE POLICY "Managing director can update MD review fields"
ON public.intent_registrations
FOR UPDATE
TO authenticated
USING (public.is_managing_director() OR public.is_admin_or_super_admin_user())
WITH CHECK (public.is_managing_director() OR public.is_admin_or_super_admin_user());

-- RLS policies for invoices table (Revenue staff access)
DROP POLICY IF EXISTS "Revenue staff can manage invoices" ON public.invoices;
DROP POLICY IF EXISTS "Staff can view all invoices" ON public.invoices;
DROP POLICY IF EXISTS "Revenue staff can insert invoices" ON public.invoices;
DROP POLICY IF EXISTS "Revenue staff can update invoices" ON public.invoices;

-- All staff can view invoices (read-only for non-revenue)
CREATE POLICY "Staff can view all invoices"
ON public.invoices
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND user_type IN ('staff', 'admin', 'super_admin')
  )
);

-- Only revenue staff can insert invoices
CREATE POLICY "Revenue staff can insert invoices"
ON public.invoices
FOR INSERT
TO authenticated
WITH CHECK (public.is_revenue_staff_user() OR public.is_admin_or_super_admin_user());

-- Only revenue staff can update invoices
CREATE POLICY "Revenue staff can update invoices"
ON public.invoices
FOR UPDATE
TO authenticated
USING (public.is_revenue_staff_user() OR public.is_admin_or_super_admin_user())
WITH CHECK (public.is_revenue_staff_user() OR public.is_admin_or_super_admin_user());

-- Add comments
COMMENT ON FUNCTION public.is_registry_staff_user() IS 'Check if current user is registry staff';
COMMENT ON FUNCTION public.is_compliance_staff_user() IS 'Check if current user is compliance staff';
COMMENT ON FUNCTION public.is_revenue_staff_user() IS 'Check if current user is revenue staff';
COMMENT ON FUNCTION public.is_managing_director() IS 'Check if current user is managing director';