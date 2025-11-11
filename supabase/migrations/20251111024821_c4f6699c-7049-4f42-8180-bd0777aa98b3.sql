-- Add existing_permit_id column to intent_registrations table
ALTER TABLE public.intent_registrations 
ADD COLUMN existing_permit_id uuid REFERENCES public.permit_applications(id);

-- Add index for better query performance
CREATE INDEX idx_intent_registrations_existing_permit 
ON public.intent_registrations(existing_permit_id);

COMMENT ON COLUMN public.intent_registrations.existing_permit_id IS 'Reference to existing permit application if intent is related to amendment, renewal, or transfer';