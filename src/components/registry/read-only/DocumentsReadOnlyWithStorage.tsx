import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { DocumentViewerCard } from '@/components/DocumentViewerCard';

interface DocumentsReadOnlyWithStorageProps {
  permit: any; // Using any to match the application object structure
}

export function DocumentsReadOnlyWithStorage({ permit }: DocumentsReadOnlyWithStorageProps) {
  const { documents, loading } = useDocuments(permit.id);

  const requiredDocuments = [
    'Environmental Impact Assessment (EIA) Report',
    'Project feasibility study',
    'Site maps and technical drawings',
    'Waste management plan',
    'Emergency response plan',
    'Proof of land ownership or lease agreement'
  ];

  const getDocumentStatus = (docName: string) => {
    const hasDocument = documents.some(doc => 
      doc.filename.toLowerCase().includes(docName.toLowerCase().split(' ')[0])
    );
    return hasDocument;
  };

  // Also check uploaded_files from permit application if no documents in storage
  const uploadedFiles = Array.isArray(permit.uploaded_files) ? permit.uploaded_files : [];
  const hasStorageDocuments = documents.length > 0;
  const hasUploadedFiles = uploadedFiles.length > 0;

  return (
    <div className="space-y-6">
      {/* Document Requirements Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Document Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {requiredDocuments.map((docName, index) => {
              const hasDocument = getDocumentStatus(docName) || 
                uploadedFiles.some((file: any) => 
                  file.name?.toLowerCase().includes(docName.toLowerCase().split(' ')[0])
                );
              return (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {hasDocument ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                    )}
                    <span className="text-sm font-medium">{docName}</span>
                  </div>
                  <Badge variant={hasDocument ? 'default' : 'secondary'}>
                    {hasDocument ? 'Submitted' : 'Missing'}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Documents from Storage */}
      {hasStorageDocuments && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Documents in Storage ({documents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading documents...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((document) => (
                  <DocumentViewerCard
                    key={document.id}
                    file={{
                      name: document.filename,
                      size: document.file_size || 0,
                      file_path: document.file_path,
                      id: document.id
                    }}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Uploaded Files from Application (fallback) */}
      {hasUploadedFiles && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Uploaded Files ({uploadedFiles.length})
              {!hasStorageDocuments && (
                <Badge variant="outline" className="text-amber-600">
                  Metadata Only
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadedFiles.map((file: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">{file.name}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{file.size ? `${Math.round(file.size / 1024)}KB` : 'Unknown size'}</span>
                        <span>{file.type || 'Unknown type'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-amber-600 border-amber-600">
                      File Metadata Only
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            {!hasStorageDocuments && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  These files show upload metadata but may not be accessible for download. 
                  Documents should be properly stored in the documents storage bucket.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* No Documents */}
      {!hasStorageDocuments && !hasUploadedFiles && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Uploaded Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No documents uploaded</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Assessment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Document Assessment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {documents.length + uploadedFiles.length}
              </div>
              <div className="text-sm text-green-700">Submitted</div>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">
                {Math.max(0, requiredDocuments.length - (documents.length + uploadedFiles.length))}
              </div>
              <div className="text-sm text-amber-700">Missing</div>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(((documents.length + uploadedFiles.length) / requiredDocuments.length) * 100)}%
              </div>
              <div className="text-sm text-blue-700">Complete</div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-muted rounded-lg">
            <h4 className="font-medium text-foreground mb-2">Assessment Notes:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• {documents.length > 0 ? 'Documents are stored and accessible for download' : 'No documents in secure storage'}</li>
              <li>• {uploadedFiles.length > 0 ? 'Upload metadata available' : 'No upload metadata found'}</li>
              <li>• Document completeness affects processing timeline</li>
              <li>• Missing documents may require clarification requests</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}