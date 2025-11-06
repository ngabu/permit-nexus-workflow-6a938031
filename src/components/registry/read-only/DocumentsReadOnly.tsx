import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Download, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { PermitForAssessment } from '../types';
import { useDocuments } from '@/hooks/useDocuments';
import { DocumentViewerCard } from '@/components/DocumentViewerCard';

interface DocumentsReadOnlyProps {
  permit: PermitForAssessment;
}

export function DocumentsReadOnly({ permit }: DocumentsReadOnlyProps) {
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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
              const hasDocument = getDocumentStatus(docName);
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

      {/* Uploaded Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Uploaded Documents ({documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading documents...</span>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No documents uploaded</p>
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

      {/* Document Assessment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Document Assessment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {documents.length}
              </div>
              <div className="text-sm text-green-700">Submitted</div>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">
                {requiredDocuments.length - documents.length}
              </div>
              <div className="text-sm text-amber-700">Missing</div>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((documents.length / requiredDocuments.length) * 100)}%
              </div>
              <div className="text-sm text-blue-700">Complete</div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-muted rounded-lg">
            <h4 className="font-medium text-foreground mb-2">Assessment Notes:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• All uploaded documents have been received and are accessible</li>
              <li>• Document completeness affects processing timeline</li>
              <li>• Missing documents may require clarification requests</li>
              <li>• File formats and quality will be verified during technical review</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}