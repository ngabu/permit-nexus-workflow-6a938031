-- Fix notifications RLS policies to use 'authenticated' role instead of 'public'
-- The 'public' role is for unauthenticated users, while 'authenticated' is for logged-in users

-- Drop the existing policies with wrong role
DROP POLICY IF EXISTS "Public users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Public users can update their own notifications" ON notifications;

-- Recreate with correct 'authenticated' role
CREATE POLICY "Public users can view their own notifications"
ON notifications
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id AND is_public_user()
);

CREATE POLICY "Public users can update their own notifications"
ON notifications
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id AND is_public_user()
);