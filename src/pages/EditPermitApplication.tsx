import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ComprehensivePermitForm } from '@/components/public/ComprehensivePermitForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function EditPermitApplication() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const handleSuccess = () => {
    navigate('/dashboard', { state: { activeTab: 'permits' } });
  };

  const handleCancel = () => {
    navigate('/dashboard', { state: { activeTab: 'permits' } });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Permit Management
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Permit Application</CardTitle>
          </CardHeader>
          <CardContent>
            <ComprehensivePermitForm
              permitId={id}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
