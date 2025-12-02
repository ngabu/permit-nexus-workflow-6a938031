import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, X, Loader2, CheckCircle, Info, Replace } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';

interface DocumentsTabProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  removeFile: (fileId: string) => Promise<void>;
  formatFileSize: (bytes: number) => string;
  permitId?: string;
}

interface DocumentUploadState {
  id: string;
  name: string;
  size: number;
  type: string;
  fromDatabase?: boolean;
}

const DOCUMENT_TYPES = [
  {
    id: 'environmental_inception_report',
    name: 'Environmental Inception Report',
    description: 'A scoping document required for Level 3 activities that identifies potential environmental impacts at an early stage. It lists all issues to be covered in the Environmental Impact Statement and initiates consultation with stakeholders. The report should include: project introduction and objectives, purpose of development, project viability, description of proposed development, development timetable, bio-physical environmental issues (air, water, land, noise, flora, fauna), socio-economic issues, baseline information availability, site selection details, and consultant qualifications.',
    isMandatory: true,
  },
  {
    id: 'environmental_impact_assessment',
    name: 'Environmental Impact Assessment and Statement',
    description: 'A comprehensive assessment document required for Level 3 activities that covers all relevant issues relating to possible adverse impacts on the environment. It should address: bio-physical impacts (air quality, water resources, noise, waste, biodiversity), socio-economic impacts (both direct Group A impacts like degradation and loss of resources, and secondary Group B impacts like social structure and infrastructure), mitigation measures and commitments, monitoring plans, and regulatory compliance requirements. This is the key document used to assess whether Approval-In-Principle is granted.',
    isMandatory: true,
  },
];

const DocumentsTab: React.FC<DocumentsTabProps> = ({ 
  formData, 
  handleInputChange, 
  handleFileUpload, 
  removeFile, 
  formatFileSize,
  permitId
}) => {
  const { documents, loading, uploadDocument, deleteDocument } = useDocuments(permitId);
  const [uploadingType, setUploadingType] = useState<string | null>(null);

  // Track uploaded documents by type using formData
  const getUploadedDocument = (documentTypeId: string): DocumentUploadState | null => {
    const uploaded = formData.document_uploads?.[documentTypeId];
    if (uploaded) return uploaded;

    // Check database documents - match by filename pattern
    const dbDoc = documents.find(doc => {
      const filename = doc.filename.toLowerCase();
      if (documentTypeId === 'environmental_inception_report') {
        return filename.includes('inception') || filename.includes('eir');
      }
      if (documentTypeId === 'environmental_impact_assessment') {
        return filename.includes('impact') || filename.includes('eia') || filename.includes('eis');
      }
      return false;
    });
    if (dbDoc) {
      return {
        id: dbDoc.id,
        name: dbDoc.filename,
        size: dbDoc.file_size || 0,
        type: dbDoc.mime_type || '',
        fromDatabase: true,
      };
    }
    return null;
  };

  const handleDocumentUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    documentTypeId: string
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingType(documentTypeId);

    try {
      // Remove existing document if replacing
      const existing = getUploadedDocument(documentTypeId);
      if (existing?.fromDatabase && existing.id) {
        await deleteDocument(existing.id);
      }

      if (permitId) {
        // Upload to database with document type
        const result = await uploadDocument(file, permitId);
        
        // Update the document record with the document type
        // Store in formData for tracking
        const newUploads = {
          ...(formData.document_uploads || {}),
          [documentTypeId]: {
            id: result.id,
            name: file.name,
            size: file.size,
            type: file.type,
            fromDatabase: true,
          },
        };
        handleInputChange('document_uploads', newUploads);
      } else {
        // For draft applications, store in formData
        const newUploads = {
          ...(formData.document_uploads || {}),
          [documentTypeId]: {
            id: `draft_${Date.now()}`,
            name: file.name,
            size: file.size,
            type: file.type,
            fromDatabase: false,
          },
        };
        handleInputChange('document_uploads', newUploads);
        
        // Also call the original upload handler
        await handleFileUpload(event);
      }
    } catch (error) {
      console.error('Failed to upload document:', error);
    } finally {
      setUploadingType(null);
      event.target.value = '';
    }
  };

  const handleRemoveDocument = async (documentTypeId: string) => {
    const uploaded = getUploadedDocument(documentTypeId);
    if (!uploaded) return;

    try {
      if (uploaded.fromDatabase && uploaded.id) {
        await deleteDocument(uploaded.id);
      } else if (uploaded.id) {
        await removeFile(uploaded.id);
      }

      // Remove from formData
      const newUploads = { ...(formData.document_uploads || {}) };
      delete newUploads[documentTypeId];
      handleInputChange('document_uploads', newUploads);
    } catch (error) {
      console.error('Failed to remove document:', error);
    }
  };

  const allMandatoryUploaded = DOCUMENT_TYPES.filter(d => d.isMandatory).every(
    docType => getUploadedDocument(docType.id) !== null
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          Required Documents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!allMandatoryUploaded && (
          <Alert variant="destructive">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Please upload all mandatory documents before submitting your application.
            </AlertDescription>
          </Alert>
        )}

        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-900 dark:text-blue-100">
            Upload the following documents as required under the Environment Act 2000 for Level 3 activities. 
            Files are automatically saved when uploaded. You can replace a document by uploading a new file.
          </AlertDescription>
        </Alert>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading documents...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {DOCUMENT_TYPES.map((docType) => {
              const uploaded = getUploadedDocument(docType.id);
              const isUploading = uploadingType === docType.id;

              return (
                <div
                  key={docType.id}
                  className="bg-muted/30 p-6 rounded-xl border-l-4 border-l-primary space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {uploaded ? (
                        <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <FileText className="w-6 h-6 text-muted-foreground mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground text-lg flex items-center gap-2">
                          {docType.name}
                          {docType.isMandatory && (
                            <Badge variant="destructive" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </h4>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed pl-9">
                    {docType.description}
                  </p>

                  {uploaded ? (
                    <div className="ml-9 flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-900 dark:text-green-100">
                            {uploaded.name}
                          </p>
                          <p className="text-xs text-green-700 dark:text-green-300">
                            {formatFileSize(uploaded.size)} • {uploaded.type}
                            {uploaded.fromDatabase && (
                              <span className="ml-2 px-2 py-0.5 bg-green-600/20 text-green-700 dark:text-green-300 rounded">
                                Saved
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleDocumentUpload(e, docType.id)}
                          className="hidden"
                          id={`replace-${docType.id}`}
                          disabled={isUploading}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          disabled={isUploading}
                        >
                          <label
                            htmlFor={`replace-${docType.id}`}
                            className="cursor-pointer"
                          >
                            <Replace className="w-4 h-4 mr-2" />
                            Replace
                          </label>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveDocument(docType.id)}
                          className="text-destructive hover:text-destructive"
                          disabled={isUploading}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="ml-9">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleDocumentUpload(e, docType.id)}
                        className="hidden"
                        id={`upload-${docType.id}`}
                        disabled={isUploading}
                      />
                      <Button
                        variant="outline"
                        size="default"
                        asChild
                        disabled={isUploading}
                        className="w-full sm:w-auto"
                      >
                        <label
                          htmlFor={`upload-${docType.id}`}
                          className="cursor-pointer flex items-center justify-center"
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Document
                            </>
                          )}
                        </label>
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
            <Info className="w-4 h-4 text-muted-foreground" />
            Document Guidelines
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Accepted formats: PDF, DOC, DOCX</li>
            <li>Documents are automatically saved when uploaded</li>
            <li>You can replace an existing document at any time</li>
            <li>Ensure documents comply with DEC Publication guidelines</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentsTab;
