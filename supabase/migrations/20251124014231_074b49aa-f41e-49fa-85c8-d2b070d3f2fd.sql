-- Populate GIS data table with references to GeoJSON files
INSERT INTO public.gis_data (name, data) VALUES 
  ('Biodiversity Priority Areas', '{"type": "file_reference", "path": "/gis-data/biodiversity_priority_areas.json", "description": "Biodiversity priority areas for conservation planning", "color": "#8b5cf6"}'::jsonb),
  ('Conservation National Areas', '{"type": "file_reference", "path": "/gis-data/conservation_national_areas.json", "description": "National conservation areas and protected regions", "color": "#f59e0b"}'::jsonb),
  ('Key Biodiversity Areas (KBA)', '{"type": "file_reference", "path": "/gis-data/KBA_Key_Biodiversity_Area.json", "description": "Key Biodiversity Areas identified for protection", "color": "#ec4899"}'::jsonb),
  ('Protected Areas (Existing)', '{"type": "file_reference", "path": "/gis-data/protected_areas_existing.json", "description": "Existing protected areas and sanctuaries", "color": "#06b6d4"}'::jsonb),
  ('Protected Areas (Proposed)', '{"type": "file_reference", "path": "/gis-data/protected_areas_proposed.json", "description": "Proposed protected areas for future designation", "color": "#84cc16"}'::jsonb)
ON CONFLICT DO NOTHING;
