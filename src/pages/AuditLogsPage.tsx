import { SimpleHeader } from '@/components/SimpleHeader';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuditLogs } from '@/components/audit-logs';

export default function AuditLogsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SimpleHeader />
      <main className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/admin')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
              <p className="text-muted-foreground mt-1">System-wide activity and change tracking</p>
            </div>
          </div>

          <AuditLogs />
        </div>
      </main>
    </div>
  );
}
