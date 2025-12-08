-- Add inspection_id column to invoices table to link inspection invoices
ALTER TABLE public.invoices
ADD COLUMN inspection_id uuid REFERENCES public.inspections(id);

-- Create index for better query performance
CREATE INDEX idx_invoices_inspection_id ON public.invoices(inspection_id);

-- Add invoice_type column to distinguish between different invoice types
ALTER TABLE public.invoices
ADD COLUMN invoice_type text DEFAULT 'permit_fee';

-- Add comment for clarity
COMMENT ON COLUMN public.invoices.inspection_id IS 'Links to inspections table for inspection-related invoices';
COMMENT ON COLUMN public.invoices.invoice_type IS 'Type of invoice: permit_fee, inspection_fee, etc.';