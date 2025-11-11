-- Add permit_specific_fields column to permit_applications table
ALTER TABLE public.permit_applications 
ADD COLUMN IF NOT EXISTS permit_specific_fields jsonb DEFAULT '{}'::jsonb;