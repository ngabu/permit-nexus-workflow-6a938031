-- Update gabunorman@gmail.com to admin role with full privileges
UPDATE public.profiles 
SET 
  role = 'admin',
  operational_unit = 'admin',
  staff_position = 'manager',
  full_name = 'Norman Gabu (Super Admin)',
  updated_at = now()
WHERE email = 'gabunorman@gmail.com';

-- Verify the update
SELECT id, email, full_name, role, operational_unit, staff_position 
FROM public.profiles 
WHERE email = 'gabunorman@gmail.com';