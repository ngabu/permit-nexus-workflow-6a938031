-- Add project_boundary column to intent_registrations table
ALTER TABLE intent_registrations 
ADD COLUMN IF NOT EXISTS project_boundary jsonb;