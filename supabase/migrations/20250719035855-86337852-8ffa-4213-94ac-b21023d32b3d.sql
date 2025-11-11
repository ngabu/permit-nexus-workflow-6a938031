-- Complete database reset - Drop all triggers, functions, relations and empty tables

-- Drop all triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_entities_updated_at ON public.entities;
DROP TRIGGER IF EXISTS update_permits_updated_at ON public.permits;
DROP TRIGGER IF EXISTS update_invoices_updated_at ON public.invoices;
DROP TRIGGER IF EXISTS update_permit_activities_updated_at ON public.permit_activities;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_permit_applications_updated_at ON public.permit_applications;
DROP TRIGGER IF EXISTS update_documents_updated_at ON public.documents;
DROP TRIGGER IF EXISTS update_financial_transactions_updated_at ON public.financial_transactions;
DROP TRIGGER IF EXISTS update_prescribed_activities_updated_at ON public.prescribed_activities;

-- Drop all functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.is_cepa_staff() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.setup_test_user_profile(text, text, user_role, cepa_unit, cepa_position, text, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.permit_applications_staff_access(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.generate_application_number() CASCADE;
DROP FUNCTION IF EXISTS public.create_notification(uuid, text, text, text, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_with_profile(uuid) CASCADE;

-- Drop all foreign key constraints
ALTER TABLE IF EXISTS public.permit_application_details DROP CONSTRAINT IF EXISTS permit_application_details_permit_id_fkey;
ALTER TABLE IF EXISTS public.documents DROP CONSTRAINT IF EXISTS documents_permit_id_fkey;
ALTER TABLE IF EXISTS public.invoices DROP CONSTRAINT IF EXISTS invoices_permit_id_fkey;
ALTER TABLE IF EXISTS public.permits DROP CONSTRAINT IF EXISTS permits_entity_id_fkey;
ALTER TABLE IF EXISTS public.permits DROP CONSTRAINT IF EXISTS permits_assigned_officer_id_fkey;
ALTER TABLE IF EXISTS public.permit_activities DROP CONSTRAINT IF EXISTS permit_activities_permit_id_fkey;
ALTER TABLE IF EXISTS public.financial_transactions DROP CONSTRAINT IF EXISTS financial_transactions_application_id_fkey;
ALTER TABLE IF EXISTS public.financial_transactions DROP CONSTRAINT IF EXISTS financial_transactions_permit_id_fkey;
ALTER TABLE IF EXISTS public.permit_applications DROP CONSTRAINT IF EXISTS permit_applications_applicant_id_fkey;
ALTER TABLE IF EXISTS public.permit_applications DROP CONSTRAINT IF EXISTS permit_applications_assigned_assessor_id_fkey;
ALTER TABLE IF EXISTS public.permit_applications DROP CONSTRAINT IF EXISTS permit_applications_approved_by_fkey;
ALTER TABLE IF EXISTS public.permit_applications DROP CONSTRAINT IF EXISTS permit_applications_rejected_by_fkey;
ALTER TABLE IF EXISTS public.application_workflow DROP CONSTRAINT IF EXISTS application_workflow_application_id_fkey;
ALTER TABLE IF EXISTS public.application_workflow DROP CONSTRAINT IF EXISTS application_workflow_assigned_to_fkey;
ALTER TABLE IF EXISTS public.notifications DROP CONSTRAINT IF EXISTS notifications_application_id_fkey;

-- Truncate all tables (empty them but keep structure)
TRUNCATE TABLE public.activity_logs CASCADE;
TRUNCATE TABLE public.application_workflow CASCADE;
TRUNCATE TABLE public.documents CASCADE;
TRUNCATE TABLE public.entities CASCADE;
TRUNCATE TABLE public.fee_structures CASCADE;
TRUNCATE TABLE public.financial_transactions CASCADE;
TRUNCATE TABLE public.invoices CASCADE;
TRUNCATE TABLE public.notifications CASCADE;
TRUNCATE TABLE public.permit_activities CASCADE;
TRUNCATE TABLE public.permit_application CASCADE;
TRUNCATE TABLE public.permit_application_details CASCADE;
TRUNCATE TABLE public.permit_applications CASCADE;
TRUNCATE TABLE public.permits CASCADE;
TRUNCATE TABLE public.prescribed_activities CASCADE;
TRUNCATE TABLE public.profiles CASCADE;

-- Drop all RLS policies
DROP POLICY IF EXISTS "Users can view their own applications" ON public.permit_application;
DROP POLICY IF EXISTS "Users can insert their own applications" ON public.permit_application;
DROP POLICY IF EXISTS "Users can update their own applications" ON public.permit_application;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile only" ON public.profiles;
DROP POLICY IF EXISTS "CEPA staff can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "CEPA staff can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Everyone can view prescribed activities" ON public.prescribed_activities;
DROP POLICY IF EXISTS "CEPA staff can manage prescribed activities" ON public.prescribed_activities;
DROP POLICY IF EXISTS "Users can view their permits" ON public.permits;
DROP POLICY IF EXISTS "CEPA staff can manage permits" ON public.permits;
DROP POLICY IF EXISTS "Users can view entities" ON public.entities;
DROP POLICY IF EXISTS "CEPA staff can manage entities" ON public.entities;
DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "CEPA staff can manage all invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can view permit activities for their permits" ON public.permit_activities;
DROP POLICY IF EXISTS "CEPA staff can manage permit activities" ON public.permit_activities;
DROP POLICY IF EXISTS "Users can manage activities for their permits" ON public.permit_activities;
DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.documents;
DROP POLICY IF EXISTS "CEPA staff can view all documents" ON public.documents;
DROP POLICY IF EXISTS "Users can view their permit details" ON public.permit_application_details;
DROP POLICY IF EXISTS "Users can manage their permit details" ON public.permit_application_details;
DROP POLICY IF EXISTS "CEPA staff can view all permit details" ON public.permit_application_details;
DROP POLICY IF EXISTS "Everyone can view fee structures" ON public.fee_structures;
DROP POLICY IF EXISTS "CEPA staff can manage fee structures" ON public.fee_structures;
DROP POLICY IF EXISTS "Users can view their own applications" ON public.permit_applications;
DROP POLICY IF EXISTS "Users can create applications" ON public.permit_applications;
DROP POLICY IF EXISTS "Users can create their own applications" ON public.permit_applications;
DROP POLICY IF EXISTS "Users can update their own applications" ON public.permit_applications;
DROP POLICY IF EXISTS "Users can delete their own applications" ON public.permit_applications;
DROP POLICY IF EXISTS "Staff can view applications for assessment" ON public.permit_applications;
DROP POLICY IF EXISTS "Staff can update applications for processing" ON public.permit_applications;
DROP POLICY IF EXISTS "CEPA staff can manage applications" ON public.permit_applications;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "CEPA staff can create notifications" ON public.notifications;

-- Disable RLS on all tables
ALTER TABLE public.activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_workflow DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.entities DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_structures DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.permit_activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.permit_application DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.permit_application_details DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.permit_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.permits DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescribed_activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;