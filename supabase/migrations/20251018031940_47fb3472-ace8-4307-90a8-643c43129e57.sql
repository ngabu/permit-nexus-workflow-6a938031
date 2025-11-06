-- Continue populating permit_type_fields - Part 2

-- LAND USE & RESOURCE EXTRACTION PERMITS

-- Quarry/Mining Environmental Permit
INSERT INTO permit_type_fields (permit_type_id, field_name, field_label, field_type, is_mandatory, sort_order, help_text)
SELECT id, 'extraction_type', 'Extraction Type', 'select', true, 1, 'Type of mining/quarrying'
FROM permit_types WHERE name = 'quarry_mining'
UNION ALL
SELECT id, 'area_extent', 'Area Extent (ha)', 'number', true, 2, 'Area extent in hectares'
FROM permit_types WHERE name = 'quarry_mining'
UNION ALL
SELECT id, 'blasting_schedule', 'Blasting Schedule', 'text', false, 3, 'Schedule for blasting operations'
FROM permit_types WHERE name = 'quarry_mining'
UNION ALL
SELECT id, 'rehabilitation_plan', 'Rehabilitation Plan', 'textarea', true, 4, 'Post-extraction rehabilitation plan'
FROM permit_types WHERE name = 'quarry_mining';

-- Land Clearing/Deforestation
INSERT INTO permit_type_fields (permit_type_id, field_name, field_label, field_type, is_mandatory, sort_order, help_text)
SELECT id, 'area_size', 'Area Size (ha)', 'number', true, 1, 'Area to be cleared in hectares'
FROM permit_types WHERE name = 'land_clearing'
UNION ALL
SELECT id, 'vegetation_type', 'Vegetation Type', 'text', true, 2, 'Type of vegetation present'
FROM permit_types WHERE name = 'land_clearing'
UNION ALL
SELECT id, 'purpose', 'Purpose', 'text', true, 3, 'Purpose of land clearing'
FROM permit_types WHERE name = 'land_clearing'
UNION ALL
SELECT id, 'offset_plan', 'Offset Plan', 'textarea', true, 4, 'Environmental offset plan'
FROM permit_types WHERE name = 'land_clearing';

-- Soil Extraction/Backfilling
INSERT INTO permit_type_fields (permit_type_id, field_name, field_label, field_type, is_mandatory, sort_order, help_text)
SELECT id, 'material_type', 'Material Type', 'text', true, 1, 'Type of soil/material'
FROM permit_types WHERE name = 'soil_extraction'
UNION ALL
SELECT id, 'extraction_depth', 'Extraction Depth (m)', 'number', true, 2, 'Depth of extraction in meters'
FROM permit_types WHERE name = 'soil_extraction'
UNION ALL
SELECT id, 'refill_plan', 'Refill Plan', 'textarea', true, 3, 'Plan for backfilling'
FROM permit_types WHERE name = 'soil_extraction';

-- Infrastructure Development
INSERT INTO permit_type_fields (permit_type_id, field_name, field_label, field_type, is_mandatory, sort_order, help_text)
SELECT id, 'project_type', 'Project Type', 'select', true, 1, 'Type of infrastructure project'
FROM permit_types WHERE name = 'infrastructure_development'
UNION ALL
SELECT id, 'site_coordinates', 'Site Coordinates', 'text', true, 2, 'GPS coordinates of site'
FROM permit_types WHERE name = 'infrastructure_development'
UNION ALL
SELECT id, 'eia_reference_id', 'EIA Reference ID', 'text', false, 3, 'Environmental Impact Assessment reference'
FROM permit_types WHERE name = 'infrastructure_development'
UNION ALL
SELECT id, 'construction_schedule', 'Construction Schedule', 'text', true, 4, 'Planned construction timeline'
FROM permit_types WHERE name = 'infrastructure_development';

-- BIODIVERSITY & NATURAL RESOURCE PERMITS

-- Wildlife Trade/Transport
INSERT INTO permit_type_fields (permit_type_id, field_name, field_label, field_type, is_mandatory, sort_order, help_text)
SELECT id, 'species_name', 'Species Name', 'text', true, 1, 'Scientific and common name of species'
FROM permit_types WHERE name = 'wildlife_trade'
UNION ALL
SELECT id, 'cites_status', 'CITES Status', 'select', true, 2, 'CITES Appendix classification'
FROM permit_types WHERE name = 'wildlife_trade'
UNION ALL
SELECT id, 'quantity', 'Quantity', 'number', true, 3, 'Number of specimens'
FROM permit_types WHERE name = 'wildlife_trade'
UNION ALL
SELECT id, 'destination', 'Destination', 'text', true, 4, 'Final destination'
FROM permit_types WHERE name = 'wildlife_trade';

-- Biodiversity Access and Benefit Sharing
INSERT INTO permit_type_fields (permit_type_id, field_name, field_label, field_type, is_mandatory, sort_order, help_text)
SELECT id, 'genetic_resource', 'Genetic Resource', 'text', true, 1, 'Type of genetic resource accessed'
FROM permit_types WHERE name = 'biodiversity_abs'
UNION ALL
SELECT id, 'community_consent', 'Community Consent', 'select', true, 2, 'Status of community consent'
FROM permit_types WHERE name = 'biodiversity_abs'
UNION ALL
SELECT id, 'intended_use', 'Intended Use', 'textarea', true, 3, 'Intended use of genetic resources'
FROM permit_types WHERE name = 'biodiversity_abs';

-- Aquaculture/Fish Farm Operation
INSERT INTO permit_type_fields (permit_type_id, field_name, field_label, field_type, is_mandatory, sort_order, help_text)
SELECT id, 'species', 'Species', 'text', true, 1, 'Species being farmed'
FROM permit_types WHERE name = 'aquaculture'
UNION ALL
SELECT id, 'pond_area', 'Pond Area (ha)', 'number', true, 2, 'Total pond area in hectares'
FROM permit_types WHERE name = 'aquaculture'
UNION ALL
SELECT id, 'feed_type', 'Feed Type', 'text', true, 3, 'Type of feed used'
FROM permit_types WHERE name = 'aquaculture'
UNION ALL
SELECT id, 'discharge_controls', 'Discharge Controls', 'textarea', true, 4, 'Effluent discharge control measures'
FROM permit_types WHERE name = 'aquaculture';

-- Forest Product Processing/Export
INSERT INTO permit_type_fields (permit_type_id, field_name, field_label, field_type, is_mandatory, sort_order, help_text)
SELECT id, 'species_type', 'Species Type', 'text', true, 1, 'Type of forest species'
FROM permit_types WHERE name = 'forest_product'
UNION ALL
SELECT id, 'volume', 'Volume (m³)', 'number', true, 2, 'Volume in cubic meters'
FROM permit_types WHERE name = 'forest_product'
UNION ALL
SELECT id, 'processing_method', 'Processing Method', 'text', true, 3, 'Method of processing'
FROM permit_types WHERE name = 'forest_product';