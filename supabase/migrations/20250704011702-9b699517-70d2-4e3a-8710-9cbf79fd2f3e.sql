
-- Create entities table for individuals and companies
CREATE TABLE public.entities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('individual', 'company')),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  registration_number TEXT, -- for companies
  tax_number TEXT,
  contact_person TEXT, -- for companies
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create permits table
CREATE TABLE public.permits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  entity_id UUID REFERENCES public.entities NOT NULL,
  permit_number TEXT UNIQUE,
  permit_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'expired')),
  application_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approval_date TIMESTAMP WITH TIME ZONE,
  expiry_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create permit activities table
CREATE TABLE public.permit_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  permit_id UUID REFERENCES public.permits NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('transfer', 'amalgamation', 'surrender', 'renew', 'compliance_report')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  permit_id UUID REFERENCES public.permits,
  activity_id UUID REFERENCES public.permit_activities,
  invoice_number TEXT UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'PGK',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  paid_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  related_permit_id UUID REFERENCES public.permits,
  related_activity_id UUID REFERENCES public.permit_activities,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create documents table
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  permit_id UUID REFERENCES public.permits,
  activity_id UUID REFERENCES public.permit_activities,
  entity_id UUID REFERENCES public.entities,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  document_type TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permit_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for entities
CREATE POLICY "Users can view their own entities" 
  ON public.entities FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own entities" 
  ON public.entities FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entities" 
  ON public.entities FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entities" 
  ON public.entities FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for permits
CREATE POLICY "Users can view their own permits" 
  ON public.permits FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own permits" 
  ON public.permits FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own permits" 
  ON public.permits FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create RLS policies for permit activities
CREATE POLICY "Users can view their permit activities" 
  ON public.permit_activities FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.permits WHERE permits.id = permit_activities.permit_id AND permits.user_id = auth.uid()));

CREATE POLICY "Users can create permit activities" 
  ON public.permit_activities FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.permits WHERE permits.id = permit_activities.permit_id AND permits.user_id = auth.uid()));

-- Create RLS policies for invoices
CREATE POLICY "Users can view their own invoices" 
  ON public.invoices FOR SELECT 
  USING (auth.uid() = user_id);

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create RLS policies for documents
CREATE POLICY "Users can view their own documents" 
  ON public.documents FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own documents" 
  ON public.documents FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" 
  ON public.documents FOR DELETE 
  USING (auth.uid() = user_id);

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false);

-- Create storage policies
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
