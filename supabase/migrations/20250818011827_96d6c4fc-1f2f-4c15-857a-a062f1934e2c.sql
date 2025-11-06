-- Add RLS policy to allow compliance staff to view initial assessments for their assigned compliance assessments
CREATE POLICY "Compliance staff can view initial assessments for their cases" 
ON public.initial_assessments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.compliance_assessments ca
    JOIN public.profiles p ON p.user_id = auth.uid()
    WHERE ca.permit_application_id = initial_assessments.permit_application_id
      AND p.staff_unit = 'compliance'
      AND p.user_type = 'staff'
  )
);