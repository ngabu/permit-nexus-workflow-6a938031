-- Add industrial_sector_id column to permit_applications table
ALTER TABLE public.permit_applications
ADD COLUMN IF NOT EXISTS industrial_sector_id uuid REFERENCES public.industrial_sectors(id);