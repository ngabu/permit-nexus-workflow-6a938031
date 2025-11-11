-- Update existing data to consolidate Level 2A and 2B into Level 2
-- Update activity_document_requirements
UPDATE activity_document_requirements
SET activity_classification = 'Level 2'
WHERE activity_classification IN ('Level 2A', 'Level 2B') OR (activity_level = 2 AND activity_classification IS NULL);

-- Update permit_applications
UPDATE permit_applications
SET activity_level = 'Level 2'
WHERE activity_level IN ('Level 2A', 'Level 2B');