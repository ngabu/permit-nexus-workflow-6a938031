-- Add intent_registration_id column to inspections table
ALTER TABLE public.inspections 
ADD COLUMN intent_registration_id uuid REFERENCES public.intent_registrations(id) ON DELETE SET NULL;

-- Make permit_application_id nullable to support intent-only inspections
ALTER TABLE public.inspections 
ALTER COLUMN permit_application_id DROP NOT NULL;

-- Add check constraint to ensure at least one reference exists
ALTER TABLE public.inspections 
ADD CONSTRAINT inspections_must_have_reference 
CHECK (permit_application_id IS NOT NULL OR intent_registration_id IS NOT NULL);

-- Create index for faster lookups
CREATE INDEX idx_inspections_intent_registration_id ON public.inspections(intent_registration_id);

-- Add comment for clarity
COMMENT ON COLUMN public.inspections.intent_registration_id IS 'Optional reference to intent registration for intent-based inspections';