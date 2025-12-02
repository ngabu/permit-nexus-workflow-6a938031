-- Drop existing restrictive policies and create new ones for admin management

-- ======================
-- PRESCRIBED_ACTIVITIES
-- ======================
DROP POLICY IF EXISTS "Authenticated users can view prescribed activities" ON public.prescribed_activities;
DROP POLICY IF EXISTS "Admin can manage prescribed activities" ON public.prescribed_activities;

-- Allow all authenticated users to view
CREATE POLICY "Authenticated users can view prescribed activities"
ON public.prescribed_activities
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Allow admin and super_admin to manage (insert, update, delete)
CREATE POLICY "Admin can manage prescribed activities"
ON public.prescribed_activities
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.user_type IN ('admin', 'super_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.user_type IN ('admin', 'super_admin')
  )
);

-- ======================
-- ACTIVITY_LEVELS
-- ======================
DROP POLICY IF EXISTS "Authenticated users can view activity levels" ON public.activity_levels;
DROP POLICY IF EXISTS "Admin can manage activity levels" ON public.activity_levels;

-- Allow all authenticated users to view
CREATE POLICY "Authenticated users can view activity levels"
ON public.activity_levels
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Allow admin and super_admin to manage
CREATE POLICY "Admin can manage activity levels"
ON public.activity_levels
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.user_type IN ('admin', 'super_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.user_type IN ('admin', 'super_admin')
  )
);

-- ======================
-- PERMIT_TYPES
-- ======================
DROP POLICY IF EXISTS "Authenticated users can view permit types" ON public.permit_types;
DROP POLICY IF EXISTS "Admin can manage permit types" ON public.permit_types;

-- Allow all authenticated users to view
CREATE POLICY "Authenticated users can view permit types"
ON public.permit_types
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Allow admin and super_admin to manage
CREATE POLICY "Admin can manage permit types"
ON public.permit_types
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.user_type IN ('admin', 'super_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.user_type IN ('admin', 'super_admin')
  )
);

-- ======================
-- FEE_STRUCTURES (already has policy but let's ensure it's correct)
-- ======================
DROP POLICY IF EXISTS "Admin can manage fee structures" ON public.fee_structures;

CREATE POLICY "Admin can manage fee structures"
ON public.fee_structures
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.user_type IN ('admin', 'super_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.user_type IN ('admin', 'super_admin')
  )
);

-- Allow all authenticated users to view fee structures
DROP POLICY IF EXISTS "Authenticated users can view fee structures" ON public.fee_structures;
CREATE POLICY "Authenticated users can view fee structures"
ON public.fee_structures
FOR SELECT
USING (auth.uid() IS NOT NULL);