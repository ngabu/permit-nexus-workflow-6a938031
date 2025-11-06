-- Fix critical RLS and security issues

-- Enable RLS on tables that are missing it
ALTER TABLE public.activity_document_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_fee_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_fee_view ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_document_checklist ENABLE ROW LEVEL SECURITY;
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

-- Fix function search paths for security
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

CREATE OR REPLACE FUNCTION public.get_applicable_fee_structures(p_activity_id uuid)
 RETURNS TABLE(fee_structure_id uuid, permit_type text, fee_category text, annual_recurrent_fee numeric, calculation_method text, formula text, is_default boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    fs.id AS fee_structure_id,
    fs.permit_type,
    fs.fee_category,
    fs.annual_recurrent_fee,
    fcm.method_name AS calculation_method,
    fcm.formula,
    afm.is_default
  FROM 
    public.activity_fee_mapping afm
  JOIN 
    public.fee_structures fs ON afm.fee_structure_id = fs.id
  JOIN 
    public.fee_calculation_methods fcm ON fs.calculation_method_id = fcm.id
  WHERE 
    afm.activity_id = p_activity_id
    AND fs.is_active = true
  ORDER BY
    afm.is_default DESC, fs.permit_type;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trigger_application_docs()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
    -- Auto-add base documents when application is created
    IF TG_OP = 'INSERT' THEN
        INSERT INTO application_required_docs (application_id, document_type, requirement_id)
        SELECT 
            NEW.id, 
            'BASE', 
            id
        FROM base_document_requirements
        WHERE NEW.entity_type = ANY(applies_to_entities);
    END IF;
    
    -- Auto-update activity docs when activity is changed
    IF TG_OP = 'UPDATE' AND (
        OLD.activity_classification IS DISTINCT FROM NEW.activity_classification OR
        OLD.activity_category IS DISTINCT FROM NEW.activity_category
    ) THEN
        -- Remove previous activity docs
        DELETE FROM application_required_docs
        WHERE application_id = NEW.id
        AND document_type = 'ACTIVITY'
        AND status = 'PENDING';
        
        -- Add new activity docs
        INSERT INTO application_required_docs (application_id, document_type, requirement_id)
        SELECT 
            NEW.id, 
            'ACTIVITY', 
            id
        FROM activity_document_requirements
        WHERE 
            activity_classification = NEW.activity_classification AND
            activity_category = NEW.activity_category AND
            is_post_assessment = FALSE;
    END IF;
    
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_audit_event(p_user_id uuid, p_action text, p_target_type text DEFAULT NULL::text, p_target_id text DEFAULT NULL::text, p_details jsonb DEFAULT NULL::jsonb, p_ip_address inet DEFAULT NULL::inet, p_user_agent text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    user_id, action, target_type, target_id, details, ip_address, user_agent
  ) VALUES (
    p_user_id, p_action, p_target_type, p_target_id, p_details, p_ip_address, p_user_agent
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.record_system_metric(p_metric_name text, p_metric_value numeric DEFAULT NULL::numeric, p_metric_data jsonb DEFAULT NULL::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  metric_id UUID;
BEGIN
  INSERT INTO public.system_metrics (metric_name, metric_value, metric_data)
  VALUES (p_metric_name, p_metric_value, p_metric_data)
  RETURNING id INTO metric_id;
  
  RETURN metric_id;
END;
$function$;