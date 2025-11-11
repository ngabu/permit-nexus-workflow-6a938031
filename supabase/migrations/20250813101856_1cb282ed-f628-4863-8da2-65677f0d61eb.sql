-- First, let's see what current values exist that are violating the constraint
SELECT DISTINCT assessment_outcome 
FROM public.initial_assessments;

-- Update any invalid values to valid ones
UPDATE public.initial_assessments 
SET assessment_outcome = 'pending_review'
WHERE assessment_outcome NOT IN (
  'Approved for Next Stage', 
  'Rejected', 
  'Requires Clarification',
  'pending'
);

-- Now drop and recreate the constraint with the correct values
ALTER TABLE public.initial_assessments 
DROP CONSTRAINT IF EXISTS initial_assessments_outcome_check;

-- Add the corrected constraint with proper values including pending_review
ALTER TABLE public.initial_assessments 
ADD CONSTRAINT initial_assessments_outcome_check 
CHECK (assessment_outcome IN (
  'pending_review',
  'Approved for Next Stage', 
  'Rejected', 
  'Requires Clarification',
  'pending'
));