-- Add RLS policy for compliance staff to view entities for intent registrations
CREATE POLICY "Compliance staff can view entities for intent registrations" 
ON public.entities 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.user_id = auth.uid() 
  AND profiles.staff_unit = 'compliance'::staff_unit 
  AND profiles.user_type = 'staff'::user_type
));