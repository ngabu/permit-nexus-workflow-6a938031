-- Create GIS Data table for storing boundary overlays
CREATE TABLE IF NOT EXISTS public.gis_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.gis_data ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read GIS data
CREATE POLICY "Authenticated users can view GIS data"
  ON public.gis_data
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow admins to manage GIS data
CREATE POLICY "Admins can manage GIS data"
  ON public.gis_data
  FOR ALL
  TO authenticated
  USING (is_admin_or_super_admin())
  WITH CHECK (is_admin_or_super_admin());

-- Create index on name for faster lookups
CREATE INDEX idx_gis_data_name ON public.gis_data(name);

-- Add trigger for updated_at
CREATE TRIGGER update_gis_data_updated_at
  BEFORE UPDATE ON public.gis_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();