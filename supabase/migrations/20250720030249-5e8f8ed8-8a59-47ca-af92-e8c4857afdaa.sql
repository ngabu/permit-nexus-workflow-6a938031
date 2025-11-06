-- Add missing profile fields to store additional user information
ALTER TABLE public.profiles 
ADD COLUMN phone TEXT,
ADD COLUMN address TEXT,
ADD COLUMN organization TEXT;