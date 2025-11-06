-- Configure Public Users (Applicants)
SELECT setup_test_user_profile(
    'john.smith@example.com',
    'John Smith',
    'public'::user_role,
    NULL::cepa_unit,
    NULL::cepa_position,
    'Smith Construction Ltd',
    '+675 123 4567',
    '123 Main Street, Port Moresby'
);

SELECT setup_test_user_profile(
    'mary.johnson@example.com',
    'Mary Johnson',
    'public'::user_role,
    NULL::cepa_unit,
    NULL::cepa_position,
    'Johnson Mining Corp',
    '+675 234 5678',
    '456 Industrial Ave, Lae'
);

SELECT setup_test_user_profile(
    'peter.wilson@example.com',
    'Peter Wilson',
    'public'::user_role,
    NULL::cepa_unit,
    NULL::cepa_position,
    'Wilson Environmental Services',
    '+675 345 6789',
    '789 Business District, Mt Hagen'
);

-- Configure CEPA Staff - Registry Unit
SELECT setup_test_user_profile(
    'sarah.thompson@cepa.gov.pg',
    'Sarah Thompson',
    'cepa_staff'::user_role,
    'registry'::cepa_unit,
    'officer'::cepa_position,
    'CEPA - Conservation & Environment Protection Authority',
    '+675 321 1001',
    'CEPA House, Waigani Drive, Port Moresby'
);

SELECT setup_test_user_profile(
    'michael.brown@cepa.gov.pg',
    'Michael Brown',
    'cepa_staff'::user_role,
    'registry'::cepa_unit,
    'manager'::cepa_position,
    'CEPA - Conservation & Environment Protection Authority',
    '+675 321 1002',
    'CEPA House, Waigani Drive, Port Moresby'
);

-- Configure CEPA Staff - Compliance Unit
SELECT setup_test_user_profile(
    'lisa.anderson@cepa.gov.pg',
    'Lisa Anderson',
    'cepa_staff'::user_role,
    'compliance'::cepa_unit,
    'officer'::cepa_position,
    'CEPA - Conservation & Environment Protection Authority',
    '+675 321 1003',
    'CEPA House, Waigani Drive, Port Moresby'
);

SELECT setup_test_user_profile(
    'david.miller@cepa.gov.pg',
    'David Miller',
    'cepa_staff'::user_role,
    'compliance'::cepa_unit,
    'manager'::cepa_position,
    'CEPA - Conservation & Environment Protection Authority',
    '+675 321 1004',
    'CEPA House, Waigani Drive, Port Moresby'
);

-- Configure CEPA Staff - Revenue Unit
SELECT setup_test_user_profile(
    'emma.davis@cepa.gov.pg',
    'Emma Davis',
    'cepa_staff'::user_role,
    'revenue'::cepa_unit,
    'officer'::cepa_position,
    'CEPA - Conservation & Environment Protection Authority',
    '+675 321 1005',
    'CEPA House, Waigani Drive, Port Moresby'
);

SELECT setup_test_user_profile(
    'james.wilson@cepa.gov.pg',
    'James Wilson',
    'cepa_staff'::user_role,
    'revenue'::cepa_unit,
    'manager'::cepa_position,
    'CEPA - Conservation & Environment Protection Authority',
    '+675 321 1006',
    'CEPA House, Waigani Drive, Port Moresby'
);

-- Configure CEPA Staff - Finance Unit
SELECT setup_test_user_profile(
    'rachel.green@cepa.gov.pg',
    'Rachel Green',
    'cepa_staff'::user_role,
    'finance'::cepa_unit,
    'officer'::cepa_position,
    'CEPA - Conservation & Environment Protection Authority',
    '+675 321 1007',
    'CEPA House, Waigani Drive, Port Moresby'
);

SELECT setup_test_user_profile(
    'kevin.lee@cepa.gov.pg',
    'Kevin Lee',
    'cepa_staff'::user_role,
    'finance'::cepa_unit,
    'manager'::cepa_position,
    'CEPA - Conservation & Environment Protection Authority',
    '+675 321 1008',
    'CEPA House, Waigani Drive, Port Moresby'
);

-- Configure CEPA Staff - Directorate
SELECT setup_test_user_profile(
    'jennifer.taylor@cepa.gov.pg',
    'Jennifer Taylor',
    'cepa_staff'::user_role,
    'directorate'::cepa_unit,
    'officer'::cepa_position,
    'CEPA - Conservation & Environment Protection Authority',
    '+675 321 1009',
    'CEPA House, Waigani Drive, Port Moresby'
);

SELECT setup_test_user_profile(
    'robert.clark@cepa.gov.pg',
    'Robert Clark',
    'cepa_staff'::user_role,
    'directorate'::cepa_unit,
    'manager'::cepa_position,
    'CEPA - Conservation & Environment Protection Authority',
    '+675 321 1010',
    'CEPA House, Waigani Drive, Port Moresby'
);

SELECT setup_test_user_profile(
    'patricia.williams@cepa.gov.pg',
    'Dr. Patricia Williams',
    'cepa_staff'::user_role,
    'directorate'::cepa_unit,
    'managing_director'::cepa_position,
    'CEPA - Conservation & Environment Protection Authority',
    '+675 321 1000',
    'CEPA House, Waigani Drive, Port Moresby'
);

-- Configure System Admin
SELECT setup_test_user_profile(
    'admin@cepa.gov.pg',
    'Admin User',
    'system_admin'::user_role,
    NULL::cepa_unit,
    NULL::cepa_position,
    'CEPA - Conservation & Environment Protection Authority',
    '+675 321 9999',
    'CEPA House, Waigani Drive, Port Moresby'
);