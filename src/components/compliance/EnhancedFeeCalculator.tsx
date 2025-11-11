
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { usePrescribedActivities } from '@/hooks/usePrescribedActivities';
import { useFeeCalculation, FeeCalculationParams } from '@/hooks/useFeeCalculation';
import { useToast } from '@/hooks/use-toast';

export interface FeeComponent {
  component_id: string;
  component_name: string;
  fee_category: string;
  calculation_method: string;
  base_amount: number;
  calculated_amount: number;
  formula_used: string;
  is_mandatory: boolean;
  notes?: string;
}

interface EnhancedFeeCalculatorProps {
  onCalculationComplete?: (components: FeeComponent[], totalFee: number) => void;
  permitApplicationId?: string;
  initialParameters?: FeeCalculationParameters;
}

interface FeeCalculationParameters {
  activityType?: string;
  activitySubCategory?: string;
  permitType?: string;
  activityLevel?: string;
  prescribedActivityId?: string;
  projectCost?: number;
  landArea?: number;
  durationYears?: number;
  odsChemicalType?: string;
  wasteType?: string;
}

interface ValidationError {
  field: string;
  message: string;
}

export function EnhancedFeeCalculator({ 
  onCalculationComplete, 
  permitApplicationId,
  initialParameters = {}
}: EnhancedFeeCalculatorProps) {
  const [parameters, setParameters] = useState<FeeCalculationParameters>(initialParameters);
  const [feeComponents, setFeeComponents] = useState<FeeComponent[]>([]);
  const [totalFee, setTotalFee] = useState<number>(0);
  const [calculating, setCalculating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const { data: prescribedActivities, isLoading: activitiesLoading } = usePrescribedActivities();
  const { calculateFeesWithSupabase, validateParameters } = useFeeCalculation();
  const { toast } = useToast();

  // Activity types and levels
  const activityTypes = [
    { value: 'mining', label: 'Mining' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'construction', label: 'Construction' },
    { value: 'waste_management', label: 'Waste Management' },
    { value: 'energy', label: 'Energy' },
    { value: 'tourism', label: 'Tourism' },
    { value: 'forestry', label: 'Forestry' },
    { value: 'aquaculture', label: 'Aquaculture' },
    { value: 'other', label: 'Other' }
  ];

  const activityLevels = [
    { value: 'Level 1', label: 'Level 1' },
    { value: 'Level 2', label: 'Level 2' },
    { value: 'Level 3', label: 'Level 3' }
  ];

  const permitTypes = [
    { value: 'Environment Permit', label: 'Environment Permit' },
    { value: 'Water Permit', label: 'Water Permit' },
    { value: 'Waste Permit', label: 'Waste Permit' },
    { value: 'Air Permit', label: 'Air Permit' },
    { value: 'Mining Permit', label: 'Mining Permit' },
    { value: 'Industrial Permit', label: 'Industrial Permit' }
  ];

  const updateParameter = (key: keyof FeeCalculationParameters, value: any) => {
    setParameters(prev => ({ ...prev, [key]: value }));
    // Clear validation errors for this field
    setValidationErrors(prev => prev.filter(error => error.field !== key));
  };

  const validateInputParameters = (): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (!parameters.activityType) {
      errors.push({ field: 'activityType', message: 'Activity type is required' });
    }

    if (!parameters.permitType) {
      errors.push({ field: 'permitType', message: 'Permit type is required' });
    }

    if (!parameters.activityLevel) {
      errors.push({ field: 'activityLevel', message: 'Activity level is required' });
    }

    if (!parameters.prescribedActivityId) {
      errors.push({ field: 'prescribedActivityId', message: 'Prescribed activity must be selected' });
    }

    return errors;
  };

  const calculateFees = async () => {
    console.log('Starting enhanced fee calculation with parameters:', parameters);
    
    // Validate required parameters
    const errors = validateInputParameters();
    if (errors.length > 0) {
      setValidationErrors(errors);
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields before calculating fees.",
        variant: "destructive"
      });
      return;
    }

    setCalculating(true);
    setCalculationError(null);
    setValidationErrors([]);

    try {
      // Convert to FeeCalculationParams format
      const feeParams: FeeCalculationParams = {
        activityType: parameters.activityType!,
        activitySubCategory: parameters.activitySubCategory || 'general',
        permitType: parameters.permitType!,
        activityLevel: parameters.activityLevel!,
        projectCost: parameters.projectCost,
        landArea: parameters.landArea,
        durationYears: parameters.durationYears,
        odsDetails: parameters.odsChemicalType && parameters.odsChemicalType !== 'none' 
          ? { chemicalType: parameters.odsChemicalType, quantity: 1 } 
          : undefined,
        wasteDetails: parameters.wasteType && parameters.wasteType !== 'none' 
          ? { type: parameters.wasteType, quantity: 1 } 
          : undefined
      };

      console.log('Calling calculateFeesWithSupabase with params:', feeParams);
      
      // Use the main fee calculation function
      const calculatedFees = await calculateFeesWithSupabase(feeParams);
      
      if (!calculatedFees) {
        throw new Error('No fee calculation result returned');
      }

      console.log('Fee calculation result:', calculatedFees);

      // Convert the result to FeeComponent format
      const components: FeeComponent[] = [
        {
          component_id: 'administration-fee',
          component_name: 'Administration Fee',
          fee_category: 'Administrative',
          calculation_method: calculatedFees.source === 'official' ? 'Official Rate' : 'Estimated',
          base_amount: calculatedFees.administrationFee,
          calculated_amount: calculatedFees.administrationFee,
          formula_used: calculatedFees.administrationForm,
          is_mandatory: true,
          notes: `Processing time: ${calculatedFees.processingDays} days`
        },
        {
          component_id: 'technical-fee',
          component_name: 'Technical Fee',
          fee_category: 'Technical',
          calculation_method: calculatedFees.source === 'official' ? 'Official Rate' : 'Estimated',
          base_amount: calculatedFees.technicalFee,
          calculated_amount: calculatedFees.technicalFee,
          formula_used: calculatedFees.technicalForm,
          is_mandatory: true,
          notes: `Based on ${parameters.activityLevel} assessment requirements`
        }
      ];

      // Add additional fee components based on parameters
      if (parameters.projectCost && parameters.projectCost > 1000000) {
        const surcharge = calculatedFees.totalFee * 0.1; // 10% surcharge for large projects
        components.push({
          component_id: 'project-cost-surcharge',
          component_name: 'Large Project Surcharge',
          fee_category: 'Project-based',
          calculation_method: 'Percentage',
          base_amount: surcharge,
          calculated_amount: surcharge,
          formula_used: '10% of base fee for projects > K1,000,000',
          is_mandatory: true,
          notes: `Applied to project cost of K${parameters.projectCost.toLocaleString()}`
        });
      }

      if (parameters.landArea && parameters.landArea > 5000) {
        const areaSurcharge = Math.ceil(parameters.landArea / 1000) * 500; // K500 per 1000 sqm
        components.push({
          component_id: 'land-area-surcharge',
          component_name: 'Large Area Surcharge',
          fee_category: 'Area-based',
          calculation_method: 'Tiered',
          base_amount: areaSurcharge,
          calculated_amount: areaSurcharge,
          formula_used: 'K500 per 1000 sqm above 5000 sqm',
          is_mandatory: true,
          notes: `Applied to land area of ${parameters.landArea} sqm`
        });
      }

      // Calculate total from components
      const total = components.reduce((sum, comp) => sum + comp.calculated_amount, 0);

      setFeeComponents(components);
      setTotalFee(total);

      // Notify parent component
      if (onCalculationComplete) {
        onCalculationComplete(components, total);
      }

      toast({
        title: "Fee Calculation Complete",
        description: `Total fee calculated: K${total.toLocaleString()} (${calculatedFees.source === 'official' ? 'Official' : 'Estimated'})`,
      });

    } catch (error: any) {
      console.error('Enhanced fee calculation error:', error);
      setCalculationError(error.message || 'An unexpected error occurred during fee calculation');
      toast({
        title: "Calculation Error",
        description: error.message || 'Failed to calculate fees',
        variant: "destructive"
      });
    } finally {
      setCalculating(false);
    }
  };

  const getTierDescription = (landArea: number): string => {
    if (landArea <= 1000) return 'Tier 1 (≤1,000 sqm)';
    if (landArea <= 5000) return 'Tier 2 (1,001–5,000 sqm)';
    return 'Tier 3 (>5,000 sqm)';
  };

  const getValidationErrorForField = (field: string): string | undefined => {
    return validationErrors.find(error => error.field === field)?.message;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Enhanced Fee Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Validation Errors Alert */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {validationErrors.map((error, index) => (
                    <div key={index}>• {error.message}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Calculation Error Alert */}
          {calculationError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{calculationError}</AlertDescription>
            </Alert>
          )}

          {/* Required Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="activityType">Activity Type *</Label>
              <Select 
                value={parameters.activityType || ''} 
                onValueChange={(value) => updateParameter('activityType', value)}
              >
                <SelectTrigger className={getValidationErrorForField('activityType') ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select activity type" />
                </SelectTrigger>
                <SelectContent>
                  {activityTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getValidationErrorForField('activityType') && (
                <p className="text-sm text-destructive">{getValidationErrorForField('activityType')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="permitType">Permit Type *</Label>
              <Select 
                value={parameters.permitType || ''} 
                onValueChange={(value) => updateParameter('permitType', value)}
              >
                <SelectTrigger className={getValidationErrorForField('permitType') ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select permit type" />
                </SelectTrigger>
                <SelectContent>
                  {permitTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getValidationErrorForField('permitType') && (
                <p className="text-sm text-destructive">{getValidationErrorForField('permitType')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="activityLevel">Activity Level *</Label>
              <Select 
                value={parameters.activityLevel || ''} 
                onValueChange={(value) => updateParameter('activityLevel', value)}
              >
                <SelectTrigger className={getValidationErrorForField('activityLevel') ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select activity level" />
                </SelectTrigger>
                <SelectContent>
                  {activityLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getValidationErrorForField('activityLevel') && (
                <p className="text-sm text-destructive">{getValidationErrorForField('activityLevel')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="prescribedActivity">Prescribed Activity *</Label>
              <Select
                value={parameters.prescribedActivityId || ''}
                onValueChange={(value) => {
                  const activity = prescribedActivities?.find(a => a.id === value);
                  updateParameter('prescribedActivityId', value);
                  updateParameter('activitySubCategory', activity?.activity_description || '');
                }}
              >
                <SelectTrigger className={getValidationErrorForField('prescribedActivityId') ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select prescribed activity" />
                </SelectTrigger>
                <SelectContent>
                  {prescribedActivities?.filter(activity => activity.id && activity.id.trim() !== '').map((activity) => (
                    <SelectItem key={activity.id} value={activity.id}>
                      {activity.category_number} - {activity.activity_description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getValidationErrorForField('prescribedActivityId') && (
                <p className="text-sm text-destructive">{getValidationErrorForField('prescribedActivityId')}</p>
              )}
            </div>
          </div>

          {/* Optional Parameters */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Optional Parameters (affect final calculation)</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectCost">Project Cost (Kina)</Label>
                <Input
                  id="projectCost"
                  type="number"
                  placeholder="Enter project cost"
                  value={parameters.projectCost || ''}
                  onChange={(e) => updateParameter('projectCost', parseFloat(e.target.value) || undefined)}
                />
                <p className="text-sm text-muted-foreground">Projects &gt; K1,000,000 incur additional fees</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="landArea">Land Area (sqm)</Label>
                <Input
                  id="landArea"
                  type="number"
                  placeholder="Enter land area"
                  value={parameters.landArea || ''}
                  onChange={(e) => updateParameter('landArea', parseFloat(e.target.value) || undefined)}
                />
                {parameters.landArea && (
                  <p className="text-sm text-muted-foreground">
                    {getTierDescription(parameters.landArea)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="durationYears">Duration (Years)</Label>
                <Input
                  id="durationYears"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={parameters.durationYears || 1}
                  onChange={(e) => updateParameter('durationYears', parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            {/* Special Fees */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="odsChemicalType">ODS Chemical Type</Label>
                <Select
                  value={parameters.odsChemicalType || 'none'}
                  onValueChange={(value) => updateParameter('odsChemicalType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select if applicable" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="CFC">CFC (Chlorofluorocarbons)</SelectItem>
                    <SelectItem value="HCFC">HCFC (Hydrochlorofluorocarbons)</SelectItem>
                    <SelectItem value="HFC">HFC (Hydrofluorocarbons)</SelectItem>
                    <SelectItem value="Halons">Halons</SelectItem>
                    <SelectItem value="other">Other ODS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wasteType">Waste Type</Label>
                <Select
                  value={parameters.wasteType || 'none'}
                  onValueChange={(value) => updateParameter('wasteType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select if applicable" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="hazardous">Hazardous Waste</SelectItem>
                    <SelectItem value="industrial">Industrial Waste</SelectItem>
                    <SelectItem value="chemical">Chemical Waste</SelectItem>
                    <SelectItem value="medical">Medical Waste</SelectItem>
                    <SelectItem value="radioactive">Radioactive Waste</SelectItem>
                    <SelectItem value="other">Other Waste</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Calculate Button */}
          <Button 
            onClick={calculateFees} 
            disabled={calculating || activitiesLoading}
            className="w-full"
          >
            {calculating ? 'Calculating...' : 'Calculate Fees'}
          </Button>

          {/* Fee Breakdown */}
          {feeComponents.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Fee Breakdown
              </h4>
              
              <div className="space-y-3">
                {feeComponents.map((component, index) => (
                  <Card key={component.component_id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium">{component.component_name}</h5>
                          <Badge variant={component.is_mandatory ? "default" : "secondary"}>
                            {component.is_mandatory ? "Mandatory" : "Optional"}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>Category: {component.fee_category}</div>
                          <div>Method: {component.calculation_method}</div>
                          <div>Formula: {component.formula_used}</div>
                          {component.base_amount !== component.calculated_amount && (
                            <div>Base Amount: K{component.base_amount.toLocaleString()}</div>
                          )}
                          {component.notes && (
                            <div className="flex items-start gap-1">
                              <Info className="h-3 w-3 mt-0.5" />
                              <span>{component.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-semibold">
                          K{component.calculated_amount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Total */}
              <Card className="p-4 bg-primary/5 border-primary/20">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-semibold">Total Fee</h4>
                  <div className="text-2xl font-bold text-primary">
                    K{totalFee.toLocaleString()}
                  </div>
                </div>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
