
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Calendar, FileText, Forward, Eye } from 'lucide-react';
import { PermitForAssessment, RegistryStaff } from './types';
import { useState } from 'react';

interface PermitAssessmentCardProps {
  permit: PermitForAssessment;
  isManager: boolean;
  staff: RegistryStaff[];
  onAssign: (permitId: string, officerId: string) => void;
  onAssess: (permitId: string, assessment: string, notes: string) => void;
  onForwardToCompliance: (permitId: string) => void;
  onViewDetails: (permit: PermitForAssessment) => void;
}

export function PermitAssessmentCard({ 
  permit, 
  isManager, 
  staff, 
  onAssign, 
  onAssess,
  onForwardToCompliance,
  onViewDetails 
}: PermitAssessmentCardProps) {
  const [assessmentStatus, setAssessmentStatus] = useState<string>('');
  const [assessmentNotes, setAssessmentNotes] = useState('');
  const [isAssessing, setIsAssessing] = useState(false);

  const getStatusColor = (status: string) => {
    const colors = {
      submitted: 'bg-blue-100 text-blue-800',
      under_initial_review: 'bg-yellow-100 text-yellow-800',
      passed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      requires_clarification: 'bg-orange-100 text-orange-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleAssessment = async () => {
    if (!assessmentStatus || !assessmentNotes.trim()) return;
    
    setIsAssessing(true);
    try {
      await onAssess(permit.id, assessmentStatus, assessmentNotes);
      setAssessmentStatus('');
      setAssessmentNotes('');
    } finally {
      setIsAssessing(false);
    }
  };

  return (
    <Card className="border border-forest-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-forest-800">{permit.title}</CardTitle>
            <p className="text-sm text-forest-600">
              {permit.permit_number || 'No permit number assigned'}
            </p>
            <div className="flex items-center mt-2 space-x-4 text-sm text-forest-600">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                {permit.entity.name} ({permit.entity.entity_type})
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(permit.application_date).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(permit)}
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <Eye className="w-4 h-4 mr-1" />
              View Details
            </Button>
            <Badge className={getStatusColor(permit.status)}>
              {permit.status.replace('_', ' ').toUpperCase()}
            </Badge>
            <Badge variant="outline">
              {permit.permit_type}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Assignment Section - Only for Managers */}
        {isManager && permit.status === 'submitted' && (
          <div className="flex items-center space-x-2 p-3 bg-forest-50 rounded-lg">
            <span className="text-sm font-medium">Assign to Officer:</span>
            <Select onValueChange={(value) => onAssign(permit.id, value)}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select registry officer" />
              </SelectTrigger>
               <SelectContent>
                 {staff.filter(s => s.staff_position === 'officer').map((officer) => (
                   <SelectItem key={officer.id} value={officer.id}>
                     {officer.full_name || officer.email}
                   </SelectItem>
                 ))}
               </SelectContent>
            </Select>
          </div>
        )}

        {/* Assessment Section - For Officers and Managers */}
        {permit.status === 'under_initial_review' && (
          <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              <span className="font-medium">Initial Assessment</span>
            </div>
            
            <div className="space-y-2">
              <Select value={assessmentStatus} onValueChange={setAssessmentStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select assessment outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="passed">Passed - Forward to Compliance</SelectItem>
                  <SelectItem value="requires_clarification">Requires Clarification</SelectItem>
                  <SelectItem value="failed">Failed - Return to Applicant</SelectItem>
                </SelectContent>
              </Select>

              <Textarea
                placeholder="Assessment notes and feedback..."
                value={assessmentNotes}
                onChange={(e) => setAssessmentNotes(e.target.value)}
                rows={3}
              />

              <div className="flex space-x-2">
                <Button
                  onClick={handleAssessment}
                  disabled={!assessmentStatus || !assessmentNotes.trim() || isAssessing}
                  size="sm"
                >
                  {isAssessing ? 'Processing...' : 'Submit Assessment'}
                </Button>

                {assessmentStatus === 'passed' && (
                  <Button
                    onClick={() => onForwardToCompliance(permit.id)}
                    variant="outline"
                    size="sm"
                    className="border-green-200 text-green-700 hover:bg-green-50"
                  >
                    <Forward className="w-4 h-4 mr-1" />
                    Forward to Compliance
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Assignment Status */}
        {permit.assigned_officer && (
          <div className="flex items-center p-2 bg-green-50 rounded-lg">
            <User className="w-4 h-4 mr-2 text-green-600" />
            <span className="text-sm">
              Assigned to: {permit.assigned_officer.full_name || permit.assigned_officer.email}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
