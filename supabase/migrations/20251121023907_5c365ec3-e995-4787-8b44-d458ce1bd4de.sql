-- Create function to freeze/unfreeze all entity-related records
CREATE OR REPLACE FUNCTION freeze_entity_records(
  entity_id_param UUID,
  should_freeze BOOLEAN,
  freeze_reason TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Update entity suspension status
  UPDATE entities
  SET is_suspended = should_freeze
  WHERE id = entity_id_param;

  -- Note: RLS policies will handle preventing modifications to frozen records
  -- This function just updates the entity status which triggers the RLS checks
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies to prevent modifications when entity is suspended
-- Update permit_applications RLS policies
DROP POLICY IF EXISTS "Public users can update their own applications" ON permit_applications;
CREATE POLICY "Public users can update their own applications"
ON permit_applications
FOR UPDATE
USING (
  auth.uid() = user_id 
  AND is_public_user()
  AND NOT EXISTS (
    SELECT 1 FROM entities e 
    WHERE e.id = permit_applications.entity_id 
    AND e.is_suspended = true
  )
);

DROP POLICY IF EXISTS "Public users can delete their own applications" ON permit_applications;
CREATE POLICY "Public users can delete their own applications"
ON permit_applications
FOR DELETE
USING (
  auth.uid() = user_id 
  AND is_public_user()
  AND NOT EXISTS (
    SELECT 1 FROM entities e 
    WHERE e.id = permit_applications.entity_id 
    AND e.is_suspended = true
  )
);

-- Update intent_registrations RLS policies
DROP POLICY IF EXISTS "Public users can update their own intent registrations" ON intent_registrations;
CREATE POLICY "Public users can update their own intent registrations"
ON intent_registrations
FOR UPDATE
USING (
  auth.uid() = user_id 
  AND is_public_user() 
  AND status = 'pending'
  AND NOT EXISTS (
    SELECT 1 FROM entities e 
    WHERE e.id = intent_registrations.entity_id 
    AND e.is_suspended = true
  )
);

-- Update entities RLS policy
DROP POLICY IF EXISTS "Public users can update their own entities" ON entities;
CREATE POLICY "Public users can update their own entities"
ON entities
FOR UPDATE
USING (
  auth.uid() = user_id 
  AND is_public_user()
  AND is_suspended = false
);

DROP POLICY IF EXISTS "Public users can delete their own entities" ON entities;
CREATE POLICY "Public users can delete their own entities"
ON entities
FOR DELETE
USING (
  auth.uid() = user_id 
  AND is_public_user()
  AND is_suspended = false
);

-- Update documents RLS policies for entity-related documents
DROP POLICY IF EXISTS "Public users can delete their own documents" ON documents;
CREATE POLICY "Public users can delete their own documents"
ON documents
FOR DELETE
USING (
  auth.uid() = user_id 
  AND is_public_user()
  AND NOT EXISTS (
    SELECT 1 FROM entities e 
    WHERE e.id = documents.entity_id 
    AND e.is_suspended = true
  )
);

-- Update compliance_reports RLS policy
DROP POLICY IF EXISTS "Public users can update their own pending reports" ON compliance_reports;
CREATE POLICY "Public users can update their own pending reports"
ON compliance_reports
FOR UPDATE
USING (
  auth.uid() = user_id 
  AND status = 'pending'
  AND NOT EXISTS (
    SELECT 1 FROM permit_applications pa
    JOIN entities e ON e.id = pa.entity_id
    WHERE pa.id = compliance_reports.permit_id
    AND e.is_suspended = true
  )
);