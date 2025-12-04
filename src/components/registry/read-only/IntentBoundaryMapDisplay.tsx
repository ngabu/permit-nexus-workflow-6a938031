import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import area from '@turf/area';
import { polygon } from '@turf/helpers';

interface IntentBoundaryMapDisplayProps {
  projectBoundary: any;
  activityLocation?: string;
  province?: string;
  district?: string;
  llg?: string;
}

export function IntentBoundaryMapDisplay({ projectBoundary, activityLocation, province, district, llg }: IntentBoundaryMapDisplayProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [areaInfo, setAreaInfo] = useState<{ sqKm: number; hectares: number } | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !projectBoundary) return;

    // Set Mapbox access token
    mapboxgl.accessToken = 'pk.eyJ1IjoiZ2FidW5vcm1hbiIsImEiOiJjbWJ0emU0cGEwOHR1MmtxdXh2d2wzOTV5In0.RUVMHkS-KaJ6CGWUiB3s4w';
    
    // Calculate area
    const geoJsonPolygon = projectBoundary.type === 'Polygon' 
      ? polygon(projectBoundary.coordinates)
      : polygon(projectBoundary.geometry.coordinates);
    
    const areaSqMeters = area(geoJsonPolygon);
    const areaSqKm = areaSqMeters / 1_000_000;
    const areaHectares = areaSqMeters / 10_000;
    
    setAreaInfo({ sqKm: areaSqKm, hectares: areaHectares });

    // Calculate bounds for the polygon
    const coordinates = projectBoundary.type === 'Polygon' 
      ? projectBoundary.coordinates[0]
      : projectBoundary.geometry.coordinates[0];
    
    const bounds = new mapboxgl.LngLatBounds();
    coordinates.forEach((coord: [number, number]) => {
      bounds.extend(coord);
    });

    const center = bounds.getCenter();
    
    // Initialize map with appropriate zoom to see street names (14-16)
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [center.lng, center.lat],
      zoom: 14,
      interactive: true,
      cooperativeGestures: false,
    });

    // Explicitly enable all interactions after map init
    map.current.scrollZoom.enable();
    map.current.dragPan.enable();
    map.current.dragRotate.enable();
    map.current.touchZoomRotate.enable();
    map.current.keyboard.enable();
    map.current.doubleClickZoom.enable();

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      if (!map.current) return;

      // Add the boundary as a source
      map.current.addSource('boundary', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: projectBoundary.type === 'Polygon' 
            ? projectBoundary 
            : projectBoundary.geometry
        }
      });

      // Add fill layer
      map.current.addLayer({
        id: 'boundary-fill',
        type: 'fill',
        source: 'boundary',
        paint: {
          'fill-color': '#ff0000',
          'fill-opacity': 0.2
        }
      });

      // Add outline layer
      map.current.addLayer({
        id: 'boundary-outline',
        type: 'line',
        source: 'boundary',
        paint: {
          'line-color': '#ff0000',
          'line-width': 2,
          'line-dasharray': [2, 2]
        }
      });

      // Fit map to bounds with padding at street level
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 17 // Ensure we stay zoomed in enough to see streets
      });

      // Add center marker
      new mapboxgl.Marker({ 
        color: '#ef4444',
        scale: 1.2
      })
        .setLngLat([center.lng, center.lat])
        .addTo(map.current);

      // Add popup with area information
      const locationInfo = [
        province ? `<strong>Province:</strong> ${province}` : null,
        district ? `<strong>District:</strong> ${district}` : null,
        llg ? `<strong>LLG:</strong> ${llg}` : null
      ].filter(Boolean).join('<br/>');

      const popup = new mapboxgl.Popup({ 
        offset: 25,
        closeButton: true,
        closeOnClick: false,
        maxWidth: '400px'
      })
        .setLngLat([center.lng, center.lat])
        .setHTML(`
          <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
            <h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #1a1a1a; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
              Expression of Interest Boundary
            </h4>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              ${activityLocation ? `
                <div style="margin-bottom: 8px; padding: 8px; background: #f3f4f6; border-radius: 6px;">
                  <p style="margin: 0; font-size: 13px; color: #6b7280;">Location</p>
                  <p style="margin: 4px 0 0 0; font-size: 14px; font-weight: 500; color: #111827;">${activityLocation}</p>
                </div>
              ` : ''}
              ${locationInfo ? `
                <div style="margin-bottom: 8px; padding: 10px; background: #f3f4f6; border-radius: 6px;">
                  <p style="margin: 0; font-size: 13px; color: #374151; line-height: 1.6;">
                    ${locationInfo}
                  </p>
                </div>
              ` : ''}
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div style="padding: 10px; background: #ecfdf5; border-radius: 6px; border-left: 3px solid #10b981;">
                  <p style="margin: 0; font-size: 12px; color: #059669; font-weight: 600;">AREA (sq km)</p>
                  <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 700; color: #047857;">${areaSqKm.toFixed(2)}</p>
                </div>
                <div style="padding: 10px; background: #fef3c7; border-radius: 6px; border-left: 3px solid #f59e0b;">
                  <p style="margin: 0; font-size: 12px; color: #d97706; font-weight: 600;">AREA (ha)</p>
                  <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 700; color: #b45309;">${areaHectares.toFixed(2)}</p>
                </div>
              </div>
              <div style="margin-top: 4px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; font-size: 12px; color: #6b7280;">
                  <strong>Center:</strong> ${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}
                </p>
              </div>
            </div>
          </div>
        `)
        .addTo(map.current);
    });

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [projectBoundary, activityLocation, province, district, llg]);

  if (!projectBoundary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Proposed Project Site Mapping
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center bg-muted/50 rounded-lg">
            <div className="text-center text-muted-foreground">
              <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No project boundary defined</p>
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
          Proposed Project Site Mapping
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          ref={mapContainer} 
          className="h-96 w-full rounded-lg border border-border overflow-hidden"
          style={{ touchAction: 'none' }}
        />
        {areaInfo && (
          <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-primary/10 rounded-lg">
              <p className="text-muted-foreground text-xs font-medium mb-1">Area (sq km)</p>
              <p className="font-bold text-lg">{areaInfo.sqKm.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <p className="text-muted-foreground text-xs font-medium mb-1">Area (hectares)</p>
              <p className="font-bold text-lg">{areaInfo.hectares.toFixed(2)}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
