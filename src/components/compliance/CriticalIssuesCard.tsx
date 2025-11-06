
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export function CriticalIssuesCard() {
  const criticalIssues = [
    { company: 'TropicMining Ltd', issue: 'Excessive Emission Levels', severity: 'Critical', site: 'Site A-12', date: '2024-01-20' },
    { company: 'ForestCorp PNG', issue: 'Unauthorized Waste Disposal', severity: 'High', site: 'Site B-07', date: '2024-01-18' },
    { company: 'Coastal Mining', issue: 'Water Contamination', severity: 'Critical', site: 'Site C-03', date: '2024-01-17' },
    { company: 'Timber Solutions', issue: 'Habitat Destruction', severity: 'High', site: 'Site D-15', date: '2024-01-15' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-forest-800 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          Critical Compliance Issues
        </CardTitle>
        <CardDescription>High-priority violations requiring immediate action</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {criticalIssues.map((item, index) => (
          <div key={index} className="p-3 border border-red-200 bg-red-50 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium text-forest-800">{item.company}</p>
                <p className="text-sm text-forest-600">{item.site}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                item.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                'bg-orange-100 text-orange-700'
              }`}>
                {item.severity}
              </span>
            </div>
            <p className="text-sm text-forest-700 font-medium">{item.issue}</p>
            <p className="text-xs text-forest-500 mt-1">Reported: {item.date}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
