-- Update the constraint to include all current values plus the new ones
ALTER TABLE public.initial_assessments 
DROP CONSTRAINT IF EXISTS initial_assessments_outcome_check;

-- Add the corrected constraint with all current and needed values
ALTER TABLE public.initial_assessments 
ADD CONSTRAINT initial_assessments_outcome_check 
CHECK (assessment_outcome IN (
  'pending_review',
  'Approved for Next Stage', 
  'Rejected', 
  'Requires Clarification',
  'pending',
  'failed',  -- This value exists in the database
  'passed'   -- Common value that might exist
));