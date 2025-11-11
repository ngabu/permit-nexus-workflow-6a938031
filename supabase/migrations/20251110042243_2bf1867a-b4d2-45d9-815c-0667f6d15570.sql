-- Remove permit_specific_fields column from permit_applications table
-- This column is no longer needed as the Permit Details tab has been removed

ALTER TABLE public.permit_applications 
DROP COLUMN IF EXISTS permit_specific_fields;