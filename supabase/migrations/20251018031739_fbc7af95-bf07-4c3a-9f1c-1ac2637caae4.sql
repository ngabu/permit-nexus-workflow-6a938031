-- Populate permit_type_fields for all permit types (fixed syntax)

-- POLLUTION & WASTE MANAGEMENT PERMITS

-- Waste Discharge
INSERT INTO permit_type_fields (permit_type_id, field_name, field_label, field_type, is_mandatory, sort_order, help_text)
SELECT id, 'discharge_type', 'Discharge Type', 'select', true, 1, 'Type of waste being discharged'
FROM permit_types WHERE name = 'waste_discharge'
UNION ALL
SELECT id, 'discharge_volume', 'Discharge Volume (L/day)', 'number', true, 2, 'Daily volume of discharge in liters'
FROM permit_types WHERE name = 'waste_discharge'
UNION ALL
SELECT id, 'contaminant_list', 'Contaminant List', 'textarea', true, 3, 'List all contaminants present in the discharge'
FROM permit_types WHERE name = 'waste_discharge'
UNION ALL
SELECT id, 'treatment_method', 'Treatment Method', 'text', true, 4, 'Describe the treatment method used'
FROM permit_types WHERE name = 'waste_discharge';

-- Effluent Discharge
INSERT INTO permit_type_fields (permit_type_id, field_name, field_label, field_type, is_mandatory, sort_order, help_text)
SELECT id, 'effluent_type', 'Effluent Type', 'select', true, 1, 'Type of effluent being discharged'
FROM permit_types WHERE name = 'effluent_discharge'
UNION ALL
SELECT id, 'monitoring_frequency', 'Monitoring Frequency', 'select', true, 2, 'How often monitoring will be conducted'
FROM permit_types WHERE name = 'effluent_discharge'
UNION ALL
SELECT id, 'receiving_body', 'Receiving Water Body', 'text', true, 3, 'Name of the receiving water body'
FROM permit_types WHERE name = 'effluent_discharge'
UNION ALL
SELECT id, 'standards_applied', 'Standards Applied', 'text', true, 4, 'Environmental standards being followed'
FROM permit_types WHERE name = 'effluent_discharge';

-- Solid Waste Disposal
INSERT INTO permit_type_fields (permit_type_id, field_name, field_label, field_type, is_mandatory, sort_order, help_text)
SELECT id, 'waste_type', 'Waste Type', 'select', true, 1, 'Type of solid waste'
FROM permit_types WHERE name = 'solid_waste'
UNION ALL
SELECT id, 'disposal_method', 'Disposal Method', 'select', true, 2, 'Method of waste disposal'
FROM permit_types WHERE name = 'solid_waste'
UNION ALL
SELECT id, 'disposal_site_location', 'Disposal Site Location', 'text', true, 3, 'Location of disposal site'
FROM permit_types WHERE name = 'solid_waste'
UNION ALL
SELECT id, 'volume_capacity', 'Volume Capacity (m³)', 'number', true, 4, 'Total volume capacity in cubic meters'
FROM permit_types WHERE name = 'solid_waste';

-- Hazardous Waste Storage/Transport
INSERT INTO permit_type_fields (permit_type_id, field_name, field_label, field_type, is_mandatory, sort_order, help_text)
SELECT id, 'waste_category', 'Waste Category', 'select', true, 1, 'Category of hazardous waste'
FROM permit_types WHERE name = 'hazardous_waste'
UNION ALL
SELECT id, 'transport_mode', 'Transport Mode', 'select', true, 2, 'Mode of transportation'
FROM permit_types WHERE name = 'hazardous_waste'
UNION ALL
SELECT id, 'origin', 'Origin', 'text', true, 3, 'Origin location of waste'
FROM permit_types WHERE name = 'hazardous_waste'
UNION ALL
SELECT id, 'destination', 'Destination', 'text', true, 4, 'Destination location'
FROM permit_types WHERE name = 'hazardous_waste'
UNION ALL
SELECT id, 'handling_protocol', 'Handling Protocol', 'textarea', true, 5, 'Safety handling protocols'
FROM permit_types WHERE name = 'hazardous_waste';

-- Air Emissions
INSERT INTO permit_type_fields (permit_type_id, field_name, field_label, field_type, is_mandatory, sort_order, help_text)
SELECT id, 'emission_source', 'Emission Source', 'text', true, 1, 'Source of air emissions'
FROM permit_types WHERE name = 'air_emissions'
UNION ALL
SELECT id, 'pollutants_list', 'Pollutants List', 'textarea', true, 2, 'List of pollutants emitted'
FROM permit_types WHERE name = 'air_emissions'
UNION ALL
SELECT id, 'control_technology', 'Control Technology', 'text', true, 3, 'Emission control technology used'
FROM permit_types WHERE name = 'air_emissions'
UNION ALL
SELECT id, 'stack_height', 'Stack Height (m)', 'number', true, 4, 'Height of emission stack in meters'
FROM permit_types WHERE name = 'air_emissions';

-- Noise/Vibration Emission
INSERT INTO permit_type_fields (permit_type_id, field_name, field_label, field_type, is_mandatory, sort_order, help_text)
SELECT id, 'source_type', 'Source Type', 'text', true, 1, 'Type of noise/vibration source'
FROM permit_types WHERE name = 'noise_emission'
UNION ALL
SELECT id, 'decibel_level', 'Decibel Level (dB)', 'number', true, 2, 'Expected decibel level'
FROM permit_types WHERE name = 'noise_emission'
UNION ALL
SELECT id, 'mitigation_measures', 'Mitigation Measures', 'textarea', true, 3, 'Measures to reduce noise/vibration'
FROM permit_types WHERE name = 'noise_emission'
UNION ALL
SELECT id, 'operation_hours', 'Operation Hours', 'text', true, 4, 'Hours of operation'
FROM permit_types WHERE name = 'noise_emission';

-- WATER & MARINE PERMITS

-- Water Extraction
INSERT INTO permit_type_fields (permit_type_id, field_name, field_label, field_type, is_mandatory, sort_order, help_text)
SELECT id, 'source_type', 'Source Type', 'select', true, 1, 'Type of water source'
FROM permit_types WHERE name = 'water_extraction'
UNION ALL
SELECT id, 'extraction_rate', 'Extraction Rate (L/min)', 'number', true, 2, 'Rate of water extraction in liters per minute'
FROM permit_types WHERE name = 'water_extraction'
UNION ALL
SELECT id, 'purpose', 'Purpose', 'text', true, 3, 'Purpose of water extraction'
FROM permit_types WHERE name = 'water_extraction';

-- Stormwater Management
INSERT INTO permit_type_fields (permit_type_id, field_name, field_label, field_type, is_mandatory, sort_order, help_text)
SELECT id, 'collection_system', 'Collection System', 'text', true, 1, 'Type of stormwater collection system'
FROM permit_types WHERE name = 'stormwater'
UNION ALL
SELECT id, 'discharge_point', 'Discharge Point', 'text', true, 2, 'Location of discharge point'
FROM permit_types WHERE name = 'stormwater'
UNION ALL
SELECT id, 'sediment_controls', 'Sediment Controls', 'textarea', true, 3, 'Sediment control measures'
FROM permit_types WHERE name = 'stormwater'
UNION ALL
SELECT id, 'catchment_area', 'Catchment Area (ha)', 'number', true, 4, 'Catchment area in hectares'
FROM permit_types WHERE name = 'stormwater';

-- Marine Dumping
INSERT INTO permit_type_fields (permit_type_id, field_name, field_label, field_type, is_mandatory, sort_order, help_text)
SELECT id, 'material_type', 'Material Type', 'text', true, 1, 'Type of material being dumped'
FROM permit_types WHERE name = 'marine_dumping'
UNION ALL
SELECT id, 'quantity', 'Quantity (tonnes)', 'number', true, 2, 'Quantity in tonnes'
FROM permit_types WHERE name = 'marine_dumping'
UNION ALL
SELECT id, 'dumping_location', 'Dumping Location', 'text', true, 3, 'GPS coordinates of dumping site'
FROM permit_types WHERE name = 'marine_dumping'
UNION ALL
SELECT id, 'vessel_details', 'Vessel Details', 'text', true, 4, 'Details of vessel used'
FROM permit_types WHERE name = 'marine_dumping';

-- Dredging and Reclamation
INSERT INTO permit_type_fields (permit_type_id, field_name, field_label, field_type, is_mandatory, sort_order, help_text)
SELECT id, 'dredge_volume', 'Dredge Volume (m³)', 'number', true, 1, 'Volume to be dredged in cubic meters'
FROM permit_types WHERE name = 'dredging'
UNION ALL
SELECT id, 'spoil_disposal_site', 'Spoil Disposal Site', 'text', true, 2, 'Location of spoil disposal'
FROM permit_types WHERE name = 'dredging'
UNION ALL
SELECT id, 'method', 'Dredging Method', 'select', true, 3, 'Method of dredging'
FROM permit_types WHERE name = 'dredging'
UNION ALL
SELECT id, 'duration', 'Duration (days)', 'number', true, 4, 'Expected duration in days'
FROM permit_types WHERE name = 'dredging';

-- Continue in next part...