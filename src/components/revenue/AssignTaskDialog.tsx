import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface RevenueStaff {
  id: string;
  email: string;
  full_name: string | null;
  staff_position?: string | null;
}

interface RelatedItem {
  id: string;
  label: string;
}

interface AssignTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign: (taskData: {
    task_type: 'invoice_processing' | 'payment_verification' | 'collection_followup';
    title: string;
    description: string;
    assigned_to: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    due_date: string | null;
    related_invoice_id?: string | null;
  }) => Promise<void>;
}

export function AssignTaskDialog({ open, onOpenChange, onAssign }: AssignTaskDialogProps) {
  const [taskType, setTaskType] = useState<'invoice_processing' | 'payment_verification' | 'collection_followup'>('invoice_processing');
  const [relatedItemId, setRelatedItemId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [loading, setLoading] = useState(false);
  
  const [staffList, setStaffList] = useState<RevenueStaff[]>([]);
  const [relatedItems, setRelatedItems] = useState<RelatedItem[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);

  // Fetch revenue staff
  useEffect(() => {
    const fetchStaff = async () => {
      setLoadingStaff(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('user_id, email, first_name, last_name, staff_position')
          .eq('staff_unit', 'revenue')
          .in('staff_position', ['officer', 'manager']);

        if (error) throw error;

        setStaffList((data || []).map(p => ({
          id: p.user_id,
          email: p.email || '',
          full_name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.email,
          staff_position: p.staff_position
        })));
      } catch (error) {
        console.error('Error fetching staff:', error);
      } finally {
        setLoadingStaff(false);
      }
    };

    if (open) {
      fetchStaff();
    }
  }, [open]);

  // Fetch related invoices
  useEffect(() => {
    const fetchRelatedItems = async () => {
      setLoadingItems(true);
      setRelatedItems([]);
      setRelatedItemId('');

      try {
        const { data, error } = await supabase
          .from('invoices')
          .select('id, invoice_number, amount')
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;

        setRelatedItems((data || []).map(i => ({
          id: i.id,
          label: `${i.invoice_number} - K${i.amount.toLocaleString()}`
        })));
      } catch (error) {
        console.error('Error fetching related items:', error);
      } finally {
        setLoadingItems(false);
      }
    };

    if (open) {
      fetchRelatedItems();
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!title || !assignedTo) return;

    setLoading(true);
    try {
      await onAssign({
        task_type: taskType,
        title,
        description,
        assigned_to: assignedTo,
        priority,
        due_date: dueDate ? dueDate.toISOString() : null,
        related_invoice_id: relatedItemId || null,
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setTaskType('invoice_processing');
      setAssignedTo('');
      setPriority('normal');
      setDueDate(undefined);
      setRelatedItemId('');
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Task and Assignment</DialogTitle>
          <DialogDescription>
            Create a new task and assign it to a revenue team member
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="task-type">Task Type</Label>
            <Select value={taskType} onValueChange={(v) => setTaskType(v as typeof taskType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select task type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="invoice_processing">Invoice Processing</SelectItem>
                <SelectItem value="payment_verification">Payment Verification</SelectItem>
                <SelectItem value="collection_followup">Collection Follow-up</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Related Invoice</Label>
            <Select value={relatedItemId} onValueChange={setRelatedItemId} disabled={loadingItems}>
              <SelectTrigger>
                <SelectValue placeholder={loadingItems ? 'Loading...' : 'Select invoice (optional)'} />
              </SelectTrigger>
              <SelectContent>
                {relatedItems.map(item => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Assigned To</Label>
            <Select value={assignedTo} onValueChange={setAssignedTo} disabled={loadingStaff}>
              <SelectTrigger>
                <SelectValue placeholder={loadingStaff ? 'Loading staff...' : 'Select staff member'} />
              </SelectTrigger>
              <SelectContent>
                {staffList.map(staff => (
                  <SelectItem key={staff.id} value={staff.id}>
                    {staff.full_name} ({staff.staff_position})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title || !assignedTo || loading}>
            {loading ? 'Creating...' : 'Create Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
