-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Revenue managers can create item codes" ON public.revenue_item_codes;

-- Drop existing UPDATE policy
DROP POLICY IF EXISTS "Revenue managers can update item codes" ON public.revenue_item_codes;

-- Drop existing DELETE policy
DROP POLICY IF EXISTS "Revenue managers can delete item codes" ON public.revenue_item_codes;

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Revenue staff can view item codes" ON public.revenue_item_codes;

-- Create new SELECT policy - allow revenue staff and admins
CREATE POLICY "Revenue staff and admins can view item codes"
ON public.revenue_item_codes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND (
      (profiles.staff_unit = 'revenue' AND profiles.user_type = 'staff')
      OR profiles.user_type IN ('admin', 'super_admin')
    )
  )
);

-- Create new INSERT policy - allow revenue managers and admins
CREATE POLICY "Revenue managers and admins can create item codes"
ON public.revenue_item_codes
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND (
      (profiles.staff_unit = 'revenue' AND profiles.staff_position IN ('manager', 'director') AND profiles.user_type = 'staff')
      OR profiles.user_type IN ('admin', 'super_admin')
    )
  )
);

-- Create new UPDATE policy - allow revenue managers and admins
CREATE POLICY "Revenue managers and admins can update item codes"
ON public.revenue_item_codes
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND (
      (profiles.staff_unit = 'revenue' AND profiles.staff_position IN ('manager', 'director') AND profiles.user_type = 'staff')
      OR profiles.user_type IN ('admin', 'super_admin')
    )
  )
);

-- Create new DELETE policy - allow revenue managers and admins
CREATE POLICY "Revenue managers and admins can delete item codes"
ON public.revenue_item_codes
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND (
      (profiles.staff_unit = 'revenue' AND profiles.staff_position IN ('manager', 'director') AND profiles.user_type = 'staff')
      OR profiles.user_type IN ('admin', 'super_admin')
    )
  )
);