-- Allow public users to view staff profiles who reviewed their intent registrations
CREATE POLICY "Public users can view reviewers of their intent registrations"
ON profiles
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1
    FROM intent_registrations ir
    WHERE ir.reviewed_by = profiles.user_id
    AND ir.user_id = auth.uid()
  )
);