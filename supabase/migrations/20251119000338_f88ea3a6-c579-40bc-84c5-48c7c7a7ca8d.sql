-- Update base document requirement to change "Project Description" to "Full Permit Application"
UPDATE base_document_requirements 
SET 
  name = 'Full Permit Application', 
  description = 'Complete permit application form containing all required information including project description, site details, environmental considerations, and activity-specific requirements. This comprehensive document must address all checklist items specified for your permit type and activity level.'
WHERE name = 'Project Description';