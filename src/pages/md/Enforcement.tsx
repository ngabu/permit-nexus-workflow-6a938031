import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, XCircle, Ban, DollarSign, FileText } from "lucide-react";
import { useDirectorateApprovals } from "@/hooks/useDirectorateApprovals";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export default function MDEnforcement() {
  const { approvals, loading, updateApprovalStatus } = useDirectorateApprovals();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [enforcementNotes, setEnforcementNotes] = useState("");
  const [penaltyAmount, setPenaltyAmount] = useState("");

  const handleRevoke = async (approvalId: string) => {
    if (!enforcementNotes.trim()) {
      toast.error("Please provide revocation reason");
      return;
    }
    const result = await updateApprovalStatus(approvalId, 'revoked', enforcementNotes);
    if (result.success) {
      toast.success("Permit revoked successfully");
      setSelectedItem(null);
      setEnforcementNotes("");
    }
  };

  const handleIssuePenalty = () => {
    if (!enforcementNotes.trim() || !penaltyAmount) {
      toast.error("Please provide penalty details and amount");
      return;
    }
    toast.success(`Penalty of K${penaltyAmount} issued`);
    setSelectedItem(null);
    setEnforcementNotes("");
    setPenaltyAmount("");
  };

  const approvedPermits = approvals.filter(a => a.approval_status === 'approved');
  const revokedPermits = approvals.filter(a => a.approval_status === 'revoked');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Enforcement & Penalties</h1>
        <p className="text-muted-foreground">Revoke permits and issue penalties for non-compliance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Permits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedPermits.length}</div>
            <p className="text-xs text-muted-foreground">Approved applications</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Revoked Permits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{revokedPermits.length}</div>
            <p className="text-xs text-muted-foreground">Enforcement actions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {approvals.filter(a => a.approval_status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting decision</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Permits - Enforcement Actions</CardTitle>
          <CardDescription>Review and take enforcement actions on approved permits</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-4">Loading permits...</p>
          ) : approvedPermits.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No active permits</p>
          ) : (
            <div className="space-y-4">
              {approvedPermits.map((approval) => (
                <Card key={approval.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">
                          {approval.application?.title || 'Permit Application'}
                        </CardTitle>
                        <CardDescription>
                          Approved {formatDistanceToNow(new Date(approval.reviewed_at || approval.created_at), { addSuffix: true })}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Entity</p>
                        <p className="font-medium">{approval.application?.entity_name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Permit Type</p>
                        <p className="font-medium">{approval.application?.permit_type}</p>
                      </div>
                    </div>

                    {selectedItem?.id === approval.id ? (
                      <div className="space-y-3 border-t pt-4">
                        <div className="space-y-2">
                          <Label>Enforcement Notes *</Label>
                          <Textarea
                            placeholder="Provide detailed reason for enforcement action..."
                            value={enforcementNotes}
                            onChange={(e) => setEnforcementNotes(e.target.value)}
                            className="min-h-24"
                          />
                        </div>

                        {selectedItem.action === 'penalty' && (
                          <div className="space-y-2">
                            <Label>Penalty Amount (Kina) *</Label>
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={penaltyAmount}
                              onChange={(e) => setPenaltyAmount(e.target.value)}
                            />
                          </div>
                        )}

                        <div className="flex gap-2">
                          {selectedItem.action === 'revoke' ? (
                            <Button 
                              onClick={() => handleRevoke(approval.id)}
                              variant="destructive"
                              className="flex-1"
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Confirm Revocation
                            </Button>
                          ) : (
                            <Button 
                              onClick={handleIssuePenalty}
                              variant="destructive"
                              className="flex-1"
                            >
                              <DollarSign className="h-4 w-4 mr-2" />
                              Issue Penalty
                            </Button>
                          )}
                          <Button 
                            onClick={() => {
                              setSelectedItem(null);
                              setEnforcementNotes("");
                              setPenaltyAmount("");
                            }}
                            variant="outline"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => setSelectedItem({ ...approval, action: 'revoke' })}
                          variant="destructive"
                          className="flex-1"
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          Revoke Permit
                        </Button>
                        <Button 
                          onClick={() => setSelectedItem({ ...approval, action: 'penalty' })}
                          variant="outline"
                          className="flex-1"
                        >
                          <DollarSign className="h-4 w-4 mr-2" />
                          Issue Penalty
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {revokedPermits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              Revoked Permits
            </CardTitle>
            <CardDescription>Previously revoked permits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {revokedPermits.map((approval) => (
                <div key={approval.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{approval.application?.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Revoked {formatDistanceToNow(new Date(approval.reviewed_at || approval.updated_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
