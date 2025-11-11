-- The issue might be that the CEPA staff policy on invoices is still causing recursion
-- Let's create a security definer function to fix this
CREATE OR REPLACE FUNCTION public.is_cepa_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND user_role IN ('cepa_staff', 'admin', 'system_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Drop and recreate the problematic policy
DROP POLICY IF EXISTS "CEPA staff can manage all invoices" ON public.invoices;

CREATE POLICY "CEPA staff can manage all invoices" 
ON public.invoices 
FOR ALL 
USING (user_id = auth.uid() OR public.is_cepa_staff());

-- Also fix the permit_activities policy that might have the same issue
DROP POLICY IF EXISTS "Users can view permit activities for their permits" ON public.permit_activities;
DROP POLICY IF EXISTS "CEPA staff can manage permit activities" ON public.permit_activities;
DROP POLICY IF EXISTS "Users can manage activities for their permits" ON public.permit_activities;

CREATE POLICY "Users can view permit activities for their permits" 
ON public.permit_activities 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.permits 
    WHERE permits.id = permit_activities.permit_id 
    AND permits.user_id = auth.uid()
  ) OR public.is_cepa_staff()
);

-- Also add missing policies for permit_activities
CREATE POLICY "CEPA staff can manage permit activities" 
ON public.permit_activities 
FOR ALL 
USING (public.is_cepa_staff());

CREATE POLICY "Users can manage activities for their permits" 
ON public.permit_activities 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.permits 
    WHERE permits.id = permit_activities.permit_id 
    AND permits.user_id = auth.uid()
  )
);