-- Insert test users for different CEPA units and positions
-- Note: These are dummy UUIDs - you'll need to create actual accounts through the auth system

-- Public users (applicants)
INSERT INTO public.profiles (user_id, full_name, email, user_role, organization, phone, address) VALUES
('11111111-1111-1111-1111-111111111111', 'John Smith', 'john.smith@example.com', 'public', 'Smith Mining Company', '+675 123 4567', 'Port Moresby, NCD'),
('22222222-2222-2222-2222-222222222222', 'Mary Johnson', 'mary.johnson@example.com', 'public', 'Pacific Environmental Services', '+675 234 5678', 'Lae, Morobe Province'),
('33333333-3333-3333-3333-333333333333', 'Peter Wilson', 'peter.wilson@example.com', 'public', 'Wilson Agriculture Ltd', '+675 345 6789', 'Mount Hagen, Western Highlands');

-- Registry Unit Staff
INSERT INTO public.profiles (user_id, full_name, email, user_role, cepa_unit, cepa_position, phone) VALUES
('44444444-4444-4444-4444-444444444444', 'Sarah Thompson', 'sarah.thompson@cepa.gov.pg', 'cepa_staff', 'registry', 'officer', '+675 456 7890'),
('55555555-5555-5555-5555-555555555555', 'Michael Brown', 'michael.brown@cepa.gov.pg', 'cepa_staff', 'registry', 'manager', '+675 567 8901');

-- Compliance Unit Staff
INSERT INTO public.profiles (user_id, full_name, email, user_role, cepa_unit, cepa_position, phone) VALUES
('66666666-6666-6666-6666-666666666666', 'Lisa Anderson', 'lisa.anderson@cepa.gov.pg', 'cepa_staff', 'compliance', 'officer', '+675 678 9012'),
('77777777-7777-7777-7777-777777777777', 'David Miller', 'david.miller@cepa.gov.pg', 'cepa_staff', 'compliance', 'manager', '+675 789 0123');

-- Revenue Unit Staff  
INSERT INTO public.profiles (user_id, full_name, email, user_role, cepa_unit, cepa_position, phone) VALUES
('88888888-8888-8888-8888-888888888888', 'Emma Davis', 'emma.davis@cepa.gov.pg', 'cepa_staff', 'revenue', 'officer', '+675 890 1234'),
('99999999-9999-9999-9999-999999999999', 'James Wilson', 'james.wilson@cepa.gov.pg', 'cepa_staff', 'revenue', 'manager', '+675 901 2345');

-- Finance Unit Staff
INSERT INTO public.profiles (user_id, full_name, email, user_role, cepa_unit, cepa_position, phone) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Rachel Green', 'rachel.green@cepa.gov.pg', 'cepa_staff', 'finance', 'officer', '+675 012 3456'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Kevin Lee', 'kevin.lee@cepa.gov.pg', 'cepa_staff', 'finance', 'manager', '+675 123 4567');

-- Directorate Staff
INSERT INTO public.profiles (user_id, full_name, email, user_role, cepa_unit, cepa_position, phone) VALUES
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Jennifer Taylor', 'jennifer.taylor@cepa.gov.pg', 'cepa_staff', 'directorate', 'officer', '+675 234 5678'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Robert Clark', 'robert.clark@cepa.gov.pg', 'cepa_staff', 'directorate', 'manager', '+675 345 6789'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Dr. Patricia Williams', 'patricia.williams@cepa.gov.pg', 'admin', 'directorate', 'managing_director', '+675 456 7890');

-- System Admin
INSERT INTO public.profiles (user_id, full_name, email, user_role, phone) VALUES
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Admin User', 'admin@cepa.gov.pg', 'system_admin', '+675 567 8901');

-- Insert sample permit applications
INSERT INTO public.permit_applications (application_number, applicant_id, permit_type, status, title, description, location_description, estimated_cost, application_fee, current_unit, workflow_stage) VALUES
('CEPA-APP-20250102-0001', '11111111-1111-1111-1111-111111111111', 'new', 'submitted', 'Gold Mining Operation', 'Small scale gold mining operation in the highlands', 'Wabag, Enga Province', 250000.00, 500.00, 'registry', 'registry'),
('CEPA-APP-20250102-0002', '22222222-2222-2222-2222-222222222222', 'new', 'under_assessment', 'Environmental Consulting Services', 'Establishment of environmental consulting business', 'Port Moresby, NCD', 150000.00, 500.00, 'compliance', 'compliance'),
('CEPA-APP-20250102-0003', '33333333-3333-3333-3333-333333333333', 'renewal', 'draft', 'Agricultural Expansion', 'Expansion of existing agricultural operations', 'Mount Hagen, Western Highlands', 100000.00, 300.00, 'registry', 'registry');

-- Insert workflow tracking
INSERT INTO public.application_workflow (application_id, unit, assigned_to, status, notes) VALUES
((SELECT id FROM public.permit_applications WHERE application_number = 'CEPA-APP-20250102-0001'), 'registry', '55555555-5555-5555-5555-555555555555', 'completed', 'Initial review completed, documents verified'),
((SELECT id FROM public.permit_applications WHERE application_number = 'CEPA-APP-20250102-0001'), 'compliance', '77777777-7777-7777-7777-777777777777', 'in_progress', 'Environmental impact assessment in progress'),
((SELECT id FROM public.permit_applications WHERE application_number = 'CEPA-APP-20250102-0002'), 'registry', '44444444-4444-4444-4444-444444444444', 'completed', 'Application registered and forwarded'),
((SELECT id FROM public.permit_applications WHERE application_number = 'CEPA-APP-20250102-0002'), 'compliance', '66666666-6666-6666-6666-666666666666', 'in_progress', 'Compliance review underway');

-- Insert sample financial transactions
INSERT INTO public.financial_transactions (transaction_number, application_id, transaction_type, amount, status, created_by) VALUES
('TXN-20250102-0001', (SELECT id FROM public.permit_applications WHERE application_number = 'CEPA-APP-20250102-0001'), 'application_fee', 500.00, 'paid', '11111111-1111-1111-1111-111111111111'),
('TXN-20250102-0002', (SELECT id FROM public.permit_applications WHERE application_number = 'CEPA-APP-20250102-0002'), 'application_fee', 500.00, 'pending', '22222222-2222-2222-2222-222222222222');

-- Insert sample notifications
INSERT INTO public.notifications (user_id, application_id, type, title, message) VALUES
('11111111-1111-1111-1111-111111111111', (SELECT id FROM public.permit_applications WHERE application_number = 'CEPA-APP-20250102-0001'), 'status_update', 'Application Under Review', 'Your application CEPA-APP-20250102-0001 is now under compliance review.'),
('22222222-2222-2222-2222-222222222222', (SELECT id FROM public.permit_applications WHERE application_number = 'CEPA-APP-20250102-0002'), 'payment_required', 'Payment Pending', 'Please complete payment for application CEPA-APP-20250102-0002.'),
('77777777-7777-7777-7777-777777777777', (SELECT id FROM public.permit_applications WHERE application_number = 'CEPA-APP-20250102-0001'), 'assignment', 'New Application Assigned', 'Application CEPA-APP-20250102-0001 has been assigned to you for compliance review.');