import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { FileText, Download, Upload, Search, Filter } from "lucide-react";

const documents = [
  {
    id: 1,
    name: "Environmental Impact Assessment.pdf",
    type: "EIA Report",
    uploadDate: "2024-01-15",
    size: "2.4 MB",
    status: "approved",
    applicationId: "APP-2024-001"
  },
  {
    id: 2,
    name: "Site Survey Report.pdf",
    type: "Survey",
    uploadDate: "2024-01-20",
    size: "1.8 MB",
    status: "under_review",
    applicationId: "APP-2024-002"
  },
  {
    id: 3,
    name: "Waste Management Plan.docx",
    type: "Management Plan",
    uploadDate: "2024-02-01",
    size: "945 KB",
    status: "approved",
    applicationId: "APP-2024-001"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved": return "bg-green-100 text-green-800";
    case "under_review": return "bg-yellow-100 text-yellow-800";
    case "rejected": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

export default function Documents() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Document Management</h1>
          <p className="text-muted-foreground">
            Manage and view all documents related to your applications and permits.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                className="pl-10"
              />
            </div>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90">
            <Upload className="w-4 h-4" />
            Upload Document
          </Button>
        </div>

        <div className="grid gap-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <FileText className="w-10 h-10 text-primary" />
                    <div>
                      <h3 className="font-semibold text-foreground">{doc.name}</h3>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>{doc.type}</span>
                        <span>•</span>
                        <span>{doc.size}</span>
                        <span>•</span>
                        <span>Uploaded {doc.uploadDate}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Application: {doc.applicationId}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(doc.status)}>
                      {doc.status.replace('_', ' ')}
                    </Badge>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {documents.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No documents found</h3>
              <p className="text-muted-foreground mb-4">
                Upload your first document to get started.
              </p>
              <Button className="bg-primary hover:bg-primary/90">
                Upload Document
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}