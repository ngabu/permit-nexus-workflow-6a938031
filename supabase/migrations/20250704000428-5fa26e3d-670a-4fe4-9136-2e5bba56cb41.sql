-- Create test users and populate profiles
-- Note: In a real environment, you'd create these through the auth system
-- This is for development/testing purposes only

-- Insert auth users directly (for testing only)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES 
-- Public Users (Applicants)
('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'john.smith@example.com', crypt('test123', gen_salt('bf')), now(), now(), now(), '', '', '', ''),
('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'mary.johnson@example.com', crypt('test123', gen_salt('bf')), now(), now(), now(), '', '', '', ''),
('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'peter.wilson@example.com', crypt('test123', gen_salt('bf')), now(), now(), now(), '', '', '', ''),

-- CEPA Staff - Registry Unit
('00000000-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', 'authenticated', 'authenticated', 'sarah.thompson@cepa.gov.pg', crypt('test123', gen_salt('bf')), now(), now(), now(), '', '', '', ''),
('00000000-0000-0000-0000-000000000000', '55555555-5555-5555-5555-555555555555', 'authenticated', 'authenticated', 'michael.brown@cepa.gov.pg', crypt('test123', gen_salt('bf')), now(), now(), now(), '', '', '', ''),

-- CEPA Staff - Compliance Unit
('00000000-0000-0000-0000-000000000000', '66666666-6666-6666-6666-666666666666', 'authenticated', 'authenticated', 'lisa.anderson@cepa.gov.pg', crypt('test123', gen_salt('bf')), now(), now(), now(), '', '', '', ''),
('00000000-0000-0000-0000-000000000000', '77777777-7777-7777-7777-777777777777', 'authenticated', 'authenticated', 'david.miller@cepa.gov.pg', crypt('test123', gen_salt('bf')), now(), now(), now(), '', '', '', ''),

-- CEPA Staff - Revenue Unit  
('00000000-0000-0000-0000-000000000000', '88888888-8888-8888-8888-888888888888', 'authenticated', 'authenticated', 'emma.davis@cepa.gov.pg', crypt('test123', gen_salt('bf')), now(), now(), now(), '', '', '', ''),
('00000000-0000-0000-0000-000000000000', '99999999-9999-9999-9999-999999999999', 'authenticated', 'authenticated', 'james.wilson@cepa.gov.pg', crypt('test123', gen_salt('bf')), now(), now(), now(), '', '', '', ''),

-- CEPA Staff - Finance Unit
('00000000-0000-0000-0000-000000000000', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'authenticated', 'authenticated', 'rachel.green@cepa.gov.pg', crypt('test123', gen_salt('bf')), now(), now(), now(), '', '', '', ''),
('00000000-0000-0000-0000-000000000000', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'authenticated', 'authenticated', 'kevin.lee@cepa.gov.pg', crypt('test123', gen_salt('bf')), now(), now(), now(), '', '', '', ''),

-- CEPA Staff - Directorate
('00000000-0000-0000-0000-000000000000', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'authenticated', 'authenticated', 'jennifer.taylor@cepa.gov.pg', crypt('test123', gen_salt('bf')), now(), now(), now(), '', '', '', ''),
('00000000-0000-0000-0000-000000000000', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'authenticated', 'authenticated', 'robert.clark@cepa.gov.pg', crypt('test123', gen_salt('bf')), now(), now(), now(), '', '', '', ''),
('00000000-0000-0000-0000-000000000000', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'authenticated', 'authenticated', 'patricia.williams@cepa.gov.pg', crypt('test123', gen_salt('bf')), now(), now(), now(), '', '', '', ''),

-- Admin User
('00000000-0000-0000-0000-000000000000', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'authenticated', 'authenticated', 'admin@cepa.gov.pg', crypt('test123', gen_salt('bf')), now(), now(), now(), '', '', '', '');

-- Create profiles for each user using the existing setup function
SELECT public.setup_test_user_profile('john.smith@example.com', 'John Smith', 'public', null, null, 'Smith Mining Company', '+675 123 4567', 'Port Moresby, NCD');
SELECT public.setup_test_user_profile('mary.johnson@example.com', 'Mary Johnson', 'public', null, null, 'Pacific Environmental Services', '+675 234 5678', 'Lae, Morobe Province');
SELECT public.setup_test_user_profile('peter.wilson@example.com', 'Peter Wilson', 'public', null, null, 'Wilson Agriculture Ltd', '+675 345 6789', 'Mount Hagen, Western Highlands');

-- Registry Unit Staff
SELECT public.setup_test_user_profile('sarah.thompson@cepa.gov.pg', 'Sarah Thompson', 'cepa_staff', 'registry', 'officer', null, '+675 456 7890', null);
SELECT public.setup_test_user_profile('michael.brown@cepa.gov.pg', 'Michael Brown', 'cepa_staff', 'registry', 'manager', null, '+675 567 8901', null);

-- Compliance Unit Staff
SELECT public.setup_test_user_profile('lisa.anderson@cepa.gov.pg', 'Lisa Anderson', 'cepa_staff', 'compliance', 'officer', null, '+675 678 9012', null);
SELECT public.setup_test_user_profile('david.miller@cepa.gov.pg', 'David Miller', 'cepa_staff', 'compliance', 'manager', null, '+675 789 0123', null);

-- Revenue Unit Staff  
SELECT public.setup_test_user_profile('emma.davis@cepa.gov.pg', 'Emma Davis', 'cepa_staff', 'revenue', 'officer', null, '+675 890 1234', null);
SELECT public.setup_test_user_profile('james.wilson@cepa.gov.pg', 'James Wilson', 'cepa_staff', 'revenue', 'manager', null, '+675 901 2345', null);

-- Finance Unit Staff
SELECT public.setup_test_user_profile('rachel.green@cepa.gov.pg', 'Rachel Green', 'cepa_staff', 'finance', 'officer', null, '+675 012 3456', null);
SELECT public.setup_test_user_profile('kevin.lee@cepa.gov.pg', 'Kevin Lee', 'cepa_staff', 'finance', 'manager', null, '+675 123 4567', null);

-- Directorate Staff
SELECT public.setup_test_user_profile('jennifer.taylor@cepa.gov.pg', 'Jennifer Taylor', 'cepa_staff', 'directorate', 'officer', null, '+675 234 5678', null);
SELECT public.setup_test_user_profile('robert.clark@cepa.gov.pg', 'Robert Clark', 'cepa_staff', 'directorate', 'manager', null, '+675 345 6789', null);
SELECT public.setup_test_user_profile('patricia.williams@cepa.gov.pg', 'Dr. Patricia Williams', 'admin', 'directorate', 'managing_director', null, '+675 456 7890', null);

-- System Admin
SELECT public.setup_test_user_profile('admin@cepa.gov.pg', 'Admin User', 'system_admin', null, null, null, '+675 567 8901', null);