
-- Remove duplicate permit type fields, keeping only the first occurrence
-- This will delete duplicates based on permit_type_id and field_name combination

DELETE FROM permit_type_fields
WHERE id NOT IN (
  SELECT DISTINCT ON (permit_type_id, field_name) id
  FROM permit_type_fields
  ORDER BY permit_type_id, field_name, created_at ASC
);

-- Add a unique constraint to prevent future duplicates
ALTER TABLE permit_type_fields
ADD CONSTRAINT unique_permit_type_field 
UNIQUE (permit_type_id, field_name);
