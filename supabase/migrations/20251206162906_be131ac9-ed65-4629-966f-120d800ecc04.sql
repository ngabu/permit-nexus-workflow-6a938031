-- Add docusign_envelope_id column to intent_registrations for reliable webhook lookup
ALTER TABLE public.intent_registrations 
ADD COLUMN IF NOT EXISTS docusign_envelope_id TEXT;

-- Create index for faster webhook lookups
CREATE INDEX IF NOT EXISTS idx_intent_registrations_docusign_envelope_id 
ON public.intent_registrations(docusign_envelope_id) 
WHERE docusign_envelope_id IS NOT NULL;