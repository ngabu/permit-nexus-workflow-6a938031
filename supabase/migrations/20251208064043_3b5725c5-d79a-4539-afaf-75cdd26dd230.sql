-- Fix RLS policy for public users to view inspections linked to their intent registrations
DROP POLICY IF EXISTS "Public users can view their permit inspections" ON public.inspections;

CREATE POLICY "Public users can view their inspections" 
ON public.inspections 
FOR SELECT 
USING (
  -- User can see inspections for their permit applications
  EXISTS (
    SELECT 1 FROM permit_applications pa
    WHERE pa.id = inspections.permit_application_id
    AND pa.user_id = auth.uid()
  )
  OR
  -- User can see inspections for their intent registrations
  EXISTS (
    SELECT 1 FROM intent_registrations ir
    WHERE ir.id = inspections.intent_registration_id
    AND ir.user_id = auth.uid()
  )
);

-- Add policy for compliance staff to insert invoices when creating inspections
DROP POLICY IF EXISTS "Compliance staff can insert inspection invoices" ON public.invoices;

CREATE POLICY "Compliance staff can insert inspection invoices" 
ON public.invoices 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.staff_unit = 'compliance'
    AND profiles.user_type = 'staff'
  )
);

-- Add policy for compliance staff to delete their inspection invoices (when deleting suspended inspections)
DROP POLICY IF EXISTS "Compliance staff can delete inspection invoices" ON public.invoices;

CREATE POLICY "Compliance staff can delete inspection invoices" 
ON public.invoices 
FOR DELETE 
USING (
  inspection_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.staff_unit = 'compliance'
    AND profiles.user_type = 'staff'
  )
);

-- Add policy for public users to view their own invoices (for inspections and permits)
DROP POLICY IF EXISTS "Public users can view their invoices" ON public.invoices;

CREATE POLICY "Public users can view their invoices" 
ON public.invoices 
FOR SELECT 
USING (
  user_id = auth.uid()
);