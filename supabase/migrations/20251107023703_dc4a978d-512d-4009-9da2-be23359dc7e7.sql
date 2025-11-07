-- Add intent_registration_id to documents table for linking documents to intent registrations
ALTER TABLE public.documents
ADD COLUMN intent_registration_id uuid REFERENCES public.intent_registrations(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX idx_documents_intent_registration_id ON public.documents(intent_registration_id);

-- Add RLS policy for intent registration documents
CREATE POLICY "Users can view documents for their intent registrations"
ON public.documents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.intent_registrations ir
    WHERE ir.id = documents.intent_registration_id
    AND ir.user_id = auth.uid()
  )
);

CREATE POLICY "Users can upload documents for their intent registrations"
ON public.documents
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.intent_registrations ir
    WHERE ir.id = documents.intent_registration_id
    AND ir.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete documents for their intent registrations"
ON public.documents
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.intent_registrations ir
    WHERE ir.id = documents.intent_registration_id
    AND ir.user_id = auth.uid()
    AND ir.status = 'pending'
  )
);

-- Add official feedback attachment path to intent_registrations
ALTER TABLE public.intent_registrations
ADD COLUMN official_feedback_attachments jsonb DEFAULT '[]'::jsonb;

-- Allow registry staff to update feedback attachments
CREATE POLICY "Registry staff can update intent feedback attachments"
ON public.intent_registrations
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.user_type = 'staff'
    AND profiles.staff_unit IN ('registry', 'compliance')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.user_type = 'staff'
    AND profiles.staff_unit IN ('registry', 'compliance')
  )
);