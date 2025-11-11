
-- Update Level 2 fees with official 2018 Environment Act Fees
UPDATE public.fee_structures 
SET annual_recurrent_fee = 7766, base_processing_days = 30, updated_at = now()
WHERE activity_type = 'Level 2' AND fee_category = '2.1';

UPDATE public.fee_structures 
SET annual_recurrent_fee = 17328.30, base_processing_days = 60, updated_at = now()
WHERE activity_type = 'Level 2' AND fee_category = '2.2';

UPDATE public.fee_structures 
SET annual_recurrent_fee = 37760.30, base_processing_days = 60, updated_at = now()
WHERE activity_type = 'Level 2' AND fee_category = '2.3';

UPDATE public.fee_structures 
SET annual_recurrent_fee = 83036.80, base_processing_days = 60, updated_at = now()
WHERE activity_type = 'Level 2' AND fee_category = '2.4';

-- Update Level 3 fees with official 2018 Environment Act Fees
UPDATE public.fee_structures 
SET annual_recurrent_fee = 114254.80, base_processing_days = 90, updated_at = now()
WHERE activity_type = 'Level 3' AND fee_category = '3.1';

UPDATE public.fee_structures 
SET annual_recurrent_fee = 162570.10, base_processing_days = 90, updated_at = now()
WHERE activity_type = 'Level 3' AND fee_category = '3.2';

UPDATE public.fee_structures 
SET annual_recurrent_fee = 543170.10, base_processing_days = 90, updated_at = now()
WHERE activity_type = 'Level 3' AND fee_category = '3.3';

UPDATE public.fee_structures 
SET annual_recurrent_fee = 1054054.10, base_processing_days = 90, updated_at = now()
WHERE activity_type = 'Level 3' AND fee_category = '3.4';
