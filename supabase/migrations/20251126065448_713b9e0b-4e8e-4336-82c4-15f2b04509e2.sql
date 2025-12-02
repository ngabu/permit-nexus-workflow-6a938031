-- Allow revenue staff to view entities for invoice management
CREATE POLICY "Revenue staff can view entities for invoicing"
ON entities
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.staff_unit = 'revenue'
    AND profiles.user_type = 'staff'
  )
);