-- Drop existing tables
DROP TABLE IF EXISTS permit_type_fields CASCADE;
DROP TABLE IF EXISTS permit_types CASCADE;

-- Recreate permit_types table
CREATE TABLE permit_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'environment',
  icon_name TEXT,
  jsonb_column_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Recreate permit_type_fields table
CREATE TABLE permit_type_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  permit_type_id UUID NOT NULL REFERENCES permit_types(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_label TEXT NOT NULL,
  field_type TEXT NOT NULL, -- text, number, textarea, select, checkbox, file, date
  field_options JSONB, -- for select/radio options
  is_mandatory BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  placeholder TEXT,
  help_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  validation_rules JSONB, -- min, max, pattern, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add trigger for updated_at
CREATE TRIGGER update_permit_types_updated_at
  BEFORE UPDATE ON permit_types
  FOR EACH ROW
  EXECUTE FUNCTION update_permit_types_updated_at();

CREATE TRIGGER update_permit_type_fields_updated_at
  BEFORE UPDATE ON permit_type_fields
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert the 5 base environment permit types
INSERT INTO permit_types (name, display_name, category, jsonb_column_name, sort_order) VALUES
  ('waste_discharge', 'Waste Discharge Permit', 'environment', 'waste_discharge_details', 1),
  ('water_extraction', 'Water Extraction Permit', 'environment', 'water_extraction_details', 2),
  ('water_investigation', 'Water Investigation Permit', 'environment', 'water_investigation_details', 3),
  ('ods_import', 'ODS Import Permit', 'environment', 'ods_import_details', 4),
  ('pesticide', 'Pesticide Permit', 'environment', 'pesticide_details', 5);

-- Insert fields for Waste Discharge Permit
INSERT INTO permit_type_fields (permit_type_id, field_name, field_label, field_type, is_mandatory, sort_order, help_text) VALUES
  ((SELECT id FROM permit_types WHERE name = 'waste_discharge'), 'adjacent_land_owner_name', 'Adjacent Land - Owner Name', 'text', true, 1, NULL),
  ((SELECT id FROM permit_types WHERE name = 'waste_discharge'), 'adjacent_land_address', 'Adjacent Land - Address', 'textarea', true, 2, NULL),
  ((SELECT id FROM permit_types WHERE name = 'waste_discharge'), 'segment_air', 'Segments Affected - Air', 'checkbox', false, 3, NULL),
  ((SELECT id FROM permit_types WHERE name = 'waste_discharge'), 'segment_land', 'Segments Affected - Land', 'checkbox', false, 4, NULL),
  ((SELECT id FROM permit_types WHERE name = 'waste_discharge'), 'segment_water', 'Segments Affected - Water', 'checkbox', false, 5, NULL),
  ((SELECT id FROM permit_types WHERE name = 'waste_discharge'), 'segment_noise', 'Segments Affected - Noise Emission', 'checkbox', false, 6, NULL),
  ((SELECT id FROM permit_types WHERE name = 'waste_discharge'), 'segment_no_discharge', 'Segments Affected - No Discharge', 'checkbox', false, 7, NULL),
  ((SELECT id FROM permit_types WHERE name = 'waste_discharge'), 'segment_waste_facility', 'Segments Affected - Waste Treatment/Storage Facility', 'checkbox', false, 8, NULL),
  ((SELECT id FROM permit_types WHERE name = 'waste_discharge'), 'period_of_permit', 'Period of Permit', 'text', true, 9, 'Attach additional details to the application form');

-- Insert fields for Water Extraction Permit
INSERT INTO permit_type_fields (permit_type_id, field_name, field_label, field_type, field_options, is_mandatory, sort_order, help_text) VALUES
  ((SELECT id FROM permit_types WHERE name = 'water_extraction'), 'water_source_coordinates_easting', 'Water Source - Coordinates (Easting)', 'text', NULL, true, 1, NULL),
  ((SELECT id FROM permit_types WHERE name = 'water_extraction'), 'water_source_coordinates_northing', 'Water Source - Coordinates (Northing)', 'text', NULL, true, 2, NULL),
  ((SELECT id FROM permit_types WHERE name = 'water_extraction'), 'water_source_diagram', 'Water Source - Diagram', 'file', NULL, true, 3, 'Attach diagram'),
  ((SELECT id FROM permit_types WHERE name = 'water_extraction'), 'water_source_legal_description', 'Water Source - Legal Description', 'select', '{"options": ["customary", "alienated"]}'::jsonb, true, 4, NULL),
  ((SELECT id FROM permit_types WHERE name = 'water_extraction'), 'water_source_owner_name', 'Water Source - Owner Name', 'text', NULL, true, 5, NULL),
  ((SELECT id FROM permit_types WHERE name = 'water_extraction'), 'water_source_tenure', 'Water Source - Tenure', 'text', NULL, true, 6, NULL),
  ((SELECT id FROM permit_types WHERE name = 'water_extraction'), 'adjacent_land_owner_name', 'Adjacent Land - Owner Name', 'text', NULL, true, 7, NULL),
  ((SELECT id FROM permit_types WHERE name = 'water_extraction'), 'adjacent_land_address', 'Adjacent Land - Address', 'textarea', NULL, true, 8, NULL),
  ((SELECT id FROM permit_types WHERE name = 'water_extraction'), 'structures_for_water_use', 'Structures for Water Use', 'select', '{"options": ["taking", "damming", "diverting"], "multiple": true}'::jsonb, true, 9, NULL),
  ((SELECT id FROM permit_types WHERE name = 'water_extraction'), 'hydro_annual_flow_min', 'Hydrological Data - Annual Flow (Min)', 'number', NULL, true, 10, NULL),
  ((SELECT id FROM permit_types WHERE name = 'water_extraction'), 'hydro_annual_flow_max', 'Hydrological Data - Annual Flow (Max)', 'number', NULL, true, 11, NULL),
  ((SELECT id FROM permit_types WHERE name = 'water_extraction'), 'hydro_annual_flow_mean', 'Hydrological Data - Annual Flow (Mean)', 'number', NULL, true, 12, NULL),
  ((SELECT id FROM permit_types WHERE name = 'water_extraction'), 'hydro_dry_flow_min', 'Hydrological Data - Dry Weather Flow (Min)', 'number', NULL, true, 13, NULL),
  ((SELECT id FROM permit_types WHERE name = 'water_extraction'), 'hydro_dry_flow_max', 'Hydrological Data - Dry Weather Flow (Max)', 'number', NULL, true, 14, NULL),
  ((SELECT id FROM permit_types WHERE name = 'water_extraction'), 'hydro_dry_flow_mean', 'Hydrological Data - Dry Weather Flow (Mean)', 'number', NULL, true, 15, NULL),
  ((SELECT id FROM permit_types WHERE name = 'water_extraction'), 'hydro_wet_flow_min', 'Hydrological Data - Wet Weather Flow (Min)', 'number', NULL, true, 16, NULL),
  ((SELECT id FROM permit_types WHERE name = 'water_extraction'), 'hydro_wet_flow_max', 'Hydrological Data - Wet Weather Flow (Max)', 'number', NULL, true, 17, NULL),
  ((SELECT id FROM permit_types WHERE name = 'water_extraction'), 'hydro_wet_flow_mean', 'Hydrological Data - Wet Weather Flow (Mean)', 'number', NULL, true, 18, NULL),
  ((SELECT id FROM permit_types WHERE name = 'water_extraction'), 'env_value_aquatic', 'Environmental Values (1km downstream) - Aquatic Ecosystem', 'checkbox', NULL, false, 19, NULL),
  ((SELECT id FROM permit_types WHERE name = 'water_extraction'), 'env_value_drinking_water', 'Environmental Values - Drinking Water', 'checkbox', NULL, false, 20, NULL),
  ((SELECT id FROM permit_types WHERE name = 'water_extraction'), 'env_value_recreation', 'Environmental Values - Recreation', 'checkbox', NULL, false, 21, NULL),
  ((SELECT id FROM permit_types WHERE name = 'water_extraction'), 'env_value_aesthetics', 'Environmental Values - Aesthetics', 'checkbox', NULL, false, 22, NULL),
  ((SELECT id FROM permit_types WHERE name = 'water_extraction'), 'env_value_transport', 'Environmental Values - Transport', 'checkbox', NULL, false, 23, NULL),
  ((SELECT id FROM permit_types WHERE name = 'water_extraction'), 'env_value_cultural', 'Environmental Values - Cultural', 'checkbox', NULL, false, 24, NULL),
  ((SELECT id FROM permit_types WHERE name = 'water_extraction'), 'env_value_others', 'Environmental Values - Others', 'text', NULL, false, 25, NULL),
  ((SELECT id FROM permit_types WHERE name = 'water_extraction'), 'proposed_use_quantity_lhr', 'Proposed Water Use - Quantity (L/hr)', 'number', NULL, true, 26, NULL),
  ((SELECT id FROM permit_types WHERE name = 'water_extraction'), 'proposed_use_hours_day', 'Proposed Water Use - Hours/Day', 'number', NULL, true, 27, NULL),
  ((SELECT id FROM permit_types WHERE name = 'water_extraction'), 'proposed_use_days_month', 'Proposed Water Use - Days/Month', 'number', NULL, true, 28, NULL),
  ((SELECT id FROM permit_types WHERE name = 'water_extraction'), 'proposed_use_months_year', 'Proposed Water Use - Months/Year', 'number', NULL, true, 29, NULL),
  ((SELECT id FROM permit_types WHERE name = 'water_extraction'), 'proposed_use_return_flow', 'Proposed Water Use - Return Flow Estimates', 'textarea', NULL, true, 30, 'Attach additional details to the application form');

-- Insert fields for Water Investigation Permit
INSERT INTO permit_type_fields (permit_type_id, field_name, field_label, field_type, field_options, is_mandatory, sort_order, help_text) VALUES
  ((SELECT id FROM permit_types WHERE name = 'water_investigation'), 'water_source_coordinates_easting', 'Water Source - Coordinates (Easting)', 'text', NULL, true, 1, NULL),
  ((SELECT id FROM permit_types WHERE name = 'water_investigation'), 'water_source_coordinates_northing', 'Water Source - Coordinates (Northing)', 'text', NULL, true, 2, NULL),
  ((SELECT id FROM permit_types WHERE name = 'water_investigation'), 'water_source_diagram', 'Water Source - Diagram', 'file', NULL, true, 3, 'Attach diagram'),
  ((SELECT id FROM permit_types WHERE name = 'water_investigation'), 'water_source_legal_description', 'Water Source - Legal Description', 'select', '{"options": ["customary", "alienated"]}'::jsonb, true, 4, NULL),
  ((SELECT id FROM permit_types WHERE name = 'water_investigation'), 'water_source_owner_name', 'Water Source - Owner Name', 'text', NULL, true, 5, NULL),
  ((SELECT id FROM permit_types WHERE name = 'water_investigation'), 'water_source_tenure', 'Water Source - Tenure', 'text', NULL, true, 6, NULL),
  ((SELECT id FROM permit_types WHERE name = 'water_investigation'), 'structures_investigation', 'Structures for Hydrological Investigation', 'textarea', NULL, true, 7, NULL),
  ((SELECT id FROM permit_types WHERE name = 'water_investigation'), 'drilling_materials', 'Drilling Activity - Drill Materials', 'textarea', NULL, true, 8, NULL),
  ((SELECT id FROM permit_types WHERE name = 'water_investigation'), 'drilling_mud_fluids_composition', 'Drilling Activity - Mud, Fluids, Chemical Composition', 'textarea', NULL, true, 9, NULL),
  ((SELECT id FROM permit_types WHERE name = 'water_investigation'), 'drilling_environmental_impacts', 'Drilling Activity - Potential Environmental Impacts', 'textarea', NULL, true, 10, NULL),
  ((SELECT id FROM permit_types WHERE name = 'water_investigation'), 'period_of_permit', 'Period of Permit', 'text', NULL, true, 11, 'Attach additional details to the application form');

-- Insert fields for ODS Import Permit
INSERT INTO permit_type_fields (permit_type_id, field_name, field_label, field_type, is_mandatory, sort_order, help_text) VALUES
  ((SELECT id FROM permit_types WHERE name = 'ods_import'), 'ods_type_cfc', 'Name of ODS - CFC', 'text', false, 1, NULL),
  ((SELECT id FROM permit_types WHERE name = 'ods_import'), 'ods_type_hcfc', 'Name of ODS - HCFC', 'text', false, 2, NULL),
  ((SELECT id FROM permit_types WHERE name = 'ods_import'), 'ods_type_methyl_bromide', 'Name of ODS - Methyl Bromide', 'text', false, 3, NULL),
  ((SELECT id FROM permit_types WHERE name = 'ods_import'), 'ods_type_others', 'Name of ODS - Others', 'text', false, 4, NULL),
  ((SELECT id FROM permit_types WHERE name = 'ods_import'), 'summary_intended_use', 'Summary of Intended Use / Need in PNG', 'textarea', true, 5, NULL),
  ((SELECT id FROM permit_types WHERE name = 'ods_import'), 'product_label_copies', 'Product Label (2 Original Copies)', 'file', true, 6, 'Attach 2 original copies of product label'),
  ((SELECT id FROM permit_types WHERE name = 'ods_import'), 'current_msds', 'Current MSDS (Material Safety Data Sheet)', 'file', true, 7, NULL),
  ((SELECT id FROM permit_types WHERE name = 'ods_import'), 'period_of_permit', 'Period of Permit', 'text', true, 8, 'Attach additional details to the application form');

-- Insert fields for Pesticide Permit
INSERT INTO permit_type_fields (permit_type_id, field_name, field_label, field_type, field_options, is_mandatory, sort_order, help_text) VALUES
  ((SELECT id FROM permit_types WHERE name = 'pesticide'), 'permit_type', 'Type of Permit', 'select', '{"options": ["Import", "Manufacture", "Distribute", "Sell"]}'::jsonb, true, 1, NULL),
  ((SELECT id FROM permit_types WHERE name = 'pesticide'), 'product_name', 'Product Name', 'text', NULL, true, 2, NULL),
  ((SELECT id FROM permit_types WHERE name = 'pesticide'), 'active_ingredient_iso', 'Active Ingredient(s) - ISO Nomenclature', 'text', NULL, true, 3, NULL),
  ((SELECT id FROM permit_types WHERE name = 'pesticide'), 'concentration_solids', 'Active Ingredient - Concentration (g/kg solids)', 'number', NULL, false, 4, NULL),
  ((SELECT id FROM permit_types WHERE name = 'pesticide'), 'concentration_liquids', 'Active Ingredient - Concentration (g/L liquids)', 'number', NULL, false, 5, NULL),
  ((SELECT id FROM permit_types WHERE name = 'pesticide'), 'formulation_use_type', 'Formulation & Use Type', 'text', NULL, true, 6, NULL),
  ((SELECT id FROM permit_types WHERE name = 'pesticide'), 'overseas_reg_country', 'Overseas Registration - Country', 'text', NULL, true, 7, NULL),
  ((SELECT id FROM permit_types WHERE name = 'pesticide'), 'overseas_reg_number', 'Overseas Registration - Registration Number', 'text', NULL, true, 8, NULL),
  ((SELECT id FROM permit_types WHERE name = 'pesticide'), 'manufacturer_details', 'Manufacturer/Formulator Details', 'textarea', NULL, true, 9, NULL),
  ((SELECT id FROM permit_types WHERE name = 'pesticide'), 'country_of_origin', 'Country of Origin of Active Ingredient', 'text', NULL, true, 10, NULL),
  ((SELECT id FROM permit_types WHERE name = 'pesticide'), 'summary_intended_use', 'Summary of Intended Use / Need in PNG', 'textarea', NULL, true, 11, NULL),
  ((SELECT id FROM permit_types WHERE name = 'pesticide'), 'overseas_reg_evidence', 'Overseas Registration Evidence', 'file', NULL, true, 12, 'Attach certificates, affidavits, labels'),
  ((SELECT id FROM permit_types WHERE name = 'pesticide'), 'product_label_copies', 'Product Label (2 Original Copies)', 'file', NULL, true, 13, 'Attach 2 original copies of product label'),
  ((SELECT id FROM permit_types WHERE name = 'pesticide'), 'current_msds', 'Current MSDS (Material Safety Data Sheet)', 'file', NULL, true, 14, NULL),
  ((SELECT id FROM permit_types WHERE name = 'pesticide'), 'period_of_permit', 'Period of Permit', 'text', NULL, true, 15, 'Attach additional details to the application form');

-- Enable RLS
ALTER TABLE permit_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE permit_type_fields ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view permit types"
  ON permit_types FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can view permit type fields"
  ON permit_type_fields FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage permit types"
  ON permit_types FOR ALL
  TO authenticated
  USING (is_admin_or_super_admin())
  WITH CHECK (is_admin_or_super_admin());

CREATE POLICY "Only admins can manage permit type fields"
  ON permit_type_fields FOR ALL
  TO authenticated
  USING (is_admin_or_super_admin())
  WITH CHECK (is_admin_or_super_admin());