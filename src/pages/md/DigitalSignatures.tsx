import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, PenTool, CheckCircle } from "lucide-react";
import { useDirectorateApprovals } from "@/hooks/useDirectorateApprovals";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export default function MDDigitalSignatures() {
  const { approvals, loading, markLetterSigned } = useDirectorateApprovals();

  const handleSign = async (approvalId: string) => {
    const result = await markLetterSigned(approvalId);
    if (result.success) {
      toast.success("Document signed successfully");
    }
  };

  const pendingSignatures = approvals.filter(a => 
    a.approval_status === 'approved' && !a.letter_signed
  );

  const signedDocuments = approvals.filter(a => a.letter_signed);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Digital Signatures</h1>
        <p className="text-muted-foreground">Sign documents, notices, and invoices digitally</p>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Signatures
            {pendingSignatures.length > 0 && (
              <Badge variant="destructive" className="ml-2">{pendingSignatures.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="signed">Signed Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">Loading documents...</p>
              </CardContent>
            </Card>
          ) : pendingSignatures.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">No documents pending signature</p>
              </CardContent>
            </Card>
          ) : (
            pendingSignatures.map((approval) => (
              <Card key={approval.id} className="border-warning">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {approval.application?.title || 'Approval Letter'}
                      </CardTitle>
                      <CardDescription>
                        Approved {formatDistanceToNow(new Date(approval.reviewed_at || approval.created_at), { addSuffix: true })}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">Awaiting Signature</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Document Type</p>
                      <p className="font-medium">Approval Letter</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Application Type</p>
                      <p className="font-medium">{approval.application_type}</p>
                    </div>
                  </div>

                  {approval.approval_notes && (
                    <div className="border-l-2 border-primary pl-3">
                      <p className="text-sm text-muted-foreground mb-1">Approval Notes</p>
                      <p className="text-sm">{approval.approval_notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => handleSign(approval.id)}>
                      <PenTool className="h-4 w-4 mr-2" />
                      Sign Document
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="signed" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">Loading signed documents...</p>
              </CardContent>
            </Card>
          ) : signedDocuments.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">No signed documents</p>
              </CardContent>
            </Card>
          ) : (
            signedDocuments.map((approval) => (
              <Card key={approval.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-success" />
                        {approval.application?.title || 'Approval Letter'}
                      </CardTitle>
                      <CardDescription>
                        Signed {formatDistanceToNow(new Date(approval.letter_signed_at || approval.updated_at), { addSuffix: true })}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">Signed</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-muted-foreground">Document Type</p>
                      <p className="font-medium">Approval Letter</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">DocuSign ID</p>
                      <p className="font-medium text-xs">{approval.docusign_envelope_id || 'N/A'}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download Signed Document
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
