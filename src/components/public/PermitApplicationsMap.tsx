import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { usePermitApplications } from '@/hooks/usePermitApplications';

interface PermitApplicationsMapProps {
  onPermitClick?: (permitId: string) => void;
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

export function PermitApplicationsMap({ onPermitClick }: PermitApplicationsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const { applications, loading } = usePermitApplications();

  useEffect(() => {
    if (!mapContainer.current || loading) return;

    // Initialize map only once
    if (!map.current) {
      mapboxgl.accessToken = 'pk.eyJ1IjoiZ2FidW5vcm1hbiIsImEiOiJjbWJ0emU0cGEwOHR1MmtxdXh2d2wzOTV5In0.RUVMHkS-KaJ6CGWUiB3s4w';
      
      map.current = new mapboxgl.Map({
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

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Ensure all interaction handlers are enabled after map load
      const enableInteractions = () => {
        map.current?.dragPan.enable();
        map.current?.scrollZoom.enable();
        map.current?.boxZoom.enable();
        map.current?.keyboard.enable();
        map.current?.doubleClickZoom.enable();
        map.current?.dragRotate.enable();
        map.current?.touchZoomRotate.enable();
      };
      if (map.current.loaded()) {
        enableInteractions();
      } else {
        map.current.on('load', enableInteractions);
      }

      // Debug any map interaction issues
      map.current.on('error', (e) => {
        console.error('Mapbox GL JS error:', e?.error || e);
      });
    }

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add markers for each permit application
    applications.forEach((app) => {
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

    return () => {
      // Don't remove the map on cleanup, just the markers
      // The map will be cleaned up when the component unmounts
    };
  }, [applications, loading, onPermitClick]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      markers.current.forEach(marker => marker.remove());
      map.current?.remove();
    };
  }, []);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Permit Applications Map
          {applications.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              ({applications.length} application{applications.length !== 1 ? 's' : ''})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div 
          ref={mapContainer} 
          className="h-96 w-full rounded-lg border border-border overflow-hidden cursor-grab active:cursor-grabbing pointer-events-auto select-none"
          style={{ touchAction: 'none' }}
        />
        {applications.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
            <div className="text-center text-muted-foreground">
              <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No permit applications to display</p>
            </div>
          </div>
        )}
        
        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#16a34a' }}></div>
            <span>Approved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3b82f6' }}></div>
            <span>Under Review</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f59e0b' }}></div>
            <span>Needs Clarification</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#dc2626' }}></div>
            <span>Rejected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#9ca3af' }}></div>
            <span>Draft</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
