-- Update the constraint to include all actual values from the database
ALTER TABLE public.initial_assessments 
DROP CONSTRAINT IF EXISTS initial_assessments_outcome_check;

-- Add the corrected constraint with all actual values
ALTER TABLE public.initial_assessments 
ADD CONSTRAINT initial_assessments_outcome_check 
CHECK (assessment_outcome IN (
  'pending_review',
  'Approved for Next Stage', 
  'Rejected', 
  'Requires Clarification',
  'pending',
  'failed',
  'passed',
  'Rejected - Application Incomplete'  -- This value exists in the database
));