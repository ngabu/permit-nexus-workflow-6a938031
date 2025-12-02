-- Add district and province columns to intent_registrations table
ALTER TABLE intent_registrations 
ADD COLUMN IF NOT EXISTS district TEXT,
ADD COLUMN IF NOT EXISTS province TEXT;

-- Add district and province columns to intent_registration_drafts table
ALTER TABLE intent_registration_drafts 
ADD COLUMN IF NOT EXISTS district TEXT,
ADD COLUMN IF NOT EXISTS province TEXT;

-- Add district and province columns to permit_applications table
ALTER TABLE permit_applications 
ADD COLUMN IF NOT EXISTS district TEXT,
ADD COLUMN IF NOT EXISTS province TEXT;

-- Add comments for documentation
COMMENT ON COLUMN intent_registrations.district IS 'District where the project site is located';
COMMENT ON COLUMN intent_registrations.province IS 'Province where the project site is located';
COMMENT ON COLUMN intent_registration_drafts.district IS 'District where the project site is located';
COMMENT ON COLUMN intent_registration_drafts.province IS 'Province where the project site is located';
COMMENT ON COLUMN permit_applications.district IS 'District where the project is located';
COMMENT ON COLUMN permit_applications.province IS 'Province where the project is located';