-- Add item_code and item_description columns to invoices table
ALTER TABLE public.invoices 
ADD COLUMN item_code TEXT,
ADD COLUMN item_description TEXT;