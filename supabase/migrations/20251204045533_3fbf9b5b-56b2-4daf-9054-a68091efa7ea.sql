-- Add DELETE policy for public users to delete their own pending intent registrations
CREATE POLICY "Public users can delete their own pending intent registrations"
ON public.intent_registrations
FOR DELETE
USING (
  (auth.uid() = user_id) 
  AND is_public_user() 
  AND (status = 'pending'::text) 
  AND (NOT (EXISTS ( 
    SELECT 1
    FROM entities e
    WHERE (e.id = intent_registrations.entity_id) AND (e.is_suspended = true)
  )))
);