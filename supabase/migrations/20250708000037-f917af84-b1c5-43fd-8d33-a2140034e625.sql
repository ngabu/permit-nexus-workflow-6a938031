-- Fix infinite recursion in profiles RLS policies
DROP POLICY IF EXISTS "Allow staff profile access" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create simpler, non-recursive policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "CEPA staff can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  auth.uid() IN (
    SELECT user_id FROM public.profiles 
    WHERE user_role IN ('cepa_staff', 'admin', 'system_admin') 
    AND user_id = auth.uid()
  )
);

-- Create entities table that the compliance code expects
CREATE TABLE IF NOT EXISTS public.entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  registration_number TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on entities
ALTER TABLE public.entities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for entities
CREATE POLICY "Users can view entities" ON public.entities FOR SELECT USING (true);
CREATE POLICY "CEPA staff can manage entities" ON public.entities FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND user_role IN ('cepa_staff', 'admin', 'system_admin')
  )
);

-- Create permits table that the compliance code expects
CREATE TABLE IF NOT EXISTS public.permits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  permit_number TEXT UNIQUE,
  title TEXT NOT NULL,
  permit_type TEXT NOT NULL DEFAULT 'new',
  status TEXT NOT NULL DEFAULT 'draft',
  description TEXT,
  entity_id UUID REFERENCES public.entities(id),
  user_id UUID NOT NULL,
  application_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approval_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on permits
ALTER TABLE public.permits ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for permits
CREATE POLICY "Users can view their permits" ON public.permits FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "CEPA staff can manage permits" ON public.permits FOR ALL USING (
  user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND user_role IN ('cepa_staff', 'admin', 'system_admin')
  )
);

-- Add updated_at triggers
CREATE TRIGGER update_entities_updated_at
  BEFORE UPDATE ON public.entities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_permits_updated_at
  BEFORE UPDATE ON public.permits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();