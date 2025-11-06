-- Populate empty select field options for permit type fields

-- Biodiversity Access and Benefit Sharing - Community Consent
UPDATE permit_type_fields
SET field_options = '["Yes - Obtained", "In Progress", "Not Yet Obtained", "Not Required"]'::jsonb
WHERE field_name = 'community_consent' 
  AND permit_type_id IN (SELECT id FROM permit_types WHERE name = 'biodiversity_abs');

-- Emergency Discharge/Incident - Incident Type
UPDATE permit_type_fields
SET field_options = '["Spill/Leak", "Fire", "Explosion", "Equipment Failure", "Natural Disaster", "Human Error", "Unauthorized Discharge", "Other Emergency"]'::jsonb
WHERE field_name = 'incident_type' 
  AND permit_type_id IN (SELECT id FROM permit_types WHERE name = 'emergency_discharge');

-- Infrastructure Development - Project Type
UPDATE permit_type_fields
SET field_options = '["Road/Highway", "Bridge", "Port/Harbor", "Airport", "Power Plant", "Water Treatment Facility", "Commercial Building", "Industrial Facility", "Residential Development", "Telecommunications Tower", "Pipeline", "Other Infrastructure"]'::jsonb
WHERE field_name = 'project_type' 
  AND permit_type_id IN (SELECT id FROM permit_types WHERE name = 'infrastructure_development');

-- Other Unclassified - Environmental Risk Level
UPDATE permit_type_fields
SET field_options = '["Low Risk", "Medium Risk", "High Risk", "Very High Risk"]'::jsonb
WHERE field_name = 'environmental_risk_level' 
  AND permit_type_id IN (SELECT id FROM permit_types WHERE name = 'other_unclassified');

-- Quarry/Mining - Extraction Type
UPDATE permit_type_fields
SET field_options = '["Surface Mining", "Underground Mining", "Quarrying", "Sand/Gravel Extraction", "Clay Extraction", "Gold Mining", "Copper Mining", "Nickel Mining", "Other Mineral Extraction"]'::jsonb
WHERE field_name = 'extraction_type' 
  AND permit_type_id IN (SELECT id FROM permit_types WHERE name = 'quarry_mining');