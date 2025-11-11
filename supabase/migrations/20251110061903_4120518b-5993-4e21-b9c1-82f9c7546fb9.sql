-- Update calculate_application_fee to use 60 days instead of 88 days for Level 2.2/2.3/2.4
DROP FUNCTION IF EXISTS public.calculate_application_fee(uuid, text, integer);

CREATE OR REPLACE FUNCTION public.calculate_application_fee(
  p_activity_id uuid,
  p_permit_type text,
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
    -- Use provided custom processing days
    v_processing_days := p_custom_processing_days;
  ELSIF v_activity_level = 2 THEN
    -- Level 2: 30 days for category 2.1, 60 days for 2.2/2.3/2.4
    IF v_fee_category = '2.1' THEN
      v_processing_days := 30;
    ELSIF v_fee_category IN ('2.2', '2.3', '2.4') THEN
      v_processing_days := 60;
    ELSE
      v_processing_days := 30; -- Default for Level 2
    END IF;
  ELSIF v_activity_level = 3 THEN
    -- Level 3: 90 days for all
    v_processing_days := 90;
  ELSE
    -- Level 1 or other: use default from fee_structure
    v_processing_days := NULL; -- Will use base_processing_days from fee_structure
  END IF;
  
  -- Get the fee structure matching activity level, fee_category, and permit type
  SELECT 
    fs.*
  INTO v_fee_structure
  FROM 
    public.fee_structures fs
  WHERE 
    fs.activity_type = v_activity_level_text
    AND (fs.fee_category = v_fee_category OR v_fee_category IS NULL)
    AND fs.permit_type = p_permit_type
    AND fs.is_active = true
  ORDER BY 
    CASE WHEN fs.fee_category = v_fee_category THEN 0 ELSE 1 END
  LIMIT 1;
  
  -- If no match with permit type, try with 'Other' as fallback
  IF NOT FOUND THEN
    SELECT 
      fs.*
    INTO v_fee_structure
    FROM 
      public.fee_structures fs
    WHERE 
      fs.activity_type = v_activity_level_text
      AND (fs.fee_category = v_fee_category OR v_fee_category IS NULL)
      AND fs.permit_type = 'Other'
      AND fs.is_active = true
    ORDER BY 
      CASE WHEN fs.fee_category = v_fee_category THEN 0 ELSE 1 END
    LIMIT 1;
  END IF;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No fee structure found for activity level %, fee category %, permit type %', 
      v_activity_level_text, v_fee_category, p_permit_type;
  END IF;
  
  -- Calculate fee using formula: (Annual Recurrent Fee ÷ 365) × Processing Days
  v_calculated_fee := (v_fee_structure.annual_recurrent_fee / 365.0) * 
                      COALESCE(v_processing_days, v_fee_structure.base_processing_days);
  
  -- Apply category multiplier if exists
  IF v_fee_structure.category_multiplier IS NOT NULL THEN
    v_calculated_fee := v_calculated_fee * v_fee_structure.category_multiplier;
  END IF;
  
  RETURN ROUND(v_calculated_fee, 2);
END;
$function$;

COMMENT ON FUNCTION public.calculate_application_fee IS 'Calculates permit application fee based on prescribed activity, permit type, and processing days (30 days for Level 2.1, 60 days for Level 2.2/2.3/2.4, 90 days for Level 3)';