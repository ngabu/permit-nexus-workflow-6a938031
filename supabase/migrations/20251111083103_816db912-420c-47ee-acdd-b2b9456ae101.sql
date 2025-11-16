-- Add travel cost fields and other necessary fields to inspections table
ALTER TABLE public.inspections
ADD COLUMN IF NOT EXISTS accommodation_cost numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS transportation_cost numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS daily_allowance numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS number_of_days integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS province text,
ADD COLUMN IF NOT EXISTS permit_category text,
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- Drop the generated column if it exists and recreate
ALTER TABLE public.inspections DROP COLUMN IF EXISTS total_travel_cost;
ALTER TABLE public.inspections ADD COLUMN total_travel_cost numeric GENERATED ALWAYS AS (accommodation_cost + transportation_cost + daily_allowance) STORED;

-- Create indexes only if they don't exist
CREATE INDEX IF NOT EXISTS idx_inspections_permit_application ON public.inspections(permit_application_id);
CREATE INDEX IF NOT EXISTS idx_inspections_status ON public.inspections(status);
CREATE INDEX IF NOT EXISTS idx_inspections_scheduled_date ON public.inspections(scheduled_date);

-- Update RLS policies for inspections
DROP POLICY IF EXISTS "Staff can create inspections" ON public.inspections;
DROP POLICY IF EXISTS "Staff can update inspections" ON public.inspections;
DROP POLICY IF EXISTS "Staff can view all inspections" ON public.inspections;
DROP POLICY IF EXISTS "Users can view inspections for their permits" ON public.inspections;
DROP POLICY IF EXISTS "Public users can view their permit inspections" ON public.inspections;
DROP POLICY IF EXISTS "Compliance staff can create inspections" ON public.inspections;
DROP POLICY IF EXISTS "Compliance staff can update inspections" ON public.inspections;
DROP POLICY IF EXISTS "Compliance staff can view all inspections" ON public.inspections;

-- Compliance staff can create inspections
CREATE POLICY "Compliance staff can create inspections"
ON public.inspections
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND staff_unit = 'compliance'
    AND user_type = 'staff'
  )
);

-- Compliance staff can update inspections
CREATE POLICY "Compliance staff can update inspections"
ON public.inspections
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND staff_unit = 'compliance'
    AND user_type = 'staff'
  )
);

-- Compliance staff can view all inspections
CREATE POLICY "Compliance staff can view all inspections"
ON public.inspections
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND staff_unit = 'compliance'
    AND user_type = 'staff'
  )
);

-- Public users can view inspections for their permits
CREATE POLICY "Public users can view their permit inspections"
ON public.inspections
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.permit_applications pa
    WHERE pa.id = inspections.permit_application_id
    AND pa.user_id = auth.uid()
  )
);

-- Create function to notify permit holder when inspection is scheduled
CREATE OR REPLACE FUNCTION public.notify_inspection_scheduled()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_permit RECORD;
BEGIN
  -- Get permit application details
  SELECT 
    pa.user_id,
    pa.permit_number,
    pa.title,
    e.name as entity_name
  INTO v_permit
  FROM public.permit_applications pa
  LEFT JOIN public.entities e ON pa.entity_id = e.id
  WHERE pa.id = NEW.permit_application_id;

  -- Create notification for permit holder
  IF v_permit.user_id IS NOT NULL THEN
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      type,
      related_permit_id
    ) VALUES (
      v_permit.user_id,
      'Inspection Scheduled',
      'An inspection has been scheduled for your permit ' || COALESCE(v_permit.permit_number, v_permit.title) || 
      ' on ' || TO_CHAR(NEW.scheduled_date, 'DD Mon YYYY') || '. ' ||
      'Travel costs (Accommodation: K' || NEW.accommodation_cost || 
      ', Transportation: K' || NEW.transportation_cost || 
      ', Daily Allowance: K' || NEW.daily_allowance || 
      ') will be charged to your entity.',
      'inspection_scheduled',
      NEW.permit_application_id
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for inspection notifications
DROP TRIGGER IF EXISTS trigger_inspection_scheduled ON public.inspections;
CREATE TRIGGER trigger_inspection_scheduled
AFTER INSERT ON public.inspections
FOR EACH ROW
EXECUTE FUNCTION public.notify_inspection_scheduled();