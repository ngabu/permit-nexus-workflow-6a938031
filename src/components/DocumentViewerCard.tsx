import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DocumentViewerCardProps {
  file: {
    name: string;
    size?: number;
    file_path?: string;
    id?: string;
  };
}

export function DocumentViewerCard({ file }: DocumentViewerCardProps) {
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    if (!file.file_path) {
      toast({
        title: "Error",
        description: "Document not accessible - File stored as metadata only",
        variant: "destructive"
      });
      return;
    }

    setDownloading(true);
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(file.file_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Document downloaded successfully"
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive"
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleView = async () => {
    if (!file.file_path) {
      toast({
        title: "Error",
        description: "Document not accessible - File stored as metadata only",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(file.file_path, 3600); // 1 hour expiry

      if (error) throw error;

      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (error) {
      console.error('Error viewing file:', error);
      toast({
        title: "Error",
        description: "Failed to view document",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg bg-sidebar">
      <div className="flex items-center gap-3">
        <FileText className="w-4 h-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">{file.name}</p>
          {file.size && (
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleView}
          className="h-8 px-2"
        >
          <Eye className="w-3 h-3" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={downloading}
          className="h-8 px-2"
        >
          <Download className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}