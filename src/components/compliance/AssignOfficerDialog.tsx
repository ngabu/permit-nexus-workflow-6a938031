import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ComplianceStaff } from './types';

interface AssignOfficerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  officers: ComplianceStaff[];
  selectedApplication?: string | null;
  onAssign: (applicationId: string, officerId: string) => Promise<void>;
}

export function AssignOfficerDialog({
  open,
  onOpenChange,
  officers,
  selectedApplication,
  onAssign
}: AssignOfficerDialogProps) {
  const [selectedOfficer, setSelectedOfficer] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssign = async () => {
    if (!selectedApplication || !selectedOfficer) return;

    try {
      setIsAssigning(true);
      await onAssign(selectedApplication, selectedOfficer);
      setSelectedOfficer('');
      onOpenChange(false);
    } catch (error) {
      console.error('Assignment failed:', error);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Compliance Officer</DialogTitle>
          <DialogDescription>
            Select a compliance officer to assign to this application.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Compliance Officer</Label>
            <Select value={selectedOfficer} onValueChange={setSelectedOfficer}>
              <SelectTrigger>
                <SelectValue placeholder="Select an officer..." />
              </SelectTrigger>
              <SelectContent>
                {officers.map((officer) => (
                  <SelectItem key={officer.id} value={officer.id}>
                    {officer.full_name || officer.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isAssigning}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!selectedOfficer || isAssigning}>
            {isAssigning ? 'Assigning...' : 'Assign Officer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}