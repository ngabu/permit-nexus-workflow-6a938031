
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

export function FinancialSummaryCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="border-amber-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-amber-700">Total Revenue (MTD)</CardTitle>
          <DollarSign className="h-4 w-4 text-amber-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-800">K 584,200</div>
          <div className="flex items-center text-xs text-green-600">
            <TrendingUp className="w-3 h-3 mr-1" />
            +12.5% from last month
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-amber-700">Payments Processed</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-800">156</div>
          <div className="text-xs text-amber-600">
            K 425,800 total value
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-amber-700">Unreconciled Items</CardTitle>
          <AlertCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-800">23</div>
          <div className="flex items-center">
            <Badge className="bg-red-100 text-red-700 text-xs">
              K 12,450 value
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-amber-700">MYOB Sync Status</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-green-700">Up to Date</div>
          <div className="text-xs text-amber-600">
            Last sync: 2 hours ago
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
