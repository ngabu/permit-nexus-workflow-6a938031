
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, AlertCircle, CheckCircle, Clock, DollarSign } from 'lucide-react';

export function BankReconciliationCard() {
  const unreconciledItems = [
    {
      id: '1',
      date: '2024-01-15',
      description: 'PNG Mining Corp - Payment',
      amount: 12500,
      status: 'unmatched',
      bankRef: 'TXN001234'
    },
    {
      id: '2',
      date: '2024-01-14',
      description: 'Forestry License Fee',
      amount: 8750,
      status: 'matched',
      bankRef: 'TXN001235'
    },
    {
      id: '3',
      date: '2024-01-13',
      description: 'Marine Permit Payment',
      amount: 3200,
      status: 'unmatched',
      bankRef: 'TXN001236'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'matched': return 'bg-green-100 text-green-800';
      case 'unmatched': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'matched': return <CheckCircle className="w-3 h-3" />;
      case 'unmatched': return <AlertCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <Card className="border-amber-200">
      <CardHeader>
        <CardTitle className="text-amber-800 flex items-center">
          <Building2 className="w-5 h-5 mr-2" />
          Bank Reconciliation
        </CardTitle>
        <CardDescription>Match bank transactions with invoice payments</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
          <div>
            <p className="font-medium text-amber-800">Reconciliation Status</p>
            <p className="text-sm text-amber-600">Last updated: 2 hours ago</p>
          </div>
          <Badge className="bg-yellow-100 text-yellow-800">
            3 pending
          </Badge>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-amber-700 text-sm">Recent Transactions</h4>
          {unreconciledItems.map((item) => (
            <div key={item.id} className="p-3 border border-amber-200 rounded-lg bg-white">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-amber-800 text-sm">{item.description}</p>
                  <p className="text-xs text-amber-600">{item.bankRef} • {item.date}</p>
                </div>
                <Badge className={`${getStatusColor(item.status)} flex items-center gap-1 text-xs`}>
                  {getStatusIcon(item.status)}
                  {item.status}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-amber-800">K {item.amount.toLocaleString()}</span>
                {item.status === 'unmatched' && (
                  <Button size="sm" variant="outline" className="text-xs border-amber-300 text-amber-700">
                    Match
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <Button className="w-full bg-amber-600 hover:bg-amber-700">
          <Building2 className="w-4 h-4 mr-2" />
          Open Reconciliation Tool
        </Button>
      </CardContent>
    </Card>
  );
}
