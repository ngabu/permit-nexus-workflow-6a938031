-- Update calculate_application_fee to use precise decimal calculation
-- Step 1: Divide by 365 keeping high precision
-- Step 2: Multiply by processing days
-- Step 3: Round to 2 decimal places

CREATE OR REPLACE FUNCTION public.calculate_application_fee(
  p_activity_id uuid, 
  p_permit_type text DEFAULT 'Other',
  p_custom_processing_days integer DEFAULT NULL
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_fee_structure RECORD;
  v_activity_level INTEGER;
  v_activity_level_text TEXT;
  v_fee_category TEXT;
  v_calculated_fee NUMERIC;
  v_processing_days INTEGER;
  v_daily_rate NUMERIC(20,10);  -- Keep 10 decimal places for daily rate
BEGIN
  -- Get activity level and fee_category from the prescribed activity
  SELECT 
    level,
    CASE 
      WHEN level = 1 THEN 'Level 1'
      WHEN level = 2 THEN 'Level 2'
      WHEN level = 3 THEN 'Level 3'
    END,
    fee_category
  INTO v_activity_level, v_activity_level_text, v_fee_category
  FROM public.prescribed_activities
  WHERE id = p_activity_id;
  
  IF v_activity_level IS NULL THEN
    RAISE EXCEPTION 'Activity with ID % not found', p_activity_id;
  END IF;
  
  -- Determine processing days based on activity level and fee_category
  IF p_custom_processing_days IS NOT NULL THEN
    v_processing_days := p_custom_processing_days;
  ELSIF v_activity_level = 2 THEN
    IF v_fee_category = '2.1' THEN
      v_processing_days := 30;
    ELSIF v_fee_category IN ('2.2', '2.3', '2.4') THEN
      v_processing_days := 60;
    ELSE
      v_processing_days := 30;
    END IF;
  ELSIF v_activity_level = 3 THEN
    v_processing_days := 90;
  ELSE
    v_processing_days := NULL;
  END IF;
  
  -- Get the fee structure matching activity level and fee_category
  -- Permit type is now optional, defaults to 'Other'
  SELECT 
    fs.*
  INTO v_fee_structure
  FROM 
    public.fee_structures fs
  WHERE 
    fs.activity_type = v_activity_level_text
    AND (fs.fee_category = v_fee_category OR v_fee_category IS NULL)
    AND (fs.permit_type = p_permit_type OR fs.permit_type = 'Other')
    AND fs.is_active = true
  ORDER BY 
    CASE WHEN fs.fee_category = v_fee_category THEN 0 ELSE 1 END,
    CASE WHEN fs.permit_type = p_permit_type THEN 0 ELSE 1 END
  LIMIT 1;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No fee structure found for activity level %, fee category %', 
      v_activity_level_text, v_fee_category;
  END IF;
  
  -- Calculate fee with precise decimal handling:
  -- Step 1: Divide annual_recurrent_fee by 365, keeping 10 decimal places
  v_daily_rate := v_fee_structure.annual_recurrent_fee / 365.0;
  
  -- Step 2: Multiply by processing days
  v_calculated_fee := v_daily_rate * COALESCE(v_processing_days, v_fee_structure.base_processing_days);
  
  -- Apply category multiplier if exists
  IF v_fee_structure.category_multiplier IS NOT NULL THEN
    v_calculated_fee := v_calculated_fee * v_fee_structure.category_multiplier;
  END IF;
  
  -- Step 3: Round to 2 decimal places
  RETURN ROUND(v_calculated_fee, 2);
END;
$function$;