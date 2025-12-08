import { format } from 'date-fns';

interface InspectionInvoiceData {
  inspectionId: string;
  inspectionType: string;
  scheduledDate: string;
  numberOfDays: number;
  accommodationCost: number;
  transportationCost: number;
  dailyAllowance: number;
  totalTravelCost: number;
  province: string;
  permitNumber: string;
  permitTitle: string;
  entityName: string;
  entityAddress?: string;
}

export const generateInspectionInvoiceNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INS-${year}-${random}`;
};

export const calculateInspectionInvoiceItems = (data: InspectionInvoiceData) => {
  const items: Array<{
    itemCode: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }> = [];

  if (data.accommodationCost > 0) {
    items.push({
      itemCode: 'INS-ACC',
      description: `Accommodation - ${data.numberOfDays} day(s) inspection in ${data.province || 'N/A'}`,
      quantity: 1,
      unitPrice: data.accommodationCost,
      totalPrice: data.accommodationCost
    });
  }

  if (data.transportationCost > 0) {
    items.push({
      itemCode: 'INS-TRN',
      description: `Transportation - ${data.inspectionType} inspection`,
      quantity: 1,
      unitPrice: data.transportationCost,
      totalPrice: data.transportationCost
    });
  }

  if (data.dailyAllowance > 0) {
    items.push({
      itemCode: 'INS-ALW',
      description: `Daily Allowance - ${data.numberOfDays} day(s)`,
      quantity: data.numberOfDays,
      unitPrice: data.dailyAllowance / data.numberOfDays,
      totalPrice: data.dailyAllowance
    });
  }

  return items;
};

export const formatInspectionInvoiceDetails = (data: InspectionInvoiceData) => {
  return {
    invoiceNumber: generateInspectionInvoiceNumber(),
    date: format(new Date(), 'dd/MM/yyyy'),
    yourRef: `INS-${data.inspectionType.toUpperCase().slice(0, 3)}`,
    contact: 'Kavau Diagoro, Manager Revenue',
    telephone: '(675) 3014665/3014614',
    email: 'revenuemanager@cepa.gov.pg',
    client: data.entityName,
    clientAddress: data.entityAddress || 'Papua New Guinea',
    permitNumber: data.permitNumber,
    permitTitle: data.permitTitle,
    inspectionType: data.inspectionType,
    scheduledDate: data.scheduledDate,
    province: data.province,
    numberOfDays: data.numberOfDays,
    items: calculateInspectionInvoiceItems(data),
    subtotal: data.totalTravelCost,
    gst: 0,
    totalInc: data.totalTravelCost,
    status: 'unpaid' as const
  };
};
