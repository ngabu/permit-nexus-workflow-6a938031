import { useParams, useNavigate } from 'react-router-dom';
import { SimpleHeader } from "@/components/SimpleHeader";
import { ComprehensiveAssessmentForm } from '@/components/compliance/ComprehensiveAssessmentForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ComplianceAssessmentDetail() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/ComplianceDashboard');
  };

  if (!assessmentId) {
    return (
      <div className="min-h-screen bg-background">
        <SimpleHeader />
        <div className="container mx-auto p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive">Assessment Not Found</h1>
            <p className="text-muted-foreground mt-2">The requested assessment could not be found.</p>
            <Button onClick={handleBack} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SimpleHeader />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Compliance Assessment Review
            </h1>
            <p className="text-muted-foreground">
              Conduct comprehensive technical assessment for environmental permit
            </p>
          </div>
        </div>

        <ComprehensiveAssessmentForm 
          assessmentId={assessmentId}
          onComplete={() => navigate('/ComplianceDashboard')}
        />
      </div>
    </div>
  );
}