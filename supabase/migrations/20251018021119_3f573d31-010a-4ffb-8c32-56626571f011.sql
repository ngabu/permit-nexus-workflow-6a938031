-- Create permit_types table
CREATE TABLE IF NOT EXISTS public.permit_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  category text NOT NULL,
  display_name text NOT NULL,
  description text,
  jsonb_column_name text NOT NULL,
  icon_name text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create permit_type_fields table
CREATE TABLE IF NOT EXISTS public.permit_type_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  permit_type_id uuid NOT NULL REFERENCES public.permit_types(id) ON DELETE CASCADE,
  field_name text NOT NULL,
  field_label text NOT NULL,
  field_type text NOT NULL, -- 'text', 'number', 'select', 'textarea', 'date'
  field_options jsonb, -- For select fields: ["option1", "option2"]
  is_mandatory boolean DEFAULT true,
  placeholder text,
  validation_rules jsonb, -- {"min": 0, "max": 100, "pattern": "regex"}
  help_text text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add new JSONB columns to permit_applications
ALTER TABLE public.permit_applications
ADD COLUMN IF NOT EXISTS effluent_discharge_details jsonb,
ADD COLUMN IF NOT EXISTS solid_waste_details jsonb,
ADD COLUMN IF NOT EXISTS hazardous_waste_details jsonb,
ADD COLUMN IF NOT EXISTS air_emission_details jsonb,
ADD COLUMN IF NOT EXISTS noise_emission_details jsonb,
ADD COLUMN IF NOT EXISTS stormwater_details jsonb,
ADD COLUMN IF NOT EXISTS marine_dumping_details jsonb,
ADD COLUMN IF NOT EXISTS dredging_details jsonb,
ADD COLUMN IF NOT EXISTS mining_permit_details jsonb,
ADD COLUMN IF NOT EXISTS land_clearing_details jsonb,
ADD COLUMN IF NOT EXISTS soil_extraction_details jsonb,
ADD COLUMN IF NOT EXISTS infrastructure_details jsonb,
ADD COLUMN IF NOT EXISTS wildlife_trade_details jsonb,
ADD COLUMN IF NOT EXISTS biodiversity_abs_details jsonb,
ADD COLUMN IF NOT EXISTS aquaculture_details jsonb,
ADD COLUMN IF NOT EXISTS forest_product_details jsonb,
ADD COLUMN IF NOT EXISTS chemical_storage_details jsonb,
ADD COLUMN IF NOT EXISTS pesticide_details jsonb,
ADD COLUMN IF NOT EXISTS mining_chemical_details jsonb,
ADD COLUMN IF NOT EXISTS hazardous_material_details jsonb,
ADD COLUMN IF NOT EXISTS fuel_storage_details jsonb,
ADD COLUMN IF NOT EXISTS renewable_energy_details jsonb,
ADD COLUMN IF NOT EXISTS ghg_emission_details jsonb,
ADD COLUMN IF NOT EXISTS carbon_offset_details jsonb,
ADD COLUMN IF NOT EXISTS research_details jsonb,
ADD COLUMN IF NOT EXISTS monitoring_license_details jsonb,
ADD COLUMN IF NOT EXISTS emergency_discharge_details jsonb,
ADD COLUMN IF NOT EXISTS rehabilitation_details jsonb,
ADD COLUMN IF NOT EXISTS other_permit_details jsonb;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_permit_types_category ON public.permit_types(category);
CREATE INDEX IF NOT EXISTS idx_permit_types_active ON public.permit_types(is_active);
CREATE INDEX IF NOT EXISTS idx_permit_type_fields_permit_type ON public.permit_type_fields(permit_type_id);

-- Enable RLS
ALTER TABLE public.permit_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permit_type_fields ENABLE ROW LEVEL SECURITY;

-- RLS Policies for permit_types
CREATE POLICY "Authenticated users can view permit types"
  ON public.permit_types FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admin can manage permit types"
  ON public.permit_types FOR ALL
  TO authenticated
  USING (is_admin_or_super_admin())
  WITH CHECK (is_admin_or_super_admin());

-- RLS Policies for permit_type_fields
CREATE POLICY "Authenticated users can view permit type fields"
  ON public.permit_type_fields FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage permit type fields"
  ON public.permit_type_fields FOR ALL
  TO authenticated
  USING (is_admin_or_super_admin())
  WITH CHECK (is_admin_or_super_admin());

-- Insert permit types data
INSERT INTO public.permit_types (name, category, display_name, jsonb_column_name, icon_name, sort_order) VALUES
-- POLLUTION & WASTE MANAGEMENT
('waste_discharge', 'Pollution & Waste Management', 'Waste Discharge', 'waste_contaminant_details', 'Droplets', 1),
('effluent_discharge', 'Pollution & Waste Management', 'Effluent Discharge (Inland/Marine)', 'effluent_discharge_details', 'Waves', 2),
('solid_waste_disposal', 'Pollution & Waste Management', 'Solid Waste Disposal', 'solid_waste_details', 'Trash2', 3),
('hazardous_waste', 'Pollution & Waste Management', 'Hazardous Waste Storage/Transport', 'hazardous_waste_details', 'AlertTriangle', 4),
('air_emissions', 'Pollution & Waste Management', 'Air Emissions', 'air_emission_details', 'Wind', 5),
('noise_vibration', 'Pollution & Waste Management', 'Noise/Vibration Emission', 'noise_emission_details', 'Volume2', 6),

-- WATER & MARINE
('water_extraction', 'Water & Marine', 'Water Extraction', 'water_extraction_details', 'Droplets', 10),
('stormwater_management', 'Water & Marine', 'Stormwater Management', 'stormwater_details', 'CloudRain', 11),
('marine_dumping', 'Water & Marine', 'Marine Dumping', 'marine_dumping_details', 'Ship', 12),
('dredging_reclamation', 'Water & Marine', 'Dredging and Reclamation', 'dredging_details', 'Anchor', 13),

-- LAND USE & RESOURCE EXTRACTION
('quarry_mining', 'Land Use & Resource Extraction', 'Quarry/Mining Environmental Permit', 'mining_permit_details', 'Mountain', 20),
('land_clearing', 'Land Use & Resource Extraction', 'Land Clearing/Deforestation', 'land_clearing_details', 'Trees', 21),
('soil_extraction', 'Land Use & Resource Extraction', 'Soil Extraction/Backfilling', 'soil_extraction_details', 'Shovel', 22),
('infrastructure_development', 'Land Use & Resource Extraction', 'Infrastructure Development', 'infrastructure_details', 'Building2', 23),

-- BIODIVERSITY & NATURAL RESOURCE
('wildlife_trade', 'Biodiversity & Natural Resource', 'Wildlife Trade/Transport', 'wildlife_trade_details', 'Bird', 30),
('biodiversity_abs', 'Biodiversity & Natural Resource', 'Biodiversity Access and Benefit Sharing', 'biodiversity_abs_details', 'Leaf', 31),
('aquaculture', 'Biodiversity & Natural Resource', 'Aquaculture/Fish Farm Operation', 'aquaculture_details', 'Fish', 32),
('forest_product', 'Biodiversity & Natural Resource', 'Forest Product Processing/Export', 'forest_product_details', 'TreePine', 33),

-- CHEMICAL & HAZARDOUS SUBSTANCES
('ods_import', 'Chemical & Hazardous Substances', 'ODS Import', 'ods_details', 'FlaskConical', 40),
('chemical_storage', 'Chemical & Hazardous Substances', 'Chemical Storage and Handling', 'chemical_storage_details', 'Beaker', 41),
('pesticide', 'Chemical & Hazardous Substances', 'Pesticide Registration/Use', 'pesticide_details', 'Spray', 42),
('mining_chemical', 'Chemical & Hazardous Substances', 'Mining Chemical Import/Use', 'mining_chemical_details', 'Flask', 43),
('hazardous_material', 'Chemical & Hazardous Substances', 'Hazardous Material Import/Export', 'hazardous_material_details', 'Skull', 44),

-- ENERGY, CLIMATE & GREENHOUSE GAS
('fuel_storage', 'Energy, Climate & Greenhouse Gas', 'Fuel Storage and Distribution', 'fuel_storage_details', 'Fuel', 50),
('renewable_energy', 'Energy, Climate & Greenhouse Gas', 'Renewable Energy Project', 'renewable_energy_details', 'Zap', 51),
('ghg_emissions', 'Energy, Climate & Greenhouse Gas', 'Greenhouse Gas Emissions', 'ghg_emission_details', 'Cloud', 52),
('carbon_offset', 'Energy, Climate & Greenhouse Gas', 'Carbon Offset Project', 'carbon_offset_details', 'TreeDeciduous', 53),

-- SPECIAL & TEMPORARY ACTIVITY
('environmental_research', 'Special & Temporary Activity', 'Environmental Research', 'research_details', 'Microscope', 60),
('monitoring_license', 'Special & Temporary Activity', 'Environmental Monitoring License', 'monitoring_license_details', 'Activity', 61),
('emergency_discharge', 'Special & Temporary Activity', 'Emergency Discharge/Incident', 'emergency_discharge_details', 'AlertOctagon', 62),
('rehabilitation_closure', 'Special & Temporary Activity', 'Rehabilitation/Closure Certificate', 'rehabilitation_details', 'CheckCircle2', 63),

-- GENERAL / OTHER
('operational_general', 'General / Other', 'Operational (General)', 'operational_details', 'Settings', 70),
('other_unclassified', 'General / Other', 'Other Unclassified Activity Permit', 'other_permit_details', 'FileQuestion', 71);

-- Insert permit type fields
-- Waste Discharge
INSERT INTO public.permit_type_fields (permit_type_id, field_name, field_label, field_type, field_options, is_mandatory, placeholder, sort_order)
SELECT id, 'discharge_type', 'Type of Discharge', 'select', 
  '["industrial_wastewater", "domestic_sewage", "stormwater", "cooling_water", "mining_effluent", "agricultural_runoff"]'::jsonb,
  true, 'Select discharge type', 1
FROM public.permit_types WHERE name = 'waste_discharge'
UNION ALL
SELECT id, 'discharge_volume', 'Daily Discharge Volume (L/day)', 'number', null, true, 'Enter daily discharge volume', 2
FROM public.permit_types WHERE name = 'waste_discharge'
UNION ALL
SELECT id, 'contaminant_list', 'Contaminant Types and Concentrations', 'textarea', null, true, 'List all contaminants with expected concentrations', 3
FROM public.permit_types WHERE name = 'waste_discharge'
UNION ALL
SELECT id, 'treatment_method', 'Treatment Method', 'textarea', null, true, 'Describe the treatment method', 4
FROM public.permit_types WHERE name = 'waste_discharge';

-- Water Extraction
INSERT INTO public.permit_type_fields (permit_type_id, field_name, field_label, field_type, field_options, is_mandatory, placeholder, sort_order)
SELECT id, 'source_type', 'Water Source', 'select',
  '["groundwater", "surface_water", "spring", "rainwater"]'::jsonb,
  true, 'Select water source', 1
FROM public.permit_types WHERE name = 'water_extraction'
UNION ALL
SELECT id, 'extraction_rate', 'Extraction Rate (L/day)', 'number', null, true, 'Enter daily extraction rate', 2
FROM public.permit_types WHERE name = 'water_extraction'
UNION ALL
SELECT id, 'purpose', 'Purpose of Water Use', 'textarea', null, true, 'Describe the intended use', 3
FROM public.permit_types WHERE name = 'water_extraction';

-- ODS Import
INSERT INTO public.permit_type_fields (permit_type_id, field_name, field_label, field_type, field_options, is_mandatory, placeholder, sort_order)
SELECT id, 'ods_type', 'ODS Type', 'select',
  '["cfc", "hcfc", "halon", "methyl_bromide"]'::jsonb,
  true, 'Select ODS type', 1
FROM public.permit_types WHERE name = 'ods_import'
UNION ALL
SELECT id, 'import_quantity', 'Import Quantity (MT CO2 eq)', 'number', null, true, 'Enter quantity', 2
FROM public.permit_types WHERE name = 'ods_import'
UNION ALL
SELECT id, 'intended_use', 'Intended Use', 'textarea', null, true, 'Describe the intended use', 3
FROM public.permit_types WHERE name = 'ods_import';

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_permit_types_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER permit_types_updated_at
  BEFORE UPDATE ON public.permit_types
  FOR EACH ROW
  EXECUTE FUNCTION update_permit_types_updated_at();

CREATE TRIGGER permit_type_fields_updated_at
  BEFORE UPDATE ON public.permit_type_fields
  FOR EACH ROW
  EXECUTE FUNCTION update_permit_types_updated_at();