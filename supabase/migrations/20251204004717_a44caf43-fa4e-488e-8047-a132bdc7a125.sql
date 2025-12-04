-- Create document_templates table for templates and guides
CREATE TABLE public.document_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  document_type TEXT NOT NULL CHECK (document_type IN ('template', 'guide')),
  category TEXT NOT NULL,
  file_path TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;

-- Public users can view active templates and guides
CREATE POLICY "Public users can view active document templates"
ON public.document_templates
FOR SELECT
USING (is_active = true);

-- Registry staff can view all templates and guides
CREATE POLICY "Registry staff can view all document templates"
ON public.document_templates
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.staff_unit = 'registry'
    AND profiles.user_type = 'staff'
  )
);

-- Registry staff can create templates and guides
CREATE POLICY "Registry staff can create document templates"
ON public.document_templates
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.staff_unit = 'registry'
    AND profiles.user_type = 'staff'
  )
);

-- Registry staff can update templates and guides
CREATE POLICY "Registry staff can update document templates"
ON public.document_templates
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.staff_unit = 'registry'
    AND profiles.user_type = 'staff'
  )
);

-- Registry staff can delete templates and guides
CREATE POLICY "Registry staff can delete document templates"
ON public.document_templates
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.staff_unit = 'registry'
    AND profiles.user_type = 'staff'
  )
);

-- Admin can manage all templates
CREATE POLICY "Admin can manage document templates"
ON public.document_templates
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.user_type IN ('admin', 'super_admin')
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_document_templates_updated_at
BEFORE UPDATE ON public.document_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default templates and guides
INSERT INTO public.document_templates (name, description, document_type, category) VALUES
('Environmental Permit Application Form', 'Standard form for environmental permit applications', 'template', 'Form template'),
('Intent Registration Form', 'Form for registering intent to conduct prescribed activities', 'template', 'Form template'),
('Compliance Report Template', 'Template for submitting compliance reports', 'template', 'Report template'),
('Environmental Impact Assessment Template', 'Template for EIA submissions', 'template', 'Assessment template'),
('Site Inspection Checklist', 'Checklist for site inspections', 'template', 'Checklist template'),
('Permit Renewal Application Form', 'Form for permit renewal applications', 'template', 'Form template'),
('Environmental Permit Application Guide', 'Step-by-step guide for permit applications', 'guide', 'User guide'),
('Compliance Reporting Guidelines', 'Guidelines for compliance reporting requirements', 'guide', 'Regulatory guideline'),
('Environmental Impact Assessment Process', 'Guide to the EIA process', 'guide', 'Process guide'),
('Monitoring and Reporting Requirements', 'Guidelines for monitoring and reporting', 'guide', 'Regulatory guideline'),
('Fee Schedule and Payment Information', 'Information about fees and payments', 'guide', 'Information'),
('Contact Information and Support', 'Contact details and support information', 'guide', 'Information');