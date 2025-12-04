-- Ensure manager_notifications table has proper RLS policies for registry staff

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Registry staff can view their unit notifications" ON manager_notifications;
DROP POLICY IF EXISTS "Registry staff can update their unit notifications" ON manager_notifications;
DROP POLICY IF EXISTS "System can insert manager notifications" ON manager_notifications;

-- Enable RLS
ALTER TABLE manager_notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Registry staff can view notifications for their unit
CREATE POLICY "Registry staff can view their unit notifications"
ON manager_notifications
FOR SELECT
TO authenticated
USING (
  target_unit::text IN (
    SELECT staff_unit::text 
    FROM profiles 
    WHERE user_id = auth.uid()
    AND staff_unit IS NOT NULL
  )
);

-- Policy: Registry staff can update (mark as read) their unit notifications
CREATE POLICY "Registry staff can update their unit notifications"
ON manager_notifications
FOR UPDATE
TO authenticated
USING (
  target_unit::text IN (
    SELECT staff_unit::text 
    FROM profiles 
    WHERE user_id = auth.uid()
    AND staff_unit IS NOT NULL
  )
)
WITH CHECK (
  target_unit::text IN (
    SELECT staff_unit::text 
    FROM profiles 
    WHERE user_id = auth.uid()
    AND staff_unit IS NOT NULL
  )
);

-- Policy: System (any authenticated user) can insert notifications
-- This allows the application to create notifications when actions occur
CREATE POLICY "System can insert manager notifications"
ON manager_notifications
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_manager_notifications_target_unit 
ON manager_notifications(target_unit);

CREATE INDEX IF NOT EXISTS idx_manager_notifications_is_read 
ON manager_notifications(is_read);

CREATE INDEX IF NOT EXISTS idx_manager_notifications_created_at 
ON manager_notifications(created_at DESC);