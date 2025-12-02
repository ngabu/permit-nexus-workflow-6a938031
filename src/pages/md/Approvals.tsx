import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useDirectorateApprovals } from "@/hooks/useDirectorateApprovals";
import { useIntentRegistrations } from "@/hooks/useIntentRegistrations";
import { usePermitInspections } from "@/hooks/usePermitInspections";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { FileCheck, AlertCircle, CheckCircle, XCircle, Eye } from "lucide-react";
import { toast } from "sonner";

export default function MDApprovals() {
  const { profile } = useAuth();
  const { approvals, loading: approvalsLoading, updateApprovalStatus } = useDirectorateApprovals();
  const { intents, loading: intentsLoading } = useIntentRegistrations(profile?.user_id);
  const { inspections, loading: inspectionsLoading } = usePermitInspections();

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [notes, setNotes] = useState("");

  const handleApprove = async (id: string, type: 'approval' | 'intent' | 'inspection') => {
    if (type === 'approval') {
      const result = await updateApprovalStatus(id, 'approved', notes);
      if (result.success) {
        toast.success("Application approved successfully");
        setSelectedItem(null);
        setNotes("");
      }
    }
  };

  const handleReject = async (id: string, type: 'approval' | 'intent' | 'inspection') => {
    if (!notes.trim()) {
      toast.error("Please provide rejection notes");
      return;
    }
    if (type === 'approval') {
      const result = await updateApprovalStatus(id, 'rejected', notes);
      if (result.success) {
        toast.success("Application rejected");
        setSelectedItem(null);
        setNotes("");
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "default",
      approved: "secondary",
      rejected: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Approvals</h1>
        <p className="text-muted-foreground">Review and approve intents, permits, inspections, and notices</p>
      </div>

      <Tabs defaultValue="permits" className="space-y-4">
        <TabsList>
          <TabsTrigger value="permits">Permit Applications</TabsTrigger>
          <TabsTrigger value="intents">Intent Registrations</TabsTrigger>
          <TabsTrigger value="inspections">Inspections</TabsTrigger>
        </TabsList>

        <TabsContent value="permits" className="space-y-4">
          {approvalsLoading ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">Loading approvals...</p>
              </CardContent>
            </Card>
          ) : approvals.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">No pending permit approvals</p>
              </CardContent>
            </Card>
          ) : (
            approvals
              .filter(a => a.approval_status === 'pending')
              .map((approval) => (
                <Card key={approval.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          <FileCheck className="h-5 w-5" />
                          {approval.application?.title || 'Permit Application'}
                        </CardTitle>
                        <CardDescription>
                          Submitted {formatDistanceToNow(new Date(approval.submitted_at), { addSuffix: true })}
                        </CardDescription>
                      </div>
                      {getStatusBadge(approval.approval_status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Permit Type</p>
                        <p className="font-medium">{approval.application?.permit_type}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Entity</p>
                        <p className="font-medium">{approval.application?.entity_name}</p>
                      </div>
                    </div>

                    {selectedItem?.id === approval.id ? (
                      <div className="space-y-3 border-t pt-4">
                        <Textarea
                          placeholder="Add decision notes..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="min-h-24"
                        />
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleApprove(approval.id, 'approval')}
                            className="flex-1"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button 
                            onClick={() => handleReject(approval.id, 'approval')}
                            variant="destructive"
                            className="flex-1"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                          <Button 
                            onClick={() => setSelectedItem(null)}
                            variant="outline"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => setSelectedItem(approval)}
                          variant="outline"
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>

        <TabsContent value="intents" className="space-y-4">
          {intentsLoading ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">Loading intent registrations...</p>
              </CardContent>
            </Card>
          ) : intents.filter(i => i.status === 'pending').length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">No pending intent registrations</p>
              </CardContent>
            </Card>
          ) : (
            intents
              .filter(i => i.status === 'pending')
              .map((intent) => (
                <Card key={intent.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          <AlertCircle className="h-5 w-5" />
                          Intent Registration - {intent.entity?.name}
                        </CardTitle>
                        <CardDescription>
                          Submitted {formatDistanceToNow(new Date(intent.created_at), { addSuffix: true })}
                        </CardDescription>
                      </div>
                      {getStatusBadge(intent.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-muted-foreground">Activity Level</p>
                        <p className="font-medium">{intent.activity_level}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Activity Description</p>
                        <p className="font-medium">{intent.activity_description}</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>

        <TabsContent value="inspections" className="space-y-4">
          {inspectionsLoading ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">Loading inspections...</p>
              </CardContent>
            </Card>
          ) : inspections.filter(i => i.status === 'scheduled').length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">No scheduled inspections</p>
              </CardContent>
            </Card>
          ) : (
            inspections
              .filter(i => i.status === 'scheduled')
              .map((inspection) => (
                <Card key={inspection.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle>Inspection - {inspection.permit_title}</CardTitle>
                        <CardDescription>
                          Type: {inspection.inspection_type}
                        </CardDescription>
                      </div>
                      {getStatusBadge(inspection.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Scheduled Date</p>
                        <p className="font-medium">{new Date(inspection.scheduled_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Inspector</p>
                        <p className="font-medium">{inspection.inspector_name || 'Not assigned'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
