import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User, 
  Building, 
  MapPin, 
  Upload, 
  Shield, 
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { PermitForAssessment } from '../types';
import { BasicInfoReadOnly } from './BasicInfoReadOnly';
import { ProjectAndSpecificDetailsReadOnly } from './ProjectAndSpecificDetailsReadOnly';
import { LocationReadOnly } from './LocationReadOnly';
import { DocumentsReadOnly } from './DocumentsReadOnly';
import { ComplianceReadOnly } from './ComplianceReadOnly';

interface PermitReadOnlyViewProps {
  permit: PermitForAssessment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PermitReadOnlyView({ 
  permit, 
  open, 
  onOpenChange 
}: PermitReadOnlyViewProps) {
  if (!permit) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      submitted: 'bg-blue-100 text-blue-800',
      under_initial_review: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      requires_clarification: 'bg-orange-100 text-orange-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Permit Application - {permit.title}
              </DialogTitle>
              <p className="text-muted-foreground mt-1">
                {permit.permit_number || 'No permit number assigned'}
              </p>
            </div>
            <div className="flex gap-2">
              {getStatusIcon(permit.status)}
              <Badge className={getStatusColor(permit.status)}>
                {permit.status.replace('_', ' ').toUpperCase()}
              </Badge>
              <Badge variant="outline">
                {permit.permit_type}
              </Badge>
            </div>
          </div>
          
          {/* Application Summary */}
          <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>Applied: {new Date(permit.application_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>Applicant: {permit.entity.name}</span>
            </div>
          </div>

          {/* Assignment Information */}
          {permit.assigned_officer && (
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border-t">
              <User className="w-4 h-4 text-green-600" />
              <span className="text-sm">
                Assigned to: {permit.assigned_officer.full_name || permit.assigned_officer.email}
              </span>
            </div>
          )}
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-200px)]">
          <Tabs defaultValue="basic-info" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic-info" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="project-details" className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                Project Details
              </TabsTrigger>
              <TabsTrigger value="location" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Documents
              </TabsTrigger>
              <TabsTrigger value="compliance" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Compliance
              </TabsTrigger>
            </TabsList>
            
            <div className="mt-6">
              <TabsContent value="basic-info" className="space-y-4">
                <BasicInfoReadOnly permit={permit} />
              </TabsContent>
              
              <TabsContent value="project-details" className="space-y-4">
                <ProjectAndSpecificDetailsReadOnly permit={permit} />
              </TabsContent>
              
              <TabsContent value="location" className="space-y-4">
                <LocationReadOnly permit={permit} />
              </TabsContent>
              
              <TabsContent value="documents" className="space-y-4">
                <DocumentsReadOnly permit={permit} />
              </TabsContent>
              
              <TabsContent value="compliance" className="space-y-4">
                <ComplianceReadOnly permit={permit} />
              </TabsContent>
            </div>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}