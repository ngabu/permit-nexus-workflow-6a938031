-- Add new columns for PNG Environment Act 2000 compliance
ALTER TABLE permit_applications  
ADD COLUMN activity_level TEXT CHECK (activity_level IN ('Level 1', 'Level 2A', 'Level 2B', 'Level 3')),  
ADD COLUMN permit_type_specific TEXT CHECK (permit_type_specific IN ('Waste Discharge', 'Water Extraction', 'ODS Import', 'Mining Operations', 'Manufacturing', 'Tourism Development', 'Construction', 'Energy Production')),
ADD COLUMN public_consultation_proof JSONB DEFAULT NULL,
ADD COLUMN consultation_period_start DATE,
ADD COLUMN consultation_period_end DATE,
ADD COLUMN fee_amount NUMERIC DEFAULT 0,
ADD COLUMN fee_breakdown JSONB DEFAULT NULL,
ADD COLUMN ods_quota_allocation TEXT,
ADD COLUMN waste_contaminant_details JSONB DEFAULT NULL,
ADD COLUMN eia_required BOOLEAN DEFAULT FALSE,
ADD COLUMN eis_required BOOLEAN DEFAULT FALSE,
ADD COLUMN legal_declaration_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'processing')),
ADD COLUMN mandatory_fields_complete BOOLEAN DEFAULT FALSE;