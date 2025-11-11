-- Add RLS policy to allow compliance staff to view permit applications for compliance assessments
CREATE POLICY "Compliance staff can view permit applications for assessments"
ON public.permit_applications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.compliance_assessments ca
    WHERE ca.permit_application_id = permit_applications.id
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
      AND p.staff_unit = 'compliance'
      AND p.user_type = 'staff'
    )
  )
);