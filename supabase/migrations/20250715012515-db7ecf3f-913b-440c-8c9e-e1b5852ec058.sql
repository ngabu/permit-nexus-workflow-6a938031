-- Add the missing permit_applications table to the database types
-- Also ensure proper foreign key relationships

-- First ensure the permit_applications table exists with proper structure
CREATE TABLE IF NOT EXISTS public.permit_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entity_id UUID REFERENCES public.entities(id),
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
  application_number TEXT,
  coordinates JSONB DEFAULT '{"lat": -6.314993, "lng": 143.95555}'::jsonb,
  environmental_impact TEXT,
  mitigation_measures TEXT,
  compliance_checks JSONB DEFAULT '{"legalCompliance": false, "technicalReview": false, "publicConsultation": false, "environmentalAssessment": false}'::jsonb,
  uploaded_files JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ensure RLS is enabled and policies exist
ALTER TABLE public.permit_applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can create their own applications" ON public.permit_applications;
DROP POLICY IF EXISTS "Users can view their own applications" ON public.permit_applications;
DROP POLICY IF EXISTS "Users can update their own applications" ON public.permit_applications;
DROP POLICY IF EXISTS "Users can delete their own applications" ON public.permit_applications;
DROP POLICY IF EXISTS "Staff can view applications for assessment" ON public.permit_applications;
DROP POLICY IF EXISTS "Staff can update applications for processing" ON public.permit_applications;

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

CREATE POLICY "Staff can view applications for assessment" 
  ON public.permit_applications 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('registry', 'compliance', 'admin', 'revenue', 'finance')
  ));

CREATE POLICY "Staff can update applications for processing" 
  ON public.permit_applications 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('registry', 'compliance', 'admin', 'revenue')
  ));