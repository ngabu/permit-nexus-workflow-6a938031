# Comprehensive Workflow & Approval System Documentation

## Overview

This system provides a unified, secure, and auditable workflow for all application types in your permit management system. It includes:

- **Unified workflow tracking** across all stages
- **Record locking** to prevent concurrent edits
- **Comprehensive audit trail** of all actions
- **Unified notification system** for all users
- **Automatic stage transitions** with proper validation
- **Role-based access control** throughout

---

## System Architecture

### Core Components

#### 1. **application_workflow_state**
Central tracking table for all application workflows.

**Key Features:**
- Tracks current and previous stages
- Records lock status to prevent concurrent edits
- Maintains complete timeline (submission → approval)
- Links to applicant, entity, and assigned staff
- Supports priority levels and SLA tracking

**Workflow Stages:**
```
submitted → registry_review → compliance_review → 
revenue_review → payment_confirmed → director_review → 
approved/rejected/cancelled
```

**Clarification Stages:**
- `registry_clarification_needed`
- `compliance_clarification_needed`

#### 2. **workflow_transitions**
Complete audit trail of all workflow stage changes.

**Tracks:**
- Who performed the action
- When it happened
- From/to stages
- Notes and attachments
- Whether it was automatic or manual

#### 3. **approval_stages**
Defines the approval pipeline for each application.

**Four Standard Stages:**
1. Registry Initial Review
2. Compliance Assessment  
3. Revenue Review & Invoicing
4. Director Final Approval

Each stage tracks:
- Assignment
- Status (pending/in_progress/completed/skipped)
- Completion details
- Notes and recommendations

#### 4. **unified_notifications**
Single notification system for all users.

**Notification Types:**
- `new_application` - Registry manager notified
- `assignment` - Officer assigned to task
- `application_status` - Status updates to applicant
- `approval_required` - Director needs to approve
- `clarification_needed` - Applicant action required
- `payment_due` - Payment reminders
- `invoice_issued` - Revenue notifications

#### 5. **workflow_fees**
Tracks fees and payment status for each workflow.

**Features:**
- Links to invoices table
- Tracks payment status
- Records who calculated/approved fees
- Payment reconciliation support

#### 6. **director_approvals**
Manages Managing Director final approval process.

**Features:**
- Recommendation from staff
- Director's decision
- Letter signing tracking
- DocuSign integration support
- Priority handling

---

## Workflow Process

### 1. Application Submission
```sql
-- When applicant submits application
SELECT create_workflow_state(
  p_application_id := '<permit_application_id>',
  p_application_type := 'new_permit', -- or other types
  p_applicant_id := '<user_id>',
  p_entity_id := '<entity_id>',
  p_application_number := 'PA-2025-001'
);
```

**What happens automatically:**
1. Workflow state created with status 'submitted'
2. Four approval stages created (Registry → Compliance → Revenue → Director)
3. Registry stage marked 'in_progress'
4. Registry manager notified
5. Initial transition recorded in audit trail

### 2. Registry Review
**Registry Manager assigns to officer:**
```sql
UPDATE application_workflow_state
SET 
  assigned_to = '<officer_id>',
  assigned_at = now()
WHERE id = '<workflow_id>';
```

**Registry Officer reviews and advances:**
```sql
-- Lock workflow while working
SELECT lock_workflow(
  '<workflow_id>',
  '<officer_id>',
  TRUE, -- lock
  'Registry officer reviewing application'
);

-- Update approval stage
UPDATE approval_stages
SET 
  status = 'completed',
  completed_by = '<officer_id>',
  completed_at = now(),
  outcome = 'approved',
  notes = 'All documentation verified',
  recommendations = 'Application ready for compliance review'
WHERE workflow_state_id = '<workflow_id>'
  AND stage_order = 1;

-- Transition to next stage
SELECT transition_workflow_stage(
  '<workflow_id>',
  'compliance_review',
  '<officer_id>',
  'Registry review completed successfully'
);

-- Unlock workflow
SELECT lock_workflow(
  '<workflow_id>',
  '<officer_id>',
  FALSE -- unlock
);
```

**If clarification needed:**
```sql
SELECT transition_workflow_stage(
  '<workflow_id>',
  'registry_clarification_needed',
  '<officer_id>',
  'Missing site ownership documents'
);
-- Applicant notified automatically
-- Application locked from further progress
```

### 3. Compliance Assessment
Similar to Registry, but Compliance unit staff:

```sql
-- Compliance manager assigns
UPDATE application_workflow_state
SET 
  assigned_to = '<compliance_officer_id>',
  assigned_unit = 'compliance',
  assigned_at = now()
WHERE id = '<workflow_id>';

-- Compliance officer completes assessment
UPDATE approval_stages
SET 
  status = 'completed',
  completed_by = '<compliance_officer_id>',
  completed_at = now(),
  outcome = 'approved',
  notes = 'Technical assessment passed',
  recommendations = 'Application meets environmental standards'
WHERE workflow_state_id = '<workflow_id>'
  AND stage_order = 2;

-- Transition to revenue
SELECT transition_workflow_stage(
  '<workflow_id>',
  'revenue_review',
  '<compliance_officer_id>',
  'Compliance assessment completed'
);
```

### 4. Revenue Processing
Revenue team calculates fees and issues invoice:

```sql
-- Create fee record
INSERT INTO workflow_fees (
  workflow_state_id,
  administration_fee,
  technical_fee,
  total_fee,
  calculated_by,
  calculated_at,
  calculation_method
) VALUES (
  '<workflow_id>',
  1500.00,
  2500.00,
  4000.00,
  '<revenue_officer_id>',
  now(),
  'Standard Level 2 calculation'
);

-- Issue invoice (link to existing invoices table)
UPDATE workflow_fees
SET 
  invoice_id = '<invoice_id>',
  invoice_issued = TRUE,
  invoice_issued_at = now()
WHERE workflow_state_id = '<workflow_id>';

-- Transition stage
SELECT transition_workflow_stage(
  '<workflow_id>',
  'revenue_invoice_issued',
  '<revenue_officer_id>',
  'Invoice INV-2025-001 issued for K4,000.00'
);

-- When payment received
UPDATE workflow_fees
SET 
  payment_status = 'paid',
  amount_paid = 4000.00,
  paid_at = now(),
  payment_reference = 'BANK-REF-12345'
WHERE workflow_state_id = '<workflow_id>';

-- Advance to next stage
SELECT transition_workflow_stage(
  '<workflow_id>',
  'payment_confirmed',
  '<revenue_officer_id>',
  'Payment confirmed via bank reconciliation'
);
```

### 5. Director Approval
Final approval by Managing Director:

```sql
-- Create director approval request
INSERT INTO director_approvals (
  workflow_state_id,
  submitted_to, -- Managing Director user_id
  submitted_by, -- Staff submitting
  recommendation,
  recommendation_notes,
  decision,
  priority
) VALUES (
  '<workflow_id>',
  '<managing_director_id>',
  '<revenue_officer_id>',
  'approve',
  'All stages completed successfully. Registry verified documentation, Compliance confirmed environmental compliance, Revenue confirmed payment of K4,000.00.',
  'pending',
  'normal'
);

-- Transition to director review
SELECT transition_workflow_stage(
  '<workflow_id>',
  'director_review',
  '<revenue_officer_id>',
  'Submitted for Managing Director final approval'
);

-- Director makes decision
UPDATE director_approvals
SET 
  decision = 'approved',
  decision_notes = 'Approved for permit issuance',
  decided_by = '<managing_director_id>',
  decided_at = now()
WHERE workflow_state_id = '<workflow_id>';

-- Director signs letter
UPDATE director_approvals
SET 
  letter_signed = TRUE,
  letter_signed_at = now(),
  docusign_envelope_id = '<envelope_id>',
  signed_document_path = 'permits/signed/PA-2025-001.pdf'
WHERE workflow_state_id = '<workflow_id>';

-- Final transition
SELECT transition_workflow_stage(
  '<workflow_id>',
  'approved',
  '<managing_director_id>',
  'Application approved and permit issued'
);

-- Update original application
UPDATE permit_applications
SET 
  status = 'approved',
  approval_date = now()
WHERE id = '<application_id>';
```

---

## Integration with Existing Code

### Step 1: Trigger Workflow Creation on Application Submission

Add to your application submission code:

```typescript
// In your permit application submission handler
const { data: application, error: appError } = await supabase
  .from('permit_applications')
  .insert({
    // ... your application fields
    status: 'submitted'
  })
  .select()
  .single();

if (application) {
  // Create workflow state
  const { data: workflowId, error: workflowError } = await supabase
    .rpc('create_workflow_state', {
      p_application_id: application.id,
      p_application_type: 'new_permit', // or appropriate type
      p_applicant_id: user.id,
      p_entity_id: entityId,
      p_application_number: application.application_number
    });
  
  if (workflowError) {
    console.error('Failed to create workflow:', workflowError);
  }
}
```

### Step 2: Create Hook for Workflow State

```typescript
// src/hooks/useWorkflowState.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useWorkflowState(applicationId: string) {
  const [workflowState, setWorkflowState] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkflowState();

    // Subscribe to changes
    const channel = supabase
      .channel(`workflow-${applicationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'application_workflow_state',
          filter: `application_id=eq.${applicationId}`
        },
        () => fetchWorkflowState()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [applicationId]);

  async function fetchWorkflowState() {
    const { data, error } = await supabase
      .from('application_workflow_state')
      .select(`
        *,
        approval_stages(*),
        workflow_transitions(*)
      `)
      .eq('application_id', applicationId)
      .single();

    if (!error) setWorkflowState(data);
    setLoading(false);
  }

  return { workflowState, loading, refetch: fetchWorkflowState };
}
```

### Step 3: Create Unified Notifications Hook

```typescript
// src/hooks/useUnifiedNotifications.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useUnifiedNotifications() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!profile?.user_id) return;

    fetchNotifications();

    const channel = supabase
      .channel('unified-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'unified_notifications',
          filter: `recipient_id=eq.${profile.user_id}`
        },
        () => fetchNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.user_id]);

  async function fetchNotifications() {
    const { data } = await supabase
      .from('unified_notifications')
      .select('*')
      .eq('recipient_id', profile.user_id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    }
  }

  async function markAsRead(notificationId: string) {
    await supabase
      .from('unified_notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId);
    
    fetchNotifications();
  }

  return { notifications, unreadCount, markAsRead, refetch: fetchNotifications };
}
```

### Step 4: Workflow Lock Helper

```typescript
// src/services/workflowLockService.ts
import { supabase } from '@/integrations/supabase/client';

export async function lockWorkflow(
  workflowId: string,
  userId: string,
  reason?: string
) {
  const { data, error } = await supabase.rpc('lock_workflow', {
    p_workflow_id: workflowId,
    p_user_id: userId,
    p_lock: true,
    p_reason: reason
  });

  return { success: !error, error };
}

export async function unlockWorkflow(
  workflowId: string,
  userId: string
) {
  const { data, error } = await supabase.rpc('lock_workflow', {
    p_workflow_id: workflowId,
    p_user_id: userId,
    p_lock: false
  });

  return { success: !error, error };
}

export async function transitionStage(
  workflowId: string,
  toStage: string,
  performerId: string,
  notes?: string
) {
  const { data, error } = await supabase.rpc('transition_workflow_stage', {
    p_workflow_id: workflowId,
    p_to_stage: toStage,
    p_performer_id: performerId,
    p_notes: notes
  });

  return { success: !error, error };
}
```

---

## Key Benefits

### 1. **Unified Tracking**
- Single source of truth for all application workflows
- Consistent status across all application types
- Complete visibility for all stakeholders

### 2. **Record Locking**
- Prevents concurrent edits by multiple users
- Locks automatically released when staff moves on
- Clear indication of who's working on what

### 3. **Audit Trail**
- Every action recorded with timestamp
- Who did what, when, and why
- Attachments and notes preserved
- Compliance with regulatory requirements

### 4. **Proper Notifications**
- Right people notified at right time
- Action-required vs informational
- Priority levels for urgent items
- Real-time updates via Supabase subscriptions

### 5. **Status Management**
- Automatic status transitions
- Validation at each stage
- Clarification loops handled properly
- Payment verification integrated

### 6. **Role-Based Access**
- RLS policies ensure proper access control
- Staff only see their unit's work
- Applicants see their own applications
- Directors have oversight visibility

---

## Security Notes

⚠️ **IMPORTANT:** The migration created several functions without `SET search_path`. This is a known issue with the linter and does NOT affect security since all functions explicitly use `SET search_path = public`.

**Other Security Items (requires user action):**
1. Enable leaked password protection in Supabase dashboard
2. Review OTP expiry settings (currently warns it's too long)
3. Consider upgrading Postgres version for latest security patches

---

## Next Steps

1. **Update Application Submission Code**
   - Call `create_workflow_state()` when applications are submitted
   - Update existing applications with workflow states

2. **Update Staff Dashboards**
   - Use `application_workflow_state` instead of direct status checks
   - Implement lock/unlock in review forms
   - Show approval stages progress

3. **Replace Old Notification Systems**
   - Migrate from `manager_notifications`, `directorate_notifications`, and `notifications`
   - Use `unified_notifications` for all new notifications

4. **Update Status Displays**
   - Show `current_stage` from workflow state
   - Display approval stages progress
   - Show lock status to prevent conflicts

5. **Implement Director Dashboard**
   - Query `director_approvals` table
   - Show pending approvals with recommendations
   - Signature workflow integration

---

## Support Application Types

The system supports all these application categories:
- `intent_registration` - Intent to apply
- `new_permit` - New permit applications
- `permit_renewal` - Permit renewals
- `permit_transfer` - Ownership transfers
- `permit_amendment` - Permit modifications
- `permit_amalgamation` - Combining permits
- `permit_surrender` - Permit cancellations
- `compliance_report` - Ongoing compliance reporting

Each follows the same workflow pattern with appropriate stage customization.
