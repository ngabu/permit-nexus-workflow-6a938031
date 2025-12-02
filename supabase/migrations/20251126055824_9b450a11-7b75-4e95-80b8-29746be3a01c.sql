-- Create new Environmental Permit
INSERT INTO permit_types (name, display_name, category, sort_order, is_active, jsonb_column_name)
VALUES ('environmental', 'Environmental Permit', 'environment', 1, true, 'environmental_details');

-- Delete old permit types
DELETE FROM permit_types WHERE name IN ('waste_discharge', 'water_extraction');