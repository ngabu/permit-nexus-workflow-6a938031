-- Add missing PNG Environment Act 2000 specific columns to permit_applications
ALTER TABLE permit_applications 
ADD COLUMN IF NOT EXISTS ods_quota_allocation text,
ADD COLUMN IF NOT EXISTS waste_contaminant_details jsonb,
ADD COLUMN IF NOT EXISTS water_extraction_details jsonb,
ADD COLUMN IF NOT EXISTS ods_details jsonb,
ADD COLUMN IF NOT EXISTS operational_details text,
ADD COLUMN IF NOT EXISTS operational_capacity text,
ADD COLUMN IF NOT EXISTS operating_hours text,
ADD COLUMN IF NOT EXISTS eia_required boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS eis_required boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS legal_declaration_accepted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS compliance_commitment boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS mandatory_fields_complete boolean DEFAULT false;