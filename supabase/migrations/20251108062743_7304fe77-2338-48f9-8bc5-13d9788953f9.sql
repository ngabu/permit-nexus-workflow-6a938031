-- Fix RLS policy for notifications table to allow system/staff to create notifications
DROP POLICY IF EXISTS "Super admin can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Create policy allowing staff (registry officers) to create notifications for applicants
CREATE POLICY "Staff can create notifications for users"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND user_type = 'staff'
  )
);

-- Ensure public users can delete their own notifications
CREATE POLICY "Public users can delete their own notifications"
ON public.notifications
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND user_type = 'public'
  )
);