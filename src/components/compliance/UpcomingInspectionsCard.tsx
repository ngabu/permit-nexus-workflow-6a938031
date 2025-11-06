
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export function UpcomingInspectionsCard() {
  const upcomingInspections = [
    { company: 'Gold Rush PNG', type: 'Environmental Audit', inspector: 'Sarah Johnson', date: '2024-01-25', site: 'Site E-08' },
    { company: 'Green Mining Co', type: 'Safety Inspection', inspector: 'Mike Wilson', date: '2024-01-26', site: 'Site F-12' },
    { company: 'Ocean Resources', type: 'Water Quality Check', inspector: 'Lisa Brown', date: '2024-01-27', site: 'Site G-04' },
    { company: 'Sustainable Timber', type: 'Forest Assessment', inspector: 'John Davis', date: '2024-01-28', site: 'Site H-09' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-forest-800 flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Upcoming Inspections
        </CardTitle>
        <CardDescription>Scheduled compliance inspections and site visits</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingInspections.map((item, index) => (
          <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium text-forest-800">{item.company}</p>
                <p className="text-sm text-forest-600">{item.site}</p>
              </div>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                Scheduled
              </span>
            </div>
            <p className="text-sm text-forest-700">{item.type}</p>
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-forest-500">Inspector: {item.inspector}</p>
              <p className="text-xs font-medium text-forest-600">{item.date}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
