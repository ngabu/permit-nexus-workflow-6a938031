-- Add total_area column to intent_registration_drafts
ALTER TABLE intent_registration_drafts
ADD COLUMN IF NOT EXISTS total_area_sqkm numeric;

-- Add total_area column to intent_registrations
ALTER TABLE intent_registrations
ADD COLUMN IF NOT EXISTS total_area_sqkm numeric;

-- Add comment to explain the column
COMMENT ON COLUMN intent_registration_drafts.total_area_sqkm IS 'Calculated total area in square kilometers from the project boundary GeoJSON';
COMMENT ON COLUMN intent_registrations.total_area_sqkm IS 'Calculated total area in square kilometers from the project boundary GeoJSON';