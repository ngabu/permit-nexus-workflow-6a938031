
-- Create fee_structures table to store all fee calculation data
CREATE TABLE public.fee_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_type TEXT NOT NULL, -- 'new', 'amendment', 'transfer', 'amalgamation', 'compliance', 'enforcement', 'renewal', 'surrender'
  permit_type TEXT NOT NULL, -- 'Level 1', 'Level 2A', 'Level 2B', 'Level 3'
  fee_category TEXT NOT NULL, -- 'Red Category', 'Orange Category', 'Green Category'
  annual_recurrent_fee NUMERIC NOT NULL, -- Base annual fee for the category
  base_processing_days INTEGER NOT NULL, -- Estimated processing days
  work_plan_amount NUMERIC NOT NULL DEFAULT 15500, -- Technical fee amount
  administration_form TEXT NOT NULL, -- Form 2 for admin fees
  technical_form TEXT NOT NULL, -- Form 5-12 depending on activity type
  category_multiplier NUMERIC NOT NULL DEFAULT 1.0, -- Multiplier for different categories
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to view fee structures
CREATE POLICY "Authenticated users can view fee structures" 
ON public.fee_structures 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Policy for CEPA staff to manage fee structures
CREATE POLICY "CEPA staff can manage fee structures" 
ON public.fee_structures 
FOR ALL 
USING (public.is_cepa_staff());

-- Insert sample fee structure data based on the administrative order
INSERT INTO public.fee_structures (
  activity_type, permit_type, fee_category, annual_recurrent_fee, 
  base_processing_days, work_plan_amount, administration_form, technical_form, category_multiplier
) VALUES 
-- Level 1 Activities (Green Category - lowest fees)
('new', 'Level 1', 'Green Category', 5000, 30, 10000, 'Form 2', 'Form 9', 1.0),
('amendment', 'Level 1', 'Green Category', 5000, 15, 5000, 'Form 2', 'Form 8', 1.0),
('transfer', 'Level 1', 'Green Category', 5000, 10, 3000, 'Form 2', 'Form 11', 1.0),
('amalgamation', 'Level 1', 'Green Category', 5000, 20, 7500, 'Form 2', 'Form 7', 1.0),
('compliance', 'Level 1', 'Green Category', 5000, 7, 2500, 'Form 2', 'Form 5', 1.0),
('enforcement', 'Level 1', 'Green Category', 5000, 14, 5000, 'Form 2', 'Form 6', 1.0),
('renewal', 'Level 1', 'Green Category', 5000, 14, 4000, 'Form 2', 'Form 10', 1.0),
('surrender', 'Level 1', 'Green Category', 5000, 7, 2000, 'Form 2', 'Form 12', 1.0),

-- Level 2A Activities (Orange Category - medium fees)
('new', 'Level 2A', 'Orange Category', 15000, 45, 25000, 'Form 2', 'Form 9', 1.5),
('amendment', 'Level 2A', 'Orange Category', 15000, 25, 12500, 'Form 2', 'Form 8', 1.5),
('transfer', 'Level 2A', 'Orange Category', 15000, 18, 8000, 'Form 2', 'Form 11', 1.5),
('amalgamation', 'Level 2A', 'Orange Category', 15000, 35, 18000, 'Form 2', 'Form 7', 1.5),
('compliance', 'Level 2A', 'Orange Category', 15000, 14, 6000, 'Form 2', 'Form 5', 1.5),
('enforcement', 'Level 2A', 'Orange Category', 15000, 21, 12000, 'Form 2', 'Form 6', 1.5),
('renewal', 'Level 2A', 'Orange Category', 15000, 21, 10000, 'Form 2', 'Form 10', 1.5),
('surrender', 'Level 2A', 'Orange Category', 15000, 10, 4000, 'Form 2', 'Form 12', 1.5),

-- Level 2B Activities (Orange Category - medium-high fees)
('new', 'Level 2B', 'Orange Category', 25000, 60, 35000, 'Form 2', 'Form 9', 1.8),
('amendment', 'Level 2B', 'Orange Category', 25000, 35, 18000, 'Form 2', 'Form 8', 1.8),
('transfer', 'Level 2B', 'Orange Category', 25000, 25, 12000, 'Form 2', 'Form 11', 1.8),
('amalgamation', 'Level 2B', 'Orange Category', 25000, 45, 25000, 'Form 2', 'Form 7', 1.8),
('compliance', 'Level 2B', 'Orange Category', 25000, 18, 8000, 'Form 2', 'Form 5', 1.8),
('enforcement', 'Level 2B', 'Orange Category', 25000, 28, 16000, 'Form 2', 'Form 6', 1.8),
('renewal', 'Level 2B', 'Orange Category', 25000, 28, 14000, 'Form 2', 'Form 10', 1.8),
('surrender', 'Level 2B', 'Orange Category', 25000, 14, 6000, 'Form 2', 'Form 12', 1.8),

-- Level 3 Activities (Red Category - highest fees)
('new', 'Level 3', 'Red Category', 50000, 86, 75000, 'Form 2', 'Form 9', 2.5),
('amendment', 'Level 3', 'Red Category', 50000, 50, 35000, 'Form 2', 'Form 8', 2.5),
('transfer', 'Level 3', 'Red Category', 50000, 35, 20000, 'Form 2', 'Form 11', 2.5),
('amalgamation', 'Level 3', 'Red Category', 50000, 65, 45000, 'Form 2', 'Form 7', 2.5),
('compliance', 'Level 3', 'Red Category', 50000, 28, 15000, 'Form 2', 'Form 5', 2.5),
('enforcement', 'Level 3', 'Red Category', 50000, 42, 30000, 'Form 2', 'Form 6', 2.5),
('renewal', 'Level 3', 'Red Category', 50000, 42, 25000, 'Form 2', 'Form 10', 2.5),
('surrender', 'Level 3', 'Red Category', 50000, 21, 10000, 'Form 2', 'Form 12', 2.5);

-- Create index for better query performance
CREATE INDEX idx_fee_structures_lookup ON public.fee_structures (activity_type, permit_type, fee_category);

-- Create a view for easier fee calculation queries
CREATE VIEW public.fee_calculation_view AS
SELECT 
  fs.*,
  -- Calculate administration fee: (Annual Recurrent Fee / 365) × Processing Days
  ROUND((fs.annual_recurrent_fee / 365.0) * fs.base_processing_days, 2) AS calculated_admin_fee,
  -- Technical fee is the work plan amount
  fs.work_plan_amount AS calculated_technical_fee,
  -- Total fee
  ROUND(((fs.annual_recurrent_fee / 365.0) * fs.base_processing_days) + fs.work_plan_amount, 2) AS total_calculated_fee
FROM public.fee_structures fs
WHERE fs.is_active = true;

-- Grant select on the view to authenticated users
GRANT SELECT ON public.fee_calculation_view TO authenticated;
