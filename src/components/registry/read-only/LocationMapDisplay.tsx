import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

interface LocationMapDisplayProps {
  coordinates: {
    lat: number;
    lng: number;
  };
  activityLocation?: string;
}

export function LocationMapDisplay({ coordinates, activityLocation }: LocationMapDisplayProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !coordinates) return;

    // Set Mapbox access token - using the same one from LocationTab
    mapboxgl.accessToken = 'pk.eyJ1IjoiZ2FidW5vcm1hbiIsImEiOiJjbWJ0emU0cGEwOHR1MmtxdXh2d2wzOTV5In0.RUVMHkS-KaJ6CGWUiB3s4w';
    
    // Initialize map centered on the coordinates
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [coordinates.lng, coordinates.lat],
      zoom: 12,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add marker for the location
    const marker = new mapboxgl.Marker({ 
      color: '#ef4444',
      scale: 1.2
    })
      .setLngLat([coordinates.lng, coordinates.lat])
      .addTo(map.current);

    // Add popup with location details
    if (activityLocation) {
      const popup = new mapboxgl.Popup({ 
        offset: 25,
        closeButton: false,
        closeOnClick: false
      })
        .setLngLat([coordinates.lng, coordinates.lat])
        .setHTML(`
          <div class="p-2">
            <h4 class="font-medium text-sm mb-1">Project Location</h4>
            <p class="text-xs text-gray-600">${activityLocation}</p>
            <p class="text-xs text-gray-500 mt-1">
              ${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}
            </p>
          </div>
        `)
        .addTo(map.current);
    }

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [coordinates, activityLocation]);

  if (!coordinates || !coordinates.lat || !coordinates.lng) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Location Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
            <div className="text-center text-muted-foreground">
              <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No coordinates available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Location Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          ref={mapContainer} 
          className="h-64 w-full rounded-lg border border-border overflow-hidden"
        />
        <div className="mt-3 text-sm text-muted-foreground">
          <p><strong>Coordinates:</strong> {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}</p>
          {activityLocation && (
            <p><strong>Location:</strong> {activityLocation}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}