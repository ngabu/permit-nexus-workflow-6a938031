import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';

interface LocationTabProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
}

const LocationTab: React.FC<LocationTabProps> = ({ formData, handleInputChange }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [projectBoundary, setProjectBoundary] = useState<any>(null);

  // Fetch project boundary from linked intent registration
  useEffect(() => {
    const fetchProjectBoundary = async () => {
      if (!formData.intent_registration_id) return;
      
      try {
        const { data, error } = await supabase
          .from('intent_registrations')
          .select('project_boundary')
          .eq('id', formData.intent_registration_id)
          .single();
        
        if (error) throw error;
        
        if (data?.project_boundary) {
          setProjectBoundary(data.project_boundary);
        }
      } catch (error) {
        console.error('Error fetching project boundary:', error);
      }
    };
    
    fetchProjectBoundary();
  }, [formData.intent_registration_id]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Set Mapbox access token
    mapboxgl.accessToken = 'pk.eyJ1IjoiZ2FidW5vcm1hbiIsImEiOiJjbWJ0emU0cGEwOHR1MmtxdXh2d2wzOTV5In0.RUVMHkS-KaJ6CGWUiB3s4w';
    
    // Initialize map to display full Papua New Guinea
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [147.1494, -6.5], // Centered on PNG
      zoom: 5, // Zoom level to show full PNG
      minZoom: 4, // Prevent zooming out too far
      maxZoom: 18, // Allow detailed zoom
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl({
      showCompass: true,
      showZoom: true,
      visualizePitch: false
    }), 'top-right');

    // Ensure scroll zoom is enabled
    map.current.scrollZoom.enable();
    map.current.doubleClickZoom.enable();
    map.current.touchZoomRotate.enable();

    // Add marker for current coordinates
    marker.current = new mapboxgl.Marker({ 
      color: '#ef4444', 
      draggable: true,
      scale: 1.2
    })
      .setLngLat([
        formData.coordinates.lng || 147.1494, 
        formData.coordinates.lat || -6.314993
      ])
      .addTo(map.current);

    // Update coordinates when marker is dragged
    marker.current.on('dragend', () => {
      const lngLat = marker.current!.getLngLat();
      handleInputChange('coordinates', {
        lat: parseFloat(lngLat.lat.toFixed(6)),
        lng: parseFloat(lngLat.lng.toFixed(6))
      });
    });

    // Add click event to set coordinates
    map.current.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      marker.current!.setLngLat([lng, lat]);
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

  // Add project boundary layer
  useEffect(() => {
    if (!map.current || !mapLoaded || !projectBoundary) return;

    const sourceId = 'project-boundary-source';
    const layerId = 'project-boundary';

    // Remove existing layers if they exist
    if (map.current.getLayer(`${layerId}-fill`)) {
      map.current.removeLayer(`${layerId}-fill`);
    }
    if (map.current.getLayer(layerId)) {
      map.current.removeLayer(layerId);
    }
    if (map.current.getSource(sourceId)) {
      map.current.removeSource(sourceId);
    }

    // Add source
    map.current.addSource(sourceId, {
      type: 'geojson',
      data: projectBoundary
    });

    // Add fill layer
    map.current.addLayer({
      id: `${layerId}-fill`,
      type: 'fill',
      source: sourceId,
      paint: {
        'fill-color': '#3b82f6',
        'fill-opacity': 0.2
      }
    });

    // Add outline layer
    map.current.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': '#3b82f6',
        'line-width': 3,
        'line-opacity': 0.8
      }
    });

    // Fit map to boundary
    const bounds = new mapboxgl.LngLatBounds();
    if (projectBoundary.type === 'FeatureCollection') {
      projectBoundary.features.forEach((feature: any) => {
        if (feature.geometry.type === 'Polygon') {
          feature.geometry.coordinates[0].forEach((coord: [number, number]) => {
            bounds.extend(coord);
          });
        } else if (feature.geometry.type === 'MultiPolygon') {
          feature.geometry.coordinates.forEach((polygon: any) => {
            polygon[0].forEach((coord: [number, number]) => {
              bounds.extend(coord);
            });
          });
        }
      });
    } else if (projectBoundary.geometry) {
      if (projectBoundary.geometry.type === 'Polygon') {
        projectBoundary.geometry.coordinates[0].forEach((coord: [number, number]) => {
          bounds.extend(coord);
        });
      } else if (projectBoundary.geometry.type === 'MultiPolygon') {
        projectBoundary.geometry.coordinates.forEach((polygon: any) => {
          polygon[0].forEach((coord: [number, number]) => {
            bounds.extend(coord);
          });
        });
      }
    }

    map.current.fitBounds(bounds, { padding: 50 });
  }, [mapLoaded, projectBoundary]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Project Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projectLocation">Activity Location / Site Address</Label>
            <Textarea
              id="projectLocation"
              value={formData.projectLocation}
              onChange={(e) => handleInputChange('projectLocation', e.target.value)}
              placeholder="Enter the specific location or address where the activity will take place"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="0.000001"
                value={formData.coordinates.lat}
                onChange={(e) => handleInputChange('coordinates', {
                  ...formData.coordinates,
                  lat: parseFloat(e.target.value)
                })}
                placeholder="e.g., -6.314993"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="0.000001"
                value={formData.coordinates.lng}
                onChange={(e) => handleInputChange('coordinates', {
                  ...formData.coordinates,
                  lng: parseFloat(e.target.value)
                })}
                placeholder="e.g., 143.95555"
              />
            </div>
          </div>

          <div 
            ref={mapContainer} 
            className="h-96 w-full rounded-lg border border-border overflow-hidden"
          />
          
          <p className="text-sm text-muted-foreground">
            Click on the map to set coordinates or drag the marker to adjust the location.
          </p>
        </CardContent>
      </Card>

      {projectBoundary && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-4 h-0.5 bg-blue-500"></div>
              <span>Project Boundary from Intent Registration</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LocationTab;
