-- Check and fix the assessment_outcome constraint
-- First, let's see what values are currently allowed
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname LIKE '%outcome_check%' AND contype = 'c';

-- Update the constraint to allow 'pending_review' value
ALTER TABLE public.initial_assessments 
DROP CONSTRAINT IF EXISTS initial_assessments_outcome_check;

-- Add the corrected constraint with proper values
ALTER TABLE public.initial_assessments 
ADD CONSTRAINT initial_assessments_outcome_check 
CHECK (assessment_outcome IN (
  'pending_review',
  'Approved for Next Stage', 
  'Rejected', 
  'Requires Clarification',
  'pending'
));