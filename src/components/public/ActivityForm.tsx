
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FeeCalculationCard } from '@/components/fee-calculation/FeeCalculationCard';
import { useFeeCalculation } from '@/hooks/useFeeCalculation';

interface ActivityFormProps {
  permitId: string;
  permitActivity?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const ACTIVITY_TYPES = [
  { value: 'transfer', label: 'Transfer' },
  { value: 'amalgamation', label: 'Amalgamation' },
  { value: 'surrender', label: 'Surrender' },
  { value: 'renewal', label: 'Renewal' },
  { value: 'compliance', label: 'Compliance Report' },
  { value: 'enforcement', label: 'Enforcement' },
  { value: 'amendment', label: 'Amendment' },
];

const ACTIVITY_CLASSIFICATIONS = [
  { value: 'mining', label: 'Mining Operations' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'construction', label: 'Construction' },
  { value: 'waste_management', label: 'Waste Management' },
  { value: 'energy', label: 'Energy Production' },
  { value: 'tourism', label: 'Tourism Development' },
  { value: 'forestry', label: 'Forestry' },
  { value: 'aquaculture', label: 'Aquaculture' },
  { value: 'other', label: 'Other' },
];

export function ActivityForm({ permitId, permitActivity, onSuccess, onCancel }: ActivityFormProps) {
  const [formData, setFormData] = useState({
    activity_type: '',
    activity_classification: permitActivity || 'other',
    details: '',
    fee_category: 'Green Category',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { calculateFees, getFeeCategories } = useFeeCalculation();

  const calculatedFees = formData.activity_classification && formData.activity_type
    ? calculateFees(formData.activity_classification, formData.activity_type, formData.fee_category)
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.activity_type) {
      toast({
        title: "Validation Error",
        description: "Please select an activity type",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Prepare the details object as JSON-compatible data
      const detailsObject = {
        description: formData.details,
        activity_classification: formData.activity_classification,
        fee_category: formData.fee_category,
        calculated_fees: calculatedFees ? {
          administrationFee: calculatedFees.administrationFee,
          technicalFee: calculatedFees.technicalFee,
          totalFee: calculatedFees.totalFee,
          processingDays: calculatedFees.processingDays,
          administrationForm: calculatedFees.administrationForm,
          technicalForm: calculatedFees.technicalForm
        } : null
      };

      // Create the activity with fee information
      const activityData = {
        permit_id: permitId,
        activity_type: formData.activity_type,
        status: 'pending',
        details: detailsObject
      };

      const { error } = await supabase
        .from('permit_activities')
        .insert(activityData);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Activity created successfully with calculated fees of ${calculatedFees ? 
          new Intl.NumberFormat('en-PG', { style: 'currency', currency: 'PGK' }).format(calculatedFees.totalFee) : 
          'TBD'}`,
      });
      onSuccess();
    } catch (error) {
      console.error('Error creating activity:', error);
      toast({
        title: "Error",
        description: "Failed to create activity",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="activity_type">Activity Type *</Label>
          <Select value={formData.activity_type} onValueChange={(value) => setFormData({ ...formData, activity_type: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select activity type" />
            </SelectTrigger>
            <SelectContent>
              {ACTIVITY_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="activity_classification">Activity Classification *</Label>
          <Select value={formData.activity_classification} onValueChange={(value) => setFormData({ ...formData, activity_classification: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select activity classification" />
            </SelectTrigger>
            <SelectContent>
              {ACTIVITY_CLASSIFICATIONS.map((classification) => (
                <SelectItem key={classification.value} value={classification.value}>
                  {classification.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fee_category">Fee Category *</Label>
          <Select value={formData.fee_category} onValueChange={(value) => setFormData({ ...formData, fee_category: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select fee category" />
            </SelectTrigger>
            <SelectContent>
              {getFeeCategories().map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="details">Details</Label>
          <Textarea
            id="details"
            value={formData.details}
            onChange={(e) => setFormData({ ...formData, details: e.target.value })}
            placeholder="Additional information about this activity"
            rows={4}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading || !formData.activity_type || !formData.activity_classification}
            className="bg-gradient-to-r from-forest-600 to-nature-600 hover:from-forest-700 hover:to-nature-700"
          >
            {loading ? 'Creating...' : 'Create Activity'}
          </Button>
        </div>
      </form>

      {/* Fee Calculation Display */}
      {formData.activity_type && formData.activity_classification && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Fee Calculation</h3>
          <FeeCalculationCard
            fees={calculatedFees}
            activityType={formData.activity_classification}
            permitType={formData.activity_type}
            feeCategory={formData.fee_category}
          />
        </div>
      )}
    </div>
  );
}
