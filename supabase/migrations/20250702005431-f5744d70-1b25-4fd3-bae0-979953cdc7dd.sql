-- Create function to update user profiles after account creation
CREATE OR REPLACE FUNCTION public.setup_test_user_profile(
    user_email TEXT,
    user_full_name TEXT,
    user_user_role public.user_role DEFAULT 'public',
    user_cepa_unit public.cepa_unit DEFAULT NULL,
    user_cepa_position public.cepa_position DEFAULT NULL,
    user_organization TEXT DEFAULT NULL,
    user_phone TEXT DEFAULT NULL,
    user_address TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Get the user ID from auth.users table
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = user_email;
    
    -- Update the profile with the provided information
    UPDATE public.profiles 
    SET 
        full_name = user_full_name,
        user_role = user_user_role,
        cepa_unit = user_cepa_unit,
        cepa_position = user_cepa_position,
        organization = user_organization,
        phone = user_phone,
        address = user_address
    WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;