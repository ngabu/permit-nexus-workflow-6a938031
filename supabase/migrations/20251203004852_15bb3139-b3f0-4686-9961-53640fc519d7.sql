-- Add document_path column to invoices table for storing attached invoice documents
ALTER TABLE invoices ADD COLUMN document_path text;

-- Add a comment for documentation
COMMENT ON COLUMN invoices.document_path IS 'Path to the invoice document stored in Supabase Storage';