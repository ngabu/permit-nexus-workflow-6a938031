-- Add intent_registration_id to invoices table for proper linking
ALTER TABLE invoices ADD COLUMN intent_registration_id uuid REFERENCES intent_registrations(id) ON DELETE SET NULL;

-- Add registry-specific review fields to intent_registrations
ALTER TABLE intent_registrations 
ADD COLUMN registry_officer_id uuid,
ADD COLUMN registry_assigned_at timestamp with time zone,
ADD COLUMN registry_review_status text DEFAULT 'pending',
ADD COLUMN registry_review_notes text,
ADD COLUMN registry_reviewed_at timestamp with time zone,
ADD COLUMN registry_reviewed_by uuid;

-- Add compliance-specific review fields to intent_registrations
ALTER TABLE intent_registrations 
ADD COLUMN compliance_officer_id uuid,
ADD COLUMN compliance_assigned_at timestamp with time zone,
ADD COLUMN compliance_review_status text DEFAULT 'pending',
ADD COLUMN compliance_review_notes text,
ADD COLUMN compliance_score integer,
ADD COLUMN compliance_recommendations text,
ADD COLUMN compliance_reviewed_at timestamp with time zone,
ADD COLUMN compliance_reviewed_by uuid;

-- Add MD review tracking fields to intent_registrations
ALTER TABLE intent_registrations 
ADD COLUMN md_review_status text DEFAULT 'pending',
ADD COLUMN md_decision text,
ADD COLUMN md_decision_notes text,
ADD COLUMN md_decided_at timestamp with time zone,
ADD COLUMN md_decided_by uuid;

-- Create index for invoice lookups by intent_registration_id
CREATE INDEX idx_invoices_intent_registration_id ON invoices(intent_registration_id);

-- Add comments for documentation
COMMENT ON COLUMN intent_registrations.registry_officer_id IS 'Registry officer assigned to review this intent';
COMMENT ON COLUMN intent_registrations.registry_review_status IS 'Status of registry review: pending, in_progress, completed, returned';
COMMENT ON COLUMN intent_registrations.compliance_officer_id IS 'Compliance officer assigned to review this intent';
COMMENT ON COLUMN intent_registrations.compliance_review_status IS 'Status of compliance review: pending, in_progress, completed, returned';
COMMENT ON COLUMN intent_registrations.md_review_status IS 'Status of MD review: pending, approved, rejected, deferred';
COMMENT ON COLUMN invoices.intent_registration_id IS 'Link to intent registration for intent-related invoices';