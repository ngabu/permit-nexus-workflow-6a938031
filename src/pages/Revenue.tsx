import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, FileText, Clock, AlertTriangle } from 'lucide-react';

export default function Revenue() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-emerald-800">Revenue Unit</h1>
            <p className="text-emerald-600 mt-1">Revenue collection and management operations</p>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-100 rounded-lg">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <span className="text-emerald-800 font-medium">Revenue Officer</span>
          </div>
        </div>

        {/* Officer Tasks */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-emerald-200">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <CardTitle className="text-emerald-800">Payment Processing</CardTitle>
              </div>
              <CardDescription>Process and verify payments</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-emerald-600">Payment processing tools and verification systems will be implemented here.</p>
            </CardContent>
          </Card>

          <Card className="border-emerald-200">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <CardTitle className="text-emerald-800">Invoice Management</CardTitle>
              </div>
              <CardDescription>Manage invoices and billing</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-emerald-600">Invoice creation and management tools will be available here.</p>
            </CardContent>
          </Card>

          <Card className="border-emerald-200">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                <CardTitle className="text-emerald-800">Outstanding Payments</CardTitle>
              </div>
              <CardDescription>Track overdue payments</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-emerald-600">Outstanding payment tracking and follow-up tools coming soon.</p>
            </CardContent>
          </Card>
        </div>

        {/* Additional section */}
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-800">Revenue Officer Operations</CardTitle>
            <CardDescription>Daily revenue collection and processing tasks</CardDescription>
          </CardHeader>
          <CardContent className="py-8">
            <div className="text-center text-emerald-600">
              <DollarSign className="w-16 h-16 mx-auto mb-4 text-emerald-400" />
              <h3 className="text-lg font-semibold mb-2">Revenue Operations</h3>
              <p>This interface will provide revenue officers with tools for payment processing, invoice management, and collections.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}