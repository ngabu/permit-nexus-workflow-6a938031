import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle2, XCircle, Ban, FileSignature, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { DirectorateApproval } from '@/hooks/useDirectorateApprovals';

interface PendingApprovalsListProps {
  approvals: DirectorateApproval[];
  onApprove: (id: string, notes?: string) => void;
  onReject: (id: string, notes?: string) => void;
  onRevoke: (id: string, notes?: string) => void;
  onCancel: (id: string, notes?: string) => void;
  onSignLetter: (id: string) => void;
}

export function PendingApprovalsList({
  approvals,
  onApprove,
  onReject,
  onRevoke,
  onCancel,
  onSignLetter,
}: PendingApprovalsListProps) {
  const [selectedApproval, setSelectedApproval] = useState<DirectorateApproval | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'revoke' | 'cancel' | null>(null);
  const [notes, setNotes] = useState('');

  const handleAction = () => {
    if (!selectedApproval || !actionType) return;

    switch (actionType) {
      case 'approve':
        onApprove(selectedApproval.id, notes);
        break;
      case 'reject':
        onReject(selectedApproval.id, notes);
        break;
      case 'revoke':
        onRevoke(selectedApproval.id, notes);
        break;
      case 'cancel':
        onCancel(selectedApproval.id, notes);
        break;
    }

    setSelectedApproval(null);
    setActionType(null);
    setNotes('');
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'high':
        return <Badge className="bg-orange-500">High</Badge>;
      case 'normal':
        return <Badge variant="secondary">Normal</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'revoked':
        return <Badge className="bg-gray-500">Revoked</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <>
      <div className="space-y-4">
        {approvals.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">No pending approvals</p>
            </CardContent>
          </Card>
        ) : (
          approvals.map((approval) => (
            <Card key={approval.id} className="border-border/50">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {approval.application?.title || 'Untitled Application'}
                    </CardTitle>
                    <CardDescription>
                      Type: {approval.application_type} | Permit: {approval.application?.permit_type}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {getPriorityBadge(approval.priority)}
                    {getStatusBadge(approval.approval_status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Entity:</span> {approval.application?.entity_name}
                    </div>
                    <div>
                      <span className="font-medium">Submitted:</span>{' '}
                      {new Date(approval.submitted_at).toLocaleDateString()}
                    </div>
                    {approval.letter_signed && (
                      <div className="col-span-2">
                        <Badge className="bg-blue-500">
                          <FileSignature className="w-3 h-3 mr-1" />
                          Letter Signed
                        </Badge>
                      </div>
                    )}
                  </div>

                  {approval.approval_notes && (
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium mb-1">Notes:</p>
                      <p className="text-sm text-muted-foreground">{approval.approval_notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {approval.approval_status === 'pending' && (
                      <>
                        <Button
                          onClick={() => {
                            setSelectedApproval(approval);
                            setActionType('approve');
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedApproval(approval);
                            setActionType('reject');
                          }}
                          variant="destructive"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                        {!approval.letter_signed && (
                          <Button
                            onClick={() => onSignLetter(approval.id)}
                            variant="outline"
                          >
                            <FileSignature className="w-4 h-4 mr-2" />
                            Sign Letter
                          </Button>
                        )}
                      </>
                    )}
                    {approval.approval_status === 'approved' && (
                      <Button
                        onClick={() => {
                          setSelectedApproval(approval);
                          setActionType('revoke');
                        }}
                        variant="outline"
                      >
                        <Ban className="w-4 h-4 mr-2" />
                        Revoke
                      </Button>
                    )}
                    <Button
                      onClick={() => {
                        setSelectedApproval(approval);
                        setActionType('cancel');
                      }}
                      variant="outline"
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={!!selectedApproval && !!actionType} onOpenChange={() => {
        setSelectedApproval(null);
        setActionType(null);
        setNotes('');
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' && 'Approve Application'}
              {actionType === 'reject' && 'Reject Application'}
              {actionType === 'revoke' && 'Revoke Approval'}
              {actionType === 'cancel' && 'Cancel Application'}
            </DialogTitle>
            <DialogDescription>
              {selectedApproval?.application?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Notes (Optional)
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter any notes or reasons for this action..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedApproval(null);
                setActionType(null);
                setNotes('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              className={
                actionType === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-destructive hover:bg-destructive/90'
              }
            >
              Confirm {actionType}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
