-- EPemit System Phase 1: Foundation Tables

-- Drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.test_sessions CASCADE;
DROP TABLE IF EXISTS public.tests CASCADE;
DROP TABLE IF EXISTS public.interviews CASCADE;
DROP TABLE IF EXISTS public.applications CASCADE;
DROP TABLE IF EXISTS public.job_postings CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create enum types for EPemit system
CREATE TYPE public.user_role AS ENUM ('public', 'cepa_staff', 'admin', 'system_admin');
CREATE TYPE public.cepa_team AS ENUM ('registry', 'assessments_compliance', 'revenue', 'finance', 'directorate');
CREATE TYPE public.permit_status AS ENUM ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'active', 'expired', 'surrendered');
CREATE TYPE public.permit_type AS ENUM ('new', 'amendment', 'renewal', 'transfer', 'amalgamation', 'surrender');
CREATE TYPE public.application_status AS ENUM ('draft', 'submitted', 'under_assessment', 'approved', 'rejected', 'completed');

-- Users/Profiles table
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    organization TEXT,
    user_role public.user_role NOT NULL DEFAULT 'public',
    cepa_team public.cepa_team,
    is_active BOOLEAN NOT NULL DEFAULT true,
    two_fa_enabled BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Permit Applications table
CREATE TABLE public.permit_applications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    application_number TEXT NOT NULL UNIQUE,
    applicant_id UUID NOT NULL,
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
    assigned_assessor_id UUID,
    assessment_notes TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID,
    rejected_at TIMESTAMP WITH TIME ZONE,
    rejected_by UUID,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Permits table (approved applications become permits)
CREATE TABLE public.permits (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    permit_number TEXT NOT NULL UNIQUE,
    application_id UUID NOT NULL,
    holder_id UUID NOT NULL,
    permit_type public.permit_type NOT NULL,
    status public.permit_status NOT NULL DEFAULT 'active',
    title TEXT NOT NULL,
    description TEXT,
    location_coordinates JSONB,
    location_description TEXT,
    conditions TEXT,
    issue_date DATE NOT NULL,
    expiry_date DATE,
    annual_fee DECIMAL(10,2),
    issued_by UUID NOT NULL,
    signed_document_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Financial Transactions table
CREATE TABLE public.financial_transactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_number TEXT NOT NULL UNIQUE,
    application_id UUID,
    permit_id UUID,
    transaction_type TEXT NOT NULL, -- 'application_fee', 'annual_fee', 'penalty', 'refund'
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'PGK',
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'overdue', 'cancelled'
    due_date DATE,
    paid_date DATE,
    payment_method TEXT,
    payment_reference TEXT,
    invoice_url TEXT,
    myob_reference TEXT,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Compliance Assessments table
CREATE TABLE public.compliance_assessments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    assessment_number TEXT NOT NULL UNIQUE,
    permit_id UUID NOT NULL,
    assessment_type TEXT NOT NULL, -- 'scheduled', 'random', 'complaint'
    iso_standard_reference TEXT,
    assessment_date DATE NOT NULL,
    assessor_id UUID NOT NULL,
    compliance_score INTEGER CHECK (compliance_score >= 0 AND compliance_score <= 100),
    findings TEXT,
    recommendations TEXT,
    corrective_actions TEXT,
    followup_date DATE,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'followup_required'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Documents table
CREATE TABLE public.documents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    document_number TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    document_type TEXT NOT NULL, -- 'landowner_agreement', 'ipa_registration', 'eia', 'workplan', 'permit', 'invoice'
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    application_id UUID,
    permit_id UUID,
    uploaded_by UUID NOT NULL,
    is_signed BOOLEAN NOT NULL DEFAULT false,
    signed_by UUID,
    signed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activity Logs table (audit trail)
CREATE TABLE public.activity_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL, -- 'application', 'permit', 'user', 'document', etc.
    entity_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- System Configurations table
CREATE TABLE public.system_configurations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    config_key TEXT NOT NULL UNIQUE,
    config_value JSONB NOT NULL,
    description TEXT,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permit_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_configurations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = user_id OR user_role IN ('admin', 'system_admin'));

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System admins can manage all profiles" ON public.profiles
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.user_id = auth.uid() AND p.user_role = 'system_admin'
    )
);

-- RLS Policies for permit applications
CREATE POLICY "Users can view their own applications" ON public.permit_applications
FOR SELECT USING (
    applicant_id = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.user_id = auth.uid() AND p.user_role IN ('cepa_staff', 'admin', 'system_admin')
    )
);

CREATE POLICY "Users can create applications" ON public.permit_applications
FOR INSERT WITH CHECK (applicant_id = auth.uid());

CREATE POLICY "Users can update their draft applications" ON public.permit_applications
FOR UPDATE USING (
    applicant_id = auth.uid() AND status = 'draft'
);

CREATE POLICY "CEPA staff can manage applications" ON public.permit_applications
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.user_id = auth.uid() AND p.user_role IN ('cepa_staff', 'admin', 'system_admin')
    )
);

-- RLS Policies for permits
CREATE POLICY "Users can view permits" ON public.permits
FOR SELECT USING (
    holder_id = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.user_id = auth.uid() AND p.user_role IN ('cepa_staff', 'admin', 'system_admin')
    )
);

CREATE POLICY "CEPA staff can manage permits" ON public.permits
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.user_id = auth.uid() AND p.user_role IN ('cepa_staff', 'admin', 'system_admin')
    )
);

-- RLS Policies for financial transactions
CREATE POLICY "Users can view their financial transactions" ON public.financial_transactions
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.permit_applications pa 
        WHERE pa.id = application_id AND pa.applicant_id = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM public.permits p 
        WHERE p.id = permit_id AND p.holder_id = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM public.profiles pr 
        WHERE pr.user_id = auth.uid() AND pr.user_role IN ('cepa_staff', 'admin', 'system_admin')
    )
);

CREATE POLICY "CEPA staff can manage financial transactions" ON public.financial_transactions
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.user_id = auth.uid() AND p.user_role IN ('cepa_staff', 'admin', 'system_admin')
    )
);

-- RLS Policies for compliance assessments
CREATE POLICY "Users can view assessments for their permits" ON public.compliance_assessments
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.permits p 
        WHERE p.id = permit_id AND p.holder_id = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM public.profiles pr 
        WHERE pr.user_id = auth.uid() AND pr.user_role IN ('cepa_staff', 'admin', 'system_admin')
    )
);

CREATE POLICY "CEPA staff can manage compliance assessments" ON public.compliance_assessments
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.user_id = auth.uid() AND p.user_role IN ('cepa_staff', 'admin', 'system_admin')
    )
);

-- RLS Policies for documents
CREATE POLICY "Users can view documents for their applications/permits" ON public.documents
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.permit_applications pa 
        WHERE pa.id = application_id AND pa.applicant_id = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM public.permits p 
        WHERE p.id = permit_id AND p.holder_id = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM public.profiles pr 
        WHERE pr.user_id = auth.uid() AND pr.user_role IN ('cepa_staff', 'admin', 'system_admin')
    )
);

CREATE POLICY "Users can upload documents for their applications" ON public.documents
FOR INSERT WITH CHECK (
    uploaded_by = auth.uid() AND (
        EXISTS (
            SELECT 1 FROM public.permit_applications pa 
            WHERE pa.id = application_id AND pa.applicant_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.permits p 
            WHERE p.id = permit_id AND p.holder_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.profiles pr 
            WHERE pr.user_id = auth.uid() AND pr.user_role IN ('cepa_staff', 'admin', 'system_admin')
        )
    )
);

-- RLS Policies for activity logs (read-only for users, full access for admins)
CREATE POLICY "Users can view their own activity logs" ON public.activity_logs
FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.user_id = auth.uid() AND p.user_role IN ('admin', 'system_admin')
    )
);

CREATE POLICY "System can create activity logs" ON public.activity_logs
FOR INSERT WITH CHECK (true);

-- RLS Policies for system configurations (admin only)
CREATE POLICY "Admins can manage system configurations" ON public.system_configurations
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.user_id = auth.uid() AND p.user_role IN ('admin', 'system_admin')
    )
);

-- Create functions for auto-generating numbers
CREATE OR REPLACE FUNCTION generate_application_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    sequence_num INTEGER;
BEGIN
    -- Get next sequence number for today
    SELECT COALESCE(MAX(CAST(SUBSTRING(application_number FROM 'CEPA-APP-[0-9]{8}-([0-9]{4})') AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM public.permit_applications
    WHERE application_number LIKE 'CEPA-APP-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-%';
    
    new_number := 'CEPA-APP-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(sequence_num::TEXT, 4, '0');
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_permit_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    sequence_num INTEGER;
BEGIN
    -- Get next sequence number for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING(permit_number FROM 'CEPA-PER-([0-9]{4})-[0-9]{4}') AS INTEGER)), EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER) AS year_check,
           COALESCE(MAX(CAST(SUBSTRING(permit_number FROM 'CEPA-PER-[0-9]{4}-([0-9]{4})') AS INTEGER)), 0) + 1 AS next_seq
    INTO sequence_num
    FROM public.permits
    WHERE permit_number LIKE 'CEPA-PER-' || EXTRACT(YEAR FROM CURRENT_DATE)::TEXT || '-%';
    
    new_number := 'CEPA-PER-' || EXTRACT(YEAR FROM CURRENT_DATE)::TEXT || '-' || LPAD(sequence_num::TEXT, 4, '0');
    
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

CREATE TRIGGER update_permits_updated_at
    BEFORE UPDATE ON public.permits
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_transactions_updated_at
    BEFORE UPDATE ON public.financial_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compliance_assessments_updated_at
    BEFORE UPDATE ON public.compliance_assessments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON public.documents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_configurations_updated_at
    BEFORE UPDATE ON public.system_configurations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Update the handle_new_user function for EPemit
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

-- Insert initial system configurations
INSERT INTO public.system_configurations (config_key, config_value, description, created_by) VALUES
('application_fees', '{"new": 500, "amendment": 250, "renewal": 300, "transfer": 200, "amalgamation": 400, "surrender": 100}', 'Application fees in PGK for different permit types', '00000000-0000-0000-0000-000000000000'),
('annual_permit_fees', '{"base": 1000, "multipliers": {"small": 1, "medium": 2, "large": 5}}', 'Annual permit fees structure', '00000000-0000-0000-0000-000000000000'),
('assessment_deadlines', '{"new": 30, "amendment": 21, "renewal": 14, "transfer": 14, "amalgamation": 45, "surrender": 7}', 'Assessment deadlines in days for different permit types', '00000000-0000-0000-0000-000000000000'),
('iso_standards', '["ISO 14001:2015", "ISO 14004:2016", "ISO 14006:2020"]', 'Applicable ISO environmental standards', '00000000-0000-0000-0000-000000000000');