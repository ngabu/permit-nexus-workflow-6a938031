
-- Create 4 new entities for paulyn@example.com
INSERT INTO entities (
  user_id, entity_type, name, email, phone, postal_address, "registered address",
  registration_number, tax_number, contact_person, contact_person_email, contact_person_phone,
  district, province
) VALUES
-- Entity 1: Lae-based mining company
(
  '17d50d9a-b5a2-4d03-b563-bd694ace1467',
  'company',
  'Morobe Mining & Resources Ltd',
  'info@morobemining.com.pg',
  '+675 472 1234',
  'PO Box 456, Lae, Morobe Province',
  '15 Markham Road, Industrial Area, Lae',
  'IPA-2019-78234',
  'TIN-8765432',
  'John Kamara',
  'john.kamara@morobemining.com.pg',
  67547212345,
  'Lae',
  'Morobe'
),
-- Entity 2: Lae-based manufacturing company
(
  '17d50d9a-b5a2-4d03-b563-bd694ace1467',
  'company',
  'Pacific Industrial Solutions PNG',
  'contact@pacificindustrial.com.pg',
  '+675 472 5678',
  'PO Box 789, Lae, Morobe Province',
  '42 Butibam Road, Lae',
  'IPA-2020-91456',
  'TIN-6543219',
  'Maria Lua',
  'maria.lua@pacificindustrial.com.pg',
  67547256789,
  'Lae',
  'Morobe'
),
-- Entity 3: Enga-based resources company
(
  '17d50d9a-b5a2-4d03-b563-bd694ace1467',
  'company',
  'Highlands Gold Operations Ltd',
  'operations@highlandsgold.com.pg',
  '+675 547 3456',
  'PO Box 123, Wabag, Enga Province',
  'Porgera Station Road, Porgera',
  'IPA-2018-45678',
  'TIN-3456789',
  'Peter Ipatas',
  'peter.ipatas@highlandsgold.com.pg',
  67554734567,
  'Porgera',
  'Enga'
),
-- Entity 4: Port Moresby-based energy company
(
  '17d50d9a-b5a2-4d03-b563-bd694ace1467',
  'company',
  'NCD Power & Energy Corporation',
  'info@ncdpower.com.pg',
  '+675 321 9876',
  'PO Box 1001, Port Moresby, NCD',
  'Level 5, Deloitte Tower, Douglas Street, Port Moresby',
  'IPA-2021-12890',
  'TIN-1234567',
  'Grace Morea',
  'grace.morea@ncdpower.com.pg',
  67532198765,
  'Moresby South',
  'National Capital District'
);

-- Update the 4 intent drafts with proper project names and link to new entities
-- First, update Lae Level 2 drafts
UPDATE intent_registration_drafts 
SET 
  entity_id = (SELECT id FROM entities WHERE name = 'Morobe Mining & Resources Ltd' AND user_id = '17d50d9a-b5a2-4d03-b563-bd694ace1467'),
  draft_name = 'Lae Industrial Wastewater Treatment Facility'
WHERE user_id = '17d50d9a-b5a2-4d03-b563-bd694ace1467' 
  AND activity_level = 'Level 2' 
  AND province = 'Morobe'
  AND draft_name LIKE '%Chemical%';

UPDATE intent_registration_drafts 
SET 
  entity_id = (SELECT id FROM entities WHERE name = 'Pacific Industrial Solutions PNG' AND user_id = '17d50d9a-b5a2-4d03-b563-bd694ace1467'),
  draft_name = 'Butibam Industrial Recycling Complex'
WHERE user_id = '17d50d9a-b5a2-4d03-b563-bd694ace1467' 
  AND activity_level = 'Level 2' 
  AND province = 'Morobe'
  AND draft_name LIKE '%Waste%';

-- Update Enga Level 3 draft
UPDATE intent_registration_drafts 
SET 
  entity_id = (SELECT id FROM entities WHERE name = 'Highlands Gold Operations Ltd' AND user_id = '17d50d9a-b5a2-4d03-b563-bd694ace1467'),
  draft_name = 'Porgera Gold Mine Tailings Management Project'
WHERE user_id = '17d50d9a-b5a2-4d03-b563-bd694ace1467' 
  AND activity_level = 'Level 3' 
  AND province = 'Enga';

-- Update Port Moresby Level 3 draft
UPDATE intent_registration_drafts 
SET 
  entity_id = (SELECT id FROM entities WHERE name = 'NCD Power & Energy Corporation' AND user_id = '17d50d9a-b5a2-4d03-b563-bd694ace1467'),
  draft_name = 'Port Moresby Combined Cycle Power Station'
WHERE user_id = '17d50d9a-b5a2-4d03-b563-bd694ace1467' 
  AND activity_level = 'Level 3' 
  AND province = 'National Capital District';
