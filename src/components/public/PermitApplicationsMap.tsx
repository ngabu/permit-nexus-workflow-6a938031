import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Filter } from 'lucide-react';
import { usePermitApplications } from '@/hooks/usePermitApplications';
import { Button } from '@/components/ui/button';

interface PermitApplicationsMapProps {
  onPermitClick?: (permitId: string) => void;
  showAllApplications?: boolean;
  defaultStatuses?: string[];
}

// Status to color mapping
const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'approved':
      return '#16a34a'; // green
    case 'rejected':
      return '#dc2626'; // red
    case 'submitted':
    case 'under_initial_review':
    case 'initial_assessment_passed':
    case 'pending_technical_assessment':
    case 'under_technical_assessment':
      return '#3b82f6'; // blue
    case 'requires_clarification':
      return '#f59e0b'; // amber
    case 'draft':
      return '#9ca3af'; // gray
    default:
      return '#6b7280'; // default gray
  }
};

const getStatusLabel = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'under_initial_review':
      return 'Under Initial Review';
    case 'initial_assessment_passed':
      return 'Initial Assessment Passed';
    case 'pending_technical_assessment':
      return 'Pending Technical Assessment';
    case 'under_technical_assessment':
      return 'Under Technical Assessment';
    case 'requires_clarification':
      return 'Requires Clarification';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

export function PermitApplicationsMap({ 
  onPermitClick,
  showAllApplications = false,
  defaultStatuses = ['approved']
}: PermitApplicationsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const { applications, loading } = usePermitApplications();
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(defaultStatuses);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map once
  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = 'pk.eyJ1IjoiZ2FidW5vcm1hbiIsImEiOiJjbWJ0emU0cGEwOHR1MmtxdXh2d2wzOTV5In0.RUVMHkS-KaJ6CGWUiB3s4w';
    
    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [147, -6], // PNG center
      zoom: 5.2,
      interactive: true,
      dragPan: true,
      scrollZoom: true,
      boxZoom: true,
      dragRotate: true,
      keyboard: true,
      doubleClickZoom: true,
      touchZoomRotate: true,
      touchPitch: true,
    });

    mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');

    mapInstance.on('load', () => {
      setMapLoaded(true);
      mapInstance.dragPan.enable();
      mapInstance.scrollZoom.enable();
      mapInstance.boxZoom.enable();
      mapInstance.keyboard.enable();
      mapInstance.doubleClickZoom.enable();
      mapInstance.dragRotate.enable();
      mapInstance.touchZoomRotate.enable();
    });

    mapInstance.on('error', (e) => {
      console.error('Mapbox GL JS error:', e?.error || e);
    });

    map.current = mapInstance;

    return () => {
      if (map.current) {
        markers.current.forEach(marker => marker.remove());
        markers.current = [];
        map.current.remove();
        map.current = null;
        setMapLoaded(false);
      }
    };
  }, []);

  // Manage markers separately
  useEffect(() => {
    if (!mapLoaded || !map.current || loading) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Filter applications by selected statuses
    const filteredApplications = applications.filter(app => 
      selectedStatuses.includes(app.status)
    );

    // Add markers for each permit application
    filteredApplications.forEach((app) => {
      // Get coordinates from the application
      let lat: number | null = null;
      let lng: number | null = null;

      // Try to parse coordinates if they exist
      if (app.coordinates) {
        try {
          const coords = typeof app.coordinates === 'string' 
            ? JSON.parse(app.coordinates) 
            : app.coordinates;
          
          if (coords && typeof coords === 'object') {
            lat = coords.lat || coords.latitude;
            lng = coords.lng || coords.longitude;
          }
        } catch (error) {
          console.error('Error parsing coordinates:', error);
        }
      }

      // Skip if no valid coordinates or if they're the default PNG center
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) return;
      if (lat === -6.314993 && lng === 143.95555) return; // Skip default coordinates

      const statusColor = getStatusColor(app.status);
      const statusLabel = getStatusLabel(app.status);

      // Create marker element with pin icon
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.innerHTML = `
        <svg width="32" height="32" viewBox="0 0 24 24" fill="${statusColor}" stroke="white" stroke-width="1.5" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3" fill="white"></circle>
        </svg>
      `;
      el.style.cursor = 'pointer';

      // Create popup content
      const popupContent = `
        <div style="padding: 8px; min-width: 200px;">
          <h4 style="font-weight: 600; margin-bottom: 8px; color: #1f2937;">${app.title || 'Untitled Project'}</h4>
          <p style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">
            <strong>Status:</strong> ${statusLabel}
          </p>
          ${app.entity?.name ? `
            <p style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">
              <strong>Entity:</strong> ${app.entity.name}
            </p>
          ` : ''}
          ${app.details?.activity_location ? `
            <p style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">
              <strong>Location:</strong> ${app.details.activity_location}
            </p>
          ` : ''}
          <p style="font-size: 11px; color: #9ca3af; margin-top: 6px; font-style: italic;">
            Click to view full details
          </p>
        </div>
      `;

      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        closeOnClick: false
      }).setHTML(popupContent);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .addTo(map.current!);

      // Add hover effect with popup
      el.addEventListener('mouseenter', () => {
        popup.setLngLat([lng, lat]).addTo(map.current!);
      });
      el.addEventListener('mouseleave', () => {
        popup.remove();
      });

      // Add click handler
      el.addEventListener('click', () => {
        if (onPermitClick) {
          onPermitClick(app.id);
        }
      });

      markers.current.push(marker);
    });
  }, [applications, mapLoaded, selectedStatuses, onPermitClick, loading]);

  const availableStatuses = ['approved', 'pending', 'under_review', 'rejected', 'draft', 'submitted'];

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Permit Applications Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center bg-muted/50 rounded-lg">
            <div className="text-center text-muted-foreground">
              <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50 animate-pulse" />
              <p>Loading map...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredApplications = applications.filter(app => 
    selectedStatuses.includes(app.status)
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Permit Applications Map
            {filteredApplications.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''})
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filter by Status</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative">
        {/* Status Filter Buttons */}
        <div className="mb-4 flex flex-wrap gap-2">
          {availableStatuses.map(status => (
            <Button
              key={status}
              variant={selectedStatuses.includes(status) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleStatus(status)}
              className="capitalize"
            >
              <div 
                className="w-3 h-3 rounded-full mr-2 border border-white" 
                style={{ backgroundColor: getStatusColor(status) }}
              />
              {getStatusLabel(status)}
            </Button>
          ))}
        </div>

        <div 
          ref={mapContainer} 
          className="h-[500px] w-full rounded-lg border border-border overflow-hidden cursor-grab active:cursor-grabbing pointer-events-auto select-none"
          style={{ touchAction: 'none' }}
        />
        {filteredApplications.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
            <div className="text-center text-muted-foreground">
              <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No permit applications match the selected filters</p>
            </div>
          </div>
        )}
        
        {/* Legend */}
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm font-medium mb-3">Status Legend</p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-white shadow" style={{ backgroundColor: '#16a34a' }}></div>
              <span className="text-xs">Approved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-white shadow" style={{ backgroundColor: '#3b82f6' }}></div>
              <span className="text-xs">Under Review</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-white shadow" style={{ backgroundColor: '#f59e0b' }}></div>
              <span className="text-xs">Needs Clarification</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-white shadow" style={{ backgroundColor: '#dc2626' }}></div>
              <span className="text-xs">Rejected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-white shadow" style={{ backgroundColor: '#9ca3af' }}></div>
              <span className="text-xs">Draft</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
