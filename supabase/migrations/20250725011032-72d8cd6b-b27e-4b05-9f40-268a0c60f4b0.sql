-- Fix critical RLS and security issues (final corrected version)

-- Enable RLS on actual tables only (not views)
ALTER TABLE public.activity_document_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_fee_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_required_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.base_document_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_calculation_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.initial_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permit_assessments ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for admin tables
CREATE POLICY "Admin can view activity document requirements" 
ON public.activity_document_requirements 
FOR SELECT 
USING (is_admin_or_super_admin());

CREATE POLICY "Admin can view activity fee mapping" 
ON public.activity_fee_mapping 
FOR SELECT 
USING (is_admin_or_super_admin());

CREATE POLICY "Admin can view base document requirements" 
ON public.base_document_requirements 
FOR SELECT 
USING (is_admin_or_super_admin());

CREATE POLICY "Admin can manage fee calculation methods" 
ON public.fee_calculation_methods 
FOR ALL 
USING (is_admin_or_super_admin());

CREATE POLICY "Admin can manage fee structures" 
ON public.fee_structures 
FOR ALL 
USING (is_admin_or_super_admin());

-- Policies for application-related tables
CREATE POLICY "Users can view their application required docs" 
ON public.application_required_docs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.permit_applications 
    WHERE permit_applications.id = application_required_docs.application_id 
    AND permit_applications.user_id = auth.uid()
  ) OR is_admin_or_super_admin()
);

CREATE POLICY "Users can manage their application required docs" 
ON public.application_required_docs 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.permit_applications 
    WHERE permit_applications.id = application_required_docs.application_id 
    AND permit_applications.user_id = auth.uid()
  ) OR is_admin_or_super_admin()
);

-- Policies for assessments (staff only)
CREATE POLICY "Staff can manage initial assessments" 
ON public.initial_assessments 
FOR ALL 
USING (is_admin_or_super_admin());

CREATE POLICY "Staff can manage permit assessments" 
ON public.permit_assessments 
FOR ALL 
USING (is_admin_or_super_admin());

-- Fix function search paths for security (select important functions)
CREATE OR REPLACE FUNCTION public.calculate_application_fee(p_activity_id uuid, p_permit_type text, p_custom_processing_days integer DEFAULT NULL::integer)
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
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
  
  -- Calculate fee based on formula
  IF v_fee_structure.formula = '(Annual Recurrent Fee * 365) / Processing Days' THEN
    v_calculated_fee := (v_fee_structure.annual_recurrent_fee * 365) / 
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