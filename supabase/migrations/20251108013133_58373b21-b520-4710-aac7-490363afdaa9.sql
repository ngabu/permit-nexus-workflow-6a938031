-- Create intent registration drafts table
CREATE TABLE public.intent_registration_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_id UUID REFERENCES public.entities(id) ON DELETE SET NULL,
  activity_level TEXT,
  activity_description TEXT,
  preparatory_work_description TEXT,
  commencement_date DATE,
  completion_date DATE,
  draft_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for intent registration drafts
ALTER TABLE public.intent_registration_drafts ENABLE ROW LEVEL SECURITY;

-- Users can view their own drafts
CREATE POLICY "Users can view their own drafts"
  ON public.intent_registration_drafts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own drafts
CREATE POLICY "Users can create their own drafts"
  ON public.intent_registration_drafts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own drafts
CREATE POLICY "Users can update their own drafts"
  ON public.intent_registration_drafts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own drafts
CREATE POLICY "Users can delete their own drafts"
  ON public.intent_registration_drafts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add intent_registration_draft_id to documents table
ALTER TABLE public.documents
ADD COLUMN intent_registration_draft_id UUID REFERENCES public.intent_registration_drafts(id) ON DELETE CASCADE;

-- Add RLS policies for draft documents
CREATE POLICY "Users can view documents for their drafts"
  ON public.documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM intent_registration_drafts ird
      WHERE ird.id = documents.intent_registration_draft_id
      AND ird.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload documents for their drafts"
  ON public.documents
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM intent_registration_drafts ird
      WHERE ird.id = documents.intent_registration_draft_id
      AND ird.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete documents for their drafts"
  ON public.documents
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM intent_registration_drafts ird
      WHERE ird.id = documents.intent_registration_draft_id
      AND ird.user_id = auth.uid()
    )
  );

-- Create index for performance
CREATE INDEX idx_intent_registration_drafts_user_id ON public.intent_registration_drafts(user_id);
CREATE INDEX idx_documents_intent_registration_draft_id ON public.documents(intent_registration_draft_id);