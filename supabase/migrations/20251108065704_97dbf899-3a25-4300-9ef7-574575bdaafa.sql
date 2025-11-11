-- Drop the policy that allows public users to view profiles
DROP POLICY IF EXISTS "Public users can view reviewers of their intent registrations" ON profiles;

-- Create a function that returns intent registrations with reviewer information
CREATE OR REPLACE FUNCTION public.get_intent_registrations_with_reviewer(requesting_user_id uuid)
RETURNS TABLE (
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
  reviewer_first_name text,
  reviewer_last_name text,
  reviewer_email text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
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
    p.first_name as reviewer_first_name,
    p.last_name as reviewer_last_name,
    p.email as reviewer_email
  FROM intent_registrations ir
  LEFT JOIN profiles p ON p.user_id = ir.reviewed_by
  WHERE ir.user_id = requesting_user_id;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_intent_registrations_with_reviewer(uuid) TO authenticated;