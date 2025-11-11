-- Drop the check constraint temporarily and recreate properly
ALTER TABLE activity_levels DROP CONSTRAINT IF EXISTS activity_levels_name_check;

-- Delete old Level 2A and 2B rows
DELETE FROM activity_levels WHERE id IN (2, 3);

-- Insert consolidated Level 2
INSERT INTO activity_levels (id, name, description, public_review_required) 
OVERRIDING SYSTEM VALUE VALUES
  (2, 'Level 2', 'Moderate-risk activities requiring environmental assessment and review', true);

-- Re-add check constraint if needed (allowing Level 1, Level 2, Level 3)
ALTER TABLE activity_levels ADD CONSTRAINT activity_levels_name_check 
CHECK (name IN ('Level 1', 'Level 2', 'Level 3'));