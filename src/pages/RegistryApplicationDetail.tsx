import { useParams } from 'react-router-dom';
import { SimpleHeader } from '@/components/SimpleHeader';
import { RegistryPermitReviewTabs } from '@/components/registry/RegistryPermitReviewTabs';

export default function RegistryApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return (
      <div className="min-h-screen bg-background">
        <SimpleHeader />
        <div className="container mx-auto p-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">No assessment ID provided</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <SimpleHeader />
      <div className="container mx-auto p-6">
        <RegistryPermitReviewTabs assessmentId={id} />
      </div>
    </div>
  );
}