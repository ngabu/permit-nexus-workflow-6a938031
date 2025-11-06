-- Add permit_category and permit_type_id columns to permit_applications table
ALTER TABLE public.permit_applications
ADD COLUMN IF NOT EXISTS permit_category TEXT,
ADD COLUMN IF NOT EXISTS permit_type_id UUID REFERENCES public.permit_types(id);