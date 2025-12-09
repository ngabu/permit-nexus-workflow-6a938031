-- Create a trigger function to notify registry when intent registrations are submitted
CREATE OR REPLACE FUNCTION public.notify_registry_on_intent_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  entity_name TEXT;
BEGIN
  -- Only trigger for new submissions with pending status
  IF NEW.status = 'pending' THEN
    -- Get entity name
    SELECT name INTO entity_name 
    FROM entities 
    WHERE id = NEW.entity_id;

    -- Create notification for registry unit
    INSERT INTO manager_notifications (
      type,
      message,
      related_id,
      target_unit,
      is_read,
      metadata
    ) VALUES (
      'new_intent_submission',
      'New intent registration submitted by ' || COALESCE(entity_name, 'Unknown Entity') || ' for ' || NEW.activity_level,
      NEW.id,
      'registry',
      false,
      jsonb_build_object(
        'entity_name', COALESCE(entity_name, 'Unknown Entity'),
        'activity_level', NEW.activity_level,
        'submitted_at', NOW(),
        'intent_id', NEW.id
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_notify_registry_on_intent_submission ON intent_registrations;
CREATE TRIGGER trigger_notify_registry_on_intent_submission
  AFTER INSERT ON intent_registrations
  FOR EACH ROW
  EXECUTE FUNCTION notify_registry_on_intent_submission();

-- Update RLS policy to allow all registry staff to view notifications (not just managers)
DROP POLICY IF EXISTS "Allow unit managers to view their notifications" ON manager_notifications;

-- Create a unified SELECT policy for all staff in the unit
DROP POLICY IF EXISTS "Staff can view their unit notifications" ON manager_notifications;
CREATE POLICY "Staff can view their unit notifications"
  ON manager_notifications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.staff_unit::text = manager_notifications.target_unit::text
      AND profiles.user_type = 'staff'
    )
  );