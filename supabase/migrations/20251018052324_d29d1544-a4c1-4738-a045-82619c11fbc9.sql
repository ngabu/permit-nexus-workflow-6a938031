-- Add permit type fields for Rehabilitation/Closure Certificate

INSERT INTO permit_type_fields (permit_type_id, field_name, field_label, field_type, is_mandatory, help_text, sort_order, field_options)
VALUES 
  ((SELECT id FROM permit_types WHERE name = 'rehabilitation_closure'), 'site_area', 'Site Area (ha)', 'number', true, 'Total area to be rehabilitated in hectares', 1, NULL),
  ((SELECT id FROM permit_types WHERE name = 'rehabilitation_closure'), 'closure_type', 'Closure Type', 'select', true, 'Type of closure or rehabilitation', 2, '["Mine Closure", "Quarry Rehabilitation", "Landfill Closure", "Industrial Site Decommissioning", "Other"]'::jsonb),
  ((SELECT id FROM permit_types WHERE name = 'rehabilitation_closure'), 'rehabilitation_plan', 'Rehabilitation Plan', 'textarea', true, 'Detailed rehabilitation and restoration plan', 3, NULL),
  ((SELECT id FROM permit_types WHERE name = 'rehabilitation_closure'), 'monitoring_duration', 'Post-Closure Monitoring Duration (years)', 'number', true, 'Duration of post-closure monitoring in years', 4, NULL),
  ((SELECT id FROM permit_types WHERE name = 'rehabilitation_closure'), 'bond_amount', 'Environmental Bond Amount (PGK)', 'number', false, 'Financial assurance amount for rehabilitation', 5, NULL);