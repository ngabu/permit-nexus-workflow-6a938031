-- Create table for Area of Interest (AOI) drawings
CREATE TABLE IF NOT EXISTS public.project_aois (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  geometry JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.project_aois ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own AOIs
CREATE POLICY "Users can view their own AOIs"
ON public.project_aois
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can create their own AOIs
CREATE POLICY "Users can create their own AOIs"
ON public.project_aois
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own AOIs
CREATE POLICY "Users can update their own AOIs"
ON public.project_aois
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can delete their own AOIs
CREATE POLICY "Users can delete their own AOIs"
ON public.project_aois
FOR DELETE
USING (auth.uid() = user_id);

-- Policy: Staff can view all AOIs
CREATE POLICY "Staff can view all AOIs"
ON public.project_aois
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND user_type = 'staff'
  )
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_project_aois_user_id ON public.project_aois(user_id);
CREATE INDEX IF NOT EXISTS idx_project_aois_created_at ON public.project_aois(created_at DESC);