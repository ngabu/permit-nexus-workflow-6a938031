
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, RefreshCw, CheckCircle, AlertTriangle, Database } from 'lucide-react';

export function MyobReconciliationCard() {
  const syncItems = [
    {
      id: '1',
      type: 'Invoice',
      reference: 'INV-2024-001',
      amount: 15000,
      status: 'synced',
      lastSync: '2 hours ago'
    },
    {
      id: '2',
      type: 'Payment',
      reference: 'PAY-2024-025',
      amount: 8750,
      status: 'pending',
      lastSync: 'Not synced'
    },
    {
      id: '3',
      type: 'Invoice',
      reference: 'INV-2024-002',
      amount: 22500,
      status: 'error',
      lastSync: '1 day ago'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'synced': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'synced': return <CheckCircle className="w-3 h-3" />;
      case 'error': return <AlertTriangle className="w-3 h-3" />;
      default: return <RefreshCw className="w-3 h-3" />;
    }
  };

  return (
    <Card className="border-amber-200">
      <CardHeader>
        <CardTitle className="text-amber-800 flex items-center">
          <Database className="w-5 h-5 mr-2" />
          MYOB Integration
        </CardTitle>
        <CardDescription>Sync financial data with MYOB accounting system</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
          <div>
            <p className="font-medium text-amber-800">Sync Status</p>
            <p className="text-sm text-amber-600">Last full sync: 2 hours ago</p>
          </div>
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Connected
          </Badge>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-amber-700 text-sm">Recent Sync Activity</h4>
          {syncItems.map((item) => (
            <div key={item.id} className="p-3 border border-amber-200 rounded-lg bg-white">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-amber-800 text-sm">{item.type}: {item.reference}</p>
                  <p className="text-xs text-amber-600">K {item.amount.toLocaleString()}</p>
                </div>
                <Badge className={`${getStatusColor(item.status)} flex items-center gap-1 text-xs`}>
                  {getStatusIcon(item.status)}
                  {item.status}
                </Badge>
              </div>
              <p className="text-xs text-amber-500">{item.lastSync}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 border-amber-300 text-amber-700">
            <FileText className="w-4 h-4 mr-2" />
            View Logs
          </Button>
          <Button className="flex-1 bg-amber-600 hover:bg-amber-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
