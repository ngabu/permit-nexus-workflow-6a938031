
-- First, let's create the new unified permit_applications table
CREATE TABLE public.permit_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  entity_id UUID REFERENCES public.entities(id),
  
  -- Basic permit information (from permits table)
  title TEXT NOT NULL,
  permit_type TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  permit_number TEXT,
  application_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approval_date TIMESTAMP WITH TIME ZONE,
  expiry_date TIMESTAMP WITH TIME ZONE,
  assigned_officer_id UUID REFERENCES public.profiles(id),
  assigned_officer_name TEXT,
  assigned_officer_email TEXT,
  entity_name TEXT,
  entity_type TEXT,
  
  -- Application details (from permit_application_details table)
  legal_description TEXT,
  land_type TEXT,
  owner_name TEXT,
  tenure TEXT,
  existing_permits_details TEXT,
  government_agreements_details TEXT,
  consulted_departments TEXT,
  required_approvals TEXT,
  landowner_negotiation_status TEXT,
  proposed_works_description TEXT,
  activity_location TEXT,
  estimated_cost_kina NUMERIC,
  commencement_date DATE,
  completion_date DATE,
  activity_classification TEXT,
  activity_category TEXT,
  activity_subcategory TEXT,
  permit_period TEXT,
  application_fee NUMERIC DEFAULT 0,
  current_step INTEGER DEFAULT 1,
  is_draft BOOLEAN DEFAULT true,
  completed_steps JSONB DEFAULT '[]'::jsonb,
  
  -- Additional fields from permit_application table
  application_number TEXT,
  coordinates JSONB DEFAULT '{"lat": -6.314993, "lng": 143.95555}'::jsonb,
  environmental_impact TEXT,
  mitigation_measures TEXT,
  compliance_checks JSONB DEFAULT '{"legalCompliance": false, "technicalReview": false, "publicConsultation": false, "environmentalAssessment": false}'::jsonb,
  uploaded_files JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Migrate data from existing tables
-- First, migrate from permits table
INSERT INTO public.permit_applications (
  id, user_id, entity_id, title, permit_type, description, status, permit_number,
  application_date, approval_date, expiry_date, created_at, updated_at
)
SELECT 
  id, user_id, entity_id, title, permit_type, description, status, permit_number,
  application_date, approval_date, expiry_date, created_at, updated_at
FROM public.permits
ON CONFLICT (id) DO NOTHING;

-- Update with data from permit_application_details
UPDATE public.permit_applications 
SET 
  legal_description = pad.legal_description,
  land_type = pad.land_type,
  owner_name = pad.owner_name,
  tenure = pad.tenure,
  existing_permits_details = pad.existing_permits_details,
  government_agreements_details = pad.government_agreements_details,
  consulted_departments = pad.consulted_departments,
  required_approvals = pad.required_approvals,
  landowner_negotiation_status = pad.landowner_negotiation_status,
  proposed_works_description = pad.proposed_works_description,
  activity_location = pad.activity_location,
  estimated_cost_kina = pad.estimated_cost_kina,
  commencement_date = pad.commencement_date,
  completion_date = pad.completion_date,
  activity_classification = pad.activity_classification,
  activity_category = pad.activity_category,
  activity_subcategory = pad.activity_subcategory,
  permit_period = pad.permit_period,
  application_fee = pad.application_fee,
  current_step = pad.current_step,
  is_draft = pad.is_draft,
  completed_steps = pad.completed_steps
FROM public.permit_application_details pad
WHERE public.permit_applications.id = pad.permit_id;

-- Update with data from permit_application table (if any additional records exist)
INSERT INTO public.permit_applications (
  user_id, entity_id, title, permit_type, description, status, application_number,
  application_date, activity_location, environmental_impact, mitigation_measures,
  estimated_cost_kina, coordinates, compliance_checks, uploaded_files, 
  legal_description, proposed_works_description, created_at, updated_at
)
SELECT 
  user_id, entity_id, title, permit_type, description, status, application_number,
  application_date, activity_location, environmental_impact, mitigation_measures,
  estimated_cost_kina, coordinates, compliance_checks, uploaded_files,
  legal_description, proposed_works_description, created_at, updated_at
FROM public.permit_application pa
WHERE NOT EXISTS (
  SELECT 1 FROM public.permit_applications papp WHERE papp.id = pa.id
);

-- Add RLS policies
ALTER TABLE public.permit_applications ENABLE ROW LEVEL SECURITY;

-- Public users can manage their own applications
CREATE POLICY "Users can create their own applications" 
  ON public.permit_applications 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own applications" 
  ON public.permit_applications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications" 
  ON public.permit_applications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own applications" 
  ON public.permit_applications 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Staff can view all applications for assessment
CREATE POLICY "Staff can view applications for assessment" 
  ON public.permit_applications 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('registry', 'compliance', 'admin', 'revenue', 'finance')
  ));

-- Staff can update applications for processing
CREATE POLICY "Staff can update applications for processing" 
  ON public.permit_applications 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('registry', 'compliance', 'admin', 'revenue')
  ));

-- Update foreign key references in other tables
-- Update documents table
ALTER TABLE public.documents 
DROP CONSTRAINT IF EXISTS documents_permit_id_fkey,
ADD CONSTRAINT documents_permit_id_fkey 
FOREIGN KEY (permit_id) REFERENCES public.permit_applications(id);

-- Update invoices table
ALTER TABLE public.invoices 
DROP CONSTRAINT IF EXISTS invoices_permit_id_fkey,
ADD CONSTRAINT invoices_permit_id_fkey 
FOREIGN KEY (permit_id) REFERENCES public.permit_applications(id);

-- Update permit_activities table
ALTER TABLE public.permit_activities 
DROP CONSTRAINT IF EXISTS permit_activities_permit_id_fkey,
ADD CONSTRAINT permit_activities_permit_id_fkey 
FOREIGN KEY (permit_id) REFERENCES public.permit_applications(id);

-- Update financial_transactions table
ALTER TABLE public.financial_transactions 
DROP CONSTRAINT IF EXISTS financial_transactions_permit_id_fkey,
ADD CONSTRAINT financial_transactions_permit_id_fkey 
FOREIGN KEY (permit_id) REFERENCES public.permit_applications(id);

-- Update initial_assessments table
ALTER TABLE public.initial_assessments 
DROP CONSTRAINT IF EXISTS initial_assessments_permit_id_fkey,
ADD CONSTRAINT initial_assessments_permit_id_fkey 
FOREIGN KEY (permit_id) REFERENCES public.permit_applications(id);

-- Drop the old tables (commented out for safety - uncomment after verification)
-- DROP TABLE IF EXISTS public.permit_application_details;
-- DROP TABLE IF EXISTS public.permit_application;
-- DROP TABLE IF EXISTS public.permits;
