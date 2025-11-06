import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  User,
  UserPlus,
  Clock,
  AlertCircle
} from "lucide-react";
import { useComplianceStaff } from '../compliance/hooks/useComplianceStaff';

interface Application {
  id: string;
  applicationNumber: string;
  proponentName: string;
  applicationType: string;
  level: string;
  status: string;
  submissionDate: string;
  deadlineDate: string;
  assignedOfficer: string | null;
  urgency: string;
}

interface AssignmentPanelProps {
  applications: Application[];
}

export function AssignmentPanel({ applications }: AssignmentPanelProps) {
  const { staff } = useComplianceStaff();
  const [selectedApplication, setSelectedApplication] = useState<string>('');
  const [selectedOfficer, setSelectedOfficer] = useState<string>('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const unassignedApplications = applications.filter(app => !app.assignedOfficer);
  const assignedApplications = applications.filter(app => app.assignedOfficer);

  const complianceOfficers = staff.filter(member => 
    member.staff_position === 'officer' && member.is_active
  );

  const handleAssignment = () => {
    // Handle assignment logic here
    console.log('Assigning application:', selectedApplication, 'to officer:', selectedOfficer);
    setDialogOpen(false);
    setSelectedApplication('');
    setSelectedOfficer('');
    setAssignmentNotes('');
  };

  const getOfficerWorkload = (officerName: string) => {
    return assignedApplications.filter(app => app.assignedOfficer === officerName).length;
  };

  return (
    <div className="space-y-6">
      {/* Assignment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unassigned</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{unassignedApplications.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting assignment</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Officers</CardTitle>
            <User className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceOfficers.length}</div>
            <p className="text-xs text-muted-foreground">Available for assignment</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned</CardTitle>
            <Clock className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignedApplications.length}</div>
            <p className="text-xs text-muted-foreground">Currently under review</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unassigned Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Unassigned Applications</CardTitle>
            <CardDescription>Applications waiting for officer assignment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {unassignedApplications.map((application) => (
                <div key={application.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{application.applicationNumber}</h4>
                        <Badge variant="outline">Level {application.level}</Badge>
                        <Badge variant="destructive">Unassigned</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {application.proponentName} • {application.applicationType}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Submitted: {application.submissionDate} • Deadline: {application.deadlineDate}
                      </p>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm"
                          onClick={() => setSelectedApplication(application.id)}
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Assign
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Assign Application</DialogTitle>
                          <DialogDescription>
                            Assign {application.applicationNumber} to a compliance officer
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="officer">Select Officer</Label>
                            <Select value={selectedOfficer} onValueChange={setSelectedOfficer}>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose an officer" />
                              </SelectTrigger>
                              <SelectContent>
                                {complianceOfficers.map((officer) => (
                                  <SelectItem key={officer.id} value={officer.id}>
                                    {officer.full_name} (Workload: {getOfficerWorkload(officer.full_name || '')})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="notes">Assignment Notes</Label>
                            <Textarea
                              id="notes"
                              placeholder="Any specific instructions or notes for the officer..."
                              value={assignmentNotes}
                              onChange={(e) => setAssignmentNotes(e.target.value)}
                              rows={3}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={handleAssignment} disabled={!selectedOfficer}>
                              Assign Application
                            </Button>
                            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
              {unassignedApplications.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No unassigned applications
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Officer Workload */}
        <Card>
          <CardHeader>
            <CardTitle>Officer Workload</CardTitle>
            <CardDescription>Current assignment distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {complianceOfficers.map((officer) => {
                const workload = getOfficerWorkload(officer.full_name || '');
                return (
                  <div key={officer.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{officer.full_name}</h4>
                        <p className="text-sm text-muted-foreground">{officer.email}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{workload}</div>
                        <p className="text-xs text-muted-foreground">Active assessments</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              {complianceOfficers.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No compliance officers available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}