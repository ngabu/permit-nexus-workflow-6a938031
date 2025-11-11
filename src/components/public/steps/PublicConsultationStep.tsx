import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar, Upload, Users, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PublicConsultationStepProps {
  data: any;
  onChange: (data: any) => void;
}

export function PublicConsultationStep({ data, onChange }: PublicConsultationStepProps) {
  const isRequired = ['Level 2', 'Level 3'].includes(data.activity_level);
  
  if (!isRequired) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-muted-foreground" />
            Public Consultation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-sidebar rounded-lg text-center">
            <p className="text-muted-foreground">
              Public consultation is not required for {data.activity_level || 'this activity level'}.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        console.error('User not authenticated');
        return;
      }

      const uploadedFileData = [];
      
      for (const file of files) {
        // Upload file to storage
        const fileName = `${Date.now()}-${Math.random()}.${file.name.split('.').pop()}`;
        const filePath = `${userData.user.id}/consultation-documents/${fileName}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          continue;
        }

        // Save document record to database
        const { data: docData, error: docError } = await supabase
          .from('documents')
          .insert({
            filename: file.name,
            file_path: filePath,
            file_size: file.size,
            mime_type: file.type,
            user_id: userData.user.id,
            document_type: 'public_consultation'
          })
          .select()
          .single();

        if (docError) {
          console.error('Database save error:', docError);
          continue;
        }

        uploadedFileData.push({
          id: docData.id,
          name: file.name,
          size: file.size,
          type: file.type,
          file_path: filePath,
          document_id: docData.id
        });
      }
      
      const existingFiles = data.public_consultation_proof || [];
      onChange({ 
        public_consultation_proof: [...existingFiles, ...uploadedFileData] 
      });
    } catch (error) {
      console.error('Error uploading consultation files:', error);
    }
  };

  const removeFile = async (fileId: string) => {
    try {
      const fileToRemove = (data.public_consultation_proof || []).find((file: any) => file.id === fileId);
      
      if (fileToRemove?.file_path) {
        // Delete from storage
        await supabase.storage
          .from('documents')
          .remove([fileToRemove.file_path]);
        
        // Delete from database
        await supabase
          .from('documents')
          .delete()
          .eq('id', fileToRemove.document_id || fileToRemove.id);
      }
      
      const updatedFiles = (data.public_consultation_proof || []).filter((file: any) => file.id !== fileId);
      onChange({ public_consultation_proof: updatedFiles });
    } catch (error) {
      console.error('Error removing consultation file:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Public Consultation
        </CardTitle>
        <CardDescription>
          Public consultation is required for {data.activity_level} activities under PNG Environment Act 2000
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800">Public Consultation Requirements</h4>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• Public notice must be published in national newspapers</li>
                <li>• Consultation period: minimum 30 days for Level 2, 60 days for Level 3</li>
                <li>• Community meetings must be held in affected areas</li>
                <li>• All public comments must be documented and addressed</li>
                <li>• Minutes of public meetings must be submitted</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="consultation_period_start">Consultation Start Date *</Label>
            <Input
              type="date"
              id="consultation_period_start"
              value={data.consultation_period_start || ''}
              onChange={(e) => onChange({ consultation_period_start: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="consultation_period_end">Consultation End Date *</Label>
            <Input
              type="date"
              id="consultation_period_end"
              value={data.consultation_period_end || ''}
              onChange={(e) => onChange({ consultation_period_end: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">Public Consultation Evidence *</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Upload proof of public consultation including newspaper advertisements, meeting minutes, and public comments
            </p>
            
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-2">
                Click to upload consultation documents
              </p>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                onChange={handleFileUpload}
                className="hidden"
                id="consultation-upload"
              />
              <Button 
                type="button" 
                variant="outline"
                onClick={() => document.getElementById('consultation-upload')?.click()}
              >
                Choose Files
              </Button>
            </div>
          </div>

          {/* Display uploaded files */}
          {data.public_consultation_proof && data.public_consultation_proof.length > 0 && (
            <div className="space-y-2">
              <Label>Uploaded Documents</Label>
              <div className="space-y-2">
                {data.public_consultation_proof.map((file: any) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-sidebar rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                        <Upload className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {data.activity_level === 'Level 3' && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="font-medium text-amber-800 mb-2">Additional Level 3 Requirements</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Environmental Impact Statement (EIS) must be made available for public review</li>
              <li>• Extended consultation period (minimum 60 days)</li>
              <li>• Public hearings may be required by CEPA</li>
              <li>• Independent review panel may be established</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}