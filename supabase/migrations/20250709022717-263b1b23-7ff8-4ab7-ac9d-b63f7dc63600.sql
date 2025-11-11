
-- Fix the profiles table to include user_id column that maps to auth.users
-- This will resolve the "column profiles.user_id does not exist" error
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Update existing profiles to set user_id equal to id (since id is already the auth user id)
UPDATE public.profiles SET user_id = id WHERE user_id IS NULL;

-- Make user_id not null after updating existing records
ALTER TABLE public.profiles ALTER COLUMN user_id SET NOT NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON public.profiles(user_id);
