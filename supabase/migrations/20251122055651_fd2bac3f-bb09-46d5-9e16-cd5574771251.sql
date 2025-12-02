-- Create industrial_sectors table
CREATE TABLE IF NOT EXISTS public.industrial_sectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Add RLS policies for industrial_sectors
ALTER TABLE public.industrial_sectors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view industrial sectors"
  ON public.industrial_sectors
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage industrial sectors"
  ON public.industrial_sectors
  FOR ALL
  TO authenticated
  USING (is_admin_or_super_admin())
  WITH CHECK (is_admin_or_super_admin());

-- Insert industrial sectors
INSERT INTO public.industrial_sectors (name) VALUES
  ('Agriculture-Livestock'),
  ('Agriculture-Oil Palm'),
  ('Agriculture-SABL'),
  ('Agro-forestry'),
  ('Energy'),
  ('Fisheries'),
  ('Food Processing'),
  ('Forestry'),
  ('Gravel Extraction'),
  ('Industrial and Manufacturing'),
  ('Infrastructure'),
  ('Infrastructure and Utilities'),
  ('Logging'),
  ('Manufacturing'),
  ('Manufacturing - Fisheries'),
  ('Manufacturing and Processing'),
  ('Mining'),
  ('Oil and Gas'),
  ('Waste Treatment');

-- Add industrial_sector column to permit_types table
ALTER TABLE public.permit_types
ADD COLUMN IF NOT EXISTS industrial_sector uuid REFERENCES public.industrial_sectors(id);

-- Add trigger for updated_at on industrial_sectors
CREATE TRIGGER update_industrial_sectors_updated_at
  BEFORE UPDATE ON public.industrial_sectors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();