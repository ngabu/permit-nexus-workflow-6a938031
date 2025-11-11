import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Globe, Navigation } from 'lucide-react';
import { PermitForAssessment } from '../types';
import { LocationMapDisplay } from './LocationMapDisplay';

interface LocationReadOnlyProps {
  permit: PermitForAssessment;
}

export function LocationReadOnly({ permit }: LocationReadOnlyProps) {
  // Extract actual location data from permit with safe property access
  const coordinates = (permit as any).coordinates || { lat: -6.314993, lng: 143.95555 };
  const locationDetails = {
    description: (permit as any).activity_location || 'Location information not available',
    coordinates: coordinates,
    landType: (permit as any).land_type || 'Not specified',
    tenure: (permit as any).tenure || 'Not specified',
    existingPermits: (permit as any).existing_permits_details || 'Not specified',
    landownerStatus: (permit as any).landowner_negotiation_status || 'Not specified',
    legalDescription: (permit as any).legal_description || 'Not specified',
    ownerName: (permit as any).owner_name || 'Not specified'
  };

  return (
    <div className="space-y-6">
      {/* Interactive Map */}
      <LocationMapDisplay 
        coordinates={locationDetails.coordinates}
        activityLocation={locationDetails.description}
      />

      {/* Location Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Project Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Location Description</label>
            <p className="mt-1 p-3 bg-muted rounded-lg">
              {locationDetails.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Land Type</label>
              <Badge variant="outline" className="mt-1">
                {locationDetails.landType}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tenure</label>
              <Badge variant="outline" className="mt-1">
                {locationDetails.tenure}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coordinates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-primary" />
            Geographic Coordinates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Latitude</label>
              <p className="font-medium font-mono">
                {locationDetails.coordinates.lat.toFixed(6)}°
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Longitude</label>
              <p className="font-medium font-mono">
                {locationDetails.coordinates.lng.toFixed(6)}°
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Coordinate System</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              WGS84 Decimal Degrees
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Land Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Land Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Legal Description</label>
            <p className="mt-1 p-3 bg-muted rounded-lg">
              {locationDetails.legalDescription}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Owner Name</label>
            <p className="mt-1 p-3 bg-muted rounded-lg">
              {locationDetails.ownerName}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Existing Permits</label>
            <p className="mt-1 p-3 bg-muted rounded-lg">
              {locationDetails.existingPermits}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Landowner Negotiation Status</label>
            <p className="mt-1 p-3 bg-muted rounded-lg">
              {locationDetails.landownerStatus}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Location Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Location Assessment Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="font-medium text-amber-800 mb-2">Assessment Considerations:</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Verify coordinates accuracy using GPS or survey data</li>
              <li>• Check proximity to sensitive environmental areas</li>
              <li>• Review existing land use and zoning requirements</li>
              <li>• Assess accessibility and infrastructure requirements</li>
              <li>• Confirm landowner consultation status</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}