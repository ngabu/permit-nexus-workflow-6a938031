import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileCheck, AlertTriangle, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface RegistryItem {
  id: string;
  type: string;
  priority: 'High' | 'Medium' | 'Low';
  days: number;
  permit_number?: string;
}

interface ComplianceItem {
  company: string;
  issue: string;
  severity: 'Critical' | 'High' | 'Medium';
  date: string;
}

export function StaffOperationalSections() {
  const [registryItems, setRegistryItems] = useState<RegistryItem[]>([]);
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([]);
  const [financeStats, setFinanceStats] = useState({
    monthlyTarget: 250000,
    currentMonth: 0,
    outstandingPayments: { overdue: { amount: 0, count: 0 }, dueSoon: { amount: 0, count: 0 } }
  });

  useEffect(() => {
    const fetchRegistryQueue = async () => {
      try {
        const { data } = await supabase
          .from('permit_applications')
          .select('id, title, permit_type, permit_number, status, created_at')
          .in('status', ['submitted', 'under_review'])
          .order('created_at', { ascending: true })
          .limit(4);

        const items = (data || []).map(app => {
          const daysSinceSubmission = Math.floor(
            (Date.now() - new Date(app.created_at).getTime()) / (1000 * 60 * 60 * 24)
          );
          
          return {
            id: app.permit_number || app.id.slice(0, 8),
            type: app.permit_type || 'Permit Application',
            priority: daysSinceSubmission > 7 ? 'High' : daysSinceSubmission > 3 ? 'Medium' : 'Low',
            days: daysSinceSubmission,
            permit_number: app.permit_number
          };
        });

        setRegistryItems(items as RegistryItem[]);
      } catch (error) {
        console.error('Error fetching registry queue:', error);
      }
    };

    const fetchComplianceIssues = async () => {
      try {
        const { data } = await supabase
          .from('permit_assessments')
          .select(`
            assessment_date,
            requires_eia,
            requires_workplan,
            recommendations,
            permit_applications!inner (
              entity_name,
              permit_type
            )
          `)
          .eq('requires_eia', true)
          .order('assessment_date', { ascending: false })
          .limit(3);

        const issues = (data || []).map((assessment, index) => ({
          company: assessment.permit_applications.entity_name || `Entity ${index + 1}`,
          issue: assessment.requires_workplan ? 'Workplan Required' : 'EIA Assessment Required',
          severity: assessment.requires_eia && assessment.requires_workplan ? 'Critical' : 'High',
          date: new Date(assessment.assessment_date).toISOString().split('T')[0]
        }));

        setComplianceItems(issues as ComplianceItem[]);
      } catch (error) {
        console.error('Error fetching compliance issues:', error);
      }
    };

    const fetchFinanceStats = async () => {
      try {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        // Get current month revenue
        const { data: currentRevenue } = await supabase
          .from('financial_transactions')
          .select('amount')
          .eq('status', 'completed')
          .gte('created_at', new Date(currentYear, currentMonth, 1).toISOString())
          .lt('created_at', new Date(currentYear, currentMonth + 1, 1).toISOString());

        // Get outstanding payments
        const { data: overduePayments } = await supabase
          .from('financial_transactions')
          .select('amount')
          .eq('status', 'pending')
          .lt('due_date', new Date().toISOString());

        const { data: dueSoonPayments } = await supabase
          .from('financial_transactions')
          .select('amount')
          .eq('status', 'pending')
          .gte('due_date', new Date().toISOString())
          .lt('due_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());

        const currentMonthTotal = currentRevenue?.reduce((sum, t) => sum + (parseFloat(t.amount?.toString() || '0') || 0), 0) || 0;
        const overdueTotal = overduePayments?.reduce((sum, t) => sum + (parseFloat(t.amount?.toString() || '0') || 0), 0) || 0;
        const dueSoonTotal = dueSoonPayments?.reduce((sum, t) => sum + (parseFloat(t.amount?.toString() || '0') || 0), 0) || 0;

        setFinanceStats({
          monthlyTarget: 250000,
          currentMonth: currentMonthTotal,
          outstandingPayments: {
            overdue: { amount: overdueTotal, count: overduePayments?.length || 0 },
            dueSoon: { amount: dueSoonTotal, count: dueSoonPayments?.length || 0 }
          }
        });
      } catch (error) {
        console.error('Error fetching finance stats:', error);
      }
    };

    fetchRegistryQueue();
    fetchComplianceIssues();
    fetchFinanceStats();
  }, []);

  const progressPercentage = Math.min(100, (financeStats.currentMonth / financeStats.monthlyTarget) * 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Registry Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-forest-800 flex items-center">
            <FileCheck className="w-5 h-5 mr-2" />
            Registry
          </CardTitle>
          <CardDescription>Application processing queue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {registryItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-forest-50 rounded-lg">
              <div>
                <p className="font-medium text-forest-800">{item.id}</p>
                <p className="text-sm text-forest-600">{item.type}</p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.priority === 'High' ? 'bg-red-100 text-red-700' :
                  item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {item.priority}
                </span>
                <p className="text-xs text-forest-500 mt-1">{item.days} days</p>
              </div>
            </div>
          ))}
          {registryItems.length === 0 && (
            <p className="text-center text-forest-500 py-4">No pending applications</p>
          )}
        </CardContent>
      </Card>

      {/* Compliance Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle className="text-forest-800 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Compliance
          </CardTitle>
          <CardDescription>Environmental compliance tracking</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {complianceItems.map((item, index) => (
            <div key={index} className="p-3 border border-forest-100 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <p className="font-medium text-forest-800">{item.company}</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                  item.severity === 'High' ? 'bg-orange-100 text-orange-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {item.severity}
                </span>
              </div>
              <p className="text-sm text-forest-600">{item.issue}</p>
              <p className="text-xs text-forest-500 mt-1">{item.date}</p>
            </div>
          ))}
          {complianceItems.length === 0 && (
            <p className="text-center text-forest-500 py-4">No compliance issues</p>
          )}
        </CardContent>
      </Card>

      {/* Finance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-forest-800 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Finance
          </CardTitle>
          <CardDescription>Revenue and payment tracking</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-forest-600">Monthly Target</span>
              <span className="font-medium text-forest-800">K{Math.round(financeStats.monthlyTarget / 1000)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-forest-600">Current Month</span>
              <span className="font-medium text-green-600">K{Math.round(financeStats.currentMonth / 1000)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 bg-green-500 rounded-full transition-all duration-300" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-forest-500">{progressPercentage.toFixed(0)}% of monthly target achieved</p>
          </div>
          
          <div className="pt-4 border-t border-forest-100 space-y-2">
            <h4 className="font-medium text-forest-800">Outstanding Payments</h4>
            <div className="flex justify-between items-center">
              <span className="text-sm text-forest-600">
                Overdue ({financeStats.outstandingPayments.overdue.count})
              </span>
              <span className="font-medium text-forest-800">
                K{Math.round(financeStats.outstandingPayments.overdue.amount / 1000)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-forest-600">
                Due Soon ({financeStats.outstandingPayments.dueSoon.count})
              </span>
              <span className="font-medium text-forest-800">
                K{Math.round(financeStats.outstandingPayments.dueSoon.amount / 1000)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}