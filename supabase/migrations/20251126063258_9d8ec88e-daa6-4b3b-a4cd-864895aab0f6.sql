-- Add entity_id column to invoices table
ALTER TABLE invoices 
ADD COLUMN entity_id uuid REFERENCES entities(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX idx_invoices_entity_id ON invoices(entity_id);