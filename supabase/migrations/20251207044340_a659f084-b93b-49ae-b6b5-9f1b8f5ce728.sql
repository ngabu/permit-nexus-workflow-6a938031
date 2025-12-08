-- Update the incorrect location data for Highlands Gold Operations Ltd intent registration
-- Porgera Gold Mine is located in Enga Province, Porgera-Lagaip District, Porgera LLG

UPDATE intent_registrations 
SET 
  province = 'Enga', 
  district = 'Porgera-Lagaip', 
  llg = 'Porgera'
WHERE id = 'fa7dae9d-3ddd-4256-9a21-a4165dcbf632';