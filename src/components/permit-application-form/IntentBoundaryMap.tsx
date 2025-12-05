import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import area from '@turf/area';

interface IntentBoundaryMapProps {
  projectBoundary: any;
  province?: string;
  district?: string;
  llg?: string;
  projectSiteAddress?: string;
  projectSiteDescription?: string;
  activityDescription?: string;
}

const MAPBOX_TOKEN = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHRvaXlzeXMwMjdyMmlwbjR6cjl0NG11In0.vMKWgS-Lss5KSoIe7kocwQ';

const IntentBoundaryMap: React.FC<IntentBoundaryMapProps> = ({
  projectBoundary,
  province,
  district,
  llg,
  projectSiteAddress,
  projectSiteDescription,
  activityDescription,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const [centerCoords, setCenterCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [areaDisplay, setAreaDisplay] = useState<string>('');

  useEffect(() => {
    if (!mapContainer.current || !projectBoundary) return;

    // Cleanup previous map instance
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    // Create new map
    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [147.0, -6.0],
      zoom: 5,
    });

    mapInstance.current = newMap;

    newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

    newMap.on('load', () => {
      try {
        // Parse boundary data
        let boundaryData = typeof projectBoundary === 'string' 
          ? JSON.parse(projectBoundary) 
          : projectBoundary;

        // Wrap in Feature if needed
        if (boundaryData.type !== 'Feature' && boundaryData.type !== 'FeatureCollection') {
          boundaryData = {
            type: 'Feature',
            geometry: boundaryData,
            properties: {}
          };
        }

        // Calculate bounding box
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        const processCoords = (coords: number[][]) => {
          coords.forEach(coord => {
            minX = Math.min(minX, coord[0]);
            minY = Math.min(minY, coord[1]);
            maxX = Math.max(maxX, coord[0]);
            maxY = Math.max(maxY, coord[1]);
          });
        };

        const processGeometry = (geometry: any) => {
          if (geometry.type === 'Polygon') {
            geometry.coordinates.forEach(processCoords);
          } else if (geometry.type === 'MultiPolygon') {
            geometry.coordinates.forEach((polygon: number[][][]) => {
              polygon.forEach(processCoords);
            });
          }
        };

        if (boundaryData.type === 'FeatureCollection') {
          boundaryData.features.forEach((f: any) => processGeometry(f.geometry));
        } else if (boundaryData.type === 'Feature') {
          processGeometry(boundaryData.geometry);
        }

        const centerLng = (minX + maxX) / 2;
        const centerLat = (minY + maxY) / 2;
        setCenterCoords({ lat: centerLat, lng: centerLng });

        // Calculate area
        const areaInSqMeters = area(boundaryData);
        const areaInSqKm = areaInSqMeters / 1000000;
        const areaInHectares = areaInSqMeters / 10000;
        setAreaDisplay(areaInSqKm >= 1 ? `${areaInSqKm.toFixed(2)} km²` : `${areaInHectares.toFixed(2)} hectares`);

        // Add boundary layer
        newMap.addSource('project-boundary', {
          type: 'geojson',
          data: boundaryData,
        });

        newMap.addLayer({
          id: 'project-boundary-fill',
          type: 'fill',
          source: 'project-boundary',
          paint: {
            'fill-color': '#22c55e',
            'fill-opacity': 0.3,
          },
        });

        newMap.addLayer({
          id: 'project-boundary-outline',
          type: 'line',
          source: 'project-boundary',
          paint: {
            'line-color': '#16a34a',
            'line-width': 3,
          },
        });

        // Add center marker
        new mapboxgl.Marker({ color: '#16a34a' })
          .setLngLat([centerLng, centerLat])
          .addTo(newMap);

        // Fit to bounds
        newMap.fitBounds(
          [[minX, minY], [maxX, maxY]],
          { padding: 50, maxZoom: 15 }
        );

        // Create popup
        const popupHTML = `
          <div style="padding: 8px; min-width: 200px; font-family: system-ui, sans-serif;">
            <h4 style="margin: 0 0 8px 0; font-weight: 600; color: #16a34a; font-size: 14px;">Project Site Information</h4>
            <div style="font-size: 12px; line-height: 1.6; color: #333;">
              <p style="margin: 4px 0;"><strong>Area:</strong> ${areaInSqKm >= 1 ? areaInSqKm.toFixed(2) + ' km²' : areaInHectares.toFixed(2) + ' hectares'}</p>
              ${province ? `<p style="margin: 4px 0;"><strong>Province:</strong> ${province}</p>` : ''}
              ${district ? `<p style="margin: 4px 0;"><strong>District:</strong> ${district}</p>` : ''}
              ${llg ? `<p style="margin: 4px 0;"><strong>LLG:</strong> ${llg}</p>` : ''}
              ${projectSiteAddress ? `<p style="margin: 4px 0;"><strong>Address:</strong> ${projectSiteAddress}</p>` : ''}
              ${projectSiteDescription ? `<p style="margin: 4px 0;"><strong>Description:</strong> ${projectSiteDescription}</p>` : ''}
              ${activityDescription ? `<p style="margin: 4px 0;"><strong>Activity:</strong> ${activityDescription}</p>` : ''}
              <p style="margin: 4px 0;"><strong>Center:</strong> ${centerLat.toFixed(6)}, ${centerLng.toFixed(6)}</p>
            </div>
          </div>
        `;

        let currentPopup: mapboxgl.Popup | null = null;

        // Hover events
        newMap.on('mouseenter', 'project-boundary-fill', (e) => {
          newMap.getCanvas().style.cursor = 'pointer';
          
          if (currentPopup) currentPopup.remove();
          
          currentPopup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
          })
            .setLngLat(e.lngLat)
            .setHTML(popupHTML)
            .addTo(newMap);
        });

        newMap.on('mousemove', 'project-boundary-fill', (e) => {
          if (currentPopup) {
            currentPopup.setLngLat(e.lngLat);
          }
        });

        newMap.on('mouseleave', 'project-boundary-fill', () => {
          newMap.getCanvas().style.cursor = '';
          if (currentPopup) {
            currentPopup.remove();
            currentPopup = null;
          }
        });

      } catch (error) {
        console.error('Error initializing map:', error);
      }
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [projectBoundary, province, district, llg, projectSiteAddress, projectSiteDescription, activityDescription]);

  if (!projectBoundary) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Project Site Map (from Approved Intent)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div 
          ref={mapContainer} 
          className="w-full h-[400px] rounded-lg border border-border overflow-hidden"
        />
        {centerCoords && (
          <div className="grid grid-cols-3 gap-4 p-3 bg-muted/50 rounded-lg text-sm">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Latitude</Label>
              <p className="font-medium">{centerCoords.lat.toFixed(6)}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Longitude</Label>
              <p className="font-medium">{centerCoords.lng.toFixed(6)}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Area</Label>
              <p className="font-medium">{areaDisplay}</p>
            </div>
          </div>
        )}
        <p className="text-sm text-muted-foreground">
          Hover over the boundary to view project site details.
        </p>
      </CardContent>
    </Card>
  );
};

export default IntentBoundaryMap;
