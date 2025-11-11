-- Fix calculate_application_fee function to join with fee_structures table
CREATE OR REPLACE FUNCTION calculate_application_fee(
  p_activity_id UUID,
  p_permit_type TEXT DEFAULT NULL,
  p_custom_processing_days INTEGER DEFAULT NULL
)
RETURNS NUMERIC AS $$
DECLARE
  v_annual_fee NUMERIC;
  v_processing_days INTEGER;
  v_daily_rate NUMERIC;
  v_total_fee NUMERIC;
  v_fee_category TEXT;
BEGIN
  -- Get the fee category from prescribed_activities
  SELECT 
    pa.fee_category
  INTO 
    v_fee_category
  FROM prescribed_activities pa
  WHERE pa.id = p_activity_id;

  -- If no activity found, return 0
  IF v_fee_category IS NULL THEN
    RETURN 0;
  END IF;

  -- Get the annual recurrent fee from fee_structures based on fee_category
  SELECT 
    fs.annual_recurrent_fee
  INTO 
    v_annual_fee
  FROM fee_structures fs
  WHERE fs.fee_category = v_fee_category
    AND fs.permit_operation = 'New Application'
    AND fs.is_active = true
  LIMIT 1;

  -- If no fee structure found, return 0
  IF v_annual_fee IS NULL THEN
    RETURN 0;
  END IF;

  -- Determine processing days based on fee_category if not provided
  IF p_custom_processing_days IS NOT NULL THEN
    v_processing_days := p_custom_processing_days;
  ELSE
    -- Default processing days based on fee category
    CASE 
      WHEN v_fee_category = '2.1' THEN v_processing_days := 30;
      WHEN v_fee_category IN ('2.2', '2.3', '2.4') THEN v_processing_days := 60;
      WHEN v_fee_category = '3' THEN v_processing_days := 90;
      ELSE v_processing_days := 30; -- Default fallback
    END CASE;
  END IF;

  -- Calculate daily rate with 10 decimal places precision
  v_daily_rate := ROUND(v_annual_fee / 365.0, 10);

  -- Calculate total fee and round UP to 2 decimal places
  v_total_fee := CEIL((v_daily_rate * v_processing_days) * 100) / 100;

  RETURN v_total_fee;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;