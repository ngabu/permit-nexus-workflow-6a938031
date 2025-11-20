-- Add intent_registration_id column to permit_applications table
ALTER TABLE permit_applications
ADD COLUMN intent_registration_id UUID REFERENCES intent_registrations(id) ON DELETE SET NULL;

-- Create an index for better query performance
CREATE INDEX idx_permit_applications_intent_registration_id 
ON permit_applications(intent_registration_id);

-- Add comment for documentation
COMMENT ON COLUMN permit_applications.intent_registration_id IS 'References the approved intent registration that this permit application is based on';