-- Add column to track existing permit relationships
ALTER TABLE public.permit_applications
ADD COLUMN IF NOT EXISTS existing_permit_id uuid REFERENCES public.permit_applications(id);

COMMENT ON COLUMN public.permit_applications.existing_permit_id IS 'References an existing permit for amendment, renewal, or transfer activities';