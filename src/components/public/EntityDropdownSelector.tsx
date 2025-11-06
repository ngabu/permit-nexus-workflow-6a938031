import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Building, User } from 'lucide-react';
import { useEntities, Entity } from '@/hooks/useEntities';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { EntityForm } from './EntityForm';

interface EntityDropdownSelectorProps {
  selectedEntityId: string | null;
  onEntitySelect: (entityId: string, entityData?: Entity) => void;
  onEntityCreate?: () => void;
}

export function EntityDropdownSelector({ selectedEntityId, onEntitySelect, onEntityCreate }: EntityDropdownSelectorProps) {
  const { entities, loading, refetchEntities } = useEntities();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleEntityCreated = () => {
    setShowCreateDialog(false);
    refetchEntities();
    onEntityCreate?.();
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        <span className="text-sm text-muted-foreground">Loading entities...</span>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2">
      <div className="flex-1 space-y-2">
        <Label htmlFor="entity-select">Entity (Individual or Organization) *</Label>
        <Select 
          value={selectedEntityId || ''} 
          onValueChange={(entityId) => {
            const selectedEntity = entities.find(entity => entity.id === entityId);
            onEntitySelect(entityId, selectedEntity);
          }}
        >
          <SelectTrigger id="entity-select">
            <SelectValue placeholder="Select an entity" />
          </SelectTrigger>
          <SelectContent>
            {entities.length === 0 ? (
              <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                No entities found. Please create one.
              </div>
            ) : (
              entities.map((entity) => (
                <SelectItem key={entity.id} value={entity.id}>
                  <div className="flex items-center gap-2">
                    {entity.entity_type === 'company' ? (
                      <Building className="w-4 h-4" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                    <span>{entity.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({entity.entity_type === 'company' ? 'Organization' : 
                        entity.entity_type === 'government' ? 'Government' : 'Individual'})
                    </span>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
      
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" size="default" className="shrink-0">
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
  );
}
