-- Add district and province columns to entities table
ALTER TABLE entities 
ADD COLUMN IF NOT EXISTS district TEXT,
ADD COLUMN IF NOT EXISTS province TEXT;