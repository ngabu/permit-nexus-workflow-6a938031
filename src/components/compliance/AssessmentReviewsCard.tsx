
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardCheck } from 'lucide-react';

export function AssessmentReviewsCard() {
  const assessmentReviews = [
    { assessment: 'ASS-2024-156', officer: 'Sarah Johnson', status: 'Pending Review', permit: 'MIN-2024-089' },
    { assessment: 'ASS-2024-157', officer: 'Mike Wilson', status: 'Approved', permit: 'LOG-2024-034' },
    { assessment: 'ASS-2024-158', officer: 'Lisa Brown', status: 'Needs Revision', permit: 'MAR-2024-012' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-forest-800 flex items-center">
          <ClipboardCheck className="w-5 h-5 mr-2" />
          Assessment Reviews
        </CardTitle>
        <CardDescription>Review and approve technical assessments from compliance officers</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {assessmentReviews.map((item, index) => (
          <div key={index} className="p-3 bg-forest-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <p className="font-medium text-forest-800">{item.assessment}</p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                item.status === 'Approved' ? 'bg-green-100 text-green-700' :
                item.status === 'Needs Revision' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {item.status}
              </span>
            </div>
            <p className="text-sm text-forest-600">Officer: {item.officer}</p>
            <p className="text-xs text-forest-500">Permit: {item.permit}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
