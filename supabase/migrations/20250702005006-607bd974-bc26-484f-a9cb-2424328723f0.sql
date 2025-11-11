-- Drop existing tables
DROP TABLE IF EXISTS public.payment_reconciliations CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;

-- Create enum types for EPemit system
CREATE TYPE public.user_role AS ENUM ('public', 'cepa_staff', 'admin', 'system_admin');
CREATE TYPE public.cepa_unit AS ENUM ('registry', 'compliance', 'revenue', 'finance', 'directorate');
CREATE TYPE public.cepa_position AS ENUM ('officer', 'manager', 'managing_director');
CREATE TYPE public.permit_status AS ENUM ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'active', 'expired', 'surrendered');
CREATE TYPE public.permit_type AS ENUM ('new', 'amendment', 'renewal', 'transfer', 'amalgamation', 'surrender');
CREATE TYPE public.application_status AS ENUM ('draft', 'submitted', 'under_assessment', 'approved', 'rejected', 'completed');

-- Users/Profiles table with CEPA staff details
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    organization TEXT,
    user_role public.user_role NOT NULL DEFAULT 'public',
    cepa_unit public.cepa_unit,
    cepa_position public.cepa_position,
    is_active BOOLEAN NOT NULL DEFAULT true,
    two_fa_enabled BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Permit Applications table
CREATE TABLE public.permit_applications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    application_number TEXT NOT NULL UNIQUE,
    applicant_id UUID NOT NULL REFERENCES auth.users(id),
    permit_type public.permit_type NOT NULL DEFAULT 'new',
    status public.application_status NOT NULL DEFAULT 'draft',
    title TEXT NOT NULL,
    description TEXT,
    location_coordinates JSONB,
    location_description TEXT,
    environmental_impact_assessment TEXT,
    work_plan TEXT,
    estimated_cost DECIMAL(15,2),
    application_fee DECIMAL(10,2),
    submitted_at TIMESTAMP WITH TIME ZONE,
    assessment_deadline TIMESTAMP WITH TIME ZONE,
    assigned_assessor_id UUID REFERENCES auth.users(id),
    assessment_notes TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES auth.users(id),
    rejected_at TIMESTAMP WITH TIME ZONE,
    rejected_by UUID REFERENCES auth.users(id),
    rejection_reason TEXT,
    current_unit public.cepa_unit,
    workflow_stage TEXT DEFAULT 'registry',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Application Workflow table to track application through units
CREATE TABLE public.application_workflow (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id UUID NOT NULL REFERENCES public.permit_applications(id) ON DELETE CASCADE,
    unit public.cepa_unit NOT NULL,
    assigned_to UUID REFERENCES auth.users(id),
    status TEXT NOT NULL DEFAULT 'pending',
    notes TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Financial Transactions table
CREATE TABLE public.financial_transactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_number TEXT NOT NULL UNIQUE,
    application_id UUID REFERENCES public.permit_applications(id),
    transaction_type TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'PGK',
    status TEXT NOT NULL DEFAULT 'pending',
    due_date DATE,
    paid_date DATE,
    payment_method TEXT,
    payment_reference TEXT,
    invoice_url TEXT,
    myob_reference TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Notifications table
CREATE TABLE public.notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    application_id UUID REFERENCES public.permit_applications(id),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activity Logs table (audit trail)
CREATE TABLE public.activity_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permit_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_workflow ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "CEPA staff can view other profiles" ON public.profiles
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.user_id = auth.uid() AND p.user_role IN ('cepa_staff', 'admin', 'system_admin')
    )
);

-- RLS Policies for permit applications
CREATE POLICY "Users can view their own applications" ON public.permit_applications
FOR SELECT USING (
    applicant_id = auth.uid() OR 
    assigned_assessor_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.user_id = auth.uid() AND p.user_role IN ('cepa_staff', 'admin', 'system_admin')
    )
);

CREATE POLICY "Users can create applications" ON public.permit_applications
FOR INSERT WITH CHECK (applicant_id = auth.uid());

CREATE POLICY "CEPA staff can manage applications" ON public.permit_applications
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.user_id = auth.uid() AND p.user_role IN ('cepa_staff', 'admin', 'system_admin')
    )
);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "CEPA staff can create notifications" ON public.notifications
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.user_id = auth.uid() AND p.user_role IN ('cepa_staff', 'admin', 'system_admin')
    )
);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, user_role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'New User'),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data ->> 'user_role')::public.user_role, 'public')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function for auto-generating application numbers
CREATE OR REPLACE FUNCTION generate_application_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    sequence_num INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(application_number FROM 'CEPA-APP-[0-9]{8}-([0-9]{4})') AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM public.permit_applications
    WHERE application_number LIKE 'CEPA-APP-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-%';
    
    new_number := 'CEPA-APP-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(sequence_num::TEXT, 4, '0');
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_permit_applications_updated_at
    BEFORE UPDATE ON public.permit_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_transactions_updated_at
    BEFORE UPDATE ON public.financial_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();