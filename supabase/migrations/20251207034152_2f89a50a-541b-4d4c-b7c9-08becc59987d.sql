
-- Fix all 4 drafts with REALISTIC hectare-sized boundaries

-- 1. Port Moresby Power Station - ~5 hectares (250m x 200m footprint)
UPDATE intent_registration_drafts
SET 
  project_boundary = '{"type": "Polygon", "coordinates": [[[147.1915, -9.4640], [147.1940, -9.4640], [147.1940, -9.4658], [147.1915, -9.4658], [147.1915, -9.4640]]]}',
  total_area_sqkm = 0.05,
  latitude = -9.4649,
  longitude = 147.1928
WHERE id = '3dc03a5c-e1c6-4d82-bc44-64dd35c47032';

-- 2. Lae Sewage Treatment Plant - ~3 hectares (200m x 150m footprint)
UPDATE intent_registration_drafts
SET 
  project_boundary = '{"type": "Polygon", "coordinates": [[[147.0150, -6.7300], [147.0170, -6.7300], [147.0170, -6.7315], [147.0150, -6.7315], [147.0150, -6.7300]]]}',
  total_area_sqkm = 0.03,
  latitude = -6.7308,
  longitude = 147.0160
WHERE id = '958dacea-d78f-4578-92c2-c799d467b293';

-- 3. Porgera Tailings Management - ~25 hectares (500m x 500m tailings area)
UPDATE intent_registration_drafts
SET 
  activity_description = 'Upgrade and expansion of the existing tailings storage facility at Porgera Gold Mine. The project involves constructing additional containment structures and implementing improved water treatment systems for the tailings management area.',
  project_boundary = '{"type": "Polygon", "coordinates": [[[143.1150, -5.4820], [143.1200, -5.4820], [143.1200, -5.4865], [143.1150, -5.4865], [143.1150, -5.4820]]]}',
  total_area_sqkm = 0.25,
  latitude = -5.4843,
  longitude = 143.1175
WHERE id = 'f43b31c3-dba5-4baf-b7fc-fb5e4c67befb';

-- 4. Markham Valley Oil Exploration - ~15 hectares (drilling pad + support area, 400m x 375m)
UPDATE intent_registration_drafts
SET 
  project_boundary = '{"type": "Polygon", "coordinates": [[[146.4200, -6.3500], [146.4240, -6.3500], [146.4240, -6.3535], [146.4200, -6.3535], [146.4200, -6.3500]]]}',
  total_area_sqkm = 0.15,
  latitude = -6.3518,
  longitude = 146.4220
WHERE id = '3c85574f-7b84-4c61-8b68-bc3c9db75751';
