-- Create compliance_tasks table for task assignments
CREATE TABLE public.compliance_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_type TEXT NOT NULL CHECK (task_type IN ('inspection', 'intent_assessment', 'permit_assessment')),
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID NOT NULL,
  assigned_by UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  related_intent_id UUID REFERENCES public.intent_registrations(id) ON DELETE SET NULL,
  related_permit_id UUID REFERENCES public.permit_applications(id) ON DELETE SET NULL,
  related_inspection_id UUID REFERENCES public.inspections(id) ON DELETE SET NULL,
  notes TEXT,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.compliance_tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Compliance managers can manage all tasks
CREATE POLICY "Compliance managers can manage tasks"
ON public.compliance_tasks
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.staff_unit = 'compliance'
    AND profiles.staff_position IN ('manager', 'director')
    AND profiles.user_type = 'staff'
  )
);

-- Policy: Compliance officers can view and update their assigned tasks
CREATE POLICY "Officers can view assigned tasks"
ON public.compliance_tasks
FOR SELECT
USING (
  assigned_to = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.staff_unit = 'compliance'
    AND profiles.user_type = 'staff'
  )
);

CREATE POLICY "Officers can update their tasks"
ON public.compliance_tasks
FOR UPDATE
USING (assigned_to = auth.uid())
WITH CHECK (assigned_to = auth.uid());

-- Create trigger for updated_at
CREATE TRIGGER update_compliance_tasks_updated_at
BEFORE UPDATE ON public.compliance_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();