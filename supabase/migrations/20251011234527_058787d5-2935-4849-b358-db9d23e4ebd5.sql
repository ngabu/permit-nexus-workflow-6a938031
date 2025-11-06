-- Fix the incorrect fee calculation formula in the database function
-- The current formula (Annual Recurrent Fee * 365) / Processing Days is inverted
-- Correct formula should be: (Annual Recurrent Fee / 365) * Processing Days

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
  -- Get activity level and fee category
  SELECT 
    CASE 
      WHEN level = 1 THEN 'Level 1'
      WHEN level = 2 THEN 'Level 2'
      WHEN level = 3 THEN 'Level 3'
    END,
    fee_category
  INTO v_activity_level, v_fee_category
  FROM public.prescribed_activities
  WHERE id = p_activity_id;
  
  IF v_activity_level IS NULL THEN
    RAISE EXCEPTION 'Activity with ID % not found', p_activity_id;
  END IF;
  
  -- Get the fee structure details
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
    AND fs.fee_category = COALESCE(v_fee_category, 'For' || v_activity_level)
    AND fs.permit_type = p_permit_type
    AND fs.is_active = true
  LIMIT 1;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No fee structure found for activity level %, permit type %', 
      v_activity_level, p_permit_type;
  END IF;
  
  -- CORRECTED FORMULA: Calculate fee based on formula
  IF v_fee_structure.formula = '(Annual Recurrent Fee / 365) * Processing Days' THEN
    -- Correct calculation: divide by 365 then multiply by processing days
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

-- Create fee payment tracking table
CREATE TABLE IF NOT EXISTS public.fee_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  permit_application_id uuid NOT NULL REFERENCES public.permit_applications(id) ON DELETE CASCADE,
  administration_fee numeric NOT NULL DEFAULT 0,
  technical_fee numeric NOT NULL DEFAULT 0,
  total_fee numeric NOT NULL DEFAULT 0,
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'waived')),
  amount_paid numeric NOT NULL DEFAULT 0,
  payment_method text,
  payment_reference text,
  receipt_number text,
  paid_at timestamp with time zone,
  calculated_by uuid REFERENCES auth.users(id),
  approved_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create fee calculation audit trail
CREATE TABLE IF NOT EXISTS public.fee_calculation_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  permit_application_id uuid NOT NULL REFERENCES public.permit_applications(id) ON DELETE CASCADE,
  calculated_by uuid REFERENCES auth.users(id),
  calculation_method text NOT NULL,
  parameters jsonb NOT NULL,
  administration_fee numeric NOT NULL,
  technical_fee numeric NOT NULL,
  total_fee numeric NOT NULL,
  is_official boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_calculation_audit ENABLE ROW LEVEL SECURITY;

-- RLS policies for fee_payments
CREATE POLICY "Users can view their own fee payments"
  ON public.fee_payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.permit_applications pa
      WHERE pa.id = fee_payments.permit_application_id
      AND pa.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view all fee payments"
  ON public.fee_payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
      AND user_type = 'staff'
    )
  );

CREATE POLICY "Staff can manage fee payments"
  ON public.fee_payments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
      AND user_type = 'staff'
      AND staff_unit IN ('registry', 'finance', 'revenue')
    )
  );

-- RLS policies for fee_calculation_audit
CREATE POLICY "Users can view their own fee calculation history"
  ON public.fee_calculation_audit
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.permit_applications pa
      WHERE pa.id = fee_calculation_audit.permit_application_id
      AND pa.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view all fee calculations"
  ON public.fee_calculation_audit
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
      AND user_type = 'staff'
    )
  );

CREATE POLICY "System can create fee calculation audits"
  ON public.fee_calculation_audit
  FOR INSERT
  WITH CHECK (true);

-- Create function to validate workflow state before assessments
CREATE OR REPLACE FUNCTION public.validate_assessment_prerequisites(p_permit_application_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_application RECORD;
  v_fee_payment RECORD;
  v_result jsonb;
  v_errors text[] := '{}';
  v_warnings text[] := '{}';
BEGIN
  -- Get application details
  SELECT * INTO v_application
  FROM public.permit_applications
  WHERE id = p_permit_application_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valid', false,
      'errors', ARRAY['Application not found']
    );
  END IF;
  
  -- Check if fees have been calculated
  SELECT * INTO v_fee_payment
  FROM public.fee_payments
  WHERE permit_application_id = p_permit_application_id
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    v_errors := array_append(v_errors, 'Fees have not been calculated for this application');
  ELSIF v_fee_payment.payment_status != 'paid' AND v_fee_payment.payment_status != 'waived' THEN
    v_errors := array_append(v_errors, 'Application fees must be paid before assessment can begin');
  END IF;
  
  -- Check application status
  IF v_application.status NOT IN ('submitted', 'under_initial_review', 'under_technical_review') THEN
    v_warnings := array_append(v_warnings, 'Application status is: ' || v_application.status);
  END IF;
  
  -- Check if required documents are uploaded
  IF v_application.uploaded_files IS NULL OR jsonb_array_length(v_application.uploaded_files) = 0 THEN
    v_warnings := array_append(v_warnings, 'No documents uploaded');
  END IF;
  
  -- Build result
  v_result := jsonb_build_object(
    'valid', array_length(v_errors, 1) IS NULL OR array_length(v_errors, 1) = 0,
    'errors', v_errors,
    'warnings', v_warnings,
    'application_status', v_application.status,
    'fee_status', COALESCE(v_fee_payment.payment_status, 'not_calculated'),
    'total_fee', COALESCE(v_fee_payment.total_fee, 0),
    'amount_paid', COALESCE(v_fee_payment.amount_paid, 0)
  );
  
  RETURN v_result;
END;
$function$;

-- Create trigger to validate prerequisites before creating assessments
CREATE OR REPLACE FUNCTION public.check_assessment_prerequisites()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_validation jsonb;
BEGIN
  -- Skip validation for system-created placeholder assessments
  IF NEW.assessed_by = '00000000-0000-0000-0000-000000000000' THEN
    RETURN NEW;
  END IF;
  
  -- Validate prerequisites
  v_validation := public.validate_assessment_prerequisites(NEW.permit_application_id);
  
  -- If not valid, prevent assessment creation
  IF NOT (v_validation->>'valid')::boolean THEN
    RAISE EXCEPTION 'Cannot create assessment: %', v_validation->>'errors';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Add trigger to compliance_assessments
DROP TRIGGER IF EXISTS validate_compliance_assessment_prerequisites ON public.compliance_assessments;
CREATE TRIGGER validate_compliance_assessment_prerequisites
  BEFORE INSERT ON public.compliance_assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.check_assessment_prerequisites();

-- Add trigger to initial_assessments (only for manual assignments)
DROP TRIGGER IF EXISTS validate_initial_assessment_prerequisites ON public.initial_assessments;
CREATE TRIGGER validate_initial_assessment_prerequisites
  BEFORE INSERT ON public.initial_assessments
  FOR EACH ROW
  WHEN (NEW.assessed_by != '00000000-0000-0000-0000-000000000000')
  EXECUTE FUNCTION public.check_assessment_prerequisites();

-- Create function to log fee calculations
CREATE OR REPLACE FUNCTION public.log_fee_calculation(
  p_permit_application_id uuid,
  p_calculation_method text,
  p_parameters jsonb,
  p_administration_fee numeric,
  p_technical_fee numeric,
  p_total_fee numeric,
  p_is_official boolean DEFAULT false,
  p_notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_audit_id uuid;
BEGIN
  INSERT INTO public.fee_calculation_audit (
    permit_application_id,
    calculated_by,
    calculation_method,
    parameters,
    administration_fee,
    technical_fee,
    total_fee,
    is_official,
    notes
  ) VALUES (
    p_permit_application_id,
    auth.uid(),
    p_calculation_method,
    p_parameters,
    p_administration_fee,
    p_technical_fee,
    p_total_fee,
    p_is_official,
    p_notes
  ) RETURNING id INTO v_audit_id;
  
  RETURN v_audit_id;
END;
$function$;

-- Add updated_at trigger for fee_payments
CREATE TRIGGER update_fee_payments_updated_at
  BEFORE UPDATE ON public.fee_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();

COMMENT ON TABLE public.fee_payments IS 'Tracks fee payment status for permit applications';
COMMENT ON TABLE public.fee_calculation_audit IS 'Audit trail for all fee calculations';
COMMENT ON FUNCTION public.validate_assessment_prerequisites IS 'Validates that application meets prerequisites before assessment';
COMMENT ON FUNCTION public.log_fee_calculation IS 'Creates audit record of fee calculation';