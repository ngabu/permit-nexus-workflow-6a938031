-- Add project_boundary column to intent_registration_drafts table
ALTER TABLE intent_registration_drafts
ADD COLUMN IF NOT EXISTS project_boundary jsonb;