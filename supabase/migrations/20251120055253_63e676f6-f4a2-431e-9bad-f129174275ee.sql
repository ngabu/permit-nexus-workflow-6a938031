-- Create compliance_reports table
CREATE TABLE IF NOT EXISTS public.compliance_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  permit_id UUID NOT NULL REFERENCES public.permit_applications(id) ON DELETE CASCADE,
  report_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending',
  description TEXT,
  file_path TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.compliance_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for compliance_reports
CREATE POLICY "Public users can view their own compliance reports"
  ON public.compliance_reports
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Public users can create their own compliance reports"
  ON public.compliance_reports
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public users can update their own pending reports"
  ON public.compliance_reports
  FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Compliance staff can view all reports"
  ON public.compliance_reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.staff_unit = 'compliance'
      AND profiles.user_type = 'staff'
    )
  );

CREATE POLICY "Compliance staff can update reports"
  ON public.compliance_reports
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.staff_unit = 'compliance'
      AND profiles.user_type = 'staff'
    )
  );

-- Create storage bucket for compliance reports
INSERT INTO storage.buckets (id, name, public)
VALUES ('compliance-reports', 'compliance-reports', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Users can upload their compliance reports"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'compliance-reports' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own compliance reports"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'compliance-reports' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Compliance staff can view all compliance reports"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'compliance-reports'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.staff_unit = 'compliance'
      AND profiles.user_type = 'staff'
    )
  );