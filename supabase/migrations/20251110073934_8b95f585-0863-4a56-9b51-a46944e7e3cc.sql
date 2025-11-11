-- Update the calculate_application_fee function with new precision requirements
-- Daily rate: 10 decimal places, Final amount: 2 decimal places rounded up

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
  -- Get the annual recurrent fee and fee category from prescribed_activities
  SELECT 
    pa.annual_recurrent_fee,
    pa.fee_category
  INTO 
    v_annual_fee,
    v_fee_category
  FROM prescribed_activities pa
  WHERE pa.id = p_activity_id;

  -- If no activity found, return 0
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
$$ LANGUAGE plpgsql SECURITY DEFINER;