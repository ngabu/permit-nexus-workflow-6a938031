-- Add verification fields to invoices table
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS verified_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS verification_notes text,
ADD COLUMN IF NOT EXISTS cepa_receipt_path text,
ADD COLUMN IF NOT EXISTS stripe_receipt_url text;

-- Add comments for documentation
COMMENT ON COLUMN public.invoices.verification_status IS 'Status of payment verification by revenue team: pending, verified, rejected';
COMMENT ON COLUMN public.invoices.verified_by IS 'User ID of the revenue officer who verified the payment';
COMMENT ON COLUMN public.invoices.verified_at IS 'Timestamp when payment was verified';
COMMENT ON COLUMN public.invoices.verification_notes IS 'Notes from the revenue team verification process';
COMMENT ON COLUMN public.invoices.cepa_receipt_path IS 'Path to CEPA accounts confirmation receipt attachment';
COMMENT ON COLUMN public.invoices.stripe_receipt_url IS 'URL to Stripe payment receipt';