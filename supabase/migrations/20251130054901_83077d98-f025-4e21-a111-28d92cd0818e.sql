-- Add RLS policy for managing directors to view all entities
CREATE POLICY "Managing directors can view all entities"
ON public.entities
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.staff_position = 'managing_director'
  )
);

-- Add RLS policy for managing directors to view all intent registrations
CREATE POLICY "Managing directors can view all intent registrations"
ON public.intent_registrations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.staff_position = 'managing_director'
  )
);

-- Add RLS policy for managing directors to view all permit applications
CREATE POLICY "Managing directors can view all permit applications"
ON public.permit_applications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.staff_position = 'managing_director'
  )
);