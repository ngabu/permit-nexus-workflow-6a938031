-- Update invalid assessment_outcome values to valid ones
UPDATE public.initial_assessments 
SET assessment_outcome = 'Pending - Awaiting Information' 
WHERE assessment_outcome = 'pending';

UPDATE public.initial_assessments 
SET assessment_outcome = 'Pending - Awaiting Information' 
WHERE assessment_outcome = 'pending_review';

-- Add check constraint for assessment_outcome to ensure valid values
ALTER TABLE public.initial_assessments 
ADD CONSTRAINT initial_assessments_outcome_check 
CHECK (assessment_outcome IN (
  'Approved for Next Stage',
  'Rejected - Application Incomplete', 
  'Pending - Awaiting Information',
  'Conditional Approval'
));