import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, FileText } from 'lucide-react';
import { EntitySelector } from '@/components/public/EntitySelector';

interface BasicInfoTabProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
}

const PERMIT_TYPES = [
  { value: 'Waste Discharge', label: 'Waste Discharge Permit' },
  { value: 'Water Extraction', label: 'Water Extraction Permit' },
  { value: 'ODS Import', label: 'ODS Import Permit' },
  { value: 'Mining Operations', label: 'Mining Operations Permit' },
  { value: 'Manufacturing', label: 'Manufacturing Permit' },
  { value: 'Tourism Development', label: 'Tourism Development Permit' },
  { value: 'Construction', label: 'Construction Permit' },
  { value: 'Energy Production', label: 'Energy Production Permit' }
];

const BasicInfoTab: React.FC<BasicInfoTabProps> = ({ formData, handleInputChange }) => {
  return (
    <div className="space-y-6">
      {/* Entity Selection */}
      <EntitySelector
        selectedEntityId={formData.entity_id || null}
        onEntitySelect={(entityId, entityData) => {
          console.log('🏢 EntitySelector - onEntitySelect:', { entityId, entityData });
          handleInputChange('entity_id', entityId);
          if (entityData) {
            console.log('🏢 Setting entity data:', { 
              entity_type: entityData.entity_type, 
              entity_name: entityData.name 
            });
            handleInputChange('entity_type', entityData.entity_type);
            handleInputChange('entity_name', entityData.name); // Save entity name
          }
        }}
        onEntityCreate={() => {
          // Optionally refresh or show success message
          console.log('Entity created successfully');
        }}
      />
    </div>
  );
};

export default BasicInfoTab;