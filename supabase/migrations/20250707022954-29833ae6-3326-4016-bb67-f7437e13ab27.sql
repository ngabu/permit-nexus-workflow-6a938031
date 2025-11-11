
-- Create table for storing progressive permit applications with all required fields
CREATE TABLE public.permit_application_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  permit_id UUID REFERENCES public.permits(id) NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  
  -- Step 1: Basic Information (already handled by existing permit form)
  
  -- Step 2: Details of Application
  legal_description TEXT,
  land_type TEXT, -- customary/alienated
  owner_name TEXT,
  tenure TEXT,
  existing_permits_details TEXT,
  government_agreements_details TEXT,
  consulted_departments TEXT,
  required_approvals TEXT,
  landowner_negotiation_status TEXT,
  
  -- Step 3: Details of the Activity
  proposed_works_description TEXT,
  activity_location TEXT,
  estimated_cost_kina NUMERIC,
  commencement_date DATE,
  completion_date DATE,
  activity_classification TEXT, -- References prescribed activities
  activity_category TEXT, -- Level 1, Level 2A, Level 2B, Level 3
  activity_subcategory TEXT, -- Sub-category number from regulations
  
  -- Step 4: Permit Period
  permit_period TEXT,
  
  -- Step 5: Application Fee
  application_fee NUMERIC DEFAULT 0,
  
  -- Progress tracking
  current_step INTEGER DEFAULT 1,
  is_draft BOOLEAN DEFAULT true,
  completed_steps JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for prescribed activities reference (for compliance assessment)
CREATE TABLE public.prescribed_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_number TEXT NOT NULL,
  category_type TEXT NOT NULL, -- Level 2A, Level 2B, Level 3
  sub_category TEXT NOT NULL,
  activity_description TEXT NOT NULL,
  level INTEGER NOT NULL, -- 2 or 3
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for permit application details
ALTER TABLE public.permit_application_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own application details" 
  ON public.permit_application_details 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own application details" 
  ON public.permit_application_details 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own application details" 
  ON public.permit_application_details 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS for prescribed activities (read-only for all authenticated users)
ALTER TABLE public.prescribed_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view prescribed activities" 
  ON public.prescribed_activities 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Staff can view application details for assessment
CREATE POLICY "Staff can view application details for assessment" 
  ON public.permit_application_details 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('registry', 'compliance', 'admin')
  ));

-- Insert prescribed activities data
INSERT INTO public.prescribed_activities (category_number, category_type, sub_category, activity_description, level) VALUES
-- Level 2 Category A
('1.1', 'Level 2A', 'Sub-Category 1: Petroleum Exploration', 'Drilling of oil and gas wells', 2),
('2.1', 'Level 2A', 'Sub-Category 2: Mineral Exploration and Mining', 'Any drilling program at a defined prospect where the aggregate depth of all holes drilled is greater than 2,500 metres', 2),
('2.2', 'Level 2A', 'Sub-Category 2: Mineral Exploration and Mining', 'Mechanised mining on a Mining Lease issued under the Mining Act 1992 involving non-chemical processing of no greater than 50,000 tonnes per annum', 2),
('2.3', 'Level 2A', 'Sub-Category 2: Mineral Exploration and Mining', 'Gravel extraction operating continuously for more than 6 months and involving the extraction of no greater than 10,000 tonnes per annum', 2),
('2.4', 'Level 2A', 'Sub-Category 2: Mineral Exploration and Mining', 'Quarrying involving the extraction of no greater than 100,000 tonnes per annum', 2),
('3.1', 'Level 2A', 'Sub-Category 3: Minor Forest Activities', 'Activities carried out under a Timber Authority issued under the Forest Act', 2),

-- Level 2 Category B
('4.1', 'Level 2B', 'Sub-Category 4A: Manufacturing operations', 'Cement clinker manufacturing and grinding', 2),
('4.2', 'Level 2B', 'Sub-Category 4B: Processes involving chemical reactions', 'Manufacture of products by any chemical process in works designed to produce more than 100 tonnes per year of chemical products', 2),
('4.3', 'Level 2B', 'Sub-Category 4B: Processes involving chemical reactions', 'Manufacture of fibre-reinforced plastic (FRP) in works with a capacity of more than 50 tonnes per year', 2),
('4.4', 'Level 2B', 'Sub-Category 4B: Processes involving chemical reactions', 'Manufacture of acrylic compounds, fertilisers, herbicides, insecticides or pesticides by any chemical process', 2),
('4.5', 'Level 2B', 'Sub-Category 4B: Processes involving chemical reactions', 'Manufacturing operations involving the use of toluene di-isocyanate, methylene di-isocyanate, chlorofluorocarbons and halons', 2),

-- Level 3 Activities
('14.1', 'Level 3', 'Sub-Category 14: General', 'Activities involving investment of a capital cost of more than K50 million', 3),
('14.2', 'Level 3', 'Sub-Category 14: General', 'Activities involving the generation of a volume of liquid waste of more than 7,000,000 m³ per year', 3),
('14.3', 'Level 3', 'Sub-Category 14: General', 'Activities that will involve the discharge, emission or deposit of hazardous contaminants', 3),
('14.4', 'Level 3', 'Sub-Category 14: General', 'Activities that may result in a significant risk of serious or material environmental harm within protected areas', 3),
('17.1', 'Level 3', 'Sub-Category 17: Mining and extraction', 'Mining activities which require the issue of a Special Mining Lease under the Mining Act 1992', 3),
('18.1', 'Level 3', 'Sub-Category 18: Petroleum and gas production', 'Recovery, processing, storage or transportation of petroleum products requiring Petroleum Development Licence', 3);
