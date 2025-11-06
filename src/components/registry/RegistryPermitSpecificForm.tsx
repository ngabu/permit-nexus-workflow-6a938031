import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Droplets, Factory, AlertTriangle } from 'lucide-react';

interface RegistryPermitSpecificFormProps {
  data: any;
  onChange: (data: any) => void;
}

const PERMIT_TYPES = [
  'Waste Discharge',
  'Water Extraction',
  'ODS Import',
  'Air Quality',
  'Mining & Quarrying',
  'Other'
];

export function RegistryPermitSpecificForm({ data, onChange }: RegistryPermitSpecificFormProps) {
  const permitType = data.permit_type_specific;

  const renderWasteDischargeFields = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="discharge_type">Type of Discharge *</Label>
          <Select 
            value={data.waste_contaminant_details?.discharge_type || ''} 
            onValueChange={(value) => onChange({ 
              waste_contaminant_details: { 
                ...data.waste_contaminant_details, 
                discharge_type: value 
              } 
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select discharge type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="industrial_wastewater">Industrial Wastewater</SelectItem>
              <SelectItem value="domestic_sewage">Domestic Sewage</SelectItem>
              <SelectItem value="stormwater">Stormwater</SelectItem>
              <SelectItem value="cooling_water">Cooling Water</SelectItem>
              <SelectItem value="mining_effluent">Mining Effluent</SelectItem>
              <SelectItem value="agricultural_runoff">Agricultural Runoff</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="discharge_volume">Daily Discharge Volume (L/day) *</Label>
          <Input
            type="number"
            id="discharge_volume"
            value={data.waste_contaminant_details?.discharge_volume || ''}
            onChange={(e) => onChange({ 
              waste_contaminant_details: { 
                ...data.waste_contaminant_details, 
                discharge_volume: e.target.value 
              } 
            })}
            placeholder="Enter daily discharge volume"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contaminant_list">Contaminant Types and Concentrations *</Label>
        <Textarea
          id="contaminant_list"
          value={data.waste_contaminant_details?.contaminant_list || ''}
          onChange={(e) => onChange({ 
            waste_contaminant_details: { 
              ...data.waste_contaminant_details, 
              contaminant_list: e.target.value 
            } 
          })}
          placeholder="List all contaminants with expected concentrations"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="treatment_method">Treatment Method *</Label>
        <Textarea
          id="treatment_method"
          value={data.waste_contaminant_details?.treatment_method || ''}
          onChange={(e) => onChange({ 
            waste_contaminant_details: { 
              ...data.waste_contaminant_details, 
              treatment_method: e.target.value 
            } 
          })}
          placeholder="Describe the treatment method"
          rows={3}
        />
      </div>
    </div>
  );

  const renderWaterExtractionFields = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="water_source">Water Source *</Label>
          <Select 
            value={data.water_extraction_details?.source_type || ''} 
            onValueChange={(value) => onChange({ 
              water_extraction_details: { 
                ...data.water_extraction_details, 
                source_type: value 
              } 
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select water source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="groundwater">Groundwater (Bore/Well)</SelectItem>
              <SelectItem value="surface_water">Surface Water (River/Lake)</SelectItem>
              <SelectItem value="spring">Natural Spring</SelectItem>
              <SelectItem value="rainwater">Rainwater Harvesting</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="extraction_rate">Extraction Rate (L/day) *</Label>
          <Input
            type="number"
            id="extraction_rate"
            value={data.water_extraction_details?.extraction_rate || ''}
            onChange={(e) => onChange({ 
              water_extraction_details: { 
                ...data.water_extraction_details, 
                extraction_rate: e.target.value 
              } 
            })}
            placeholder="Enter daily extraction rate"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="purpose">Purpose of Water Use *</Label>
        <Textarea
          id="purpose"
          value={data.water_extraction_details?.purpose || ''}
          onChange={(e) => onChange({ 
            water_extraction_details: { 
              ...data.water_extraction_details, 
              purpose: e.target.value 
            } 
          })}
          placeholder="Describe the intended use"
          rows={3}
        />
      </div>
    </div>
  );

  const renderODSImportFields = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ods_type">ODS Type *</Label>
          <Select 
            value={data.ods_details?.ods_type || ''} 
            onValueChange={(value) => onChange({ 
              ods_details: { 
                ...data.ods_details, 
                ods_type: value 
              } 
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select ODS type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cfc">CFCs (Chlorofluorocarbons)</SelectItem>
              <SelectItem value="hcfc">HCFCs (Hydrochlorofluorocarbons)</SelectItem>
              <SelectItem value="halon">Halons</SelectItem>
              <SelectItem value="methyl_bromide">Methyl Bromide</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="import_quantity">Import Quantity (MT CO2 eq) *</Label>
          <Input
            type="number"
            id="import_quantity"
            value={data.ods_details?.import_quantity || ''}
            onChange={(e) => onChange({ 
              ods_details: { 
                ...data.ods_details, 
                import_quantity: e.target.value 
              } 
            })}
            placeholder="Enter quantity"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="intended_use">Intended Use *</Label>
        <Textarea
          id="intended_use"
          value={data.ods_details?.intended_use || ''}
          onChange={(e) => onChange({ 
            ods_details: { 
              ...data.ods_details, 
              intended_use: e.target.value 
            } 
          })}
          placeholder="Describe the intended use"
          rows={3}
        />
      </div>
    </div>
  );

  const renderDefaultFields = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="operational_details">Operational Details *</Label>
        <Textarea
          id="operational_details"
          value={data.operational_details || ''}
          onChange={(e) => onChange({ operational_details: e.target.value })}
          placeholder="Describe the operational aspects"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="capacity">Operational Capacity *</Label>
          <Input
            id="capacity"
            value={data.operational_capacity || ''}
            onChange={(e) => onChange({ operational_capacity: e.target.value })}
            placeholder="e.g., 1000 tons/year"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="operating_hours">Operating Hours *</Label>
          <Input
            id="operating_hours"
            value={data.operating_hours || ''}
            onChange={(e) => onChange({ operating_hours: e.target.value })}
            placeholder="e.g., 24/7, 8 hours/day"
          />
        </div>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Permit-Specific Requirements
        </CardTitle>
        <CardDescription>
          Registry Assessment: Define permit-specific requirements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="permit_type">Permit Type *</Label>
          <Select 
            value={permitType || ''} 
            onValueChange={(value) => onChange({ permit_type_specific: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select permit type" />
            </SelectTrigger>
            <SelectContent>
              {PERMIT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {permitType === 'Waste Discharge' && renderWasteDischargeFields()}
        {permitType === 'Water Extraction' && renderWaterExtractionFields()}
        {permitType === 'ODS Import' && renderODSImportFields()}
        {permitType && !['Waste Discharge', 'Water Extraction', 'ODS Import'].includes(permitType) && renderDefaultFields()}
      </CardContent>
    </Card>
  );
}
