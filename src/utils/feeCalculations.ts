
export interface FeeCalculationParams {
  annualRecurrentFee: number;
  processingDays: number;
  applicationType: string;
  category: string;
  workPlanAmount?: number;
}

export interface FeeBreakdown {
  administrationFee: number;
  technicalFee: number;
  totalFee: number;
  formNumber: string;
  additionalForm: string;
}

export const calculateFees = (params: FeeCalculationParams): FeeBreakdown => {
  const { annualRecurrentFee, processingDays, applicationType, workPlanAmount = 15500 } = params;
  
  // Administration Fee Calculation (Part II, Section 2)
  const administrationFee = (annualRecurrentFee / 365) * processingDays;
  
  // Technical Fee (Part III, Sections 6-13)
  const technicalFee = workPlanAmount;
  
  // Total Fee
  const totalFee = administrationFee + technicalFee;
  
  // Form Numbers
  const formMap: Record<string, string> = {
    'new': 'Form 9',
    'compliance': 'Form 5',
    'enforcement': 'Form 6',
    'amalgamation': 'Form 7',
    'amendment': 'Form 8',
    'renewal': 'Form 10',
    'transfer': 'Form 11',
    'surrender': 'Form 12'
  };
  
  return {
    administrationFee,
    technicalFee,
    totalFee,
    formNumber: 'Form 2', // Administration fee form
    additionalForm: formMap[applicationType] || 'Form 2'
  };
};

export const getFeeCategory = (category: string): { multiplier: number; description: string } => {
  const categoryMap: Record<string, { multiplier: number; description: string }> = {
    'Red Category': {
      multiplier: 1.5,
      description: 'High impact projects requiring comprehensive EIA'
    },
    'Orange Category': {
      multiplier: 1.2,
      description: 'Medium impact projects requiring environmental clearance'
    },
    'Green Category': {
      multiplier: 1.0,
      description: 'Low impact projects with minimal requirements'
    }
  };
  
  return categoryMap[category] || categoryMap['Green Category'];
};

export const getProcessingDaysEstimate = (applicationType: string, category: string): number => {
  const baseDays: Record<string, number> = {
    'new': 86,
    'amendment': 30,
    'transfer': 21,
    'amalgamation': 45,
    'compliance': 14,
    'renewal': 21,
    'surrender': 14,
    'enforcement': 30
  };
  
  const categoryMultiplier = getFeeCategory(category).multiplier;
  const baseDaysForType = baseDays[applicationType] || 30;
  
  return Math.ceil(baseDaysForType * categoryMultiplier);
};

export const validateFeePayment = (application: any): { isValid: boolean; missingDocuments: string[] } => {
  const requiredDocuments = [
    'Signed Fee Notice',
    'CEPA Common Seal',
    'Managing Director Signature',
    'Work Plan Documentation'
  ];
  
  const missingDocuments = requiredDocuments.filter(doc => 
    !application.documents?.some((appDoc: any) => appDoc.type === doc)
  );
  
  return {
    isValid: missingDocuments.length === 0,
    missingDocuments
  };
};
