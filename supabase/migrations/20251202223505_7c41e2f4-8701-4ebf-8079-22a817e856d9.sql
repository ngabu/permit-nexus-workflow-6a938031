-- Add latitude and longitude columns to intent_registrations
ALTER TABLE public.intent_registrations 
ADD COLUMN latitude numeric,
ADD COLUMN longitude numeric;

-- Add latitude and longitude columns to intent_registration_drafts
ALTER TABLE public.intent_registration_drafts 
ADD COLUMN latitude numeric,
ADD COLUMN longitude numeric;