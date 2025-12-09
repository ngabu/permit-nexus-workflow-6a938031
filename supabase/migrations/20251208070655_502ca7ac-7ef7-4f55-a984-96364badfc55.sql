-- Add DELETE policy for inspections table - only compliance managers can delete
CREATE POLICY "Compliance managers can delete inspections"
ON public.inspections
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.staff_unit = 'compliance'
    AND profiles.staff_position IN ('manager', 'director')
    AND profiles.user_type = 'staff'
  )
);