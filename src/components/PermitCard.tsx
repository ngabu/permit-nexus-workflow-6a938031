
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Eye, Download } from 'lucide-react';

interface PermitCardProps {
  permit: {
    id: string;
    type: string;
    status: 'pending' | 'approved' | 'rejected' | 'under-review' | 'expired';
    submittedDate: string;
    expiryDate?: string;
    location: string;
    applicant: string;
  };
}

const PermitCard = ({ permit }: PermitCardProps) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success' as const;
      case 'pending':
        return 'warning' as const;
      case 'rejected':
        return 'destructive' as const;
      case 'under-review':
        return 'info' as const;
      case 'expired':
        return 'secondary' as const;
      default:
        return 'secondary' as const;
    }
  };

  return (
    <Card className="permit-card animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold text-card-foreground">
            {permit.type}
          </CardTitle>
          <Badge variant={getStatusVariant(permit.status)} className="status-badge">
            {permit.status.replace('-', ' ').toUpperCase()}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">ID: {permit.id}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-card-foreground">
            <Calendar className="h-4 w-4 mr-2 text-primary" />
            <span>Submitted: {permit.submittedDate}</span>
          </div>
          {permit.expiryDate && (
            <div className="flex items-center text-sm text-card-foreground">
              <Calendar className="h-4 w-4 mr-2 text-primary" />
              <span>Expires: {permit.expiryDate}</span>
            </div>
          )}
          <div className="flex items-center text-sm text-card-foreground">
            <MapPin className="h-4 w-4 mr-2 text-primary" />
            <span>{permit.location}</span>
          </div>
        </div>
        
        <div className="pt-2 border-t border-border">
          <p className="text-sm text-card-foreground mb-3">
            Applicant: <span className="font-semibold">{permit.applicant}</span>
          </p>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PermitCard;
