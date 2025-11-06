import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, X, Loader2, CheckCircle, Download, AlertCircle } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { useDocumentRequirements } from '@/hooks/useDocumentRequirements';

interface DocumentsTabProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  removeFile: (fileId: string) => Promise<void>;
  formatFileSize: (bytes: number) => string;
  permitId?: string; // Add permitId prop for fetching existing documents
}

const DocumentsTab: React.FC<DocumentsTabProps> = ({ 
  formData, 
  handleInputChange, 
  handleFileUpload, 
  removeFile, 
  formatFileSize,
  permitId
}) => {
  const { documents, loading, uploadDocument, deleteDocument } = useDocuments(permitId);
  const { 
    requirements, 
    uploadStatuses, 
    loading: requirementsLoading,
    updateUploadStatus,
    downloadTemplate,
    validateRequiredDocuments
  } = useDocumentRequirements(
    formData.entity_type,
    formData.activity_level,
    formData.prescribed_activity_id
  );

  // Debug logging
  console.log('DocumentsTab - formData values:', {
    entity_type: formData.entity_type,
    activity_level: formData.activity_level,
    prescribed_activity_id: formData.prescribed_activity_id
  });
  console.log('DocumentsTab - requirements:', requirements);

  // Combine uploaded files from formData and documents from database
  const allFiles = [
    ...(formData.uploaded_files || []),
    ...documents.map(doc => ({
      id: doc.id,
      name: doc.filename,
      size: doc.file_size,
      type: doc.mime_type,
      uploaded_at: doc.uploaded_at,
      fromDatabase: true
    }))
  ];

  const handleDatabaseFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!permitId) {
      // If no permitId, use the original upload handler
      return handleFileUpload(event);
    }

    const files = Array.from(event.target.files || []);
    
    for (const file of files) {
      try {
        await uploadDocument(file, permitId);
      } catch (error) {
        console.error('Failed to upload file:', error);
      }
    }
  };

  const handleDatabaseFileRemoval = async (fileId: string, fromDatabase: boolean) => {
    if (fromDatabase) {
      await deleteDocument(fileId);
    } else {
      await removeFile(fileId);
    }
  };

  const handleRequiredDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>, requirementId: string) => {
    const files = Array.from(event.target.files || []);
    
    for (const file of files) {
      try {
        let fileId: string;
        
        if (permitId) {
          const result = await uploadDocument(file, permitId);
          fileId = result.id;
        } else {
          // For draft applications, use the original upload handler
          await handleFileUpload(event);
          fileId = `draft_${Date.now()}`;
        }
        
        // Update upload status for this requirement
        updateUploadStatus(requirementId, true, file.name, fileId);
        
      } catch (error) {
        console.error('Failed to upload file:', error);
      }
    }
    
    // Clear the input value to allow re-uploading the same file
    event.target.value = '';
  };

  const isDocumentUploaded = (requirementId: string) => {
    const status = uploadStatuses.find(s => s.requirement_id === requirementId);
    return status?.uploaded || false;
  };

  const handleRemoveRequiredDocument = async (requirementId: string) => {
    const status = uploadStatuses.find(s => s.requirement_id === requirementId);
    if (status?.file_id) {
      try {
        if (status.file_id.startsWith('draft_')) {
          // Handle draft document removal
          updateUploadStatus(requirementId, false);
        } else {
          await deleteDocument(status.file_id);
          updateUploadStatus(requirementId, false);
        }
      } catch (error) {
        console.error('Failed to remove document:', error);
      }
    }
  };

  const validation = validateRequiredDocuments();
  
  // Group requirements by type
  const baseRequirements = requirements.filter(req => req.document_type === 'base');
  const activityRequirements = requirements.filter(req => req.document_type === 'activity');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          Supporting Documents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!validation.isValid && requirements.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please upload all mandatory documents before submitting: {validation.missingDocuments.join(', ')}
            </AlertDescription>
          </Alert>
        )}

        {requirementsLoading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading required documents...</span>
          </div>
        ) : requirements.length > 0 ? (
          <div className="space-y-6">
            {/* Base Requirements */}
            {baseRequirements.length > 0 && (
              <div className="space-y-4 bg-muted/30 p-6 rounded-xl border-l-4 border-l-primary">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground text-lg">Base Requirements</h4>
                    <p className="text-sm text-muted-foreground">Required for all applications</p>
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    Entity Type: {formData.entity_type}
                  </Badge>
                </div>
                {baseRequirements.map((requirement) => {
                  const isUploaded = isDocumentUploaded(requirement.id);
                  const status = uploadStatuses.find(s => s.requirement_id === requirement.id);
                  
                  return (
                    <div key={requirement.id} className="bg-background border rounded-lg p-4 space-y-3 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {isUploaded ? (
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                          ) : (
                            <Upload className="w-5 h-5 text-muted-foreground mt-0.5" />
                          )}
                          <div className="flex-1">
                            <h5 className="font-medium text-foreground">
                              {requirement.name}
                              {requirement.is_mandatory && (
                                <span className="text-destructive ml-1">*</span>
                              )}
                            </h5>
                            {requirement.description && (
                              <p className="text-sm text-muted-foreground mt-1">{requirement.description}</p>
                            )}
                            {status?.uploaded && status.file_name && (
                              <p className="text-xs text-green-600 mt-1">✓ {status.file_name}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {requirement.template_path && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => downloadTemplate(requirement.template_path!, requirement.name)}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Template
                            </Button>
                          )}
                          {isUploaded ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveRequiredDocument(requirement.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          ) : (
                            <>
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                onChange={(e) => handleRequiredDocumentUpload(e, requirement.id)}
                                className="hidden"
                                id={`upload-${requirement.id}`}
                              />
                              <Button variant="outline" size="sm" asChild>
                                <label htmlFor={`upload-${requirement.id}`} className="cursor-pointer">
                                  <Upload className="w-4 h-4 mr-2" />
                                  Upload
                                </label>
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Activity Requirements */}
            {activityRequirements.length > 0 && (
              <div className="space-y-4 bg-muted/30 p-6 rounded-xl border-l-4 border-l-primary">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground text-lg">Activity-Specific Requirements</h4>
                    <p className="text-sm text-muted-foreground">Based on your selected activity and level</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      Level {activityRequirements[0]?.activity_level}
                    </Badge>
                    {formData.activity_category && (
                      <Badge variant="outline" className="border-accent/30">{formData.activity_category}</Badge>
                    )}
                  </div>
                </div>
                {activityRequirements.map((requirement) => {
                  const isUploaded = isDocumentUploaded(requirement.id);
                  const status = uploadStatuses.find(s => s.requirement_id === requirement.id);
                  
                  return (
                    <div key={requirement.id} className="bg-background border rounded-lg p-4 space-y-3 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {isUploaded ? (
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                          ) : (
                            <Upload className="w-5 h-5 text-muted-foreground mt-0.5" />
                          )}
                          <div className="flex-1">
                            <h5 className="font-medium text-foreground">
                              {requirement.name}
                              {requirement.is_mandatory && (
                                <span className="text-destructive ml-1">*</span>
                              )}
                            </h5>
                            {requirement.description && (
                              <p className="text-sm text-muted-foreground mt-1">{requirement.description}</p>
                            )}
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                Level {requirement.activity_level}
                              </Badge>
                              {requirement.activity_classification && (
                                <Badge variant="outline" className="text-xs">
                                  {requirement.activity_classification}
                                </Badge>
                              )}
                            </div>
                            {status?.uploaded && status.file_name && (
                              <p className="text-xs text-green-600 mt-1">✓ {status.file_name}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {requirement.template_path && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => downloadTemplate(requirement.template_path!, requirement.name)}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Template
                            </Button>
                          )}
                          {isUploaded ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveRequiredDocument(requirement.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          ) : (
                            <>
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                onChange={(e) => handleRequiredDocumentUpload(e, requirement.id)}
                                className="hidden"
                                id={`upload-${requirement.id}`}
                              />
                              <Button variant="outline" size="sm" asChild>
                                <label htmlFor={`upload-${requirement.id}`} className="cursor-pointer">
                                  <Upload className="w-4 h-4 mr-2" />
                                  Upload
                                </label>
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-muted/30 p-4 rounded-lg">
            <h4 className="font-medium text-foreground mb-2">Document Requirements</h4>
            <p className="text-sm text-muted-foreground">
              Select entity type and activity level to see required documents.
            </p>
          </div>
        )}


        {loading && (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading documents...</span>
          </div>
        )}

        {allFiles.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Uploaded Files</h4>
            {allFiles.map((file: any) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.size)} • {file.type}
                      {file.fromDatabase && (
                        <span className="ml-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                          Saved
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDatabaseFileRemoval(file.id, file.fromDatabase)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentsTab;