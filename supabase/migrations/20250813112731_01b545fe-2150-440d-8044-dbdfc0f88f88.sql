-- Add RLS policy to allow registry staff to view entities for permit review
CREATE POLICY "Registry staff can view entities for permit review" 
ON public.entities 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND staff_unit = 'registry' 
    AND user_type = 'staff'
  )
);