-- Update RLS policies to allow registry staff to view documents for permit applications they can access
CREATE POLICY "Registry staff can view documents for permit applications" 
ON public.documents 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.permit_applications pa
    WHERE pa.id = documents.permit_id
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
      AND p.staff_unit = 'registry'
      AND p.user_type = 'staff'
    )
  )
);

-- Also allow compliance staff to view documents for permit applications
CREATE POLICY "Compliance staff can view documents for permit applications" 
ON public.documents 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.permit_applications pa
    WHERE pa.id = documents.permit_id
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
      AND p.staff_unit = 'compliance'
      AND p.user_type = 'staff'
    )
  )
);