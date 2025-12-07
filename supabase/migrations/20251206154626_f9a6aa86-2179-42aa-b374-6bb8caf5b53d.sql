-- Add signed document path column to intent_registrations
ALTER TABLE public.intent_registrations
ADD COLUMN IF NOT EXISTS signed_document_path text;

-- Add comment for documentation
COMMENT ON COLUMN public.intent_registrations.signed_document_path IS 'Path to the signed document returned from DocuSign';