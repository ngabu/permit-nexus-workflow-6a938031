
-- Update Port Moresby Combined Cycle Power Station with realistic power plant details
UPDATE intent_registration_drafts
SET 
  activity_description = 'Construction and operation of a 150MW combined cycle gas turbine power station to supplement Port Moresby''s electricity grid. The facility will utilize natural gas supplied via the PNG LNG project and incorporate waste heat recovery for improved efficiency.',
  preparatory_work_description = 'Site preparation including ground leveling, foundation works, installation of temporary construction facilities, grid connection studies, gas pipeline tie-in engineering, and community awareness programs.',
  project_site_address = 'Lot 45, Section 12, 8 Mile Industrial Area, National Capital District',
  project_site_description = 'Industrial zoned land located in the 8 Mile area of Port Moresby, adjacent to existing PNG Power infrastructure. The site has access to main roads and is within proximity to the existing gas pipeline network.',
  site_ownership_details = 'State lease acquired through NCDC, 99-year industrial lease with power generation designation',
  government_agreement = 'Power Purchase Agreement with PNG Power Limited under review',
  departments_approached = 'Department of Petroleum and Energy, PNG Power Limited, NCDC Physical Planning, CEPA',
  approvals_required = 'Environmental Permit Level 3, Power Generation License, Building Permit, Gas Supply Agreement',
  landowner_negotiation_status = 'State land - no customary landowner negotiations required',
  estimated_cost_kina = 280000000,
  commencement_date = '2025-06-01',
  completion_date = '2028-12-31'
WHERE id = '3dc03a5c-e1c6-4d82-bc44-64dd35c47032';

-- Update Porgera Gold Mine Tailings Management with realistic mining project details
UPDATE intent_registration_drafts
SET 
  activity_description = 'Upgrade and expansion of the existing tailings storage facility at Porgera Gold Mine. The project involves constructing additional containment embankments, installing improved water treatment systems, and implementing enhanced environmental monitoring for the tailings management area.',
  preparatory_work_description = 'Geotechnical investigations, hydrological assessments, tailings characterization studies, embankment design engineering, environmental baseline monitoring, and stakeholder consultation with local communities.',
  project_site_address = 'Porgera Gold Mine, SML 1(P), Porgera Valley, Enga Province',
  project_site_description = 'The tailings storage facility is located within the existing Special Mining Lease area at Porgera, in a valley adjacent to the main processing plant. The site is at approximately 2,400m elevation in the highlands.',
  site_ownership_details = 'Within Special Mining Lease SML 1(P) held by Barrick (Niugini) Limited and Zijin Mining',
  government_agreement = 'Operating under existing Mining Development Contract with State equity participation',
  departments_approached = 'Mineral Resources Authority, CEPA, Enga Provincial Administration, Department of Mining',
  approvals_required = 'Environmental Permit Amendment, Tailings Dam Safety Approval, Water Use Permit',
  landowner_negotiation_status = 'Ongoing engagement with Porgera Landowners Association under existing compensation agreements',
  estimated_cost_kina = 85000000,
  commencement_date = '2025-04-01',
  completion_date = '2027-03-31'
WHERE id = 'f43b31c3-dba5-4baf-b7fc-fb5e4c67befb';
