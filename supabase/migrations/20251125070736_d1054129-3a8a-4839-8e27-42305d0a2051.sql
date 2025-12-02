-- =========================================
-- COMPREHENSIVE WORKFLOW & APPROVAL SYSTEM
-- =========================================

-- Create workflow status enum
CREATE TYPE workflow_stage AS ENUM (
  'submitted',
  'registry_review',
  'registry_clarification_needed',
  'compliance_review',
  'compliance_clarification_needed',
  'revenue_review',
  'revenue_invoice_issued',
  'payment_pending',
  'payment_confirmed',
  'director_review',
  'approved',
  'rejected',
  'cancelled'
);

-- Create application types enum
CREATE TYPE application_category AS ENUM (
  'intent_registration',
  'new_permit',
  'permit_renewal',
  'permit_transfer',
  'permit_amendment',
  'permit_amalgamation',
  'permit_surrender',
  'compliance_report'
);

-- =========================================
-- 1. UNIFIED WORKFLOW STATE TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS application_workflow_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Application references
  application_id UUID NOT NULL,
  application_type application_category NOT NULL,
  application_number TEXT,
  
  -- Current workflow state
  current_stage workflow_stage NOT NULL DEFAULT 'submitted',
  previous_stage workflow_stage,
  
  -- Lock mechanism to prevent concurrent edits
  is_locked BOOLEAN NOT NULL DEFAULT FALSE,
  locked_by UUID REFERENCES auth.users(id),
  locked_at TIMESTAMPTZ,
  lock_reason TEXT,
  
  -- Current assignee
  assigned_to UUID REFERENCES auth.users(id),
  assigned_unit staff_unit,
  assigned_at TIMESTAMPTZ,
  
  -- Applicant information
  applicant_id UUID NOT NULL REFERENCES auth.users(id),
  entity_id UUID REFERENCES entities(id),
  
  -- Timeline tracking
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  registry_completed_at TIMESTAMPTZ,
  compliance_completed_at TIMESTAMPTZ,
  revenue_completed_at TIMESTAMPTZ,
  final_decision_at TIMESTAMPTZ,
  
  -- Metadata
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  sla_deadline TIMESTAMPTZ,
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indices for performance
CREATE INDEX idx_workflow_state_application ON application_workflow_state(application_id, application_type);
CREATE INDEX idx_workflow_state_stage ON application_workflow_state(current_stage);
CREATE INDEX idx_workflow_state_assigned ON application_workflow_state(assigned_to, assigned_unit);
CREATE INDEX idx_workflow_state_locked ON application_workflow_state(is_locked) WHERE is_locked = TRUE;
CREATE INDEX idx_workflow_state_applicant ON application_workflow_state(applicant_id);

-- =========================================
-- 2. WORKFLOW TRANSITIONS (AUDIT TRAIL)
-- =========================================
CREATE TABLE IF NOT EXISTS workflow_transitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_state_id UUID NOT NULL REFERENCES application_workflow_state(id) ON DELETE CASCADE,
  
  -- Transition details
  from_stage workflow_stage,
  to_stage workflow_stage NOT NULL,
  transition_type TEXT NOT NULL, -- 'progress', 'clarification', 'rejection', 'approval', etc.
  
  -- Actor information
  performed_by UUID NOT NULL REFERENCES auth.users(id),
  performer_role staff_unit,
  performer_position staff_position,
  
  -- Transition metadata
  notes TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  auto_transition BOOLEAN DEFAULT FALSE, -- TRUE if triggered by system
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_workflow_transitions_state ON workflow_transitions(workflow_state_id);
CREATE INDEX idx_workflow_transitions_performer ON workflow_transitions(performed_by);

-- =========================================
-- 3. APPROVAL STAGES
-- =========================================
CREATE TABLE IF NOT EXISTS approval_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_state_id UUID NOT NULL REFERENCES application_workflow_state(id) ON DELETE CASCADE,
  
  -- Stage information
  stage_name TEXT NOT NULL, -- 'Registry Review', 'Compliance Assessment', etc.
  stage_unit staff_unit NOT NULL,
  stage_order INTEGER NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  
  -- Assignment
  assigned_to UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ,
  
  -- Completion
  completed_by UUID REFERENCES auth.users(id),
  completed_at TIMESTAMPTZ,
  outcome TEXT, -- 'approved', 'rejected', 'requires_clarification'
  
  -- Details
  notes TEXT,
  recommendations TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  
  -- Timeline
  due_date TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_approval_stages_workflow ON approval_stages(workflow_state_id, stage_order);
CREATE INDEX idx_approval_stages_assigned ON approval_stages(assigned_to, status);
CREATE INDEX idx_approval_stages_unit ON approval_stages(stage_unit, status);

-- =========================================
-- 4. UNIFIED NOTIFICATIONS TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS unified_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Recipient
  recipient_id UUID NOT NULL REFERENCES auth.users(id),
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('user', 'staff', 'unit_manager', 'director')),
  
  -- Notification details
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL, -- 'application_status', 'assignment', 'approval_required', etc.
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Related records
  workflow_state_id UUID REFERENCES application_workflow_state(id) ON DELETE CASCADE,
  application_id UUID,
  application_type application_category,
  
  -- Action requirement
  requires_action BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  action_label TEXT,
  
  -- Status
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_recipient ON unified_notifications(recipient_id, is_read);
CREATE INDEX idx_notifications_workflow ON unified_notifications(workflow_state_id);
CREATE INDEX idx_notifications_type ON unified_notifications(notification_type);
CREATE INDEX idx_notifications_action ON unified_notifications(requires_action) WHERE requires_action = TRUE;

-- =========================================
-- 5. FEES AND INVOICING TRACKING
-- =========================================
CREATE TABLE IF NOT EXISTS workflow_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_state_id UUID NOT NULL REFERENCES application_workflow_state(id) ON DELETE CASCADE,
  
  -- Fee calculation
  administration_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  technical_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  -- Calculated by
  calculated_by UUID REFERENCES auth.users(id),
  calculated_at TIMESTAMPTZ,
  calculation_method TEXT,
  
  -- Approved by
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  
  -- Invoice details
  invoice_id UUID REFERENCES invoices(id),
  invoice_issued BOOLEAN DEFAULT FALSE,
  invoice_issued_at TIMESTAMPTZ,
  
  -- Payment tracking
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partially_paid', 'paid', 'waived', 'overdue')),
  amount_paid DECIMAL(10,2) DEFAULT 0,
  paid_at TIMESTAMPTZ,
  payment_reference TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_workflow_fees_state ON workflow_fees(workflow_state_id);
CREATE INDEX idx_workflow_fees_payment ON workflow_fees(payment_status);
CREATE INDEX idx_workflow_fees_invoice ON workflow_fees(invoice_id);

-- =========================================
-- 6. DIRECTOR APPROVALS
-- =========================================
CREATE TABLE IF NOT EXISTS director_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_state_id UUID NOT NULL REFERENCES application_workflow_state(id) ON DELETE CASCADE,
  
  -- Approval request
  submitted_to UUID NOT NULL REFERENCES auth.users(id), -- Managing Director
  submitted_by UUID NOT NULL REFERENCES auth.users(id), -- Staff submitting for approval
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Recommendation from staff
  recommendation TEXT NOT NULL, -- 'approve', 'reject', 'request_changes'
  recommendation_notes TEXT,
  
  -- Decision
  decision TEXT CHECK (decision IN ('approved', 'rejected', 'revoked', 'cancelled', 'pending')),
  decision_notes TEXT,
  decided_by UUID REFERENCES auth.users(id),
  decided_at TIMESTAMPTZ,
  
  -- Letter/Document signing
  requires_signature BOOLEAN DEFAULT TRUE,
  letter_signed BOOLEAN DEFAULT FALSE,
  letter_signed_at TIMESTAMPTZ,
  docusign_envelope_id TEXT,
  signed_document_path TEXT,
  
  -- Priority
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_director_approvals_workflow ON director_approvals(workflow_state_id);
CREATE INDEX idx_director_approvals_submitted_to ON director_approvals(submitted_to, decision);
CREATE INDEX idx_director_approvals_decision ON director_approvals(decision);

-- =========================================
-- 7. ENABLE ROW LEVEL SECURITY
-- =========================================

ALTER TABLE application_workflow_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE unified_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE director_approvals ENABLE ROW LEVEL SECURITY;

-- =========================================
-- 8. RLS POLICIES
-- =========================================

-- Applicants can view their own workflow states
CREATE POLICY "Applicants can view own workflow state"
ON application_workflow_state FOR SELECT
TO authenticated
USING (applicant_id = auth.uid());

-- Staff can view workflows assigned to their unit
CREATE POLICY "Staff can view unit workflows"
ON application_workflow_state FOR SELECT
TO authenticated
USING (
  assigned_unit = (SELECT staff_unit FROM profiles WHERE user_id = auth.uid())
  OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND user_type IN ('admin', 'super_admin')
  )
);

-- Staff can update workflows assigned to them
CREATE POLICY "Staff can update assigned workflows"
ON application_workflow_state FOR UPDATE
TO authenticated
USING (
  assigned_to = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND staff_unit = application_workflow_state.assigned_unit
    AND staff_position IN ('manager', 'director')
  )
);

-- Notifications policies
CREATE POLICY "Users can view their notifications"
ON unified_notifications FOR SELECT
TO authenticated
USING (recipient_id = auth.uid());

CREATE POLICY "Users can update their notifications"
ON unified_notifications FOR UPDATE
TO authenticated
USING (recipient_id = auth.uid());

-- Workflow transitions - viewable by staff and applicant
CREATE POLICY "View workflow transitions"
ON workflow_transitions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM application_workflow_state ws
    WHERE ws.id = workflow_transitions.workflow_state_id
    AND (ws.applicant_id = auth.uid() OR ws.assigned_unit IN (
      SELECT staff_unit FROM profiles WHERE user_id = auth.uid()
    ))
  )
);

-- Approval stages policies
CREATE POLICY "Staff can view approval stages"
ON approval_stages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM application_workflow_state ws
    WHERE ws.id = approval_stages.workflow_state_id
    AND (ws.applicant_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.user_type = 'staff'
    ))
  )
);

-- Director approvals policies
CREATE POLICY "Directors can view approvals"
ON director_approvals FOR SELECT
TO authenticated
USING (
  submitted_to = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND staff_position IN ('director', 'managing_director')
  )
);

-- Workflow fees policies
CREATE POLICY "Staff can view workflow fees"
ON workflow_fees FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM application_workflow_state ws
    WHERE ws.id = workflow_fees.workflow_state_id
    AND (ws.applicant_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.user_id = auth.uid() 
      AND p.staff_unit IN ('revenue', 'finance', 'registry', 'compliance')
    ))
  )
);

-- =========================================
-- 9. HELPER FUNCTIONS
-- =========================================

-- Function to create workflow state for new applications
CREATE OR REPLACE FUNCTION create_workflow_state(
  p_application_id UUID,
  p_application_type application_category,
  p_applicant_id UUID,
  p_entity_id UUID DEFAULT NULL,
  p_application_number TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workflow_id UUID;
  v_stage_id UUID;
BEGIN
  -- Create workflow state
  INSERT INTO application_workflow_state (
    application_id,
    application_type,
    application_number,
    current_stage,
    applicant_id,
    entity_id,
    assigned_unit,
    priority
  ) VALUES (
    p_application_id,
    p_application_type,
    p_application_number,
    'submitted',
    p_applicant_id,
    p_entity_id,
    'registry', -- Always starts with registry
    'normal'
  )
  RETURNING id INTO v_workflow_id;

  -- Create initial approval stages
  -- Stage 1: Registry Review
  INSERT INTO approval_stages (
    workflow_state_id,
    stage_name,
    stage_unit,
    stage_order,
    status
  ) VALUES (
    v_workflow_id,
    'Registry Initial Review',
    'registry',
    1,
    'in_progress'
  );

  -- Stage 2: Compliance Assessment
  INSERT INTO approval_stages (
    workflow_state_id,
    stage_name,
    stage_unit,
    stage_order,
    status
  ) VALUES (
    v_workflow_id,
    'Compliance Assessment',
    'compliance',
    2,
    'pending'
  );

  -- Stage 3: Revenue Review
  INSERT INTO approval_stages (
    workflow_state_id,
    stage_name,
    stage_unit,
    stage_order,
    status
  ) VALUES (
    v_workflow_id,
    'Revenue Review & Invoicing',
    'revenue',
    3,
    'pending'
  );

  -- Stage 4: Director Approval
  INSERT INTO approval_stages (
    workflow_state_id,
    stage_name,
    stage_unit,
    stage_order,
    status
  ) VALUES (
    v_workflow_id,
    'Director Final Approval',
    'directorate',
    4,
    'pending'
  );

  -- Create initial transition
  INSERT INTO workflow_transitions (
    workflow_state_id,
    from_stage,
    to_stage,
    transition_type,
    performed_by,
    auto_transition,
    notes
  ) VALUES (
    v_workflow_id,
    NULL,
    'submitted',
    'submission',
    p_applicant_id,
    TRUE,
    'Application submitted'
  );

  -- Notify registry manager
  INSERT INTO unified_notifications (
    recipient_id,
    recipient_type,
    title,
    message,
    notification_type,
    workflow_state_id,
    application_id,
    application_type,
    requires_action,
    priority
  )
  SELECT 
    p.user_id,
    'unit_manager',
    'New Application Submitted',
    'A new ' || p_application_type || ' application has been submitted and requires assignment.',
    'new_application',
    v_workflow_id,
    p_application_id,
    p_application_type,
    TRUE,
    'normal'
  FROM profiles p
  WHERE p.staff_unit = 'registry' 
    AND p.staff_position = 'manager'
  LIMIT 1;

  RETURN v_workflow_id;
END;
$$;

-- Function to transition workflow stage
CREATE OR REPLACE FUNCTION transition_workflow_stage(
  p_workflow_id UUID,
  p_to_stage workflow_stage,
  p_performer_id UUID,
  p_notes TEXT DEFAULT NULL,
  p_attachments JSONB DEFAULT '[]'::jsonb
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_stage workflow_stage;
  v_performer_unit staff_unit;
  v_performer_position staff_position;
  v_applicant_id UUID;
  v_application_id UUID;
  v_application_type application_category;
BEGIN
  -- Get current state
  SELECT 
    current_stage,
    applicant_id,
    application_id,
    application_type
  INTO 
    v_current_stage,
    v_applicant_id,
    v_application_id,
    v_application_type
  FROM application_workflow_state
  WHERE id = p_workflow_id;

  -- Get performer details
  SELECT staff_unit, staff_position
  INTO v_performer_unit, v_performer_position
  FROM profiles
  WHERE user_id = p_performer_id;

  -- Update workflow state
  UPDATE application_workflow_state
  SET 
    previous_stage = v_current_stage,
    current_stage = p_to_stage,
    updated_at = now()
  WHERE id = p_workflow_id;

  -- Record transition
  INSERT INTO workflow_transitions (
    workflow_state_id,
    from_stage,
    to_stage,
    transition_type,
    performed_by,
    performer_role,
    performer_position,
    notes,
    attachments
  ) VALUES (
    p_workflow_id,
    v_current_stage,
    p_to_stage,
    'stage_transition',
    p_performer_id,
    v_performer_unit,
    v_performer_position,
    p_notes,
    p_attachments
  );

  -- Notify applicant of stage change
  INSERT INTO unified_notifications (
    recipient_id,
    recipient_type,
    title,
    message,
    notification_type,
    workflow_state_id,
    application_id,
    application_type
  ) VALUES (
    v_applicant_id,
    'user',
    'Application Status Updated',
    'Your application has moved to: ' || p_to_stage,
    'application_status',
    p_workflow_id,
    v_application_id,
    v_application_type
  );

  RETURN TRUE;
END;
$$;

-- Function to lock/unlock workflow
CREATE OR REPLACE FUNCTION lock_workflow(
  p_workflow_id UUID,
  p_user_id UUID,
  p_lock BOOLEAN,
  p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_lock THEN
    -- Lock the workflow
    UPDATE application_workflow_state
    SET 
      is_locked = TRUE,
      locked_by = p_user_id,
      locked_at = now(),
      lock_reason = p_reason,
      updated_at = now()
    WHERE id = p_workflow_id
      AND (is_locked = FALSE OR locked_by = p_user_id);
  ELSE
    -- Unlock the workflow
    UPDATE application_workflow_state
    SET 
      is_locked = FALSE,
      locked_by = NULL,
      locked_at = NULL,
      lock_reason = NULL,
      updated_at = now()
    WHERE id = p_workflow_id
      AND locked_by = p_user_id;
  END IF;

  RETURN FOUND;
END;
$$;

-- Function to send notification
CREATE OR REPLACE FUNCTION send_workflow_notification(
  p_recipient_id UUID,
  p_recipient_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_notification_type TEXT,
  p_workflow_id UUID,
  p_requires_action BOOLEAN DEFAULT FALSE,
  p_priority TEXT DEFAULT 'normal'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification_id UUID;
  v_application_id UUID;
  v_application_type application_category;
BEGIN
  -- Get application details
  SELECT application_id, application_type
  INTO v_application_id, v_application_type
  FROM application_workflow_state
  WHERE id = p_workflow_id;

  -- Create notification
  INSERT INTO unified_notifications (
    recipient_id,
    recipient_type,
    title,
    message,
    notification_type,
    workflow_state_id,
    application_id,
    application_type,
    requires_action,
    priority
  ) VALUES (
    p_recipient_id,
    p_recipient_type,
    p_title,
    p_message,
    p_notification_type,
    p_workflow_id,
    v_application_id,
    v_application_type,
    p_requires_action,
    p_priority
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;

-- =========================================
-- 10. TRIGGERS
-- =========================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_workflow_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_workflow_state_timestamp
BEFORE UPDATE ON application_workflow_state
FOR EACH ROW
EXECUTE FUNCTION update_workflow_timestamp();

CREATE TRIGGER update_approval_stages_timestamp
BEFORE UPDATE ON approval_stages
FOR EACH ROW
EXECUTE FUNCTION update_workflow_timestamp();

CREATE TRIGGER update_workflow_fees_timestamp
BEFORE UPDATE ON workflow_fees
FOR EACH ROW
EXECUTE FUNCTION update_workflow_timestamp();

CREATE TRIGGER update_director_approvals_timestamp
BEFORE UPDATE ON director_approvals
FOR EACH ROW
EXECUTE FUNCTION update_workflow_timestamp();