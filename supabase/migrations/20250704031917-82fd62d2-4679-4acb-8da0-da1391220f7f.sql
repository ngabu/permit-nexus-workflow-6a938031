-- Create financial_transactions table
CREATE TABLE public.financial_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_number TEXT NOT NULL UNIQUE,
  transaction_type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'PGK',
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  payment_reference TEXT,
  myob_reference TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  paid_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  application_id UUID REFERENCES permits(id),
  permit_id UUID REFERENCES permits(id),
  user_id UUID NOT NULL
);

-- Enable RLS
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own transactions" 
ON public.financial_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Staff can view all transactions" 
ON public.financial_transactions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role IN ('finance', 'admin', 'manager')
));

-- Create permit_applications view
CREATE VIEW public.permit_applications AS
SELECT 
  p.id,
  p.permit_number,
  p.title,
  p.permit_type,
  p.status,
  p.application_date,
  p.created_at,
  p.updated_at,
  e.name as entity_name,
  e.entity_type,
  pr.id as assigned_officer_id,
  pr.full_name as assigned_officer_name,
  pr.email as assigned_officer_email
FROM permits p
JOIN entities e ON p.entity_id = e.id
LEFT JOIN profiles pr ON pr.role = 'compliance' AND pr.staff_position = 'officer';