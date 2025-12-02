-- Delete all existing industrial sectors
DELETE FROM industrial_sectors;

-- Insert new industrial sectors
INSERT INTO industrial_sectors (name) VALUES
('Oil & Gas–Exploration'),
('Oil & Gas–Extraction'),
('Mining–Alluvial'),
('Mining–Quarry'),
('Mining–Extraction'),
('Mining–Exploration'),
('Forestry–Logging'),
('Agriculture–Agroforestry'),
('Agriculture–Oil Palm'),
('Agriculture–Livestock'),
('Agriculture–Tree Crops'),
('Infrastructure & Utilities–General'),
('Manufacturing & Processing–Food & Beverages'),
('Manufacturing & Processing–Chemicals'),
('Energy–General');