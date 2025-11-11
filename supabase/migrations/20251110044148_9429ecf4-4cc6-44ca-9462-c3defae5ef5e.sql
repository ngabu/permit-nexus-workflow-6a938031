-- Add missing columns for Project tab in permit applications
ALTER TABLE public.permit_applications
ADD COLUMN IF NOT EXISTS project_description TEXT,
ADD COLUMN IF NOT EXISTS project_start_date DATE,
ADD COLUMN IF NOT EXISTS project_end_date DATE,
ADD COLUMN IF NOT EXISTS environmental_impact TEXT,
ADD COLUMN IF NOT EXISTS mitigation_measures TEXT;