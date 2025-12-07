
-- Update intent drafts with project_boundary GeoJSON polygons

-- Porgera Gold Mine Tailings Management Project
UPDATE intent_registration_drafts 
SET project_boundary = '{
  "type": "Polygon",
  "coordinates": [[[143.0900, -5.4600], [143.1400, -5.4600], [143.1500, -5.4800], [143.1450, -5.5100], [143.1100, -5.5150], [143.0850, -5.4950], [143.0900, -5.4600]]]
}'::jsonb
WHERE id = 'f43b31c3-dba5-4baf-b7fc-fb5e4c67befb';

-- Markham Valley Oil Exploration (Lae)
UPDATE intent_registration_drafts 
SET project_boundary = '{
  "type": "Polygon",
  "coordinates": [[[146.9850, -6.7150], [147.0200, -6.7150], [147.0250, -6.7350], [147.0100, -6.7450], [146.9900, -6.7400], [146.9850, -6.7150]]]
}'::jsonb
WHERE id = '3c85574f-7b84-4c61-8b68-bc3c9db75751';

-- Lae City Sewage Treatment Plant
UPDATE intent_registration_drafts 
SET project_boundary = '{
  "type": "Polygon",
  "coordinates": [[[147.0050, -6.7220], [147.0260, -6.7220], [147.0280, -6.7350], [147.0200, -6.7420], [147.0080, -6.7380], [147.0050, -6.7220]]]
}'::jsonb
WHERE id = '958dacea-d78f-4578-92c2-c799d467b293';

-- Port Moresby Combined Cycle Power Station
UPDATE intent_registration_drafts 
SET project_boundary = '{
  "type": "Polygon",
  "coordinates": [[[147.1750, -9.4500], [147.2100, -9.4500], [147.2150, -9.4700], [147.2000, -9.4850], [147.1780, -9.4800], [147.1750, -9.4500]]]
}'::jsonb
WHERE id = '3dc03a5c-e1c6-4d82-bc44-64dd35c47032';
