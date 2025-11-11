
-- Create initial assessments table for tracking registry assessments
CREATE TABLE public.initial_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  permit_id UUID REFERENCES public.permits(id) NOT NULL,
  assessed_by UUID REFERENCES public.profiles(id) NOT NULL,
  assessment_status TEXT NOT NULL DEFAULT 'pending' CHECK (assessment_status IN ('pending', 'passed', 'failed', 'requires_clarification')),
  assessment_notes TEXT NOT NULL,
  assessment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  feedback_provided TEXT,
  forwarded_to_compliance BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on initial assessments
ALTER TABLE public.initial_assessments ENABLE ROW LEVEL SECURITY;

-- Create policies for initial assessments
CREATE POLICY "Registry staff can view assessments" 
  ON public.initial_assessments 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('registry', 'admin')
  ));

CREATE POLICY "Registry officers can create assessments" 
  ON public.initial_assessments 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'registry' 
    AND staff_position = 'officer'
  ));

CREATE POLICY "Registry officers can update their assessments" 
  ON public.initial_assessments 
  FOR UPDATE 
  USING (assessed_by = auth.uid() AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'registry' 
    AND staff_position = 'officer'
  ));

-- Update invoices table to include more revenue-specific fields
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'overdue', 'paid', 'partially_paid', 'cancelled'));
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS follow_up_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS follow_up_notes TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS assigned_officer_id UUID REFERENCES public.profiles(id);

-- Create RLS policies for revenue unit on invoices
CREATE POLICY "Revenue staff can view all invoices" 
  ON public.invoices 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('revenue', 'admin')
  ));

CREATE POLICY "Revenue staff can update invoices" 
  ON public.invoices 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('revenue', 'admin')
  ));

-- Update financial transactions to include more tracking fields
ALTER TABLE public.financial_transactions ADD COLUMN IF NOT EXISTS follow_up_required BOOLEAN DEFAULT false;
ALTER TABLE public.financial_transactions ADD COLUMN IF NOT EXISTS last_follow_up_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.financial_transactions ADD COLUMN IF NOT EXISTS follow_up_notes TEXT;

-- Create RLS policies for revenue unit on financial transactions
CREATE POLICY "Revenue staff can manage transactions" 
  ON public.financial_transactions 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('revenue', 'admin')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('revenue', 'admin')
  ));
