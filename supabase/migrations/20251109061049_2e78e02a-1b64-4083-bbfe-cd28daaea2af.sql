-- Recreate function with expanded return columns
DROP FUNCTION IF EXISTS public.get_intent_registrations_with_reviewer(uuid);

CREATE FUNCTION public.get_intent_registrations_with_reviewer(requesting_user_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  entity_id uuid,
  activity_level text,
  activity_description text,
  preparatory_work_description text,
  commencement_date date,
  completion_date date,
  status text,
  review_notes text,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  official_feedback_attachments jsonb,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  project_site_address text,
  project_site_description text,
  site_ownership_details text,
  government_agreement text,
  departments_approached text,
  approvals_required text,
  landowner_negotiation_status text,
  estimated_cost_kina numeric,
  prescribed_activity_id uuid,
  reviewer_first_name text,
  reviewer_last_name text,
  reviewer_email text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    ir.id,
    ir.user_id,
    ir.entity_id,
    ir.activity_level,
    ir.activity_description,
    ir.preparatory_work_description,
    ir.commencement_date,
    ir.completion_date,
    ir.status,
    ir.review_notes,
    ir.reviewed_by,
    ir.reviewed_at,
    ir.official_feedback_attachments,
    ir.created_at,
    ir.updated_at,
    ir.project_site_address,
    ir.project_site_description,
    ir.site_ownership_details,
    ir.government_agreement,
    ir.departments_approached,
    ir.approvals_required,
    ir.landowner_negotiation_status,
    ir.estimated_cost_kina,
    ir.prescribed_activity_id,
    p.first_name as reviewer_first_name,
    p.last_name as reviewer_last_name,
    p.email as reviewer_email
  FROM intent_registrations ir
  LEFT JOIN profiles p ON p.user_id = ir.reviewed_by
  WHERE ir.user_id = requesting_user_id;
$function$;