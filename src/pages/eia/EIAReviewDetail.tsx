import { useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft,
  MapPin, 
  AlertTriangle, 
  Shield, 
  FileText, 
  CheckCircle,
  Monitor,
  Clock,
  Users,
  TreePine,
  Droplets,
  Mountain,
  Factory,
  Eye,
  Download,
  Calendar,
  User
} from "lucide-react";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Mock data for the EIA detail
const eiaDetail = {
  id: "EIA-2024-001",
  project: "Riverside Industrial Park Expansion",
  applicant: "Riverside Industries Ltd",
  category: "Red Category",
  submittedDate: "2024-01-15",
  currentStep: "Impact Analysis",
  progress: 35,
  assessor: "Dr. Sarah Johnson",
  priority: "high",
  type: "Manufacturing",
  location: {
    coordinates: [147.1751, -9.4438] as [number, number], // Papua New Guinea coordinates
    description: "Port Moresby Industrial Zone, Section 45",
    area: "125 hectares",
    elevation: "45m above sea level"
  },
  environmentalData: {
    waterBodies: ["Markham River", "Coastal wetlands"],
    protectedAreas: ["Varirata National Park (15km)"],
    sensitiveSpecies: ["Raggiana Bird-of-paradise", "Green Tree Python"],
    soilType: "Alluvial clay with high organic content",
    climateZone: "Tropical monsoon"
  },
  timeline: [
    { step: "Screening", date: "2024-01-16", status: "completed", assessor: "Mark Thompson" },
    { step: "Scoping", date: "2024-01-22", status: "completed", assessor: "Dr. Sarah Johnson" },
    { step: "Impact Analysis", date: "2024-01-28", status: "in-progress", assessor: "Dr. Sarah Johnson" },
    { step: "Mitigation Measures", date: "2024-02-05", status: "pending", assessor: "TBD" },
  ],
  documents: [
    { name: "Project Description Report", type: "PDF", size: "2.4 MB", uploadDate: "2024-01-15" },
    { name: "Environmental Baseline Study", type: "PDF", size: "8.7 MB", uploadDate: "2024-01-18" },
    { name: "Community Consultation Report", type: "PDF", size: "3.2 MB", uploadDate: "2024-01-20" },
    { name: "Preliminary Impact Assessment", type: "PDF", size: "5.1 MB", uploadDate: "2024-01-25" }
  ]
};

const EIAReviewDetail = () => {
  const { id } = useParams();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const mapboxToken = "pk.eyJ1IjoiZ2FidW5vcm1hbiIsImEiOiJjbWJ0emU0cGEwOHR1MmtxdXh2d2wzOTV5In0.RUVMHkS-KaJ6CGWUiB3s4w";

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: eiaDetail.location.coordinates,
      zoom: 12,
      pitch: 45,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add project location marker
    new mapboxgl.Marker({ color: '#ef4444' })
      .setLngLat(eiaDetail.location.coordinates)
      .setPopup(
        new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <h3>${eiaDetail.project}</h3>
            <p>${eiaDetail.location.description}</p>
            <p><strong>Area:</strong> ${eiaDetail.location.area}</p>
          `)
      )
      .addTo(map.current);

    // Add environmental overlay layers
    map.current.on('load', () => {
      if (!map.current) return;

      // Add impact zone circle
      map.current.addSource('impact-zone', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: eiaDetail.location.coordinates
          },
          properties: {}
        }
      });

      map.current.addLayer({
        id: 'impact-zone-circle',
        type: 'circle',
        source: 'impact-zone',
        paint: {
          'circle-radius': 50,
          'circle-color': '#ef4444',
          'circle-opacity': 0.2,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ef4444',
          'circle-stroke-opacity': 0.8
        }
      });

      // Add protected areas
      map.current.addSource('protected-areas', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [147.3751, -9.2438] as [number, number] // Varirata National Park approximate location
          },
          properties: {}
        }
      });

      map.current.addLayer({
        id: 'protected-areas-circle',
        type: 'circle',
        source: 'protected-areas',
        paint: {
          'circle-radius': 30,
          'circle-color': '#22c55e',
          'circle-opacity': 0.3,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#22c55e',
          'circle-stroke-opacity': 1
        }
      });

      // Add water bodies
      map.current.addSource('water-bodies', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [147.1451, -9.4638] as [number, number],
              [147.1651, -9.4438] as [number, number],
              [147.1851, -9.4238] as [number, number]
            ]
          },
          properties: {}
        }
      });

      map.current.addLayer({
        id: 'water-bodies-line',
        type: 'line',
        source: 'water-bodies',
        paint: {
          'line-color': '#3b82f6',
          'line-width': 4,
          'line-opacity': 0.8
        }
      });
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  const getStepIcon = (step: string) => {
    const icons = {
      "Screening": Eye,
      "Scoping": MapPin,
      "Impact Analysis": AlertTriangle,
      "Mitigation Measures": Shield
    };
    return icons[step as keyof typeof icons] || FileText;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-primary text-primary-foreground";
      case "in-progress": return "bg-accent text-accent-foreground";
      case "pending": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/staff-dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{eiaDetail.id}</h1>
              <p className="text-muted-foreground">{eiaDetail.project}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="destructive">{eiaDetail.category}</Badge>
            <Badge variant="outline">{eiaDetail.type}</Badge>
            <Button>Update Assessment</Button>
          </div>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Assessment Progress</h3>
                <p className="text-sm text-muted-foreground">Current Step: {eiaDetail.currentStep}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{eiaDetail.progress}%</div>
                <p className="text-sm text-muted-foreground">Complete</p>
              </div>
            </div>
            <Progress value={eiaDetail.progress} className="mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {eiaDetail.timeline.map((item, index) => {
                const IconComponent = getStepIcon(item.step);
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${getStatusColor(item.status)}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.step}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="environmental-map">Environmental Map</TabsTrigger>
            <TabsTrigger value="impact-analysis">Impact Analysis</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Project Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Factory className="h-5 w-5" />
                    Project Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Applicant</label>
                    <p className="text-foreground">{eiaDetail.applicant}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Project Type</label>
                    <p className="text-foreground">{eiaDetail.type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Assessment Category</label>
                    <p className="text-foreground">{eiaDetail.category}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Primary Assessor</label>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{eiaDetail.assessor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Submission Date</label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{eiaDetail.submittedDate}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p className="text-foreground">{eiaDetail.location.description}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Area Coverage</label>
                    <p className="text-foreground">{eiaDetail.location.area}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Elevation</label>
                    <div className="flex items-center gap-2">
                      <Mountain className="h-4 w-4" />
                      <span>{eiaDetail.location.elevation}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Coordinates</label>
                    <p className="text-foreground font-mono text-sm">
                      {eiaDetail.location.coordinates[1]}, {eiaDetail.location.coordinates[0]}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Environmental Context */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TreePine className="h-5 w-5" />
                  Environmental Context
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      Water Bodies
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {eiaDetail.environmentalData.waterBodies.map((body, index) => (
                        <li key={index}>• {body}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      Protected Areas
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {eiaDetail.environmentalData.protectedAreas.map((area, index) => (
                        <li key={index}>• {area}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <TreePine className="h-4 w-4 text-orange-500" />
                      Sensitive Species
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {eiaDetail.environmentalData.sensitiveSpecies.map((species, index) => (
                        <li key={index}>• {species}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Soil Type</label>
                    <p className="text-foreground">{eiaDetail.environmentalData.soilType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Climate Zone</label>
                    <p className="text-foreground">{eiaDetail.environmentalData.climateZone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="environmental-map" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Environmental Impact Map
                </CardTitle>
                <CardDescription>
                  Interactive map showing project location, environmental features, and impact zones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Map Legend */}
                  <div className="flex flex-wrap gap-4 p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                      <span className="text-sm">Project Site</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 opacity-20 rounded-full border-2 border-red-500"></div>
                      <span className="text-sm">Impact Zone</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 opacity-30 rounded-full border-2 border-green-500"></div>
                      <span className="text-sm">Protected Areas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-1 bg-blue-500"></div>
                      <span className="text-sm">Water Bodies</span>
                    </div>
                  </div>
                  
                  {/* Map Container */}
                  <div className="relative w-full h-[600px] rounded-lg overflow-hidden border">
                    <div ref={mapContainer} className="absolute inset-0" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="impact-analysis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Environmental Impact Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Air Quality Impact</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">PM2.5 Emissions</span>
                            <Badge variant="outline">Moderate</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">NOx Emissions</span>
                            <Badge variant="destructive">High</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">SO2 Emissions</span>
                            <Badge variant="outline">Low</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Water Quality Impact</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Discharge Volume</span>
                            <Badge variant="secondary">Medium</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Chemical Contaminants</span>
                            <Badge variant="outline">Low</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Temperature Impact</span>
                            <Badge variant="outline">Minimal</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Mitigation Measures Required</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">Air Quality Monitoring</p>
                            <p className="text-sm text-muted-foreground">Continuous monitoring of PM2.5 and NOx levels with quarterly reporting</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">Waste Water Treatment</p>
                            <p className="text-sm text-muted-foreground">Installation of advanced treatment systems before discharge</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">Biodiversity Conservation</p>
                            <p className="text-sm text-muted-foreground">Establishment of 50m buffer zones around sensitive habitats</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Assessment Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {eiaDetail.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {doc.type} • {doc.size} • Uploaded {doc.uploadDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Assessment Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {eiaDetail.timeline.map((item, index) => {
                    const IconComponent = getStepIcon(item.step);
                    return (
                      <div key={index} className="flex items-start gap-4">
                        <div className={`p-3 rounded-full ${getStatusColor(item.status)}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{item.step}</h3>
                            <Badge variant="outline">{item.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.date} • Assessor: {item.assessor}
                          </p>
                          <div className="mt-2">
                            <Button size="sm" variant="outline">View Details</Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default EIAReviewDetail;