-- Create fee structure table for CEPA permit applications
CREATE TABLE public.fee_structures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_type TEXT NOT NULL,
  fee_category TEXT NOT NULL CHECK (fee_category IN ('Red Category', 'Orange Category', 'Green Category')),
  permit_type TEXT NOT NULL CHECK (permit_type IN ('new', 'amendment', 'transfer', 'amalgamation', 'compliance', 'surrender', 'enforcement', 'renewal')),
  annual_recurrent_fee NUMERIC NOT NULL,
  base_processing_days INTEGER NOT NULL,
  work_plan_amount NUMERIC NOT NULL DEFAULT 15500,
  administration_form TEXT NOT NULL DEFAULT 'Form 2',
  technical_form TEXT NOT NULL,
  category_multiplier NUMERIC NOT NULL DEFAULT 1.0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Unique constraint to prevent duplicate combinations
  UNIQUE(activity_type, fee_category, permit_type)
);

-- Create indexes for better performance
CREATE INDEX idx_fee_structures_activity_type ON public.fee_structures(activity_type);
CREATE INDEX idx_fee_structures_permit_type ON public.fee_structures(permit_type);
CREATE INDEX idx_fee_structures_fee_category ON public.fee_structures(fee_category);

-- Enable RLS
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;

-- Create policies for fee structures
CREATE POLICY "Everyone can view fee structures" 
ON public.fee_structures 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "CEPA staff can manage fee structures" 
ON public.fee_structures 
FOR ALL 
USING (is_cepa_staff())
WITH CHECK (is_cepa_staff());

-- Create trigger for updated_at
CREATE TRIGGER update_fee_structures_updated_at
BEFORE UPDATE ON public.fee_structures
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert base fee structure data based on CEPA regulations
INSERT INTO public.fee_structures (
  activity_type, 
  fee_category, 
  permit_type, 
  annual_recurrent_fee, 
  base_processing_days, 
  work_plan_amount,
  technical_form,
  category_multiplier
) VALUES
-- Mining Operations
('mining', 'Red Category', 'new', 50000, 86, 25000, 'Form 9', 1.5),
('mining', 'Orange Category', 'new', 35000, 86, 20000, 'Form 9', 1.2),
('mining', 'Green Category', 'new', 20000, 86, 15500, 'Form 9', 1.0),

-- Manufacturing
('manufacturing', 'Red Category', 'new', 40000, 86, 22000, 'Form 9', 1.5),
('manufacturing', 'Orange Category', 'new', 28000, 86, 18000, 'Form 9', 1.2),
('manufacturing', 'Green Category', 'new', 15000, 86, 15500, 'Form 9', 1.0),

-- Agriculture
('agriculture', 'Red Category', 'new', 25000, 86, 18000, 'Form 9', 1.5),
('agriculture', 'Orange Category', 'new', 18000, 86, 15500, 'Form 9', 1.2),
('agriculture', 'Green Category', 'new', 12000, 86, 12000, 'Form 9', 1.0),

-- Construction
('construction', 'Red Category', 'new', 35000, 86, 20000, 'Form 9', 1.5),
('construction', 'Orange Category', 'new', 25000, 86, 17000, 'Form 9', 1.2),
('construction', 'Green Category', 'new', 15000, 86, 15500, 'Form 9', 1.0),

-- Waste Management
('waste_management', 'Red Category', 'new', 45000, 86, 23000, 'Form 9', 1.5),
('waste_management', 'Orange Category', 'new', 32000, 86, 19000, 'Form 9', 1.2),
('waste_management', 'Green Category', 'new', 18000, 86, 15500, 'Form 9', 1.0),

-- Energy Production
('energy', 'Red Category', 'new', 60000, 86, 30000, 'Form 9', 1.5),
('energy', 'Orange Category', 'new', 42000, 86, 25000, 'Form 9', 1.2),
('energy', 'Green Category', 'new', 25000, 86, 18000, 'Form 9', 1.0),

-- Tourism Development
('tourism', 'Red Category', 'new', 30000, 86, 18000, 'Form 9', 1.5),
('tourism', 'Orange Category', 'new', 22000, 86, 15500, 'Form 9', 1.2),
('tourism', 'Green Category', 'new', 12000, 86, 12000, 'Form 9', 1.0),

-- Forestry
('forestry', 'Red Category', 'new', 40000, 86, 22000, 'Form 9', 1.5),
('forestry', 'Orange Category', 'new', 28000, 86, 18000, 'Form 9', 1.2),
('forestry', 'Green Category', 'new', 16000, 86, 15500, 'Form 9', 1.0),

-- Aquaculture
('aquaculture', 'Red Category', 'new', 35000, 86, 20000, 'Form 9', 1.5),
('aquaculture', 'Orange Category', 'new', 25000, 86, 17000, 'Form 9', 1.2),
('aquaculture', 'Green Category', 'new', 14000, 86, 15500, 'Form 9', 1.0),

-- Other Activities
('other', 'Red Category', 'new', 30000, 86, 18000, 'Form 9', 1.5),
('other', 'Orange Category', 'new', 20000, 86, 15500, 'Form 9', 1.2),
('other', 'Green Category', 'new', 12000, 86, 12000, 'Form 9', 1.0);

-- Insert amendment fee structures (reduced fees and processing time)
INSERT INTO public.fee_structures (
  activity_type, 
  fee_category, 
  permit_type, 
  annual_recurrent_fee, 
  base_processing_days, 
  work_plan_amount,
  technical_form,
  category_multiplier
)
SELECT 
  activity_type,
  fee_category,
  'amendment' as permit_type,
  annual_recurrent_fee * 0.6, -- 60% of new permit fee
  30, -- Amendment processing days
  work_plan_amount * 0.5, -- 50% of work plan amount
  'Form 8' as technical_form,
  category_multiplier
FROM public.fee_structures 
WHERE permit_type = 'new';

-- Insert transfer fee structures
INSERT INTO public.fee_structures (
  activity_type, 
  fee_category, 
  permit_type, 
  annual_recurrent_fee, 
  base_processing_days, 
  work_plan_amount,
  technical_form,
  category_multiplier
)
SELECT 
  activity_type,
  fee_category,
  'transfer' as permit_type,
  annual_recurrent_fee * 0.4, -- 40% of new permit fee
  21, -- Transfer processing days
  work_plan_amount * 0.3, -- 30% of work plan amount
  'Form 11' as technical_form,
  category_multiplier
FROM public.fee_structures 
WHERE permit_type = 'new';

-- Insert renewal fee structures
INSERT INTO public.fee_structures (
  activity_type, 
  fee_category, 
  permit_type, 
  annual_recurrent_fee, 
  base_processing_days, 
  work_plan_amount,
  technical_form,
  category_multiplier
)
SELECT 
  activity_type,
  fee_category,
  'renewal' as permit_type,
  annual_recurrent_fee * 0.8, -- 80% of new permit fee
  21, -- Renewal processing days
  work_plan_amount * 0.6, -- 60% of work plan amount
  'Form 10' as technical_form,
  category_multiplier
FROM public.fee_structures 
WHERE permit_type = 'new';

-- Insert compliance fee structures
INSERT INTO public.fee_structures (
  activity_type, 
  fee_category, 
  permit_type, 
  annual_recurrent_fee, 
  base_processing_days, 
  work_plan_amount,
  technical_form,
  category_multiplier
)
SELECT 
  activity_type,
  fee_category,
  'compliance' as permit_type,
  annual_recurrent_fee * 0.3, -- 30% of new permit fee
  14, -- Compliance processing days
  8000, -- Fixed compliance work plan
  'Form 5' as technical_form,
  category_multiplier
FROM public.fee_structures 
WHERE permit_type = 'new';

-- Insert enforcement fee structures
INSERT INTO public.fee_structures (
  activity_type, 
  fee_category, 
  permit_type, 
  annual_recurrent_fee, 
  base_processing_days, 
  work_plan_amount,
  technical_form,
  category_multiplier
)
SELECT 
  activity_type,
  fee_category,
  'enforcement' as permit_type,
  annual_recurrent_fee * 0.5, -- 50% of new permit fee
  30, -- Enforcement processing days
  work_plan_amount * 0.4, -- 40% of work plan amount
  'Form 6' as technical_form,
  category_multiplier
FROM public.fee_structures 
WHERE permit_type = 'new';

-- Insert amalgamation fee structures
INSERT INTO public.fee_structures (
  activity_type, 
  fee_category, 
  permit_type, 
  annual_recurrent_fee, 
  base_processing_days, 
  work_plan_amount,
  technical_form,
  category_multiplier
)
SELECT 
  activity_type,
  fee_category,
  'amalgamation' as permit_type,
  annual_recurrent_fee * 0.7, -- 70% of new permit fee
  45, -- Amalgamation processing days
  work_plan_amount * 0.6, -- 60% of work plan amount
  'Form 7' as technical_form,
  category_multiplier
FROM public.fee_structures 
WHERE permit_type = 'new';

-- Insert surrender fee structures
INSERT INTO public.fee_structures (
  activity_type, 
  fee_category, 
  permit_type, 
  annual_recurrent_fee, 
  base_processing_days, 
  work_plan_amount,
  technical_form,
  category_multiplier
)
SELECT 
  activity_type,
  fee_category,
  'surrender' as permit_type,
  annual_recurrent_fee * 0.2, -- 20% of new permit fee
  14, -- Surrender processing days
  5000, -- Fixed surrender work plan
  'Form 12' as technical_form,
  category_multiplier
FROM public.fee_structures 
WHERE permit_type = 'new';