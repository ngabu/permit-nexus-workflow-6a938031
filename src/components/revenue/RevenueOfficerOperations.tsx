import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useInvoices } from './hooks/useInvoices';
import { 
  DollarSign, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  FileText,
  Calendar,
  Target,
  Activity,
  ListChecks
} from 'lucide-react';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';

export function RevenueOfficerOperations() {
  const { invoices, loading } = useInvoices();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'today' | 'pending' | 'completed'>('today');

  // Today's tasks and metrics
  const today = new Date().toDateString();
  const todayPayments = (invoices || []).filter(inv => 
    inv.paid_date && new Date(inv.paid_date).toDateString() === today
  );
  const todayRevenue = todayPayments.reduce((sum, inv) => sum + inv.amount, 0);

  const pendingTasks = (invoices || []).filter(inv => 
    inv.payment_status === 'pending' || inv.payment_status === 'partially_paid'
  );

  const myAssignedInvoices = (invoices || []).filter(inv => inv.assigned_officer_id); // Would filter by current user
  const myPendingCount = myAssignedInvoices.filter(inv => 
    inv.payment_status !== 'paid'
  ).length;

  // Daily target (mock - would come from system settings)
  const dailyTarget = 50000;
  const targetProgress = (todayRevenue / dailyTarget) * 100;

  // Priority tasks
  const priorityTasks = [
    {
      id: 1,
      type: 'Follow-up Call',
      entity: 'Mining Corp Ltd',
      invoice: 'INV-2024-0123',
      amount: 15000,
      priority: 'high',
      dueDate: new Date(),
      icon: AlertTriangle
    },
    {
      id: 2,
      type: 'Payment Verification',
      entity: 'Development Co.',
      invoice: 'INV-2024-0124',
      amount: 8500,
      priority: 'medium',
      dueDate: new Date(),
      icon: CheckCircle
    },
    {
      id: 3,
      type: 'Invoice Generation',
      entity: 'Forestry Ltd',
      invoice: 'Pending',
      amount: 12000,
      priority: 'medium',
      dueDate: new Date(),
      icon: FileText
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Operations Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Daily Operations
          </CardTitle>
          <CardDescription>Your revenue collection tasks and activities for today</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6 border-b border-border">
            <Button
              variant={activeTab === 'today' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('today')}
              className="rounded-b-none"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Today's Tasks
            </Button>
            <Button
              variant={activeTab === 'pending' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('pending')}
              className="rounded-b-none"
            >
              <Clock className="w-4 h-4 mr-2" />
              Pending ({pendingTasks.length})
            </Button>
            <Button
              variant={activeTab === 'completed' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('completed')}
              className="rounded-b-none"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Completed ({todayPayments.length})
            </Button>
          </div>

          {/* Priority Tasks Section */}
          {activeTab === 'today' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <ListChecks className="w-5 h-5" />
                  Priority Tasks
                </h3>
                <Badge variant="secondary">{priorityTasks.length} tasks</Badge>
              </div>

              {priorityTasks.map((task) => {
                const Icon = task.icon;
                return (
                  <Card key={task.id} className="border-border hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`p-2 rounded-lg ${
                            task.priority === 'high' ? 'bg-red-100 dark:bg-red-900/20' :
                            task.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                            'bg-green-100 dark:bg-green-900/20'
                          }`}>
                            <Icon className={`w-5 h-5 ${
                              task.priority === 'high' ? 'text-red-600' :
                              task.priority === 'medium' ? 'text-yellow-600' :
                              'text-green-600'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-foreground">{task.type}</h4>
                              <Badge className={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">{task.entity}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-muted-foreground">Invoice: {task.invoice}</span>
                              <span className="font-semibold text-foreground">K{task.amount.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <Button size="sm">
                          Start Task
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Pending Tasks */}
          {activeTab === 'pending' && (
            <div className="space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse bg-muted rounded-lg h-20"></div>
                  ))}
                </div>
              ) : pendingTasks.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No pending tasks</p>
                </div>
              ) : (
                pendingTasks.slice(0, 10).map((invoice) => (
                  <Card key={invoice.id} className="border-border">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-foreground">{invoice.invoice_number}</h4>
                          <p className="text-sm text-muted-foreground">{invoice.entity?.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-foreground">K{invoice.amount.toLocaleString()}</p>
                          <Badge className="mt-1" variant="outline">
                            {invoice.payment_status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Completed Tasks */}
          {activeTab === 'completed' && (
            <div className="space-y-3">
              {todayPayments.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No payments processed today</p>
                </div>
              ) : (
                todayPayments.map((invoice) => (
                  <Card key={invoice.id} className="border-green-200 bg-green-50 dark:bg-green-950/20">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <div>
                            <h4 className="font-semibold text-foreground">{invoice.invoice_number}</h4>
                            <p className="text-sm text-muted-foreground">{invoice.entity?.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">K{invoice.amount.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            {invoice.paid_date && format(new Date(invoice.paid_date), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <div className="p-2 bg-primary/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Week's Revenue</p>
                <p className="text-xl font-bold text-foreground">K{(todayRevenue * 3.5).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Collection Rate</p>
                <p className="text-xl font-bold text-foreground">87.5%</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Processing Time</p>
                <p className="text-xl font-bold text-foreground">2.3 days</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
