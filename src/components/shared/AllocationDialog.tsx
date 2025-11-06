import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { UserCheck, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AllocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId?: string;
  applicationTitle?: string;
  staffUnit: string;
}

export function AllocationDialog({ 
  open, 
  onOpenChange, 
  applicationId = '', 
  applicationTitle = 'Application',
  staffUnit 
}: AllocationDialogProps) {
  const [selectedOfficer, setSelectedOfficer] = useState<string>('');
  const [priority, setPriority] = useState<string>('medium');
  const [notes, setNotes] = useState<string>('');
  const [staffMembers, setStaffMembers] = useState<Array<{ id: string; name: string; workload: number }>>([]);

  // Fetch real staff data from profiles table
  useEffect(() => {
    const fetchStaffMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, staff_unit')
          .eq('user_type', 'staff')
          .eq('staff_unit', staffUnit as any)
          .eq('is_active', true);

        if (error) throw error;

        // Transform data and calculate workload from permit assignments
        const staffWithWorkload = await Promise.all((data || []).map(async (staff) => {
          const { data: workloadData } = await supabase
            .from('permit_applications')
            .select('id')
            .eq('assigned_officer_id', staff.user_id)
            .in('status', ['submitted', 'under_review']);

          return {
            id: staff.user_id,  // Use user_id which matches auth.users and assessed_by field
            name: `${staff.first_name || ''} ${staff.last_name || ''}`.trim() || 'Unnamed Staff',
            workload: workloadData?.length || 0
          };
        }));

        setStaffMembers(staffWithWorkload);
      } catch (error) {
        console.error('Error fetching staff members:', error);
      }
    };

    if (staffUnit) {
      fetchStaffMembers();
    }
  }, [staffUnit]);

  const handleAllocate = async () => {
    if (!selectedOfficer || !applicationId) return;
    
    try {
      console.log('Allocating application:', applicationId, 'to officer:', selectedOfficer);
      
      // Update the initial_assessment with the selected officer's UUID
      const { error } = await supabase
        .from('initial_assessments')
        .update({ 
          assessed_by: selectedOfficer,  // This is the actual user_id from profiles table
          assessment_notes: notes || 'Assessment assigned to officer'
        })
        .eq('permit_application_id', applicationId);

      if (error) {
        console.error('Error allocating application:', error);
        throw error;
      }

      console.log('Successfully allocated application to officer:', selectedOfficer);
      onOpenChange(false);
      
      // Reset form
      setSelectedOfficer('');
      setNotes('');
      setPriority('medium');
      
    } catch (error) {
      console.error('Error in handleAllocate:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Allocate Application
          </DialogTitle>
          <DialogDescription>
            Assign {applicationTitle} to a staff member
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="officer">Select Officer</Label>
            <Select value={selectedOfficer} onValueChange={setSelectedOfficer}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an officer..." />
              </SelectTrigger>
              <SelectContent>
                {staffMembers.map((staff) => (
                  <SelectItem key={staff.id} value={staff.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{staff.name}</span>
                      <Badge variant="secondary" className="ml-2">
                        <Clock className="h-3 w-3 mr-1" />
                        {staff.workload}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="priority">Priority Level</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Assignment Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific instructions or notes..."
              className="min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAllocate} disabled={!selectedOfficer}>
            Allocate Application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}