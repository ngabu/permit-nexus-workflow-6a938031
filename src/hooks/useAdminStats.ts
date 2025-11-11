import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  publicUsers: number;
  staffUsers: number;
  adminUsers: number;
  superAdminUsers: number;
  totalApplications: number;
  draftApplications: number;
  submittedApplications: number;
  underReviewApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  totalTransactions: number;
  pendingTransactions: number;
  completedTransactions: number;
  totalRevenue: number;
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    publicUsers: 0,
    staffUsers: 0,
    adminUsers: 0,
    superAdminUsers: 0,
    totalApplications: 0,
    draftApplications: 0,
    submittedApplications: 0,
    underReviewApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    totalTransactions: 0,
    pendingTransactions: 0,
    completedTransactions: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user statistics
      const { data: userStats, error: userError } = await supabase
        .from('profiles')
        .select('user_type, is_active');

      if (userError) throw userError;

      // Fetch application statistics
      const { data: appStats, error: appError } = await supabase
        .from('permit_applications')
        .select('status');

      if (appError) throw appError;

      // Fetch financial transaction statistics
      const { data: transactionStats, error: transactionError } = await supabase
        .from('financial_transactions')
        .select('status, amount');

      if (transactionError) throw transactionError;

      // Calculate user statistics
      const totalUsers = userStats?.length || 0;
      const activeUsers = userStats?.filter(u => u.is_active).length || 0;
      const suspendedUsers = userStats?.filter(u => !u.is_active).length || 0;
      const publicUsers = userStats?.filter(u => u.user_type === 'public').length || 0;
      const staffUsers = userStats?.filter(u => u.user_type === 'staff').length || 0;
      const adminUsers = userStats?.filter(u => u.user_type === 'admin').length || 0;
      const superAdminUsers = userStats?.filter(u => u.user_type === 'super_admin').length || 0;

      // Calculate application statistics
      const totalApplications = appStats?.length || 0;
      const draftApplications = appStats?.filter(a => a.status === 'draft').length || 0;
      const submittedApplications = appStats?.filter(a => a.status === 'submitted').length || 0;
      const underReviewApplications = appStats?.filter(a => a.status === 'under_review').length || 0;
      const approvedApplications = appStats?.filter(a => a.status === 'approved').length || 0;
      const rejectedApplications = appStats?.filter(a => a.status === 'rejected').length || 0;

      // Calculate transaction statistics
      const totalTransactions = transactionStats?.length || 0;
      const pendingTransactions = transactionStats?.filter(t => t.status === 'pending').length || 0;
      const completedTransactions = transactionStats?.filter(t => t.status === 'completed').length || 0;
      const totalRevenue = transactionStats?.reduce((sum, t) => {
        if (t.status === 'completed') {
          return sum + (parseFloat(t.amount?.toString() || '0') || 0);
        }
        return sum;
      }, 0) || 0;

      setStats({
        totalUsers,
        activeUsers,
        suspendedUsers,
        publicUsers,
        staffUsers,
        adminUsers,
        superAdminUsers,
        totalApplications,
        draftApplications,
        submittedApplications,
        underReviewApplications,
        approvedApplications,
        rejectedApplications,
        totalTransactions,
        pendingTransactions,
        completedTransactions,
        totalRevenue,
      });
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, error, refetch: fetchStats };
}