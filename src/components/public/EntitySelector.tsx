import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Plus, Building, User, AlertCircle } from 'lucide-react';
import { useEntities, Entity } from '@/hooks/useEntities';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { EntityForm } from './EntityForm';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EntitySelectorProps {
  selectedEntityId: string | null;
  onEntitySelect: (entityId: string, entityData?: Entity) => void;
  onEntityCreate?: () => void;
}

export function EntitySelector({ selectedEntityId, onEntitySelect, onEntityCreate }: EntitySelectorProps) {
  const { entities, loading, refetchEntities } = useEntities();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleEntityCreated = () => {
    setShowCreateDialog(false);
    refetchEntities();
    onEntityCreate?.();
  };

  const selectedEntity = entities.find(entity => entity.id === selectedEntityId);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-600 mx-auto mb-4"></div>
          <p>Loading entities...</p>
        </CardContent>
      </Card>
    );
  }

  if (entities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Entity Selection
          </CardTitle>
          <CardDescription>
            You need to create an entity (Individual or Organization) to proceed with the application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No entities found. Please create an entity to continue with your permit application.
            </AlertDescription>
          </Alert>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="w-full bg-gradient-to-r from-forest-600 to-nature-600 hover:from-forest-700 hover:to-nature-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Entity
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Entity</DialogTitle>
              </DialogHeader>
              <EntityForm
                onSuccess={handleEntityCreated}
                onCancel={() => setShowCreateDialog(false)}
              />
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Entity Selection *
            </CardTitle>
            <CardDescription>
              Select the entity (Individual or Organization) for this permit application.
            </CardDescription>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Entity
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Entity</DialogTitle>
              </DialogHeader>
              <EntityForm
                onSuccess={handleEntityCreated}
                onCancel={() => setShowCreateDialog(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!selectedEntityId && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please select an entity to proceed with the application.
            </AlertDescription>
          </Alert>
        )}
        
        <RadioGroup value={selectedEntityId || ''} onValueChange={(entityId) => {
          const selectedEntity = entities.find(entity => entity.id === entityId);
          onEntitySelect(entityId, selectedEntity);
        }}>
          <div className="space-y-3">
            {entities.map((entity) => (
              <div key={entity.id} className="flex items-start space-x-3">
                <RadioGroupItem value={entity.id} id={entity.id} className="mt-1" />
                <Label htmlFor={entity.id} className="flex-1 cursor-pointer">
                  <Card className={`transition-colors ${
                    selectedEntityId === entity.id 
                      ? 'border-forest-600 bg-forest-50' 
                      : 'hover:border-gray-300'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {entity.entity_type === 'company' ? (
                            <Building className="w-4 h-4" />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                          <span className="font-medium">{entity.name}</span>
                        </div>
                        <Badge variant={entity.entity_type === 'company' ? 'default' : 'secondary'}>
                          {entity.entity_type === 'company' ? 'Organization' : 
                           entity.entity_type === 'government' ? 'Government' : 'Individual'}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        {entity.email && <p>Email: {entity.email}</p>}
                        {entity.phone && <p>Phone: {entity.phone}</p>}
                        {entity.contact_person && <p>Contact: {entity.contact_person}</p>}
                        {entity.registration_number && <p>Registration: {entity.registration_number}</p>}
                      </div>
                    </CardContent>
                  </Card>
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>

        {selectedEntity && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-green-700">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium">Selected Entity: {selectedEntity.name}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}