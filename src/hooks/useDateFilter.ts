import { useMemo } from 'react';
import { startOfMonth, startOfYear, subDays, subMonths, subYears, endOfYear } from 'date-fns';

export type DateFilterPeriod = 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'mtd' | 'ytd' | 'last-year' | 'all-time';

export interface DateFilterRange {
  start: Date;
  end: Date;
}

export function useDateFilter(period: DateFilterPeriod): DateFilterRange {
  return useMemo(() => {
    const now = new Date();
    
    switch (period) {
      case 'weekly':
        return { start: subDays(now, 7), end: now };
      case 'monthly':
        return { start: subDays(now, 30), end: now };
      case 'quarterly':
        return { start: subMonths(now, 3), end: now };
      case 'yearly':
        return { start: subYears(now, 1), end: now };
      case 'mtd':
        return { start: startOfMonth(now), end: now };
      case 'ytd':
        return { start: startOfYear(now), end: now };
      case 'last-year':
        return { start: startOfYear(subYears(now, 1)), end: endOfYear(subYears(now, 1)) };
      case 'all-time':
        return { start: new Date(2020, 0, 1), end: now };
      default:
        return { start: subDays(now, 30), end: now };
    }
  }, [period]);
}

export function filterByDateRange<T extends { created_at?: string | null }>(
  data: T[] | null | undefined,
  dateRange: DateFilterRange,
  dateField: keyof T = 'created_at' as keyof T
): T[] {
  if (!data) return [];
  
  return data.filter(item => {
    const dateValue = item[dateField];
    if (!dateValue || typeof dateValue !== 'string') return false;
    
    const itemDate = new Date(dateValue);
    return itemDate >= dateRange.start && itemDate <= dateRange.end;
  });
}
