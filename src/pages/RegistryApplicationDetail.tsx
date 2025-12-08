import { useParams, useNavigate } from 'react-router-dom';
import { SimpleHeader } from '@/components/SimpleHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function RegistryApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  if (!id) {
    return (
      <div className="min-h-screen bg-background">
        <SimpleHeader />
        <div className="container mx-auto p-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">No application ID provided</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <SimpleHeader />
      <div className="container mx-auto p-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/registry')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Registry Dashboard
        </Button>
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">
              Application review workflow has been updated. Please use the Registry Dashboard to manage applications.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}