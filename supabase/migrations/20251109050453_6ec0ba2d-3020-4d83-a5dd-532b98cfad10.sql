-- Add missing fields to intent_registrations table based on official form
ALTER TABLE intent_registrations
ADD COLUMN IF NOT EXISTS project_site_address TEXT,
ADD COLUMN IF NOT EXISTS project_site_description TEXT,
ADD COLUMN IF NOT EXISTS site_ownership_details TEXT,
ADD COLUMN IF NOT EXISTS government_agreement TEXT,
ADD COLUMN IF NOT EXISTS departments_approached TEXT,
ADD COLUMN IF NOT EXISTS approvals_required TEXT,
ADD COLUMN IF NOT EXISTS landowner_negotiation_status TEXT,
ADD COLUMN IF NOT EXISTS estimated_cost_kina NUMERIC,
ADD COLUMN IF NOT EXISTS prescribed_activity_id UUID REFERENCES prescribed_activities(id);

-- Add same fields to intent_registration_drafts table
ALTER TABLE intent_registration_drafts
ADD COLUMN IF NOT EXISTS project_site_address TEXT,
ADD COLUMN IF NOT EXISTS project_site_description TEXT,
ADD COLUMN IF NOT EXISTS site_ownership_details TEXT,
ADD COLUMN IF NOT EXISTS government_agreement TEXT,
ADD COLUMN IF NOT EXISTS departments_approached TEXT,
ADD COLUMN IF NOT EXISTS approvals_required TEXT,
ADD COLUMN IF NOT EXISTS landowner_negotiation_status TEXT,
ADD COLUMN IF NOT EXISTS estimated_cost_kina NUMERIC,
ADD COLUMN IF NOT EXISTS prescribed_activity_id UUID REFERENCES prescribed_activities(id);

-- Add index for prescribed_activity_id lookups
CREATE INDEX IF NOT EXISTS idx_intent_registrations_prescribed_activity 
ON intent_registrations(prescribed_activity_id);

CREATE INDEX IF NOT EXISTS idx_intent_registration_drafts_prescribed_activity 
ON intent_registration_drafts(prescribed_activity_id);