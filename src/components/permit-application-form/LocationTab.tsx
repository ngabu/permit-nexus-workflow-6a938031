import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface LocationTabProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
}

const LocationTab: React.FC<LocationTabProps> = ({ formData, handleInputChange }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Set Mapbox access token
    mapboxgl.accessToken = 'pk.eyJ1IjoiZ2FidW5vcm1hbiIsImEiOiJjbWJ0emU0cGEwOHR1MmtxdXh2d2wzOTV5In0.RUVMHkS-KaJ6CGWUiB3s4w';
    
    // Initialize map centered on Papua New Guinea
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [143.95555, -6.314993], // Papua New Guinea center
      zoom: 5.5,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add marker for current coordinates
    const marker = new mapboxgl.Marker({ color: '#ef4444', draggable: true })
      .setLngLat([formData.coordinates.lng, formData.coordinates.lat])
      .addTo(map.current);

    // Update coordinates when marker is dragged
    marker.on('dragend', () => {
      const lngLat = marker.getLngLat();
      handleInputChange('coordinates', {
        lat: parseFloat(lngLat.lat.toFixed(6)),
        lng: parseFloat(lngLat.lng.toFixed(6))
      });
    });

    // Add click event to set coordinates
    map.current.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      marker.setLngLat([lng, lat]);
      handleInputChange('coordinates', {
        lat: parseFloat(lat.toFixed(6)),
        lng: parseFloat(lng.toFixed(6))
      });
    });

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  // Update marker position when coordinates change via input
  useEffect(() => {
    if (map.current && mapLoaded) {
      const markers = map.current.getCanvasContainer().querySelectorAll('.mapboxgl-marker');
      if (markers.length > 0) {
        const marker = markers[0] as any;
        if (marker._marker) {
          marker._marker.setLngLat([formData.coordinates.lng, formData.coordinates.lat]);
        }
      }
    }
  }, [formData.coordinates, mapLoaded]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Project Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="projectLocation">Project Location Description *</Label>
          <Textarea
            id="projectLocation"
            value={formData.projectLocation}
            onChange={(e) => handleInputChange('projectLocation', e.target.value)}
            placeholder="Provide a detailed description of the project location, including address, landmarks, and accessibility"
            rows={3}
            required
          />
        </div>

        {/* Land Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Land Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="land_type">Land Type *</Label>
              <Select 
                value={formData.land_type || ''} 
                onValueChange={(value) => handleInputChange('land_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select land type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customary">Customary</SelectItem>
                  <SelectItem value="alienated">Alienated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="owner_name">Land Owner Name</Label>
              <Input
                id="owner_name"
                value={formData.owner_name || ''}
                onChange={(e) => handleInputChange('owner_name', e.target.value)}
                placeholder="Enter land owner name"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="legal_description">Legal Description of Land</Label>
            <Textarea
              id="legal_description"
              value={formData.legal_description || ''}
              onChange={(e) => handleInputChange('legal_description', e.target.value)}
              placeholder="Enter the legal description of the land involved"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="tenure">Tenure Details</Label>
            <Input
              id="tenure"
              value={formData.tenure || ''}
              onChange={(e) => handleInputChange('tenure', e.target.value)}
              placeholder="Enter tenure details"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="latitude">Latitude *</Label>
            <Input
              id="latitude"
              type="number"
              step="any"
              value={formData.coordinates.lat}
              onChange={(e) => handleInputChange('coordinates', { ...formData.coordinates, lat: parseFloat(e.target.value) || 0 })}
              placeholder="-9.4780"
              required
            />
          </div>
          <div>
            <Label htmlFor="longitude">Longitude *</Label>
            <Input
              id="longitude"
              type="number"
              step="any"
              value={formData.coordinates.lng}
              onChange={(e) => handleInputChange('coordinates', { ...formData.coordinates, lng: parseFloat(e.target.value) || 0 })}
              placeholder="147.1494"
              required
            />
          </div>
        </div>

        <div className="bg-muted/30 p-4 rounded-lg">
          <h4 className="font-medium text-foreground mb-2">Location Guidelines</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Provide accurate GPS coordinates in decimal degrees</li>
            <li>• Include detailed access routes and transportation information</li>
            <li>• Mention any sensitive areas or protected zones nearby</li>
            <li>• Describe the current land use and ownership status</li>
          </ul>
        </div>

        <div>
          <Label className="text-sm font-medium text-foreground mb-2 block">
            Interactive Map - Click or drag marker to set coordinates
          </Label>
          <div 
            ref={mapContainer} 
            className="h-96 w-full rounded-lg border border-border overflow-hidden"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationTab;