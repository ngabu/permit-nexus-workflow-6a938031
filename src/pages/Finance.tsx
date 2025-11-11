import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, FileText, TrendingUp, AlertTriangle } from 'lucide-react';

export default function Finance() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-amber-800">Finance Unit</h1>
            <p className="text-amber-600 mt-1">Financial operations and accounting tasks</p>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 bg-amber-100 rounded-lg">
            <Calculator className="w-5 h-5 text-amber-600" />
            <span className="text-amber-800 font-medium">Finance Officer</span>
          </div>
        </div>

        {/* Officer Tasks */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-amber-200">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Calculator className="w-5 h-5 text-amber-600" />
                <CardTitle className="text-amber-800">Financial Processing</CardTitle>
              </div>
              <CardDescription>Process financial transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-amber-600">Financial transaction processing and validation tools will be implemented here.</p>
            </CardContent>
          </Card>

          <Card className="border-amber-200">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-amber-600" />
                <CardTitle className="text-amber-800">Record Keeping</CardTitle>
              </div>
              <CardDescription>Maintain financial records</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-amber-600">Financial record keeping and documentation systems will be available here.</p>
            </CardContent>
          </Card>

          <Card className="border-amber-200">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-amber-600" />
                <CardTitle className="text-amber-800">Account Reconciliation</CardTitle>
              </div>
              <CardDescription>Reconcile accounts and balances</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-amber-600">Account reconciliation tools and procedures coming soon.</p>
            </CardContent>
          </Card>
        </div>

        {/* Additional section */}
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-800">Finance Officer Operations</CardTitle>
            <CardDescription>Daily financial processing and accounting tasks</CardDescription>
          </CardHeader>
          <CardContent className="py-8">
            <div className="text-center text-amber-600">
              <Calculator className="w-16 h-16 mx-auto mb-4 text-amber-400" />
              <h3 className="text-lg font-semibold mb-2">Finance Operations</h3>
              <p>This interface will provide finance officers with tools for transaction processing, record keeping, and account reconciliation.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}