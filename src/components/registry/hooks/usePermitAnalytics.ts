import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PermitTypeAnalytics {
  permit_type: string;
  total: number;
  approved: number;
  rejected: number;
  pending: number;
  in_review: number;
  approval_rate: number;
}

export interface PermitAnalyticsSummary {
  totalApplications: number;
  totalApproved: number;
  totalRejected: number;
  totalPending: number;
  overallApprovalRate: number;
  byType: PermitTypeAnalytics[];
}

export function usePermitAnalytics() {
  const [analytics, setAnalytics] = useState<PermitAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all permit applications grouped by type and status
      const { data, error: fetchError } = await supabase
        .from('permit_applications')
        .select('permit_type, status')
        .not('permit_type', 'is', null);

      if (fetchError) throw fetchError;

      // Process the data to calculate analytics
      const typeMap = new Map<string, {
        total: number;
        approved: number;
        rejected: number;
        pending: number;
        in_review: number;
      }>();

      (data || []).forEach((app) => {
        const type = app.permit_type || 'Unknown';
        const existing = typeMap.get(type) || { total: 0, approved: 0, rejected: 0, pending: 0, in_review: 0 };
        
        existing.total++;
        
        switch (app.status) {
          case 'approved':
          case 'issued':
            existing.approved++;
            break;
          case 'rejected':
          case 'denied':
            existing.rejected++;
            break;
          case 'draft':
          case 'pending':
          case 'submitted':
            existing.pending++;
            break;
          case 'under_review':
          case 'under_initial_review':
          case 'under_technical_review':
            existing.in_review++;
            break;
          default:
            existing.pending++;
        }
        
        typeMap.set(type, existing);
      });

      // Convert to array with approval rates
      const byType: PermitTypeAnalytics[] = Array.from(typeMap.entries())
        .map(([permit_type, stats]) => {
          const decidedCount = stats.approved + stats.rejected;
          return {
            permit_type,
            ...stats,
            approval_rate: decidedCount > 0 ? (stats.approved / decidedCount) * 100 : 0
          };
        })
        .sort((a, b) => b.total - a.total);

      // Calculate totals
      const totalApplications = byType.reduce((sum, t) => sum + t.total, 0);
      const totalApproved = byType.reduce((sum, t) => sum + t.approved, 0);
      const totalRejected = byType.reduce((sum, t) => sum + t.rejected, 0);
      const totalPending = byType.reduce((sum, t) => sum + t.pending + t.in_review, 0);
      const totalDecided = totalApproved + totalRejected;
      const overallApprovalRate = totalDecided > 0 ? (totalApproved / totalDecided) * 100 : 0;

      setAnalytics({
        totalApplications,
        totalApproved,
        totalRejected,
        totalPending,
        overallApprovalRate,
        byType
      });
    } catch (err) {
      console.error('Error fetching permit analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return { analytics, loading, error, refetch: fetchAnalytics };
}
