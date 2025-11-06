-- Create prescribed_activities table
CREATE TABLE public.prescribed_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_number TEXT NOT NULL,
  category_type TEXT NOT NULL,
  sub_category TEXT NOT NULL,
  activity_description TEXT NOT NULL,
  level INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add missing columns to invoices table
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'PGK',
ADD COLUMN IF NOT EXISTS activity_id UUID,
ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS follow_up_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS follow_up_notes TEXT,
ADD COLUMN IF NOT EXISTS assigned_officer_id UUID;

-- Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS staff_position TEXT,
ADD COLUMN IF NOT EXISTS operational_unit TEXT;

-- Add missing columns to permit_activities table
ALTER TABLE public.permit_activities 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

-- Create trigger for permit_activities updated_at
CREATE TRIGGER update_permit_activities_updated_at
  BEFORE UPDATE ON public.permit_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on prescribed_activities
ALTER TABLE public.prescribed_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for prescribed_activities
CREATE POLICY "Everyone can view prescribed activities" 
ON public.prescribed_activities 
FOR SELECT 
USING (true);

CREATE POLICY "CEPA staff can manage prescribed activities" 
ON public.prescribed_activities 
FOR ALL 
USING (is_cepa_staff());