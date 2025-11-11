-- Add is_active column to permit_type_fields for better field management
-- This allows administrators to enable/disable specific fields without deleting them

ALTER TABLE permit_type_fields 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_permit_type_fields_active 
ON permit_type_fields(permit_type_id, is_active);

-- Add comment to document the column
COMMENT ON COLUMN permit_type_fields.is_active IS 
  'Controls whether this field is displayed in the permit application form. Allows admins to disable fields without deleting historical data.';