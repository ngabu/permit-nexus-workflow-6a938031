
-- First, let's update the user_role enum to include officer and manager roles
ALTER TYPE public.user_role ADD VALUE 'officer';
ALTER TYPE public.user_role ADD VALUE 'manager';

-- Create a new enum for operational units
CREATE TYPE public.operational_unit AS ENUM (
  'registry',
  'revenue', 
  'compliance',
  'finance',
  'directorate',
  'admin'
);

-- Create a new enum for staff positions
CREATE TYPE public.staff_position AS ENUM (
  'officer',
  'manager'
);

-- Add new columns to profiles table for staff management
ALTER TABLE public.profiles 
ADD COLUMN operational_unit operational_unit,
ADD COLUMN staff_position staff_position,
ADD COLUMN is_active BOOLEAN DEFAULT true,
ADD COLUMN created_by UUID REFERENCES public.profiles(id),
ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;

-- Create audit logs table for system tracking
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for audit logs (only admin can view)
CREATE POLICY "Admin can view audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create system metrics table
CREATE TABLE public.system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  metric_data JSONB,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on system_metrics
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;

-- Create policy for system metrics (only admin can view)
CREATE POLICY "Admin can view system metrics" ON public.system_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Update profile policies to allow admin to manage staff
CREATE POLICY "Admin can insert staff profiles" ON public.profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can update staff profiles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can delete staff profiles" ON public.profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_user_id UUID,
  p_action TEXT,
  p_target_type TEXT DEFAULT NULL,
  p_target_id TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    user_id, action, target_type, target_id, details, ip_address, user_agent
  ) VALUES (
    p_user_id, p_action, p_target_type, p_target_id, p_details, p_ip_address, p_user_agent
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record system metrics
CREATE OR REPLACE FUNCTION public.record_system_metric(
  p_metric_name TEXT,
  p_metric_value NUMERIC DEFAULT NULL,
  p_metric_data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  metric_id UUID;
BEGIN
  INSERT INTO public.system_metrics (metric_name, metric_value, metric_data)
  VALUES (p_metric_name, p_metric_value, p_metric_data)
  RETURNING id INTO metric_id;
  
  RETURN metric_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a special supa_admin user profile (this would be done manually)
-- Note: This is just the structure - the actual supa_admin user would need to be created
-- through the auth system and then updated to have admin role
