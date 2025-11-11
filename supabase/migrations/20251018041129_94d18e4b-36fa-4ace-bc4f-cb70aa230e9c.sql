-- Add permit type fields for Water & Marine permit types

-- Dredging and Reclamation fields
INSERT INTO permit_type_fields (permit_type_id, field_name, field_label, field_type, is_mandatory, help_text, sort_order)
VALUES 
  ((SELECT id FROM permit_types WHERE name = 'dredging_reclamation'), 'dredging_area', 'Dredging Area (ha)', 'number', true, 'Total area to be dredged in hectares', 1),
  ((SELECT id FROM permit_types WHERE name = 'dredging_reclamation'), 'dredging_depth', 'Dredging Depth (m)', 'number', true, 'Maximum dredging depth in meters', 2),
  ((SELECT id FROM permit_types WHERE name = 'dredging_reclamation'), 'sediment_type', 'Sediment Type', 'text', true, 'Type of sediment to be dredged', 3),
  ((SELECT id FROM permit_types WHERE name = 'dredging_reclamation'), 'disposal_method', 'Disposal Method', 'select', true, 'Method for disposing dredged material', 4),
  ((SELECT id FROM permit_types WHERE name = 'dredging_reclamation'), 'disposal_location', 'Disposal Location', 'text', true, 'Location where dredged material will be disposed', 5),
  ((SELECT id FROM permit_types WHERE name = 'dredging_reclamation'), 'environmental_controls', 'Environmental Controls', 'textarea', true, 'Environmental protection and mitigation measures', 6);

-- Update disposal_method field to have options
UPDATE permit_type_fields 
SET field_options = '["Land Disposal", "Marine Disposal", "Reclamation", "Beneficial Reuse"]'::jsonb
WHERE field_name = 'disposal_method' 
  AND permit_type_id = (SELECT id FROM permit_types WHERE name = 'dredging_reclamation');

-- Stormwater Management fields
INSERT INTO permit_type_fields (permit_type_id, field_name, field_label, field_type, is_mandatory, help_text, sort_order)
VALUES 
  ((SELECT id FROM permit_types WHERE name = 'stormwater_management'), 'catchment_area', 'Catchment Area (ha)', 'number', true, 'Total catchment area in hectares', 1),
  ((SELECT id FROM permit_types WHERE name = 'stormwater_management'), 'discharge_point', 'Discharge Point', 'text', true, 'Location of stormwater discharge', 2),
  ((SELECT id FROM permit_types WHERE name = 'stormwater_management'), 'treatment_system', 'Treatment System', 'select', true, 'Type of stormwater treatment system', 3),
  ((SELECT id FROM permit_types WHERE name = 'stormwater_management'), 'flow_rate', 'Peak Flow Rate (L/s)', 'number', true, 'Peak stormwater flow rate in liters per second', 4),
  ((SELECT id FROM permit_types WHERE name = 'stormwater_management'), 'detention_capacity', 'Detention Basin Capacity (m³)', 'number', false, 'Capacity of detention/retention basin', 5),
  ((SELECT id FROM permit_types WHERE name = 'stormwater_management'), 'pollutant_removal', 'Pollutant Removal Measures', 'textarea', true, 'Measures to remove pollutants from stormwater', 6);

-- Update treatment_system field to have options
UPDATE permit_type_fields 
SET field_options = '["Detention Basin", "Retention Pond", "Wetland", "Bioswale", "Oil-Water Separator", "Other"]'::jsonb
WHERE field_name = 'treatment_system' 
  AND permit_type_id = (SELECT id FROM permit_types WHERE name = 'stormwater_management');