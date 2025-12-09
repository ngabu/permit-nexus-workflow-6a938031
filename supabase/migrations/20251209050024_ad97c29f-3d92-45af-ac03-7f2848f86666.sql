-- Add report_path column to inspections table
ALTER TABLE public.inspections ADD COLUMN IF NOT EXISTS report_path text;

-- Add comment for documentation
COMMENT ON COLUMN public.inspections.report_path IS 'File path to the completed inspection report document';