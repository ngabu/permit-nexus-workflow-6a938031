-- Add columns for payment receipt, accounts verification, and transaction number
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS payment_receipt text,
ADD COLUMN IF NOT EXISTS accounts_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS transaction_number text;

-- Add index for payment verification queries
CREATE INDEX IF NOT EXISTS idx_invoices_accounts_verified ON public.invoices(accounts_verified);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_status_verified ON public.invoices(payment_status, accounts_verified);