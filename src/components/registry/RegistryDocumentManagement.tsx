import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Plus, Book } from "lucide-react";

export function RegistryDocumentManagement() {
  const templates = [
    { name: 'Environmental Permit Application Form', type: 'Form template' },
    { name: 'Intent Registration Form', type: 'Form template' },
    { name: 'Compliance Report Template', type: 'Report template' },
    { name: 'Environmental Impact Assessment Template', type: 'Assessment template' },
    { name: 'Site Inspection Checklist', type: 'Checklist template' },
    { name: 'Permit Renewal Application Form', type: 'Form template' },
  ];

  const guides = [
    { name: 'Environmental Permit Application Guide', type: 'User guide' },
    { name: 'Compliance Reporting Guidelines', type: 'Regulatory guideline' },
    { name: 'Environmental Impact Assessment Process', type: 'Process guide' },
    { name: 'Monitoring and Reporting Requirements', type: 'Regulatory guideline' },
    { name: 'Fee Schedule and Payment Information', type: 'Information' },
    { name: 'Contact Information and Support', type: 'Information' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Documents Management</h2>
          <p className="text-muted-foreground mt-1">Manage templates, guides, and information documents</p>
        </div>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="info-guidelines">Information and Guidelines</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-6">
          <Card className="border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Document Templates</h2>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template, index) => (
                  <Card key={index} className="border hover:border-primary/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-foreground text-sm leading-tight">{template.name}</h4>
                          <p className="text-sm text-primary mt-1">{template.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="icon" className="h-9 w-9">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          View Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info-guidelines" className="mt-6">
          <Card className="border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Information and Guidelines</h2>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Guide
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {guides.map((guide, index) => (
                  <Card key={index} className="border hover:border-primary/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950 flex items-center justify-center flex-shrink-0">
                          <Book className="w-5 h-5 text-purple-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-foreground text-sm leading-tight">{guide.name}</h4>
                          <p className="text-sm text-primary mt-1">{guide.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="icon" className="h-9 w-9">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          View Guide
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
