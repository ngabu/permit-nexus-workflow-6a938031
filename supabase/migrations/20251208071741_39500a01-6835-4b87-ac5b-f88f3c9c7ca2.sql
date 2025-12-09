-- Add source_dashboard column to track where invoices are created
ALTER TABLE public.invoices 
ADD COLUMN source_dashboard text DEFAULT 'revenue';

-- Add comment for clarity
COMMENT ON COLUMN public.invoices.source_dashboard IS 'Tracks which dashboard created the invoice: revenue, registry, compliance, public';