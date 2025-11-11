import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Factory, 
  Droplet, 
  Leaf, 
  Zap, 
  Hammer, 
  AlertTriangle, 
  Trash, 
  Wind,
  TreePine,
  FlaskConical,
  Fish,
  Building2,
  Mountain,
  Waves,
  TrendingUp,
  Database,
  Shield
} from 'lucide-react';

interface ComprehensivePermitDetailsReadOnlyProps {
  application: any;
}

export function ComprehensivePermitDetailsReadOnly({ application }: ComprehensivePermitDetailsReadOnlyProps) {
  
  const renderSection = (title: string, icon: React.ReactNode, data: any, fields: Array<{key: string, label: string, type?: 'text' | 'number' | 'date' | 'boolean' | 'array'}>) => {
    if (!data || Object.keys(data).length === 0) return null;
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {fields.map(field => {
            const value = data[field.key];
            if (value === null || value === undefined || value === '') return null;
            
            return (
              <div key={field.key}>
                <label className="text-sm font-medium text-muted-foreground block mb-1">
                  {field.label}
                </label>
                <div className="p-2 bg-muted/50 rounded text-sm">
                  {field.type === 'boolean' ? (
                    <Badge variant={value ? 'default' : 'secondary'}>
                      {value ? 'Yes' : 'No'}
                    </Badge>
                  ) : field.type === 'date' ? (
                    new Date(value).toLocaleDateString()
                  ) : field.type === 'number' ? (
                    typeof value === 'number' ? value.toLocaleString() : value
                  ) : field.type === 'array' ? (
                    Array.isArray(value) ? value.join(', ') : value
                  ) : (
                    value
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Operational Details */}
      {(application.operational_details || application.operational_capacity || application.operating_hours) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Factory className="w-5 h-5 text-primary" />
              Operational Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {application.operational_details && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Operational Details</label>
                <p className="mt-1 p-3 bg-muted/50 rounded text-sm">{application.operational_details}</p>
              </div>
            )}
            {application.operational_capacity && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Operational Capacity</label>
                <p className="mt-1 p-3 bg-muted/50 rounded text-sm">{application.operational_capacity}</p>
              </div>
            )}
            {application.operating_hours && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Operating Hours</label>
                <p className="mt-1 p-3 bg-muted/50 rounded text-sm">{application.operating_hours}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Water Extraction Details */}
      {renderSection(
        'Water Extraction Details',
        <Droplet className="w-5 h-5 text-blue-500" />,
        application.water_extraction_details,
        [
          { key: 'source_type', label: 'Water Source Type' },
          { key: 'extraction_rate', label: 'Extraction Rate (L/day)', type: 'number' },
          { key: 'purpose', label: 'Purpose of Water Use' },
          { key: 'location', label: 'Extraction Location' },
          { key: 'treatment_method', label: 'Treatment Method' },
        ]
      )}

      {/* Effluent Discharge Details */}
      {renderSection(
        'Effluent Discharge Details',
        <Droplet className="w-5 h-5 text-cyan-500" />,
        application.effluent_discharge_details,
        [
          { key: 'discharge_type', label: 'Type of Discharge' },
          { key: 'discharge_volume', label: 'Discharge Volume (L/day)', type: 'number' },
          { key: 'discharge_point', label: 'Discharge Point' },
          { key: 'treatment_method', label: 'Treatment Method' },
          { key: 'receiving_water_body', label: 'Receiving Water Body' },
        ]
      )}

      {/* Waste Management */}
      {renderSection(
        'Solid Waste Details',
        <Trash className="w-5 h-5 text-orange-500" />,
        application.solid_waste_details,
        [
          { key: 'waste_type', label: 'Type of Waste' },
          { key: 'daily_generation', label: 'Daily Generation (kg/day)', type: 'number' },
          { key: 'storage_method', label: 'Storage Method' },
          { key: 'disposal_method', label: 'Disposal Method' },
          { key: 'recycling_plan', label: 'Recycling Plan' },
        ]
      )}

      {/* Hazardous Waste Details */}
      {renderSection(
        'Hazardous Waste Details',
        <AlertTriangle className="w-5 h-5 text-red-500" />,
        application.hazardous_waste_details,
        [
          { key: 'waste_classification', label: 'Waste Classification' },
          { key: 'quantity', label: 'Estimated Quantity (kg/year)', type: 'number' },
          { key: 'storage_facilities', label: 'Storage Facilities' },
          { key: 'handling_procedures', label: 'Handling Procedures' },
          { key: 'disposal_contractor', label: 'Licensed Disposal Contractor' },
        ]
      )}

      {/* Waste Contaminant Details */}
      {renderSection(
        'Waste Contaminant Details',
        <AlertTriangle className="w-5 h-5 text-amber-500" />,
        application.waste_contaminant_details,
        [
          { key: 'discharge_type', label: 'Discharge Type' },
          { key: 'discharge_volume', label: 'Discharge Volume', type: 'number' },
          { key: 'contaminant_list', label: 'Contaminant Types' },
          { key: 'treatment_method', label: 'Treatment Method' },
        ]
      )}

      {/* Air Quality & Emissions */}
      {renderSection(
        'Air Emission Details',
        <Wind className="w-5 h-5 text-sky-500" />,
        application.air_emission_details,
        [
          { key: 'emission_sources', label: 'Emission Sources' },
          { key: 'pollutant_types', label: 'Pollutant Types', type: 'array' },
          { key: 'emission_rate', label: 'Emission Rate', type: 'number' },
          { key: 'control_measures', label: 'Control Measures' },
          { key: 'monitoring_plan', label: 'Monitoring Plan' },
        ]
      )}

      {/* GHG Emissions */}
      {renderSection(
        'GHG Emission Details',
        <TrendingUp className="w-5 h-5 text-purple-500" />,
        application.ghg_emission_details,
        [
          { key: 'annual_emissions', label: 'Annual Emissions (tCO2e)', type: 'number' },
          { key: 'emission_sources', label: 'Emission Sources', type: 'array' },
          { key: 'reduction_measures', label: 'Reduction Measures' },
          { key: 'monitoring_methodology', label: 'Monitoring Methodology' },
        ]
      )}

      {/* Carbon Offset Details */}
      {renderSection(
        'Carbon Offset Details',
        <Leaf className="w-5 h-5 text-green-500" />,
        application.carbon_offset_details,
        [
          { key: 'offset_type', label: 'Offset Type' },
          { key: 'offset_amount', label: 'Offset Amount (tCO2e)', type: 'number' },
          { key: 'verification_standard', label: 'Verification Standard' },
          { key: 'project_details', label: 'Project Details' },
        ]
      )}

      {/* Noise Emissions */}
      {renderSection(
        'Noise Emission Details',
        <Wind className="w-5 h-5 text-indigo-500" />,
        application.noise_emission_details,
        [
          { key: 'noise_sources', label: 'Noise Sources' },
          { key: 'expected_levels', label: 'Expected Noise Levels (dB)' },
          { key: 'operating_hours', label: 'Operating Hours' },
          { key: 'mitigation_measures', label: 'Mitigation Measures' },
        ]
      )}

      {/* ODS Details */}
      {renderSection(
        'Ozone Depleting Substances (ODS)',
        <Shield className="w-5 h-5 text-blue-600" />,
        application.ods_details,
        [
          { key: 'ods_type', label: 'ODS Type' },
          { key: 'import_quantity', label: 'Import Quantity (MT CO2 eq)', type: 'number' },
          { key: 'intended_use', label: 'Intended Use' },
          { key: 'storage_conditions', label: 'Storage Conditions' },
        ]
      )}

      {/* Stormwater Details */}
      {renderSection(
        'Stormwater Management',
        <Waves className="w-5 h-5 text-blue-400" />,
        application.stormwater_details,
        [
          { key: 'catchment_area', label: 'Catchment Area (m²)', type: 'number' },
          { key: 'drainage_system', label: 'Drainage System' },
          { key: 'treatment_facilities', label: 'Treatment Facilities' },
          { key: 'discharge_point', label: 'Discharge Point' },
        ]
      )}

      {/* Mining & Extraction */}
      {renderSection(
        'Mining Permit Details',
        <Mountain className="w-5 h-5 text-stone-600" />,
        application.mining_permit_details,
        [
          { key: 'mineral_type', label: 'Mineral Type' },
          { key: 'extraction_method', label: 'Extraction Method' },
          { key: 'annual_production', label: 'Annual Production Target', type: 'number' },
          { key: 'lease_area', label: 'Lease Area (hectares)', type: 'number' },
        ]
      )}

      {/* Mining Chemical Details */}
      {renderSection(
        'Mining Chemical Usage',
        <FlaskConical className="w-5 h-5 text-red-600" />,
        application.mining_chemical_details,
        [
          { key: 'chemical_types', label: 'Chemical Types', type: 'array' },
          { key: 'quantities', label: 'Annual Quantities' },
          { key: 'storage_method', label: 'Storage Method' },
          { key: 'safety_procedures', label: 'Safety Procedures' },
        ]
      )}

      {/* Soil Extraction */}
      {renderSection(
        'Soil Extraction Details',
        <Mountain className="w-5 h-5 text-amber-700" />,
        application.soil_extraction_details,
        [
          { key: 'extraction_volume', label: 'Extraction Volume (m³)', type: 'number' },
          { key: 'extraction_method', label: 'Extraction Method' },
          { key: 'transport_method', label: 'Transport Method' },
          { key: 'rehabilitation_plan', label: 'Rehabilitation Plan' },
        ]
      )}

      {/* Land Clearing */}
      {renderSection(
        'Land Clearing Details',
        <TreePine className="w-5 h-5 text-green-700" />,
        application.land_clearing_details,
        [
          { key: 'area_to_clear', label: 'Area to Clear (hectares)', type: 'number' },
          { key: 'vegetation_type', label: 'Vegetation Type' },
          { key: 'clearing_method', label: 'Clearing Method' },
          { key: 'waste_management', label: 'Vegetation Waste Management' },
        ]
      )}

      {/* Dredging */}
      {renderSection(
        'Dredging Details',
        <Waves className="w-5 h-5 text-teal-600" />,
        application.dredging_details,
        [
          { key: 'dredging_area', label: 'Dredging Area (m²)', type: 'number' },
          { key: 'dredging_depth', label: 'Dredging Depth (m)', type: 'number' },
          { key: 'sediment_volume', label: 'Sediment Volume (m³)', type: 'number' },
          { key: 'disposal_method', label: 'Disposal Method' },
          { key: 'environmental_controls', label: 'Environmental Controls' },
        ]
      )}

      {/* Marine Dumping */}
      {renderSection(
        'Marine Dumping Details',
        <Fish className="w-5 h-5 text-blue-700" />,
        application.marine_dumping_details,
        [
          { key: 'material_type', label: 'Material Type' },
          { key: 'volume', label: 'Volume (m³)', type: 'number' },
          { key: 'disposal_site', label: 'Disposal Site Coordinates' },
          { key: 'environmental_impact', label: 'Environmental Impact Assessment' },
        ]
      )}

      {/* Infrastructure */}
      {renderSection(
        'Infrastructure Details',
        <Building2 className="w-5 h-5 text-slate-600" />,
        application.infrastructure_details,
        [
          { key: 'infrastructure_type', label: 'Infrastructure Type' },
          { key: 'dimensions', label: 'Dimensions/Scale' },
          { key: 'materials', label: 'Construction Materials' },
          { key: 'access_requirements', label: 'Access Requirements' },
        ]
      )}

      {/* Hazardous Materials */}
      {renderSection(
        'Hazardous Material Details',
        <AlertTriangle className="w-5 h-5 text-red-600" />,
        application.hazardous_material_details,
        [
          { key: 'material_types', label: 'Material Types', type: 'array' },
          { key: 'quantities', label: 'Quantities' },
          { key: 'storage_locations', label: 'Storage Locations' },
          { key: 'safety_measures', label: 'Safety Measures' },
          { key: 'emergency_procedures', label: 'Emergency Procedures' },
        ]
      )}

      {/* Fuel Storage */}
      {renderSection(
        'Fuel Storage Details',
        <Database className="w-5 h-5 text-orange-600" />,
        application.fuel_storage_details,
        [
          { key: 'fuel_types', label: 'Fuel Types', type: 'array' },
          { key: 'storage_capacity', label: 'Total Storage Capacity (L)', type: 'number' },
          { key: 'tank_specifications', label: 'Tank Specifications' },
          { key: 'spill_containment', label: 'Spill Containment Measures' },
          { key: 'fire_safety', label: 'Fire Safety Measures' },
        ]
      )}

      {/* Renewable Energy */}
      {renderSection(
        'Renewable Energy Details',
        <Zap className="w-5 h-5 text-yellow-500" />,
        application.renewable_energy_details,
        [
          { key: 'energy_type', label: 'Energy Type' },
          { key: 'capacity', label: 'Installed Capacity (MW)', type: 'number' },
          { key: 'annual_generation', label: 'Expected Annual Generation (MWh)', type: 'number' },
          { key: 'grid_connection', label: 'Grid Connection Details' },
        ]
      )}

      {/* Biodiversity & ABS */}
      {renderSection(
        'Biodiversity & Access and Benefit Sharing',
        <TreePine className="w-5 h-5 text-green-600" />,
        application.biodiversity_abs_details,
        [
          { key: 'species_involved', label: 'Species Involved', type: 'array' },
          { key: 'collection_method', label: 'Collection Method' },
          { key: 'benefit_sharing_plan', label: 'Benefit Sharing Plan' },
          { key: 'conservation_measures', label: 'Conservation Measures' },
        ]
      )}

      {/* Wildlife Trade */}
      {renderSection(
        'Wildlife Trade Details',
        <Fish className="w-5 h-5 text-teal-500" />,
        application.wildlife_trade_details,
        [
          { key: 'species', label: 'Species' },
          { key: 'quantity', label: 'Quantity', type: 'number' },
          { key: 'purpose', label: 'Purpose of Trade' },
          { key: 'cites_permit', label: 'CITES Permit Number' },
          { key: 'origin', label: 'Origin' },
        ]
      )}

      {/* Research Details */}
      {renderSection(
        'Research Details',
        <FlaskConical className="w-5 h-5 text-purple-600" />,
        application.research_details,
        [
          { key: 'research_objectives', label: 'Research Objectives' },
          { key: 'methodology', label: 'Methodology' },
          { key: 'duration', label: 'Duration' },
          { key: 'ethical_approval', label: 'Ethical Approval', type: 'boolean' },
        ]
      )}

      {/* Monitoring License */}
      {renderSection(
        'Monitoring License Details',
        <FlaskConical className="w-5 h-5 text-indigo-600" />,
        application.monitoring_license_details,
        [
          { key: 'monitoring_type', label: 'Monitoring Type' },
          { key: 'parameters', label: 'Parameters to Monitor', type: 'array' },
          { key: 'frequency', label: 'Monitoring Frequency' },
          { key: 'reporting_schedule', label: 'Reporting Schedule' },
        ]
      )}

      {/* Rehabilitation Details */}
      {renderSection(
        'Rehabilitation & Closure Plan',
        <Leaf className="w-5 h-5 text-lime-600" />,
        application.rehabilitation_details,
        [
          { key: 'rehabilitation_plan', label: 'Rehabilitation Plan' },
          { key: 'timeline', label: 'Timeline' },
          { key: 'budget', label: 'Estimated Budget (PGK)', type: 'number' },
          { key: 'revegetation_species', label: 'Revegetation Species', type: 'array' },
          { key: 'monitoring_program', label: 'Post-Rehabilitation Monitoring' },
        ]
      )}
    </div>
  );
}
