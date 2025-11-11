-- Drop the problematic RLS policies
DROP POLICY IF EXISTS "CEPA staff can view all profiles" ON public.profiles;

-- Create a simpler, non-recursive policy that only allows users to view their own profile
-- Staff access to other profiles will be handled differently if needed
CREATE POLICY "Users can view own profile only" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create the missing invoices table that the code expects
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  permit_id UUID REFERENCES public.permits(id),
  invoice_number TEXT UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  issue_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  due_date TIMESTAMP WITH TIME ZONE,
  paid_date TIMESTAMP WITH TIME ZONE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for invoices
CREATE POLICY "Users can view their own invoices" 
ON public.invoices 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "CEPA staff can manage all invoices" 
ON public.invoices 
FOR ALL 
USING (
  user_id = auth.uid() OR 
  auth.uid() IN (
    SELECT user_id FROM public.profiles 
    WHERE user_role IN ('cepa_staff', 'admin', 'system_admin')
  )
);

-- Create permit_activities table that the invoice query expects
CREATE TABLE IF NOT EXISTS public.permit_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  permit_id UUID REFERENCES public.permits(id),
  activity_type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on permit_activities
ALTER TABLE public.permit_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for permit_activities
CREATE POLICY "Users can view permit activities for their permits" 
ON public.permit_activities 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.permits 
    WHERE permits.id = permit_activities.permit_id 
    AND permits.user_id = auth.uid()
  )
);

-- Add triggers for updated_at
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_permit_activities_updated_at
  BEFORE UPDATE ON public.permit_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();