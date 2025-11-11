import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useComplianceAssessments } from "./hooks/useComplianceAssessments";
import { useAuth } from "@/contexts/AuthContext";
import { FileCheck, Clock, User, AlertCircle } from "lucide-react";
import { useState } from "react";
import { AssignOfficerDialog } from "./AssignOfficerDialog";

export function PendingAssessmentsCard() {
  const { assessments, loading } = useComplianceAssessments();
  const { profile } = useAuth();
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);

  const isManager = profile?.staff_position === 'manager';
  
  const pendingAssessments = assessments.filter(
    assessment => assessment.assessment_status === 'pending'
  );

  const assignedToMe = assessments.filter(
    assessment => assessment.assessed_by === profile?.user_id
  );

  const displayAssessments = isManager ? pendingAssessments : assignedToMe;

  const handleAssignTask = (assessment: any) => {
    setSelectedAssessment(assessment);
    setAssignDialogOpen(true);
  };

  const refreshAssessments = async () => {
    // This will be called after assignment to refresh the list
    window.location.reload();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="w-5 h-5" />
            {isManager ? 'Pending Technical Assessments' : 'My Assessments'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading assessments...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="w-5 h-5" />
            {isManager ? 'Pending Technical Assessments' : 'My Assessments'}
          </CardTitle>
          <CardDescription>
            {isManager 
              ? 'Applications ready for compliance assessment assignment'
              : 'Technical assessments assigned to you'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {displayAssessments.length === 0 ? (
            <div className="text-center py-6">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {isManager 
                  ? 'No pending assessments to assign'
                  : 'No assessments assigned to you'
                }
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {displayAssessments.map((assessment) => (
                  <div key={assessment.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">
                          {assessment.permit_application?.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Application #{assessment.permit_application?.application_number}
                        </p>
                      </div>
                      <Badge 
                        variant={assessment.assessment_status === 'pending' ? 'secondary' : 'default'}
                      >
                        {assessment.assessment_status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Entity: {assessment.permit_application?.entity_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Type: {assessment.permit_application?.permit_type}</span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      {assessment.assessment_notes}
                    </p>

                    {isManager && assessment.assessment_status === 'pending' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleAssignTask(assessment)}
                        className="w-full"
                      >
                        Assign to Officer
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <AssignOfficerDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        officers={[]}
        selectedApplication={selectedAssessment?.permit_application_id}
        onAssign={async (applicationId: string, officerId: string) => {
          console.log('Assigning application:', applicationId, 'to officer:', officerId);
          setAssignDialogOpen(false);
          setSelectedAssessment(null);
          refreshAssessments();
        }}
      />
    </>
  );
}