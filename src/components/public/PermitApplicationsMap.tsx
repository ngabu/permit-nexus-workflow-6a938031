import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Layers, Edit3, Upload, Info } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useGISData } from '@/hooks/useGISData';
import { useApprovedPermits } from '@/hooks/useApprovedPermits';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point, polygon } from '@turf/helpers';
import area from '@turf/area';
import { Badge } from '@/components/ui/badge';

interface PermitApplicationsMapProps {
  onPermitClick?: (permitId: string) => void;
  showAllApplications?: boolean;
  defaultStatuses?: string[];
  intentRegistrationId?: string;
  existingBoundary?: any;
  onBoundarySave?: (boundary: any, locationInfo?: {
    district?: string;
    province?: string;
    llg?: string;
    areaSqKm?: number;
  }) => void;
  coordinates?: { lat: number; lng: number };
  onCoordinatesChange?: (coordinates: { lat: number; lng: number }) => void;
  hideDrawingTools?: boolean;
  customTitle?: string;
  customDescription?: string;
  readOnly?: boolean;
  district?: string;
  province?: string;
  llg?: string;
}

export function PermitApplicationsMap({ 
  onPermitClick,
  showAllApplications = false,
  defaultStatuses = ['approved'],
  intentRegistrationId,
  existingBoundary,
  onBoundarySave,
  coordinates,
  onCoordinatesChange,
  hideDrawingTools = false,
  customTitle,
  customDescription,
  readOnly = false,
  district,
  province,
  llg
}: PermitApplicationsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const draw = useRef<MapboxDraw | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const popup = useRef<mapboxgl.Popup | null>(null);
  const hoverPopupRef = useRef<mapboxgl.Popup | null>(null);
  const eventListenersRef = useRef<Map<string, { mousemove: any; mouseleave: any }>>(new Map());
  const currentPopupRequestId = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const readOnlyRef = useRef<boolean>(readOnly);
  const aoiBoundaryPresentRef = useRef<boolean>(!!existingBoundary);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);
  const [pendingBoundary, setPendingBoundary] = useState<any>(null);
  const [uploadedAOI, setUploadedAOI] = useState<any>(null);
  const [uploadedAOIFeatureId, setUploadedAOIFeatureId] = useState<string | null>(null);
  const [drawnAOI, setDrawnAOI] = useState<any>(null);
  const [showAOIChoiceDialog, setShowAOIChoiceDialog] = useState(false);
  const aoiPopupRef = useRef<mapboxgl.Popup | null>(null);
  const [aoiAreaInfo, setAoiAreaInfo] = useState<{
    areaSqKm: number;
    areaHectares: number;
  } | null>(null);
  
  // GIS Layer toggles
  const [showDistricts, setShowDistricts] = useState(false);
  const [showLLGs, setShowLLGs] = useState(false);
  const [showUploadedAOI, setShowUploadedAOI] = useState(true);
  const [dbGISLayerToggles, setDbGISLayerToggles] = useState<{[key: string]: boolean}>({});
  
  // Permit level filters
  const [showLevel1, setShowLevel1] = useState(true);
  const [showLevel2, setShowLevel2] = useState(true);
  const [showLevel3, setShowLevel3] = useState(true);
  
  // Fetch approved permits
  const { permits, loading: permitsLoading } = useApprovedPermits();
  
  // Store permit markers
  const permitMarkers = useRef<mapboxgl.Marker[]>([]);
  
  const { 
    dbGISLayers,
    loadFromDatabase,
    loadGISLayerData
  } = useGISData();

  const [loadedLayerData, setLoadedLayerData] = useState<{[key: string]: any}>({});
  const [boundaryLayersData, setBoundaryLayersData] = useState<{
    districts: any;
    llgs: any;
  }>({
    districts: null,
    llgs: null
  });

  // Keep readOnlyRef in sync with readOnly prop
  useEffect(() => {
    readOnlyRef.current = readOnly;
  }, [readOnly]);

  // Keep aoiBoundaryPresentRef in sync with uploadedAOI and existingBoundary
  useEffect(() => {
    aoiBoundaryPresentRef.current = !!(uploadedAOI || existingBoundary);
  }, [uploadedAOI, existingBoundary]);

  // Helper function to forcefully remove all boundary popups
  const removeAllBoundaryPopups = useCallback(() => {
    // Remove from ref
    if (hoverPopupRef.current) {
      hoverPopupRef.current.remove();
      hoverPopupRef.current = null;
    }
    
    // Forcefully remove any lingering popups from DOM
    const popupClasses = ['district-popup', 'llg-popup', 'mapboxgl-popup'];
    popupClasses.forEach(className => {
      const existingPopups = document.querySelectorAll(`.${className}`);
      existingPopups.forEach(popup => {
        popup.remove();
      });
    });
  }, []);

  // Function to get province from Mapbox Geocoding API
  const getProvinceFromMapbox = useCallback(async (lng: number, lat: number) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?types=region&access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        return data.features[0].text || null;
      }
      return null;
    } catch (error) {
      console.error('Error fetching province from Mapbox:', error);
      return null;
    }
  }, []);

  // Function to find which district/LLG contains a point
  const findLocationInfo = useCallback(async (lng: number, lat: number) => {
    const pt = point([lng, lat]);
    let districtInfo = null;
    let llgInfo = null;

    const province = await getProvinceFromMapbox(lng, lat);

    // Check district boundaries
    if (showDistricts && boundaryLayersData.districts && boundaryLayersData.districts.features) {
      for (const feature of boundaryLayersData.districts.features) {
        if (booleanPointInPolygon(pt, feature)) {
          districtInfo = {
            district: feature.properties?.DISTNAME || 'Location not found',
            geocode: feature.properties?.GEOCODE,
            province: province || 'Papua New Guinea'
          };
          break;
        }
      }
    }

    // Check LLG boundaries
    if (showLLGs && boundaryLayersData.llgs && boundaryLayersData.llgs.features) {
      for (const feature of boundaryLayersData.llgs.features) {
        if (booleanPointInPolygon(pt, feature)) {
          llgInfo = {
            llg: feature.properties?.LLGNAME || 'Location not found',
            geocode: feature.properties?.GEOCODE,
            province: province || districtInfo?.province || 'Papua New Guinea'
          };
          break;
        }
      }
    }

    return { districtInfo, llgInfo };
  }, [showDistricts, showLLGs, boundaryLayersData, getProvinceFromMapbox]);

  // Function to update popup based on marker location (only for mouseover, no summary when both are active)
  const updatePopup = useCallback(async (lng: number, lat: number) => {
    if (!map.current) return;

    if (!showDistricts && !showLLGs) {
      popup.current?.remove();
      return;
    }

    const { districtInfo, llgInfo } = await findLocationInfo(lng, lat);

    let popupContent = '';

    // When both Districts and LLGs are active, don't show summary popup - only mouseover
    if (showDistricts && showLLGs && (llgInfo || districtInfo)) {
      // No popup content for summary when both are active
      popup.current?.remove();
      return;
    } else if (showDistricts && districtInfo) {
      popupContent = `<div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif; min-width: 320px; max-width: 400px;">
        <strong style="display: block; margin-bottom: 10px; color: #1a1a1a; font-size: 16px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">District Information</strong>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <p style="margin: 0; font-size: 14px; color: #374151;"><strong>District:</strong> <span style="color: #2563eb;">${districtInfo.district}</span></p>
          <p style="margin: 0; font-size: 14px; color: #374151;"><strong>Province:</strong> <span style="color: #dc2626;">${districtInfo.province}</span></p>
        </div>
      </div>`;
    } else if (showLLGs && llgInfo) {
      popupContent = `<div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif; min-width: 320px; max-width: 400px;">
        <strong style="display: block; margin-bottom: 10px; color: #1a1a1a; font-size: 16px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">LLG Information</strong>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <p style="margin: 0; font-size: 14px; color: #374151;"><strong>LLG:</strong> <span style="color: #059669;">${llgInfo.llg}</span></p>
          <p style="margin: 0; font-size: 14px; color: #374151;"><strong>Province:</strong> <span style="color: #dc2626;">${llgInfo.province}</span></p>
        </div>
      </div>`;
    }

    if (popupContent) {
      if (!popup.current) {
        popup.current = new mapboxgl.Popup({ 
          offset: 25, 
          closeButton: true, 
          closeOnClick: false,
          maxWidth: '450px'
        });
      }
      popup.current.setLngLat([lng, lat]).setHTML(popupContent).addTo(map.current);
    } else {
      popup.current?.remove();
    }
  }, [findLocationInfo, showDistricts, showLLGs]);

  // Function to extract location info and area from a geometry
  const extractLocationInfoFromGeometry = useCallback(async (geometry: any) => {
    try {
      // Calculate area
      const areaSqMeters = area(geometry);
      const areaSqKm = areaSqMeters / 1_000_000;

      // Get centroid or first coordinate to detect location
      let lng, lat;
      if (geometry.type === 'Polygon') {
        // Get center of first ring
        const coords = geometry.coordinates[0];
        lng = coords.reduce((sum: number, coord: number[]) => sum + coord[0], 0) / coords.length;
        lat = coords.reduce((sum: number, coord: number[]) => sum + coord[1], 0) / coords.length;
      } else if (geometry.type === 'MultiPolygon') {
        // Get center of first polygon's first ring
        const coords = geometry.coordinates[0][0];
        lng = coords.reduce((sum: number, coord: number[]) => sum + coord[0], 0) / coords.length;
        lat = coords.reduce((sum: number, coord: number[]) => sum + coord[1], 0) / coords.length;
      } else if (geometry.type === 'Point') {
        [lng, lat] = geometry.coordinates;
      } else {
        return { areaSqKm };
      }

      // Load GIS data if not already loaded - use the loaded data directly
      let districtData = boundaryLayersData.districts;
      let llgData = boundaryLayersData.llgs;
      
      if (!districtData) {
        districtData = await loadGISLayerData('district-boundaries', '/gis-data/png_dist_boundaries.json');
        if (districtData) {
          setBoundaryLayersData(prev => ({ ...prev, districts: districtData }));
        }
      }
      if (!llgData) {
        llgData = await loadGISLayerData('llg-boundaries', '/gis-data/png_llg_boundaries.json');
        if (llgData) {
          setBoundaryLayersData(prev => ({ ...prev, llgs: llgData }));
        }
      }

      // Detect location using the loaded data
      const pt = point([lng, lat]);
      let district, province, llg;

      // Check district using the loaded data directly
      if (districtData?.features) {
        for (const feature of districtData.features) {
          if (booleanPointInPolygon(pt, feature)) {
            district = feature.properties?.DISTNAME || feature.properties?.District || feature.properties?.NAME;
            province = feature.properties?.PROVINCE || feature.properties?.Province || feature.properties?.PROV;
            break;
          }
        }
      }

      // Check LLG using the loaded data directly
      if (llgData?.features) {
        for (const feature of llgData.features) {
          if (booleanPointInPolygon(pt, feature)) {
            llg = feature.properties?.LLGNAME || feature.properties?.LLG || feature.properties?.NAME;
            if (!province) {
              province = feature.properties?.PROVINCE || feature.properties?.Province || feature.properties?.PROV;
            }
            break;
          }
        }
      }

      // Fallback to Mapbox API for province if not found
      if (!province) {
        province = await getProvinceFromMapbox(lng, lat);
      }

      return {
        areaSqKm: parseFloat(areaSqKm.toFixed(4)),
        district: district || undefined,
        province: province || undefined,
        llg: llg || undefined,
      };
    } catch (error) {
      console.error('Error extracting location info from geometry:', error);
      return {};
    }
  }, [boundaryLayersData, loadGISLayerData, getProvinceFromMapbox]);

  // Initialize map once
  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = 'pk.eyJ1IjoiZ2FidW5vcm1hbiIsImEiOiJjbWJ0emU0cGEwOHR1MmtxdXh2d2wzOTV5In0.RUVMHkS-KaJ6CGWUiB3s4w';
    
    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [147.1494, -6.5], // PNG center
      zoom: 5,
      minZoom: 4,
      maxZoom: 18,
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

    mapInstance.addControl(new mapboxgl.NavigationControl({
      showCompass: true,
      showZoom: true,
      visualizePitch: false
    }), 'top-right');

    // Initialize Mapbox Draw only if drawing tools are not hidden and not in read-only mode
    if (!hideDrawingTools && !readOnly) {
      const drawInstance = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true
        },
        styles: [
          // Polygon fill
          {
            id: 'gl-draw-polygon-fill',
            type: 'fill',
            filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
            paint: {
              'fill-color': '#ff0000',
              'fill-opacity': 0.1
            }
          },
          // Polygon outline - red dashed line
          {
            id: 'gl-draw-polygon-stroke-active',
            type: 'line',
            filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
            paint: {
              'line-color': '#ff0000',
              'line-dasharray': [2, 2],
              'line-width': 2
            }
          },
          // Polygon vertices
          {
            id: 'gl-draw-polygon-and-line-vertex-active',
            type: 'circle',
            filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point']],
            paint: {
              'circle-radius': 5,
              'circle-color': '#ff0000'
            }
          }
        ]
      });
      
      mapInstance.addControl(drawInstance, 'top-left');
      draw.current = drawInstance;
    }

    // Handle AOI creation
    mapInstance.on('draw.create', async (e: any) => {
      const features = e.features;
      if (features && features.length > 0) {
        const geometry = features[0].geometry;
        setDrawnAOI(geometry);
        
        if (intentRegistrationId && onBoundarySave) {
          // Check if there's an uploaded AOI
          if (uploadedAOI) {
            setShowAOIChoiceDialog(true);
          } else if (existingBoundary) {
            setPendingBoundary(geometry);
            setShowOverrideDialog(true);
          } else {
            const locationInfo = await extractLocationInfoFromGeometry(geometry);
            onBoundarySave(geometry, locationInfo);
            toast.success('Project boundary saved successfully');
          }
        } else {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
              toast.error('Please log in to save AOI drawings');
              return;
            }

            const { error } = await supabase
              .from('project_aois')
              .insert({
                user_id: user.id,
                geometry: geometry
              });

            if (error) throw error;
            
            toast.success('Area of Interest saved successfully');
          } catch (error) {
            console.error('Error saving AOI:', error);
            toast.error('Failed to save Area of Interest');
          }
        }
      }
    });

    // Handle AOI updates
    mapInstance.on('draw.update', async (e: any) => {
      const features = e.features;
      if (features && features.length > 0) {
        const geometry = features[0].geometry;
        
        if (intentRegistrationId && onBoundarySave) {
          const locationInfo = await extractLocationInfoFromGeometry(geometry);
          onBoundarySave(geometry, locationInfo);
          toast.success('Project boundary updated successfully');
        } else {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
              toast.error('Please log in to update AOI drawings');
              return;
            }

            const { error } = await supabase
              .from('project_aois')
              .insert({
                user_id: user.id,
                geometry: geometry
              });

            if (error) throw error;
            
            toast.success('Area of Interest updated');
          } catch (error) {
            console.error('Error updating AOI:', error);
            toast.error('Failed to update Area of Interest');
          }
        }
      }
    });

    // Handle AOI deletion
    mapInstance.on('draw.delete', async (e: any) => {
      const features = e.features;
      if (features && features.length > 0) {
        // If it's the uploaded AOI being deleted, clear the state
        if (uploadedAOIFeatureId && features.some((f: any) => f.id === uploadedAOIFeatureId)) {
          setUploadedAOI(null);
          setUploadedAOIFeatureId(null);
          toast.success('Uploaded AOI removed');
        } else {
          toast.success('Drawing removed from map');
        }
      }
    });

    // Add marker if onCoordinatesChange provided (allows clicking to set coordinates)
    if (onCoordinatesChange) {
      const initialCoords = coordinates ? [coordinates.lng, coordinates.lat] : [147.1494, -6.314993];
      marker.current = new mapboxgl.Marker({ 
        color: '#ef4444', 
        draggable: !readOnly,
        scale: 1.2
      })
        .setLngLat(initialCoords as [number, number]);
      
      // Only add marker to map if coordinates are provided
      // Marker will be shown when user clicks or when coordinates are set
      
      // Update coordinates when marker is dragged
      marker.current.on('dragend', () => {
        const lngLat = marker.current!.getLngLat();
        
        // Check if marker is within AOI boundaries when dragged
        if (uploadedAOI) {
          const pt = point([lngLat.lng, lngLat.lat]);
          const isInside = booleanPointInPolygon(pt, uploadedAOI);
          
          if (!isInside) {
            // Reset to previous valid position without showing message
            if (coordinates) {
              marker.current!.setLngLat([coordinates.lng, coordinates.lat]);
            }
            return;
          }
        }
        
        onCoordinatesChange({
          lat: parseFloat(lngLat.lat.toFixed(6)),
          lng: parseFloat(lngLat.lng.toFixed(6))
        });
        updatePopup(lngLat.lng, lngLat.lat);
      });

      // Show popup on marker hover when boundaries are active (only mouseover)
      const markerElement = marker.current.getElement();
      markerElement.addEventListener('mouseenter', () => {
        if (showDistricts || showLLGs) {
          const lngLat = marker.current!.getLngLat();
          updatePopup(lngLat.lng, lngLat.lat);
        }
      });
      
      markerElement.addEventListener('mouseleave', () => {
        // Keep popup open, don't close on mouse leave
      });

      // Add click event to set coordinates - disabled in read-only mode and when AOI exists
      mapInstance.on('click', (e) => {
        // Disable marker placement in read-only mode
        if (readOnlyRef.current) {
          return;
        }
        
        // When an AOI boundary exists (uploaded or existing), marker is fixed at center
        // Do not allow click-based marker placement
        if (aoiBoundaryPresentRef.current) {
          return;
        }
        
        const { lng, lat } = e.lngLat;
        marker.current!.setLngLat([lng, lat]);
        
        // Show marker on map if not already added
        if (map.current && !marker.current!.getLngLat()) {
          marker.current!.addTo(map.current);
        } else if (map.current) {
          // Ensure marker is on map
          marker.current!.addTo(map.current);
        }
        
        onCoordinatesChange({
          lat: parseFloat(lat.toFixed(6)),
          lng: parseFloat(lng.toFixed(6))
        });
        updatePopup(lng, lat);
      });
    }

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
        // Clean up all event listeners
        eventListenersRef.current.forEach((listeners, layerId) => {
          if (map.current) {
            map.current.off('mousemove', layerId, listeners.mousemove);
            map.current.off('mouseleave', layerId, listeners.mouseleave);
          }
        });
        eventListenersRef.current.clear();
        
        marker.current?.remove();
        popup.current?.remove();
        hoverPopupRef.current?.remove();
        permitMarkers.current.forEach(m => m.remove());
        permitMarkers.current = [];
        map.current.remove();
        map.current = null;
        setMapLoaded(false);
      }
    };
  }, []);
  
  // Add permit markers to map
  useEffect(() => {
    if (!map.current || !mapLoaded || permitsLoading || !showAllApplications) return;
    
    // Clear existing markers
    permitMarkers.current.forEach(m => m.remove());
    permitMarkers.current = [];
    
    // Color mapping for levels
    const levelColors: { [key: number]: string } = {
      1: '#22c55e', // green for Level 1
      2: '#f59e0b', // amber for Level 2
      3: '#ef4444'  // red for Level 3
    };
    
    // Filter permits based on level toggles
    const filteredPermits = permits.filter(permit => {
      if (!permit.activity_level) return false;
      if (permit.activity_level === 1 && !showLevel1) return false;
      if (permit.activity_level === 2 && !showLevel2) return false;
      if (permit.activity_level === 3 && !showLevel3) return false;
      return true;
    });
    
    // Add markers for each permit
    filteredPermits.forEach(permit => {
      if (!permit.coordinates) return;
      
      const color = levelColors[permit.activity_level || 1];
      
      const el = document.createElement('div');
      el.className = 'permit-marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = color;
      el.style.border = '2px solid white';
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([permit.coordinates.lng, permit.coordinates.lat])
        .addTo(map.current!);
      
      // Add popup on click
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div style="padding: 12px; min-width: 200px;">
            <h4 style="font-weight: 600; margin-bottom: 8px; font-size: 14px;">${permit.title}</h4>
            <div style="display: flex; flex-direction: column; gap: 4px; font-size: 12px;">
              <div><strong>Permit Number:</strong> ${permit.permit_number || 'N/A'}</div>
              <div><strong>Entity:</strong> ${permit.entity_name || 'N/A'}</div>
              <div><strong>Type:</strong> ${permit.permit_type}</div>
              <div><strong>Level:</strong> <span style="color: ${color}; font-weight: 600;">Level ${permit.activity_level || 'N/A'}</span></div>
            </div>
          </div>
        `);
      
      el.addEventListener('click', () => {
        popup.addTo(map.current!);
        if (onPermitClick) {
          onPermitClick(permit.id);
        }
      });
      
      permitMarkers.current.push(marker);
    });
  }, [map.current, mapLoaded, permits, permitsLoading, showLevel1, showLevel2, showLevel3, showAllApplications, onPermitClick]);


  // Add/remove district boundaries layer with lazy loading
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    
    const layerId = 'district-boundaries';
    const sourceId = 'district-boundaries-source';

    if (showDistricts) {
      // Lazy load district boundaries if not already loaded
      const loadData = async () => {
        if (!boundaryLayersData.districts) {
          const data = await loadGISLayerData('district-boundaries', '/gis-data/png_dist_boundaries.json');
          if (data) {
            setBoundaryLayersData(prev => ({ ...prev, districts: data }));
          }
        }
      };
      loadData();

      // Only add layers if data is loaded
      if (boundaryLayersData.districts) {
        if (!map.current.getSource(sourceId)) {
          map.current.addSource(sourceId, {
            type: 'geojson',
            data: boundaryLayersData.districts
          });
        }

        if (!map.current.getLayer(layerId)) {
          map.current.addLayer({
            id: layerId,
            type: 'line',
            source: sourceId,
            paint: {
              'line-color': '#3b82f6',
              'line-width': 2,
              'line-opacity': 0.8
            }
          });

          map.current.addLayer({
            id: `${layerId}-fill`,
            type: 'fill',
            source: sourceId,
            paint: {
              'fill-color': '#3b82f6',
              'fill-opacity': 0.1
            }
          });

          // Add hover popup for districts (always enabled when layer is visible)
          // Remove any existing event listeners for this layer first
          const existingListeners = eventListenersRef.current.get(`${layerId}-fill`);
          if (existingListeners && map.current) {
            map.current.off('mousemove', `${layerId}-fill`, existingListeners.mousemove);
            map.current.off('mouseleave', `${layerId}-fill`, existingListeners.mouseleave);
            eventListenersRef.current.delete(`${layerId}-fill`);
          }

          let currentFeatureId: string | null = null;

          const mousemoveHandler = async (e: any) => {
            if (!map.current || !e.features || e.features.length === 0) return;
            
            // Increment request ID and capture it
            currentPopupRequestId.current++;
            const thisRequestId = currentPopupRequestId.current;
            
            const feature = e.features[0];
            const featureId = feature.id?.toString() || feature.properties?.GEOCODE || feature.properties?.DISTNAME;
            
            // Only update if we're hovering over a different feature
            if (featureId === currentFeatureId && hoverPopupRef.current) return;
            
            // Force remove ALL popups from DOM and ref
            removeAllBoundaryPopups();
            
            currentFeatureId = featureId;
            map.current.getCanvas().style.cursor = 'pointer';
            
            const properties = feature.properties;
            const lngLat = e.lngLat;
            
            const districtName = properties?.['DISTNAME'] || properties?.['District'] || properties?.['NAME'] || 'Unknown District';
            
            // Try to get province from properties first, then fallback to API
            let provinceName = properties?.['PROVINCE'] || properties?.['Province'] || properties?.['PROV'] || null;
            
            if (!provinceName) {
              // Only call API if not in properties
              try {
                provinceName = await getProvinceFromMapbox(lngLat.lng, lngLat.lat);
              } catch (error) {
                console.warn('Error fetching province:', error);
              }
            }
            
            // Check if this request is still current before showing popup
            if (thisRequestId !== currentPopupRequestId.current) {
              return; // A newer request has been made, abandon this one
            }
            
            provinceName = provinceName || 'Papua New Guinea';
            
            // Show popup with complete info
            const html = `
              <div class="p-3" style="min-width: 220px;">
                <h4 class="font-semibold text-sm mb-2 pb-1 border-b">District Information</h4>
                <p class="text-xs mb-1"><strong>District:</strong> ${districtName}</p>
                <p class="text-xs mb-1"><strong>Province:</strong> ${provinceName}</p>
              </div>
            `;
            
            // Double-check request ID and feature ID before creating popup
            if (currentFeatureId === featureId && thisRequestId === currentPopupRequestId.current) {
              // Remove any popups one more time before creating new one
              removeAllBoundaryPopups();
              
              hoverPopupRef.current = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false,
                className: 'district-popup'
              })
                .setLngLat(lngLat)
                .setHTML(html)
                .addTo(map.current);
            }
          };

          const mouseleaveHandler = () => {
            currentFeatureId = null;
            currentPopupRequestId.current++; // Cancel any pending requests
            if (map.current) {
              map.current.getCanvas().style.cursor = '';
            }
            removeAllBoundaryPopups();
          };

          map.current.on('mousemove', `${layerId}-fill`, mousemoveHandler);
          map.current.on('mouseleave', `${layerId}-fill`, mouseleaveHandler);
          
          // Store listeners for cleanup
          eventListenersRef.current.set(`${layerId}-fill`, {
            mousemove: mousemoveHandler,
            mouseleave: mouseleaveHandler
          });
        }
      }
    } else {
      // Remove event listeners
      const existingListeners = eventListenersRef.current.get(`${layerId}-fill`);
      if (existingListeners && map.current) {
        map.current.off('mousemove', `${layerId}-fill`, existingListeners.mousemove);
        map.current.off('mouseleave', `${layerId}-fill`, existingListeners.mouseleave);
        eventListenersRef.current.delete(`${layerId}-fill`);
      }
      
      // Remove layers when toggled off
      if (map.current.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
      if (map.current.getLayer(`${layerId}-fill`)) {
        map.current.removeLayer(`${layerId}-fill`);
      }
      // Clear all popups when layer is toggled off
      removeAllBoundaryPopups();
    }
  }, [showDistricts, mapLoaded, boundaryLayersData.districts, loadGISLayerData, removeAllBoundaryPopups, getProvinceFromMapbox]);

  // Add/remove LLG boundaries layer with lazy loading
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    
    const layerId = 'llg-boundaries';
    const sourceId = 'llg-boundaries-source';

    if (showLLGs) {
      // Lazy load LLG boundaries and district boundaries (for district lookup) if not already loaded
      const loadData = async () => {
        if (!boundaryLayersData.llgs) {
          const data = await loadGISLayerData('llg-boundaries', '/gis-data/png_llg_boundaries.json');
          if (data) {
            setBoundaryLayersData(prev => ({ ...prev, llgs: data }));
          }
        }
        // Also load districts if not loaded (needed for district lookup in LLG popups)
        if (!boundaryLayersData.districts) {
          const districtData = await loadGISLayerData('district-boundaries', '/gis-data/png_dist_boundaries.json');
          if (districtData) {
            setBoundaryLayersData(prev => ({ ...prev, districts: districtData }));
          }
        }
      };
      loadData();

      // Only add layers if data is loaded
      if (boundaryLayersData.llgs) {
        if (!map.current.getSource(sourceId)) {
          map.current.addSource(sourceId, {
            type: 'geojson',
            data: boundaryLayersData.llgs
          });
        }

        if (!map.current.getLayer(layerId)) {
          map.current.addLayer({
            id: layerId,
            type: 'line',
            source: sourceId,
            paint: {
              'line-color': '#10b981',
              'line-width': 2,
              'line-opacity': 0.8
            }
          });

          map.current.addLayer({
            id: `${layerId}-fill`,
            type: 'fill',
            source: sourceId,
            paint: {
              'fill-color': '#10b981',
              'fill-opacity': 0.1
            }
          });

          // Add hover popup for LLGs (always enabled when layer is visible)
          // Remove any existing event listeners for this layer first
          const existingListeners = eventListenersRef.current.get(`${layerId}-fill`);
          if (existingListeners && map.current) {
            map.current.off('mousemove', `${layerId}-fill`, existingListeners.mousemove);
            map.current.off('mouseleave', `${layerId}-fill`, existingListeners.mouseleave);
            eventListenersRef.current.delete(`${layerId}-fill`);
          }

          let currentFeatureId: string | null = null;

          const mousemoveHandler = async (e: any) => {
            if (!map.current || !e.features || e.features.length === 0) return;
            
            // Increment request ID and capture it
            currentPopupRequestId.current++;
            const thisRequestId = currentPopupRequestId.current;
            
            const feature = e.features[0];
            const featureId = feature.id?.toString() || feature.properties?.GEOCODE || feature.properties?.LLGNAME;
            
            // Only update if we're hovering over a different feature
            if (featureId === currentFeatureId && hoverPopupRef.current) return;
            
            // Force remove ALL popups from DOM and ref
            removeAllBoundaryPopups();
            
            currentFeatureId = featureId;
            map.current.getCanvas().style.cursor = 'pointer';
            
            const properties = feature.properties;
            const lngLat = e.lngLat;
            
            const llgName = properties?.['LLGNAME'] || properties?.['LLG'] || properties?.['NAME'] || 'Unknown LLG';
            
            // Try to get district from properties first
            let districtName = properties?.['DISTNAME'] || properties?.['District'] || null;
            
            // If not in properties, try to find district by checking point against district boundaries
            if (!districtName && boundaryLayersData.districts) {
              const pt = point([lngLat.lng, lngLat.lat]);
              for (const feature of boundaryLayersData.districts.features) {
                if (booleanPointInPolygon(pt, feature)) {
                  districtName = feature.properties?.DISTNAME || feature.properties?.District || null;
                  break;
                }
              }
            }
            
            districtName = districtName || 'Not Available';
            
            // Try to get province from properties first, then fallback to API
            let provinceName = properties?.['PROVINCE'] || properties?.['Province'] || properties?.['PROV'] || null;
            
            if (!provinceName) {
              // Only call API if not in properties
              try {
                provinceName = await getProvinceFromMapbox(lngLat.lng, lngLat.lat);
              } catch (error) {
                console.warn('Error fetching province:', error);
              }
            }
            
            // Check if this request is still current before showing popup
            if (thisRequestId !== currentPopupRequestId.current) {
              return; // A newer request has been made, abandon this one
            }
            
            provinceName = provinceName || 'Papua New Guinea';
            
            // Show popup with complete info
            const html = `
              <div class="p-3" style="min-width: 220px;">
                <h4 class="font-semibold text-sm mb-2 pb-1 border-b">LLG Information</h4>
                <p class="text-xs mb-1"><strong>LLG:</strong> ${llgName}</p>
                <p class="text-xs mb-1"><strong>District:</strong> ${districtName}</p>
                <p class="text-xs mb-1"><strong>Province:</strong> ${provinceName}</p>
              </div>
            `;
            
            // Double-check request ID and feature ID before creating popup
            if (currentFeatureId === featureId && thisRequestId === currentPopupRequestId.current) {
              // Remove any popups one more time before creating new one
              removeAllBoundaryPopups();
              
              hoverPopupRef.current = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false,
                className: 'llg-popup'
              })
                .setLngLat(lngLat)
                .setHTML(html)
                .addTo(map.current);
            }
          };

          const mouseleaveHandler = () => {
            currentFeatureId = null;
            currentPopupRequestId.current++; // Cancel any pending requests
            if (map.current) {
              map.current.getCanvas().style.cursor = '';
            }
            removeAllBoundaryPopups();
          };

          map.current.on('mousemove', `${layerId}-fill`, mousemoveHandler);
          map.current.on('mouseleave', `${layerId}-fill`, mouseleaveHandler);
          
          // Store listeners for cleanup
          eventListenersRef.current.set(`${layerId}-fill`, {
            mousemove: mousemoveHandler,
            mouseleave: mouseleaveHandler
          });
        }
      }
    } else {
      // Remove event listeners
      const existingListeners = eventListenersRef.current.get(`${layerId}-fill`);
      if (existingListeners && map.current) {
        map.current.off('mousemove', `${layerId}-fill`, existingListeners.mousemove);
        map.current.off('mouseleave', `${layerId}-fill`, existingListeners.mouseleave);
        eventListenersRef.current.delete(`${layerId}-fill`);
      }
      
      // Remove layers when toggled off
      if (map.current.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
      if (map.current.getLayer(`${layerId}-fill`)) {
        map.current.removeLayer(`${layerId}-fill`);
      }
      // Clear all popups when layer is toggled off
      removeAllBoundaryPopups();
    }
  }, [showLLGs, mapLoaded, boundaryLayersData.llgs, boundaryLayersData.districts, loadGISLayerData, removeAllBoundaryPopups, getProvinceFromMapbox]);

  // Update popup when boundaries are toggled and marker exists (only for mouseover)
  useEffect(() => {
    if (!marker.current || !coordinates || !onCoordinatesChange || !showUploadedAOI) return;
    
    // Don't auto-show popup, only on mouseover
    if (!showDistricts && !showLLGs) {
      popup.current?.remove();
    }
  }, [showDistricts, showLLGs, coordinates, onCoordinatesChange, showUploadedAOI]);

  // Load database GIS layers on mount
  useEffect(() => {
    if (mapLoaded) {
      loadFromDatabase();
    }
  }, [mapLoaded, loadFromDatabase]);

  // Handle database GIS layer toggle and lazy load data
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    if (!dbGISLayers.length) return;

    dbGISLayers.forEach(async (layer) => {
      const layerId = `db-gis-${layer.id}`;
      const sourceId = `db-gis-source-${layer.id}`;
      const isVisible = dbGISLayerToggles[layer.id] || false;

      if (isVisible) {
        // Lazy load the GeoJSON data if not already loaded
        if (!loadedLayerData[layer.id] && layer.data?.path) {
          const geoData = await loadGISLayerData(layer.id, layer.data.path);
          if (geoData) {
            setLoadedLayerData(prev => ({ ...prev, [layer.id]: geoData }));
          }
        }

        const geoData = loadedLayerData[layer.id];
        if (!geoData) return;

        // Add source and layer if they don't exist
        if (!map.current?.getSource(sourceId)) {
          map.current?.addSource(sourceId, {
            type: 'geojson',
            data: geoData
          });
        }

        if (!map.current?.getLayer(layerId)) {
          const color = layer.data?.color || '#ff6b6b';
          map.current?.addLayer({
            id: layerId,
            type: 'line',
            source: sourceId,
            paint: {
              'line-color': color,
              'line-width': 2,
              'line-opacity': 0.8
            }
          });

          map.current?.addLayer({
            id: `${layerId}-fill`,
            type: 'fill',
            source: sourceId,
            paint: {
              'fill-color': color,
              'fill-opacity': 0.1
            }
          });

          // Add hover popup for conservation/protected layers (always enabled when layer is visible)
          // Remove any existing event listeners for this layer first
          const existingListeners = eventListenersRef.current.get(`${layerId}-fill`);
          if (existingListeners && map.current) {
            map.current.off('mousemove', `${layerId}-fill`, existingListeners.mousemove);
            map.current.off('mouseleave', `${layerId}-fill`, existingListeners.mouseleave);
            eventListenersRef.current.delete(`${layerId}-fill`);
          }

          let currentFeatureId: string | null = null;

          const mousemoveHandler = async (e: any) => {
            if (!map.current || !e.features || e.features.length === 0) return;

            // Increment request ID and capture it
            currentPopupRequestId.current++;
            const thisRequestId = currentPopupRequestId.current;

            const feature = e.features[0];
            const featureId = feature.id?.toString() || 
                             feature.properties?.NAME || 
                             feature.properties?.Name || 
                             feature.properties?.NatName ||
                             feature.properties?.IntName;
            
            // Only update if we're hovering over a different feature
            if (featureId === currentFeatureId && hoverPopupRef.current) return;
            
            // Force remove ALL popups from DOM and ref
            removeAllBoundaryPopups();

            currentFeatureId = featureId;
            const lngLat = e.lngLat;
            map.current!.getCanvas().style.cursor = 'pointer';
            
            const properties = feature.properties;
            
            // Fetch province from Mapbox
            let province = 'Papua New Guinea';
            try {
              const provinceData = await getProvinceFromMapbox(lngLat.lng, lngLat.lat);
              if (provinceData) province = provinceData;
            } catch (error) {
              console.warn('Could not fetch province:', error);
            }
            
            // Check if this request is still current before showing popup
            if (thisRequestId !== currentPopupRequestId.current) {
              return; // A newer request has been made, abandon this one
            }
            
            let html = `
              <div class="p-3" style="min-width: 220px;">
                <h4 class="font-semibold text-sm mb-2 pb-1 border-b">${layer.name}</h4>
            `;
            
            // Display site name - check all possible name fields
            let siteName = null;
            if (properties) {
              siteName = properties['NAME'] || properties['Name'] || properties['NatName'] || properties['IntName'] || 
                        properties['DISTNAME'] || properties['LLGNAME'] || properties['site_name'];
              if (siteName) {
                html += `<p class="text-xs mb-1"><strong>Site Name:</strong> ${siteName}</p>`;
              }
            }
            
            // Display area - check all possible area fields
            if (properties) {
              let areaValue = null;
              if (properties['AREA__HA_']) {
                areaValue = parseFloat(properties['AREA__HA_']).toFixed(2) + ' ha';
              } else if (properties['Area_Ha']) {
                areaValue = parseFloat(properties['Area_Ha']).toFixed(2) + ' ha';
              } else if (properties['Hectares']) {
                areaValue = parseFloat(properties['Hectares']).toFixed(2) + ' ha';
              } else if (properties['GISArea']) {
                areaValue = parseFloat(properties['GISArea']).toFixed(2) + ' ha';
              } else if (properties['Area']) {
                areaValue = parseFloat(properties['Area']).toFixed(2) + ' ha';
              } else if (properties['Shape_Area']) {
                const areaHa = (parseFloat(properties['Shape_Area']) * 12321 * 100).toFixed(0);
                areaValue = areaHa + ' ha (estimated)';
              } else if (properties['area']) {
                areaValue = properties['area'];
              }
              
              if (areaValue) {
                html += `<p class="text-xs mb-1"><strong>Area:</strong> ${areaValue}</p>`;
              }
            }
            
            // Display province - use layer data if available, otherwise Mapbox
            const provinceFromData = properties?.['PROVINCE'] || properties?.['Province'];
            const finalProvince = provinceFromData || province;
            html += `<p class="text-xs mb-1"><strong>Province:</strong> ${finalProvince}</p>`;
            
            html += `</div>`;
            
            // Double-check request ID and feature ID before creating popup
            if (currentFeatureId === featureId && thisRequestId === currentPopupRequestId.current) {
              // Remove any popups one more time before creating new one
              removeAllBoundaryPopups();
              
              hoverPopupRef.current = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false,
              })
                .setLngLat(lngLat)
                .setHTML(html)
                .addTo(map.current!);
            }
          };

          const mouseleaveHandler = () => {
            currentFeatureId = null;
            currentPopupRequestId.current++; // Cancel any pending requests
            if (!map.current) return;
            map.current.getCanvas().style.cursor = '';
            removeAllBoundaryPopups();
          };

          map.current.on('mousemove', `${layerId}-fill`, mousemoveHandler);
          map.current.on('mouseleave', `${layerId}-fill`, mouseleaveHandler);
          
          // Store listeners for cleanup
          eventListenersRef.current.set(`${layerId}-fill`, {
            mousemove: mousemoveHandler,
            mouseleave: mouseleaveHandler
          });
        }
      } else {
        // Remove event listeners
        const existingListeners = eventListenersRef.current.get(`${layerId}-fill`);
        if (existingListeners && map.current) {
          map.current.off('mousemove', `${layerId}-fill`, existingListeners.mousemove);
          map.current.off('mouseleave', `${layerId}-fill`, existingListeners.mouseleave);
          eventListenersRef.current.delete(`${layerId}-fill`);
        }
        
        // Remove layers when toggled off
        if (map.current?.getLayer(layerId)) {
          map.current?.removeLayer(layerId);
        }
        if (map.current?.getLayer(`${layerId}-fill`)) {
          map.current?.removeLayer(`${layerId}-fill`);
        }
        // Clear all popups when layer is toggled off
        removeAllBoundaryPopups();
      }
    });
  }, [mapLoaded, dbGISLayers, dbGISLayerToggles, loadedLayerData, loadGISLayerData, removeAllBoundaryPopups, getProvinceFromMapbox]);

  // Toggle uploaded AOI visibility and marker display
  useEffect(() => {
    if (!map.current || !mapLoaded || !draw.current) return;
    if (!uploadedAOI || !uploadedAOIFeatureId) return;

    if (showUploadedAOI) {
      // Show the uploaded AOI - check if it exists first
      const existingFeature = draw.current.get(uploadedAOIFeatureId);
      if (!existingFeature) {
        // Re-add the feature if it was deleted
        draw.current.add({
          type: 'Feature',
          id: uploadedAOIFeatureId,
          properties: {},
          geometry: uploadedAOI
        });
      }
      
      // Calculate center and zoom to boundary
      if (uploadedAOI.type === 'Polygon') {
        // Calculate bounds and center
        const bounds = new mapboxgl.LngLatBounds();
        uploadedAOI.coordinates[0].forEach((coord: [number, number]) => {
          bounds.extend(coord);
        });
        
        // Get center of bounds
        const center = bounds.getCenter();
        
        // Zoom to fit the boundary at street level
        map.current.fitBounds(bounds, { padding: 80, duration: 1000, maxZoom: 17 });
        
        // Place marker at center and show it
        if (marker.current && onCoordinatesChange) {
          marker.current.setLngLat([center.lng, center.lat]);
          onCoordinatesChange({
            lat: parseFloat(center.lat.toFixed(6)),
            lng: parseFloat(center.lng.toFixed(6))
          });
          
          // Make marker draggable but constrained to AOI (only if not readOnly)
          marker.current.setDraggable(!readOnly);
          
          // Add marker to map if not already added
          marker.current.addTo(map.current);
        }
      }
    } else {
      // Hide the uploaded AOI by deleting it
      try {
        draw.current.delete(uploadedAOIFeatureId);
      } catch (error) {
        // Feature might not exist, ignore error
      }
      
      // Remove marker from map when AOI is hidden
      if (marker.current) {
        marker.current.remove();
      }
    }
  }, [showUploadedAOI, uploadedAOI, uploadedAOIFeatureId, mapLoaded, onCoordinatesChange]);

  // Calculate AOI area and add hover popup for uploaded AOI boundary
  useEffect(() => {
    if (!map.current || !mapLoaded || !uploadedAOI) {
      setAoiAreaInfo(null);
      return;
    }

    // Calculate area using Turf.js
    let calculatedAreaInfo: { areaSqKm: number; areaHectares: number } | null = null;
    if (uploadedAOI.type === 'Polygon' || uploadedAOI.type === 'MultiPolygon') {
      try {
        const aoiPolygon = {
          type: 'Feature' as const,
          properties: {},
          geometry: uploadedAOI
        };
        const areaInSqMeters = area(aoiPolygon);
        const areaSqKm = areaInSqMeters / 1_000_000;
        const areaHectares = areaInSqMeters / 10_000;
        calculatedAreaInfo = { areaSqKm, areaHectares };
        setAoiAreaInfo(calculatedAreaInfo);
      } catch (error) {
        console.error('Error calculating AOI area:', error);
        setAoiAreaInfo(null);
      }
    }

    // Add hover listener for uploaded AOI boundary
    const aoiLayerId = 'uploaded-aoi-hover-layer';
    const aoiSourceId = 'uploaded-aoi-hover-source';

    // Add source and layer for hover detection
    if (!map.current.getSource(aoiSourceId)) {
      map.current.addSource(aoiSourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: uploadedAOI
        }
      });
    } else {
      // Update source data
      (map.current.getSource(aoiSourceId) as mapboxgl.GeoJSONSource).setData({
        type: 'Feature',
        properties: {},
        geometry: uploadedAOI
      });
    }

    if (!map.current.getLayer(aoiLayerId)) {
      map.current.addLayer({
        id: aoiLayerId,
        type: 'fill',
        source: aoiSourceId,
        paint: {
          'fill-color': 'transparent',
          'fill-opacity': 0
        }
      });
    }

    // Track if popup is currently shown to prevent flickering
    let popupShown = false;
    let cachedLocationInfo: { district: string; llg: string; province: string } | null = null;

    // Mouse enter handler - show popup once when entering AOI
    const handleAOIMouseEnter = async (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
      if (!map.current || !calculatedAreaInfo || popupShown) return;

      const { lng, lat } = e.lngLat;
      popupShown = true;

      // Get location info (cache it to avoid refetching)
      let districtName = 'Loading...';
      let llgName = 'Loading...';
      let provinceName = 'Loading...';

      // Format area display
      const areaDisplay = calculatedAreaInfo.areaSqKm >= 1 
        ? `${calculatedAreaInfo.areaSqKm.toFixed(2)} km²` 
        : `${calculatedAreaInfo.areaHectares.toFixed(2)} hectares`;

      // Show popup immediately with loading state
      const createPopupHTML = (province: string, district: string, llg: string) => `
        <div style="padding: 12px; min-width: 250px; font-family: system-ui, -apple-system, sans-serif;">
          <h4 style="font-weight: 600; font-size: 14px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; color: #1a1a1a;">
            Area of Interest
          </h4>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <p style="margin: 0; font-size: 13px; color: #374151;">
              <strong>Total Area:</strong> <span style="color: #059669; font-weight: 600;">${areaDisplay}</span>
            </p>
            <p style="margin: 0; font-size: 13px; color: #374151;">
              <strong>Province:</strong> <span style="color: #dc2626;">${province}</span>
            </p>
            <p style="margin: 0; font-size: 13px; color: #374151;">
              <strong>District:</strong> <span style="color: #2563eb;">${district}</span>
            </p>
            <p style="margin: 0; font-size: 13px; color: #374151;">
              <strong>LLG:</strong> <span style="color: #7c3aed;">${llg}</span>
            </p>
          </div>
        </div>
      `;

      // Create popup
      if (!aoiPopupRef.current) {
        aoiPopupRef.current = new mapboxgl.Popup({
          closeButton: true,
          closeOnClick: false,
          className: 'aoi-hover-popup',
          anchor: 'bottom'
        });
        
        aoiPopupRef.current.on('close', () => {
          popupShown = false;
          aoiPopupRef.current = null;
        });
      }

      aoiPopupRef.current
        .setLngLat([lng, lat])
        .setHTML(createPopupHTML(provinceName, districtName, llgName))
        .addTo(map.current);

      // Fetch location data asynchronously
      if (!cachedLocationInfo) {
        const pt = point([lng, lat]);

        // Check district boundaries
        if (boundaryLayersData.districts?.features) {
          for (const feature of boundaryLayersData.districts.features) {
            if (booleanPointInPolygon(pt, feature)) {
              districtName = feature.properties?.DISTNAME || feature.properties?.District || 'Unknown';
              break;
            }
          }
        } else {
          const data = await loadGISLayerData('district-boundaries', '/gis-data/png_dist_boundaries.json');
          if (data) {
            setBoundaryLayersData(prev => ({ ...prev, districts: data }));
            for (const feature of data.features) {
              if (booleanPointInPolygon(pt, feature)) {
                districtName = feature.properties?.DISTNAME || feature.properties?.District || 'Unknown';
                break;
              }
            }
          }
        }

        // Check LLG boundaries
        if (boundaryLayersData.llgs?.features) {
          for (const feature of boundaryLayersData.llgs.features) {
            if (booleanPointInPolygon(pt, feature)) {
              llgName = feature.properties?.LLGNAME || feature.properties?.LLG || 'Unknown';
              break;
            }
          }
        } else {
          const data = await loadGISLayerData('llg-boundaries', '/gis-data/png_llg_boundaries.json');
          if (data) {
            setBoundaryLayersData(prev => ({ ...prev, llgs: data }));
            for (const feature of data.features) {
              if (booleanPointInPolygon(pt, feature)) {
                llgName = feature.properties?.LLGNAME || feature.properties?.LLG || 'Unknown';
                break;
              }
            }
          }
        }

        // Get province from Mapbox
        provinceName = await getProvinceFromMapbox(lng, lat) || 'Papua New Guinea';
        
        if (districtName === 'Loading...') districtName = 'Not available';
        if (llgName === 'Loading...') llgName = 'Not available';

        cachedLocationInfo = { district: districtName, llg: llgName, province: provinceName };

        // Update popup with fetched data if still open
        if (aoiPopupRef.current && map.current) {
          aoiPopupRef.current.setHTML(createPopupHTML(provinceName, districtName, llgName));
        }
      } else {
        // Use cached info
        aoiPopupRef.current.setHTML(createPopupHTML(
          cachedLocationInfo.province, 
          cachedLocationInfo.district, 
          cachedLocationInfo.llg
        ));
      }
    };

    const handleAOIMouseLeave = () => {
      // Don't close on mouseleave - only close on click outside
    };

    // Handle click outside AOI to close popup
    const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
      if (!map.current) return;
      
      const pt = point([e.lngLat.lng, e.lngLat.lat]);
      let isInsideAOI = false;
      
      try {
        isInsideAOI = booleanPointInPolygon(pt, uploadedAOI);
      } catch (error) {
        isInsideAOI = false;
      }
      
      // If click is outside the AOI boundary, close the popup
      if (!isInsideAOI && aoiPopupRef.current) {
        aoiPopupRef.current.remove();
        aoiPopupRef.current = null;
        popupShown = false;
      }
    };

    // Add event listeners
    map.current.on('mouseenter', aoiLayerId, handleAOIMouseEnter);
    map.current.on('mouseleave', aoiLayerId, handleAOIMouseLeave);
    map.current.on('click', handleMapClick);

    // Cleanup
    return () => {
      if (map.current) {
        map.current.off('mouseenter', aoiLayerId, handleAOIMouseEnter);
        map.current.off('mouseleave', aoiLayerId, handleAOIMouseLeave);
        map.current.off('click', handleMapClick);
        if (map.current.getLayer(aoiLayerId)) {
          map.current.removeLayer(aoiLayerId);
        }
        if (map.current.getSource(aoiSourceId)) {
          map.current.removeSource(aoiSourceId);
        }
      }
      if (aoiPopupRef.current) {
        aoiPopupRef.current.remove();
        aoiPopupRef.current = null;
      }
    };
  }, [uploadedAOI, mapLoaded, boundaryLayersData, loadGISLayerData, getProvinceFromMapbox]);

  // Don't auto-load existing AOIs from database to avoid clutter
  // Users can draw new AOIs or upload them as needed

  // Load existing boundary on mount and sync with uploaded AOI state
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    // Handle read-only mode - display boundary as GeoJSON layer instead of using draw control
    if (readOnly) {
      // Remove existing read-only boundary layers if they exist
      if (map.current.getLayer('readonly-boundary-fill')) {
        map.current.removeLayer('readonly-boundary-fill');
      }
      if (map.current.getLayer('readonly-boundary-outline')) {
        map.current.removeLayer('readonly-boundary-outline');
      }
      if (map.current.getSource('readonly-boundary')) {
        map.current.removeSource('readonly-boundary');
      }

      if (!existingBoundary) return;

      try {
        // Add the boundary as a GeoJSON source
        map.current.addSource('readonly-boundary', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: existingBoundary
          }
        });

        // Add fill layer
        map.current.addLayer({
          id: 'readonly-boundary-fill',
          type: 'fill',
          source: 'readonly-boundary',
          paint: {
            'fill-color': '#ff0000',
            'fill-opacity': 0.2
          }
        });

        // Add outline layer with red dashed line
        map.current.addLayer({
          id: 'readonly-boundary-outline',
          type: 'line',
          source: 'readonly-boundary',
          paint: {
            'line-color': '#ff0000',
            'line-width': 3,
            'line-dasharray': [2, 2]
          }
        });

        // Zoom to boundary at street level
        if (existingBoundary.type === 'Polygon' && existingBoundary.coordinates?.[0]) {
          const bounds = new mapboxgl.LngLatBounds();
          existingBoundary.coordinates[0].forEach((coord: [number, number]) => {
            bounds.extend(coord);
          });
          map.current.fitBounds(bounds, { padding: 50, maxZoom: 17, duration: 1000 });
          
          // Add a center marker
          const center = bounds.getCenter();
          new mapboxgl.Marker({ color: '#ef4444', scale: 1.2 })
            .setLngLat([center.lng, center.lat])
            .addTo(map.current);

          // Calculate area using turf
          const turfPolygon = polygon(existingBoundary.coordinates);
          const areaSqMeters = area(turfPolygon);
          const areaSqKm = (areaSqMeters / 1_000_000).toFixed(2);
          const areaHectares = (areaSqMeters / 10_000).toFixed(2);

          // Create popup for hover
          const hoverPopup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            maxWidth: '300px'
          });

          // Fetch location info from GIS data if props are missing
          let resolvedProvince = province;
          let resolvedDistrict = district;
          let resolvedLlg = llg;

          // Fetch location info from GIS boundaries if props are not provided
          const fetchLocationInfo = async () => {
            const pt = point([center.lng, center.lat]);
            
            // Fetch district info if not provided
            if (!resolvedDistrict || !resolvedProvince) {
              let districtData = boundaryLayersData.districts;
              if (!districtData) {
                districtData = await loadGISLayerData('district-boundaries', '/gis-data/png_dist_boundaries.json');
                if (districtData) {
                  setBoundaryLayersData(prev => ({ ...prev, districts: districtData }));
                }
              }
              if (districtData?.features) {
                for (const feature of districtData.features) {
                  if (booleanPointInPolygon(pt, feature)) {
                    if (!resolvedDistrict) {
                      resolvedDistrict = feature.properties?.DISTNAME || feature.properties?.District || feature.properties?.NAME;
                    }
                    if (!resolvedProvince) {
                      resolvedProvince = feature.properties?.PROVINCE || feature.properties?.Province || feature.properties?.PROV;
                    }
                    break;
                  }
                }
              }
            }

            // Fetch LLG info if not provided
            if (!resolvedLlg) {
              let llgData = boundaryLayersData.llgs;
              if (!llgData) {
                llgData = await loadGISLayerData('llg-boundaries', '/gis-data/png_llg_boundaries.json');
                if (llgData) {
                  setBoundaryLayersData(prev => ({ ...prev, llgs: llgData }));
                }
              }
              if (llgData?.features) {
                for (const feature of llgData.features) {
                  if (booleanPointInPolygon(pt, feature)) {
                    resolvedLlg = feature.properties?.LLGNAME || feature.properties?.LLG || feature.properties?.NAME;
                    break;
                  }
                }
              }
            }

            // Fallback to Mapbox API for province if still not found
            if (!resolvedProvince) {
              resolvedProvince = await getProvinceFromMapbox(center.lng, center.lat);
            }
          };

          // Start fetching location info
          fetchLocationInfo();

          // Add hover events for boundary
          const mapInstance = map.current;
          
          mapInstance.on('mouseenter', 'readonly-boundary-fill', (e) => {
            mapInstance.getCanvas().style.cursor = 'pointer';
            
            const locationInfo = [
              resolvedProvince ? `<strong>Province:</strong> ${resolvedProvince}` : `<strong>Province:</strong> Not Available`,
              resolvedDistrict ? `<strong>District:</strong> ${resolvedDistrict}` : `<strong>District:</strong> Not Available`,
              resolvedLlg ? `<strong>LLG:</strong> ${resolvedLlg}` : `<strong>LLG:</strong> Not Available`
            ].join('<br/>');
            
            const popupContent = `
              <div style="padding: 12px; font-family: system-ui, -apple-system, sans-serif;">
                <h4 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 600; color: #1a1a1a; border-bottom: 2px solid #e5e7eb; padding-bottom: 6px;">
                  Area of Interest (AOI)
                </h4>
                <div style="margin-bottom: 10px; padding: 8px; background: #f3f4f6; border-radius: 6px;">
                  <p style="margin: 0; font-size: 12px; color: #374151; line-height: 1.6;">
                    ${locationInfo}
                  </p>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                  <div style="padding: 8px; background: #ecfdf5; border-radius: 6px; border-left: 3px solid #10b981;">
                    <p style="margin: 0; font-size: 11px; color: #059669; font-weight: 600;">AREA (sq km)</p>
                    <p style="margin: 2px 0 0 0; font-size: 16px; font-weight: 700; color: #047857;">${areaSqKm}</p>
                  </div>
                  <div style="padding: 8px; background: #fef3c7; border-radius: 6px; border-left: 3px solid #f59e0b;">
                    <p style="margin: 0; font-size: 11px; color: #d97706; font-weight: 600;">AREA (ha)</p>
                    <p style="margin: 2px 0 0 0; font-size: 16px; font-weight: 700; color: #b45309;">${areaHectares}</p>
                  </div>
                </div>
                <p style="margin: 8px 0 0 0; font-size: 11px; color: #6b7280;">
                  <strong>Center:</strong> ${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}
                </p>
              </div>
            `;
            
            hoverPopup.setLngLat(e.lngLat).setHTML(popupContent).addTo(mapInstance);
          });

          mapInstance.on('mousemove', 'readonly-boundary-fill', (e) => {
            hoverPopup.setLngLat(e.lngLat);
          });

          mapInstance.on('mouseleave', 'readonly-boundary-fill', () => {
            mapInstance.getCanvas().style.cursor = '';
            hoverPopup.remove();
          });
        }
      } catch (error) {
        console.error('Error loading existing boundary in read-only mode:', error);
      }
      return;
    }

    // Non read-only mode - use draw control
    if (!draw.current) return;

    // Clear previous boundary when existingBoundary changes or is null
    if (uploadedAOIFeatureId) {
      try {
        draw.current.delete(uploadedAOIFeatureId);
      } catch (error) {
        // Feature might not exist, ignore
      }
    }

    // Reset state when no existing boundary
    if (!existingBoundary) {
      setUploadedAOI(null);
      setUploadedAOIFeatureId(null);
      return;
    }

    try {
      // Generate a unique feature ID for this boundary
      const featureId = `uploaded-aoi-${Date.now()}`;
      
      // Set the uploaded AOI state
      setUploadedAOI(existingBoundary);
      setUploadedAOIFeatureId(featureId);
      
      const feature = {
        type: 'Feature',
        id: featureId,
        properties: {},
        geometry: existingBoundary
      };
      
      // Add the boundary to the map
      draw.current.add(feature);
      
      // Zoom to boundary
      if (existingBoundary.type === 'Polygon') {
        const bounds = new mapboxgl.LngLatBounds();
        existingBoundary.coordinates[0].forEach((coord: [number, number]) => {
          bounds.extend(coord);
        });
        map.current.fitBounds(bounds, { padding: 80, duration: 1000, maxZoom: 17 });
        
        // Place marker at center if marker exists
        if (marker.current && onCoordinatesChange) {
          const center = bounds.getCenter();
          marker.current.setLngLat([center.lng, center.lat]);
          onCoordinatesChange({
            lat: parseFloat(center.lat.toFixed(6)),
            lng: parseFloat(center.lng.toFixed(6))
          });
        }
      }
    } catch (error) {
      console.error('Error loading existing boundary:', error);
    }
  }, [mapLoaded, existingBoundary, readOnly, boundaryLayersData, loadGISLayerData, getProvinceFromMapbox, province, district, llg]);

  const handleConfirmOverride = async () => {
    if (pendingBoundary && onBoundarySave) {
      const locationInfo = await extractLocationInfoFromGeometry(pendingBoundary);
      onBoundarySave(pendingBoundary, locationInfo);
      toast.success('Project boundary saved successfully');
    }
    setShowOverrideDialog(false);
    setPendingBoundary(null);
  };

  const handleChooseDrawn = async () => {
    if (drawnAOI && onBoundarySave) {
      const locationInfo = await extractLocationInfoFromGeometry(drawnAOI);
      onBoundarySave(drawnAOI, locationInfo);
      toast.success('Drawn AOI selected as project boundary');
    }
    setShowAOIChoiceDialog(false);
  };

  const handleChooseUploaded = async () => {
    if (uploadedAOI && onBoundarySave) {
      const locationInfo = await extractLocationInfoFromGeometry(uploadedAOI);
      onBoundarySave(uploadedAOI, locationInfo);
      toast.success('Uploaded AOI selected as project boundary');
    }
    setShowAOIChoiceDialog(false);
  };


  // Handle file upload for GIS files
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const supportedFormats = ['kml', 'kmz', 'json', 'geojson', 'zip', 'gpx', 'csv'];
    
    if (!fileExtension || !supportedFormats.includes(fileExtension)) {
      toast.error('Unsupported file format. Please upload one of the following: KML, KMZ, GeoJSON, JSON, ZIP, GPX, or CSV files.');
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    try {
      console.log('Starting file upload:', file.name, 'Size:', file.size, 'Type:', file.type);
      toast.info('Converting file to GeoJSON...');
      
      // Read file as base64
      let fileContent: string;
      try {
        fileContent = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            console.log('File read successfully');
            resolve(reader.result as string);
          };
          reader.onerror = () => {
            console.error('FileReader error:', reader.error);
            reject(new Error('Failed to read file'));
          };
          reader.readAsDataURL(file);
        });
      } catch (readError) {
        console.error('Error reading file:', readError);
        toast.error('Failed to read file. Please ensure the file is not corrupted and try again.');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      console.log('Calling convertToGeoJSON edge function...');

      // Call the edge function to convert the file
      const { data, error } = await supabase.functions.invoke('convertToGeoJSON', {
        body: {
          fileName: file.name,
          fileContent: fileContent,
          fileType: file.type
        },
      });

      console.log('Edge function response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        toast.error(`Conversion failed: ${error.message || 'Unable to process file'}. Please check the file format and try again.`);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      if (!data) {
        toast.error('No response from conversion service. Please try again.');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      if (!data.success) {
        console.error('Conversion failed:', data.error);
        toast.error(`File conversion failed: ${data.error || 'Unknown error'}. Please verify your file format.`);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      const geoJson = data.geoJson;

      console.log('GeoJSON received:', geoJson);

      if (!geoJson || !geoJson.features || geoJson.features.length === 0) {
        toast.error('No valid geographic features found in the file. Please check your file content.');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      toast.success(`Successfully converted ${file.name}`);

      // Add to map
      if (draw.current && geoJson.features.length > 0) {
        const firstGeometry = geoJson.features[0].geometry;
        
        // Generate a unique ID for the uploaded AOI
        const featureId = `uploaded-aoi-${Date.now()}`;
        
        setUploadedAOI(firstGeometry);
        setUploadedAOIFeatureId(featureId);
        
        // Check if we're in a form that has boundary save callback (intent registration or permit application)
        if (onBoundarySave) {
          // Check if there's a drawn AOI
          if (drawnAOI) {
            const addedFeatures = draw.current.add({
              type: 'Feature',
              id: featureId,
              properties: {},
              geometry: firstGeometry
            });
            setShowAOIChoiceDialog(true);
          } else if (existingBoundary) {
            setPendingBoundary(firstGeometry);
            setShowOverrideDialog(true);
          } else {
            draw.current.add({
              type: 'Feature',
              id: featureId,
              properties: {},
              geometry: firstGeometry
            });
            const locationInfo = await extractLocationInfoFromGeometry(firstGeometry);
            onBoundarySave(firstGeometry, locationInfo);
            toast.success('Project boundary uploaded successfully');
          }
        } else {
          // Regular AOI upload to database
          draw.current.add({
            type: 'Feature',
            id: featureId,
            properties: {},
            geometry: firstGeometry
          });

          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            toast.error('Please log in to save uploaded AOI');
            return;
          }

          for (const feature of geoJson.features) {
            const { error } = await supabase
              .from('project_aois')
              .insert({
                user_id: user.id,
                geometry: feature.geometry,
                name: file.name
              });

            if (error) throw error;
          }

          toast.success(`Successfully uploaded ${geoJson.features.length} AOI(s) from ${file.name}`);
        }
        
        // Zoom to uploaded features
        if (map.current && geoJson.features[0]) {
          const bounds = new mapboxgl.LngLatBounds();
          geoJson.features.forEach((feature: any) => {
            if (feature.geometry.type === 'Polygon') {
              feature.geometry.coordinates[0].forEach((coord: [number, number]) => {
                bounds.extend(coord);
              });
            }
          });
          map.current.fitBounds(bounds, { padding: 50, maxZoom: 17 });
          
          // Place marker at the center of the AOI boundary (fixed position)
          if (marker.current && onCoordinatesChange) {
            const center = bounds.getCenter();
            marker.current.setLngLat([center.lng, center.lat]);
            marker.current.addTo(map.current);
            onCoordinatesChange({
              lat: parseFloat(center.lat.toFixed(6)),
              lng: parseFloat(center.lng.toFixed(6))
            });
          }
        }
      } else {
        toast.error('No valid geometries found in file');
      }
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during file upload';
      toast.error(`Upload failed: ${errorMessage}`);
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };



  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {customTitle || 'Full map of Papua New Guinea with GIS layers and Area of Interest drawing tools'}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              {customDescription || 'Map your proposed project site and area of interest using the interactive map below. You can also upload previously saved KML or GeoJSON files of your proposed project site.'}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-4">
        {/* Drawing Tool Info and File Upload - Hidden when hideDrawingTools is true or readOnly */}
        {!hideDrawingTools && !readOnly && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-start gap-2 text-sm">
                <Edit3 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <span className="font-medium block mb-1">AOI Drawing Tool</span>
                  <p className="text-xs text-muted-foreground">
                    Use the polygon tool (top-left of map) to draw your project boundary directly on the map. Click points to create a polygon shape, and double-click or connect back to the starting point to complete.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-start gap-2 text-sm">
                <Upload className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <span className="font-medium block mb-1">Upload AOI Files</span>
                  <p className="text-xs text-muted-foreground mb-2">
                    Or upload existing geographic files (KML, KMZ, GeoJSON, GPX, CSV, or ZIP containing these formats).
                  </p>
                  <div>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".kml,.kmz,.json,.geojson,.zip,.gpx,.csv"
                      onChange={handleFileUpload}
                      className="h-8 text-xs cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GIS Layers Legend - Collapsible */}
        <div className="space-y-3 border rounded-lg p-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">GIS Layers</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                // Check if any layer is currently enabled
                const anyEnabled = showDistricts || showLLGs || 
                                  Object.values(dbGISLayerToggles).some(v => v) || 
                                  (uploadedAOI && showUploadedAOI);
                
                // If any is enabled, disable all. Otherwise, enable all
                const targetState = !anyEnabled;
                
                setShowDistricts(targetState);
                setShowLLGs(targetState);
                
                if (dbGISLayers.length > 0) {
                  const newToggles: {[key: string]: boolean} = {};
                  dbGISLayers.forEach(layer => {
                    newToggles[layer.id] = targetState;
                  });
                  setDbGISLayerToggles(newToggles);
                }
                
                if (uploadedAOI) {
                  setShowUploadedAOI(targetState);
                }
              }}
              className="h-7 text-xs"
            >
              {(!showDistricts && !showLLGs && Object.values(dbGISLayerToggles).every(v => !v) && (!uploadedAOI || !showUploadedAOI)) ? 'Enable All' : 'Disable All'}
            </Button>
          </div>

          {/* Boundary Layers */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Boundaries</div>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center space-x-2 px-2 py-1 rounded-md bg-background hover:bg-accent transition-colors">
                <Switch
                  id="districts"
                  checked={showDistricts}
                  onCheckedChange={setShowDistricts}
                  className="scale-75"
                />
                <Label htmlFor="districts" className="text-xs cursor-pointer flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full border" style={{ backgroundColor: '#3b82f6' }}></div>
                  Districts
                </Label>
              </div>
              <div className="flex items-center space-x-2 px-2 py-1 rounded-md bg-background hover:bg-accent transition-colors">
                <Switch
                  id="llgs"
                  checked={showLLGs}
                  onCheckedChange={setShowLLGs}
                  className="scale-75"
                />
                <Label htmlFor="llgs" className="text-xs cursor-pointer flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full border" style={{ backgroundColor: '#10b981' }}></div>
                  LLGs
                </Label>
              </div>
            </div>
          </div>

          {/* Conservation & Protected Layers */}
          {dbGISLayers.length > 0 && (
            <div className="space-y-2 border-t border-border pt-2">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Conservation & Protected Areas</div>
              <div className="flex flex-wrap gap-2">
                {dbGISLayers.map((layer) => (
                  <div key={layer.id} className="flex items-center space-x-2 px-2 py-1 rounded-md bg-background hover:bg-accent transition-colors">
                    <Switch
                      id={`db-layer-${layer.id}`}
                      checked={dbGISLayerToggles[layer.id] || false}
                      onCheckedChange={(checked) => 
                        setDbGISLayerToggles(prev => ({ ...prev, [layer.id]: checked }))
                      }
                      className="scale-75"
                    />
                    <Label htmlFor={`db-layer-${layer.id}`} className="text-xs cursor-pointer flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full border" style={{ backgroundColor: layer.data?.color || '#ff6b6b' }}></div>
                      {layer.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Uploaded AOI */}
          {uploadedAOI && (
            <div className="space-y-2 border-t border-border pt-2">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Custom Areas</div>
              <div className="flex items-center space-x-2 px-2 py-1 rounded-md bg-background hover:bg-accent transition-colors w-fit">
                <Switch
                  id="uploaded-aoi"
                  checked={showUploadedAOI}
                  onCheckedChange={setShowUploadedAOI}
                  className="scale-75"
                />
                <Label htmlFor="uploaded-aoi" className="text-xs cursor-pointer flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full border" style={{ backgroundColor: '#ff0000' }}></div>
                  Uploaded AOI
                </Label>
              </div>
            </div>
          )}
        </div>

        {/* Map Container */}
        <div className="relative">
          <div 
            ref={mapContainer} 
            className="h-[600px] w-full rounded-lg border-2 border-border shadow-lg"
            style={{ 
              minHeight: '600px',
              position: 'relative',
              zIndex: 0,
              touchAction: 'pan-x pan-y',
              overflow: 'visible'
            }}
          />
        </div>

        {/* Active Layer Descriptions */}
        {(showDistricts || showLLGs || Object.values(dbGISLayerToggles).some(v => v) || (uploadedAOI && showUploadedAOI)) && (
          <div className="space-y-2 p-3 bg-accent/5 rounded-lg border border-accent/20">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Active Layers
            </h3>
            <div className="grid gap-1.5">
              {showDistricts && (
                <div className="text-xs flex items-start gap-2">
                  <div className="w-2.5 h-2.5 rounded-full border mt-0.5" style={{ backgroundColor: '#3b82f6', borderColor: '#2563eb' }}></div>
                  <div>
                    <span className="font-medium">District Boundaries:</span>
                    <span className="text-muted-foreground ml-1">Administrative district boundaries of PNG</span>
                  </div>
                </div>
              )}
              {showLLGs && (
                <div className="text-xs flex items-start gap-2">
                  <div className="w-2.5 h-2.5 rounded-full border mt-0.5" style={{ backgroundColor: '#06b6d4', borderColor: '#0891b2' }}></div>
                  <div>
                    <span className="font-medium">LLG Boundaries:</span>
                    <span className="text-muted-foreground ml-1">Local Level Government administrative boundaries</span>
                  </div>
                </div>
              )}
              {dbGISLayers.map((layer) => 
                dbGISLayerToggles[layer.id] && (
                  <div key={layer.id} className="text-xs flex items-start gap-2">
                    <div className="w-2.5 h-2.5 rounded-full border mt-0.5" style={{ backgroundColor: layer.data?.color || '#ff6b6b', borderColor: layer.data?.color || '#dc2626' }}></div>
                    <div>
                      <span className="font-medium">{layer.name}:</span>
                      <span className="text-muted-foreground ml-1">
                        {layer.name.includes('Biodiversity') ? 'High biodiversity value areas requiring protection' :
                         layer.name.includes('Conservation') ? 'Nationally designated conservation areas' :
                         layer.name.includes('KBA') || layer.name.includes('Key Biodiversity') ? 'Sites contributing to global biodiversity conservation' :
                         layer.name.includes('Protected') && layer.name.includes('Existing') ? 'Currently gazetted protected areas' :
                         layer.name.includes('Protected') && layer.name.includes('Proposed') ? 'Proposed areas under consideration for protection' :
                         'Conservation or protected area'}
                      </span>
                    </div>
                  </div>
                )
              )}
              {uploadedAOI && showUploadedAOI && (
                <div className="text-xs flex items-start gap-2">
                  <div className="w-2.5 h-2.5 rounded-full border mt-0.5" style={{ backgroundColor: '#ff0000', borderColor: '#dc2626' }}></div>
                  <div>
                    <span className="font-medium">Custom Area of Interest:</span>
                    <span className="text-muted-foreground ml-1">Your uploaded project area boundary</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Level Filters - Show only when displaying all applications */}
        {showAllApplications && (
          <div className="p-4 bg-muted/30 rounded-lg border space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-primary" />
              <Label className="text-sm font-semibold">Filter by Activity Level</Label>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Switch
                  id="level1-toggle"
                  checked={showLevel1}
                  onCheckedChange={setShowLevel1}
                />
                <Label htmlFor="level1-toggle" className="flex items-center gap-2 cursor-pointer">
                  <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow"></div>
                  <span className="text-sm">Level 1</span>
                  <Badge variant="secondary" className="text-xs">
                    {permits.filter(p => p.activity_level === 1).length}
                  </Badge>
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="level2-toggle"
                  checked={showLevel2}
                  onCheckedChange={setShowLevel2}
                />
                <Label htmlFor="level2-toggle" className="flex items-center gap-2 cursor-pointer">
                  <div className="w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow"></div>
                  <span className="text-sm">Level 2</span>
                  <Badge variant="secondary" className="text-xs">
                    {permits.filter(p => p.activity_level === 2).length}
                  </Badge>
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="level3-toggle"
                  checked={showLevel3}
                  onCheckedChange={setShowLevel3}
                />
                <Label htmlFor="level3-toggle" className="flex items-center gap-2 cursor-pointer">
                  <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow"></div>
                  <span className="text-sm">Level 3</span>
                  <Badge variant="secondary" className="text-xs">
                    {permits.filter(p => p.activity_level === 3).length}
                  </Badge>
                </Label>
              </div>
            </div>
            {permitsLoading && (
              <p className="text-xs text-muted-foreground">Loading permits...</p>
            )}
          </div>
        )}

        {/* Coordinate Fields - Moved to bottom */}
        {coordinates && onCoordinatesChange && (
          <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-lg border">
            <div className="space-y-1">
              <Label htmlFor="latitude" className="text-xs font-medium">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="0.000001"
                value={coordinates.lat || ''}
                onChange={(e) => {
                  const lat = parseFloat(e.target.value);
                  if (!isNaN(lat)) {
                    onCoordinatesChange({ ...coordinates, lat });
                    if (marker.current) {
                      marker.current.setLngLat([coordinates.lng, lat]);
                      updatePopup(coordinates.lng, lat);
                    }
                  }
                }}
                className="h-8 text-xs"
                placeholder="e.g., -6.314993"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="longitude" className="text-xs font-medium">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="0.000001"
                value={coordinates.lng || ''}
                onChange={(e) => {
                  const lng = parseFloat(e.target.value);
                  if (!isNaN(lng)) {
                    onCoordinatesChange({ ...coordinates, lng });
                    if (marker.current) {
                      marker.current.setLngLat([lng, coordinates.lat]);
                      updatePopup(lng, coordinates.lat);
                    }
                  }
                }}
                className="h-8 text-xs"
                placeholder="e.g., 147.1494"
              />
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground flex items-start gap-1">
                <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                Coordinates are automatically set from the center of the uploaded AOI boundary.
              </p>
            </div>
          </div>
        )}

      </CardContent>

      {/* Override Confirmation Dialog */}
      <AlertDialog open={showOverrideDialog} onOpenChange={setShowOverrideDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Override Existing Boundary?</AlertDialogTitle>
            <AlertDialogDescription>
              A project boundary already exists for this intent registration. Do you want to replace it with the new boundary? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowOverrideDialog(false);
              setPendingBoundary(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmOverride}>
              Override
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AOI Choice Dialog */}
      <AlertDialog open={showAOIChoiceDialog} onOpenChange={setShowAOIChoiceDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Choose AOI to Save</AlertDialogTitle>
            <AlertDialogDescription>
              You have both a drawn AOI and an uploaded AOI. Which one would you like to use as your project boundary?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowAOIChoiceDialog(false);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleChooseUploaded} className="mr-2">
              Use Uploaded AOI
            </AlertDialogAction>
            <AlertDialogAction onClick={handleChooseDrawn}>
              Use Drawn AOI
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
