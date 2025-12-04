-- Fix manager_notifications to allow both permit and intent related IDs
-- The current foreign key constraint only references permit_applications
-- but we need to support intent_registrations as well

-- Drop the restrictive foreign key constraint
ALTER TABLE manager_notifications 
DROP CONSTRAINT IF EXISTS fk_related_id;

-- Note: We're removing the foreign key constraint entirely because the related_id
-- can point to multiple different tables (permit_applications, intent_registrations, etc.)
-- The application code will ensure referential integrity

-- Add a comment to the column to document its usage
COMMENT ON COLUMN manager_notifications.related_id IS 
'UUID that can reference various entities (permit_applications, intent_registrations, etc.) depending on the notification type. Referential integrity is maintained by application code.';