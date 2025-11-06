-- Drop the old constraint first
ALTER TABLE permit_applications DROP CONSTRAINT IF EXISTS permit_applications_activity_level_check;

-- Now update existing data from Level 2A/2B to Level 2
UPDATE permit_applications 
SET activity_level = 'Level 2' 
WHERE activity_level IN ('Level 2A', 'Level 2B');

-- Add new constraint that matches the application form
ALTER TABLE permit_applications 
ADD CONSTRAINT permit_applications_activity_level_check 
CHECK (activity_level = ANY (ARRAY['Level 1'::text, 'Level 2'::text, 'Level 3'::text]));