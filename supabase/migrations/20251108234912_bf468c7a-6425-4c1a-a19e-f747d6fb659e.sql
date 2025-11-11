-- Remove outdated CHECK constraint on permit_type_specific
-- We're now using permit_type_id (UUID) and permit_specific_fields (JSONB) for the new dynamic system
-- The permit_type_specific column can remain for backward compatibility but should be nullable without constraints

ALTER TABLE permit_applications 
DROP CONSTRAINT IF EXISTS permit_applications_permit_type_specific_check;

-- Make permit_type_specific nullable if it isn't already (it should be based on schema)
-- This allows the new system to work without populating this legacy field
ALTER TABLE permit_applications 
ALTER COLUMN permit_type_specific DROP NOT NULL;

-- Add a comment to document the change
COMMENT ON COLUMN permit_applications.permit_type_specific IS 
  'Legacy field - replaced by permit_type_id and permit_specific_fields. Kept for backward compatibility only.';