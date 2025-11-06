-- Fix calculate_application_fee to use activity-specific fee_category
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
  v_activity_level TEXT;
  v_fee_category TEXT;
  v_calculated_fee NUMERIC;
  v_formula TEXT;
BEGIN
  -- Get activity level AND fee_category from the prescribed activity
  SELECT 
    CASE 
      WHEN level = 1 THEN 'Level 1'
      WHEN level = 2 THEN 'Level 2'
      WHEN level = 3 THEN 'Level 3'
    END,
    COALESCE(fee_category, 
      CASE 
        WHEN level = 1 THEN 'ForL1'
        WHEN level = 2 THEN 'ForL2'
        WHEN level = 3 THEN 'ForL3'
      END
    )
  INTO v_activity_level, v_fee_category
  FROM public.prescribed_activities
  WHERE id = p_activity_id;
  
  IF v_activity_level IS NULL THEN
    RAISE EXCEPTION 'Activity with ID % not found', p_activity_id;
  END IF;
  
  -- Get the fee structure matching activity level, fee_category, AND permit type
  SELECT 
    fs.*,
    fcm.formula
  INTO v_fee_structure
  FROM 
    public.fee_structures fs
  JOIN 
    public.fee_calculation_methods fcm ON fs.calculation_method_id = fcm.id
  WHERE 
    fs.activity_type = v_activity_level
    AND fs.fee_category = v_fee_category
    AND fs.permit_type = p_permit_type
    AND fs.is_active = true
  LIMIT 1;
  
  -- If no exact match, try with just level and permit type (fallback)
  IF NOT FOUND THEN
    SELECT 
      fs.*,
      fcm.formula
    INTO v_fee_structure
    FROM 
      public.fee_structures fs
    JOIN 
      public.fee_calculation_methods fcm ON fs.calculation_method_id = fcm.id
    WHERE 
      fs.activity_type = v_activity_level
      AND fs.permit_type = p_permit_type
      AND fs.is_active = true
    LIMIT 1;
  END IF;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No fee structure found for activity level %, fee category %, permit type %', 
      v_activity_level, v_fee_category, p_permit_type;
  END IF;
  
  -- Calculate fee based on formula
  IF v_fee_structure.formula = '(Annual Recurrent Fee / 365) * Processing Days' THEN
    v_calculated_fee := (v_fee_structure.annual_recurrent_fee / 365) * 
                        COALESCE(p_custom_processing_days, v_fee_structure.base_processing_days);
  ELSIF v_fee_structure.formula = 'Work Plan Amount' THEN
    v_calculated_fee := v_fee_structure.work_plan_amount;
  ELSIF v_fee_structure.formula = 'Annual Recurrent Fee' THEN
    v_calculated_fee := v_fee_structure.annual_recurrent_fee;
  ELSE
    v_calculated_fee := v_fee_structure.annual_recurrent_fee;
  END IF;
  
  -- Apply category multiplier
  v_calculated_fee := v_calculated_fee * v_fee_structure.category_multiplier;
  
  RETURN ROUND(v_calculated_fee, 2);
END;
$function$;

COMMENT ON FUNCTION public.calculate_application_fee IS 'Calculates permit application fee based on prescribed activity (including fee_category), permit type, and optional custom processing days';
