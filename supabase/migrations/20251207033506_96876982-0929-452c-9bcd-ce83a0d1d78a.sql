
-- Fix Draft 1: Port Moresby Combined Cycle Power Station - activity description doesn't match name
-- The draft_name says "Power Station" but activity_description talks about "chemical manufacturing"
UPDATE intent_registration_drafts
SET 
  activity_description = 'Construction and operation of a 150MW combined cycle gas turbine power station to supplement Port Moresby''s electricity grid. The facility will utilize natural gas from the PNG LNG project and feature advanced emission control systems.',
  preparatory_work_description = 'Grid interconnection studies, gas supply negotiations with PNG LNG, detailed power plant engineering design, environmental impact assessment for air emissions and noise, community consultation in surrounding suburbs.',
  approvals_required = 'Level 3 Environmental Permit, Power Generation License, Gas Supply Agreement, Building Permit, Grid Connection Approval',
  departments_approached = 'CEPA, PNG Power Ltd, Department of Petroleum and Energy, NCDC, Investment Promotion Authority',
  project_site_description = 'Industrial zone site at Badili with existing high-voltage transmission lines nearby. Located 3km from Port Moresby CBD with good road access. The site has been pre-cleared and has utility connections.',
  -- Adjust boundary to be smaller and more appropriate for a power station (about 0.5 sq km)
  project_boundary = '{"type": "Polygon", "coordinates": [[[147.188, -9.462], [147.195, -9.462], [147.196, -9.468], [147.189, -9.469], [147.188, -9.462]]]}',
  total_area_sqkm = 0.45,
  latitude = -9.465,
  longitude = 147.192
WHERE id = '3dc03a5c-e1c6-4d82-bc44-64dd35c47032';

-- Fix Draft 2: Markham Valley Oil Exploration - coordinates are in Lae Urban, should be in actual Markham Valley
-- Markham Valley is northeast of Lae, around coordinates -6.4 to -6.6 lat, 146.2 to 146.8 long
UPDATE intent_registration_drafts
SET 
  project_site_address = 'Petroleum Exploration License Area PEL-2024, Umi Creek area, Upper Markham Valley',
  project_site_description = 'The site is located in the Upper Markham Valley, approximately 60km northwest of Lae city along the Highlands Highway. The terrain consists of grassland savanna with scattered eucalyptus woodland. The exploration area is accessible via existing logging roads branching from the main highway.',
  llg = 'Umi-Atzera',
  -- Move coordinates to actual Markham Valley (Upper Markham area near Umi)
  latitude = -6.35,
  longitude = 146.42,
  -- Create a reasonable exploration boundary in the Markham Valley (about 8 sq km for exploration)
  project_boundary = '{"type": "Polygon", "coordinates": [[[146.40, -6.33], [146.45, -6.33], [146.46, -6.36], [146.44, -6.38], [146.41, -6.37], [146.40, -6.33]]]}',
  total_area_sqkm = 8.5,
  site_ownership_details = 'State land within Petroleum Exploration License PEL-2024-089, with landowner consent from Umi and Atzera communities'
WHERE id = '3c85574f-7b84-4c61-8b68-bc3c9db75751';

-- Fix Draft 3: Porgera Gold Mine Tailings Management - reduce boundary size to be more realistic
-- 15 sq km is too large for a tailings management facility
UPDATE intent_registration_drafts
SET 
  project_site_description = 'High altitude site (2,200m elevation) in the Porgera Valley adjacent to the existing Porgera Gold Mine. The terrain is mountainous with the project area focusing on the designated tailings storage facility zone within the Special Mining Lease.',
  -- More realistic boundary for tailings management (about 4 sq km)
  project_boundary = '{"type": "Polygon", "coordinates": [[[143.11, -5.475], [143.13, -5.475], [143.135, -5.49], [143.125, -5.50], [143.115, -5.495], [143.11, -5.475]]]}',
  total_area_sqkm = 4.2
WHERE id = 'f43b31c3-dba5-4baf-b7fc-fb5e4c67befb';

-- Fix Draft 4: Lae City Sewage Treatment Plant - reduce boundary to more realistic size
-- 1.8 sq km is too large for a sewage treatment plant
UPDATE intent_registration_drafts
SET 
  -- More realistic boundary for a treatment plant (about 0.3 sq km / 30 hectares)
  project_boundary = '{"type": "Polygon", "coordinates": [[[147.012, -6.728], [147.02, -6.728], [147.021, -6.735], [147.014, -6.736], [147.012, -6.728]]]}',
  total_area_sqkm = 0.32,
  latitude = -6.731,
  longitude = 147.016
WHERE id = '958dacea-d78f-4578-92c2-c799d467b293';
