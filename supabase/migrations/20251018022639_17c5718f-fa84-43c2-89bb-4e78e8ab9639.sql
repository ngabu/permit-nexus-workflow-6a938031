-- Insert field definitions for permit types with proper JSONB casting

-- Effluent Discharge (Inland/Marine)
INSERT INTO public.permit_type_fields (permit_type_id, field_name, field_label, field_type, field_options, is_mandatory, placeholder, sort_order)
SELECT id, 'effluent_type', 'Effluent Type', 'select',
  '["industrial", "domestic", "mixed", "process_water", "treated_wastewater"]'::jsonb,
  true, 'Select effluent type', 1
FROM public.permit_types WHERE name = 'effluent_discharge'
UNION ALL
SELECT id, 'monitoring_frequency', 'Monitoring Frequency', 'select',
  '["daily", "weekly", "monthly", "quarterly", "annually"]'::jsonb,
  true, 'Select monitoring frequency', 2
FROM public.permit_types WHERE name = 'effluent_discharge'
UNION ALL
SELECT id, 'receiving_body', 'Receiving Water Body', 'text', null::jsonb, true, 'Enter receiving water body name', 3
FROM public.permit_types WHERE name = 'effluent_discharge'
UNION ALL
SELECT id, 'standards_applied', 'Environmental Standards Applied', 'textarea', null::jsonb, true, 'Describe applicable environmental standards', 4
FROM public.permit_types WHERE name = 'effluent_discharge';

-- Solid Waste Disposal
INSERT INTO public.permit_type_fields (permit_type_id, field_name, field_label, field_type, field_options, is_mandatory, placeholder, sort_order)
SELECT id, 'waste_type', 'Waste Type', 'select',
  '["municipal", "industrial", "construction", "medical", "agricultural", "inert"]'::jsonb,
  true, 'Select waste type', 1
FROM public.permit_types WHERE name = 'solid_waste_disposal'
UNION ALL
SELECT id, 'disposal_method', 'Disposal Method', 'select',
  '["landfill", "incineration", "composting", "recycling", "treatment"]'::jsonb,
  true, 'Select disposal method', 2
FROM public.permit_types WHERE name = 'solid_waste_disposal'
UNION ALL
SELECT id, 'disposal_site_location', 'Disposal Site Location', 'text', null::jsonb, true, 'Enter disposal site coordinates/address', 3
FROM public.permit_types WHERE name = 'solid_waste_disposal'
UNION ALL
SELECT id, 'volume_capacity', 'Volume Capacity (tons/year)', 'number', null::jsonb, true, 'Enter annual capacity', 4
FROM public.permit_types WHERE name = 'solid_waste_disposal';

-- Hazardous Waste Storage/Transport
INSERT INTO public.permit_type_fields (permit_type_id, field_name, field_label, field_type, field_options, is_mandatory, placeholder, sort_order)
SELECT id, 'waste_category', 'Hazardous Waste Category', 'select',
  '["toxic", "corrosive", "flammable", "reactive", "infectious", "radioactive"]'::jsonb,
  true, 'Select waste category', 1
FROM public.permit_types WHERE name = 'hazardous_waste'
UNION ALL
SELECT id, 'transport_mode', 'Transport Mode', 'select',
  '["road", "rail", "sea", "air", "pipeline"]'::jsonb,
  true, 'Select transport mode', 2
FROM public.permit_types WHERE name = 'hazardous_waste'
UNION ALL
SELECT id, 'origin', 'Origin Location', 'text', null::jsonb, true, 'Enter origin address', 3
FROM public.permit_types WHERE name = 'hazardous_waste'
UNION ALL
SELECT id, 'destination', 'Destination Location', 'text', null::jsonb, true, 'Enter destination address', 4
FROM public.permit_types WHERE name = 'hazardous_waste'
UNION ALL
SELECT id, 'handling_protocol', 'Handling Protocol', 'textarea', null::jsonb, true, 'Describe handling and safety protocols', 5
FROM public.permit_types WHERE name = 'hazardous_waste';

-- Air Emissions
INSERT INTO public.permit_type_fields (permit_type_id, field_name, field_label, field_type, field_options, is_mandatory, placeholder, sort_order)
SELECT id, 'emission_source', 'Emission Source', 'text', null::jsonb, true, 'Describe emission source', 1
FROM public.permit_types WHERE name = 'air_emissions'
UNION ALL
SELECT id, 'pollutants_list', 'Pollutants List', 'textarea', null::jsonb, true, 'List all pollutants and concentrations', 2
FROM public.permit_types WHERE name = 'air_emissions'
UNION ALL
SELECT id, 'control_technology', 'Control Technology', 'text', null::jsonb, true, 'Describe emission control technology', 3
FROM public.permit_types WHERE name = 'air_emissions'
UNION ALL
SELECT id, 'stack_height', 'Stack Height (meters)', 'number', null::jsonb, true, 'Enter stack height', 4
FROM public.permit_types WHERE name = 'air_emissions';

-- Noise/Vibration Emission
INSERT INTO public.permit_type_fields (permit_type_id, field_name, field_label, field_type, field_options, is_mandatory, placeholder, sort_order)
SELECT id, 'source_type', 'Source Type', 'select',
  '["industrial_machinery", "construction", "mining", "transport", "event", "other"]'::jsonb,
  true, 'Select source type', 1
FROM public.permit_types WHERE name = 'noise_vibration'
UNION ALL
SELECT id, 'decibel_level', 'Decibel Level (dB)', 'number', null::jsonb, true, 'Enter expected decibel level', 2
FROM public.permit_types WHERE name = 'noise_vibration'
UNION ALL
SELECT id, 'mitigation_measures', 'Mitigation Measures', 'textarea', null::jsonb, true, 'Describe noise mitigation measures', 3
FROM public.permit_types WHERE name = 'noise_vibration'
UNION ALL
SELECT id, 'operation_hours', 'Operation Hours', 'text', null::jsonb, true, 'Specify operation hours', 4
FROM public.permit_types WHERE name = 'noise_vibration';