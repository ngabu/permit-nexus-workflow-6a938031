-- Add existing_permit_id column to intent_registration_drafts table
ALTER TABLE public.intent_registration_drafts 
ADD COLUMN existing_permit_id uuid REFERENCES public.permit_applications(id);

-- Add index for better query performance
CREATE INDEX idx_intent_drafts_existing_permit 
ON public.intent_registration_drafts(existing_permit_id);

COMMENT ON COLUMN public.intent_registration_drafts.existing_permit_id IS 'Reference to existing permit application if draft is related to amendment, renewal, or transfer';