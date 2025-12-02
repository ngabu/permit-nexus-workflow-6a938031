import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { XMLParser } from 'https://esm.sh/fast-xml-parser@4.3.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== convertToGeoJSON function called ===');
    
    const body = await req.json();
    console.log('Request body keys:', Object.keys(body));
    
    const { fileName, fileContent, fileType } = body;
    
    if (!fileName || !fileContent) {
      const errorMsg = 'No file data provided. Missing: ' + 
        (!fileName ? 'fileName ' : '') + 
        (!fileContent ? 'fileContent' : '');
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    console.log('Processing file:', fileName, 'Type:', fileType);
    
    const fileNameLower = fileName.toLowerCase();
    const fileExtension = fileNameLower.split('.').pop();
    console.log('File extension:', fileExtension);
    
    // Extract base64 content (remove data URL prefix)
    if (!fileContent.includes(',')) {
      throw new Error('Invalid file content format. Expected base64 data URL.');
    }
    
    const base64Data = fileContent.split(',')[1];
    if (!base64Data) {
      throw new Error('Failed to extract base64 data from file content');
    }
    
    console.log('Base64 data length:', base64Data.length);
    
    let binaryData: Uint8Array;
    try {
      binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      console.log('Binary data size:', binaryData.length, 'bytes');
    } catch (decodeError) {
      console.error('Base64 decode error:', decodeError);
      throw new Error('Failed to decode base64 file content');
    }
    
    let geoJson: any = null;

    if (fileExtension === 'geojson' || fileExtension === 'json') {
      console.log('Processing as GeoJSON/JSON');
      // Parse GeoJSON/JSON directly
      const text = new TextDecoder().decode(binaryData);
      console.log('Decoded text length:', text.length);
      const parsed = JSON.parse(text);
      
      if (parsed.type === 'FeatureCollection') {
        geoJson = parsed;
      } else if (parsed.type === 'Feature') {
        geoJson = {
          type: 'FeatureCollection',
          features: [parsed]
        };
      } else if (parsed.geometry) {
        geoJson = {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            properties: {},
            geometry: parsed.geometry
          }]
        };
      } else {
        throw new Error('Invalid GeoJSON format');
      }
    } else if (fileExtension === 'kml') {
      console.log('Processing as KML');
      // Parse KML to GeoJSON
      const text = new TextDecoder().decode(binaryData);
      geoJson = await convertKMLToGeoJSON(text);
    } else if (fileExtension === 'kmz') {
      console.log('Processing as KMZ');
      // KMZ is a zipped KML file
      const kmlText = await extractKMLFromKMZ(binaryData.buffer as ArrayBuffer);
      geoJson = await convertKMLToGeoJSON(kmlText);
    } else if (fileExtension === 'gpx') {
      console.log('Processing as GPX');
      // Parse GPX to GeoJSON
      const text = new TextDecoder().decode(binaryData);
      geoJson = await convertGPXToGeoJSON(text);
    } else if (fileExtension === 'csv') {
      console.log('Processing as CSV');
      // Parse CSV to GeoJSON (assuming lat/lon columns)
      const text = new TextDecoder().decode(binaryData);
      geoJson = await convertCSVToGeoJSON(text);
    } else if (fileExtension === 'zip') {
      console.log('Processing as Shapefile (ZIP)');
      // Handle shapefile (zip containing .shp, .shx, .dbf)
      geoJson = await convertShapefileToGeoJSON(binaryData.buffer as ArrayBuffer);
    } else {
      throw new Error(`Unsupported file format: ${fileExtension}. Supported formats: .geojson, .json, .kml, .kmz, .gpx, .csv, .zip (shapefile)`);
    }

    if (!geoJson) {
      throw new Error('Failed to convert file to GeoJSON');
    }

    console.log('Conversion successful, features:', geoJson?.features?.length || 0);

    return new Response(
      JSON.stringify({
        success: true,
        geoJson,
        message: `Successfully converted ${fileName} to GeoJSON`
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    );
  } catch (error: any) {
    console.error('Error in convertToGeoJSON:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    );
  }
});

// Helper function to convert KML to GeoJSON
async function convertKMLToGeoJSON(kmlText: string): Promise<any> {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_'
  });
  
  const kmlDoc = parser.parse(kmlText);
  
  if (!kmlDoc) {
    throw new Error('Failed to parse KML document');
  }
  
  const features: any[] = [];
  
  // Navigate to Placemarks (handle various KML structures)
  const kml = kmlDoc.kml || kmlDoc;
  const document = kml.Document || kml;
  let placemarks = document.Placemark || [];
  
  if (!Array.isArray(placemarks)) {
    placemarks = [placemarks];
  }
  
  for (const placemark of placemarks) {
    const name = placemark.name || '';
    const description = placemark.description || '';
    
    // Check for Polygon
    if (placemark.Polygon) {
      const coordinates = placemark.Polygon.outerBoundaryIs?.LinearRing?.coordinates || 
                         placemark.Polygon.coordinates;
      if (coordinates) {
        const coordPairs = coordinates.trim().split(/\s+/).map((coord: string) => {
          const parts = coord.split(',').map(Number);
          return [parts[0], parts[1]]; // [lng, lat]
        });
        
        features.push({
          type: 'Feature',
          properties: { name, description },
          geometry: {
            type: 'Polygon',
            coordinates: [coordPairs]
          }
        });
      }
    }
    
    // Check for LineString
    if (placemark.LineString) {
      const coordinates = placemark.LineString.coordinates;
      if (coordinates) {
        const coordPairs = coordinates.trim().split(/\s+/).map((coord: string) => {
          const parts = coord.split(',').map(Number);
          return [parts[0], parts[1]]; // [lng, lat]
        });
        
        features.push({
          type: 'Feature',
          properties: { name, description },
          geometry: {
            type: 'LineString',
            coordinates: coordPairs
          }
        });
      }
    }
    
    // Check for Point
    if (placemark.Point) {
      const coordinates = placemark.Point.coordinates;
      if (coordinates) {
        const parts = coordinates.trim().split(',').map(Number);
        
        features.push({
          type: 'Feature',
          properties: { name, description },
          geometry: {
            type: 'Point',
            coordinates: [parts[0], parts[1]] // [lng, lat]
          }
        });
      }
    }
  }
  
  return {
    type: 'FeatureCollection',
    features
  };
}

// Helper function to extract KML from KMZ (zip)
async function extractKMLFromKMZ(arrayBuffer: ArrayBuffer): Promise<string> {
  // Import JSZip for handling zip files
  const JSZip = (await import('https://esm.sh/jszip@3.10.1')).default;
  
  const zip = await JSZip.loadAsync(arrayBuffer);
  
  // Find the KML file in the zip
  const kmlFile = Object.keys(zip.files).find(name => name.endsWith('.kml'));
  
  if (!kmlFile) {
    throw new Error('No KML file found in KMZ archive');
  }
  
  return await zip.files[kmlFile].async('text');
}

// Helper function to convert GPX to GeoJSON
async function convertGPXToGeoJSON(gpxText: string): Promise<any> {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_'
  });
  
  const gpxDoc = parser.parse(gpxText);
  
  if (!gpxDoc) {
    throw new Error('Failed to parse GPX document');
  }
  
  const features: any[] = [];
  const gpx = gpxDoc.gpx || gpxDoc;
  
  // Extract waypoints (wpt)
  let waypoints = gpx.wpt || [];
  if (!Array.isArray(waypoints)) {
    waypoints = [waypoints];
  }
  
  for (const wpt of waypoints) {
    const lat = parseFloat(wpt['@_lat'] || '0');
    const lon = parseFloat(wpt['@_lon'] || '0');
    const name = wpt.name || '';
    
    features.push({
      type: 'Feature',
      properties: { name },
      geometry: {
        type: 'Point',
        coordinates: [lon, lat]
      }
    });
  }
  
  // Extract tracks (trk)
  let tracks = gpx.trk || [];
  if (!Array.isArray(tracks)) {
    tracks = [tracks];
  }
  
  for (const trk of tracks) {
    const name = trk.name || '';
    let trksegs = trk.trkseg || [];
    if (!Array.isArray(trksegs)) {
      trksegs = [trksegs];
    }
    
    for (const trkseg of trksegs) {
      let trkpts = trkseg.trkpt || [];
      if (!Array.isArray(trkpts)) {
        trkpts = [trkpts];
      }
      
      const coordinates: number[][] = [];
      for (const trkpt of trkpts) {
        const lat = parseFloat(trkpt['@_lat'] || '0');
        const lon = parseFloat(trkpt['@_lon'] || '0');
        coordinates.push([lon, lat]);
      }
      
      if (coordinates.length > 0) {
        features.push({
          type: 'Feature',
          properties: { name },
          geometry: {
            type: 'LineString',
            coordinates
          }
        });
      }
    }
  }
  
  // Extract routes (rte)
  let routes = gpx.rte || [];
  if (!Array.isArray(routes)) {
    routes = [routes];
  }
  
  for (const rte of routes) {
    const name = rte.name || '';
    let rtepts = rte.rtept || [];
    if (!Array.isArray(rtepts)) {
      rtepts = [rtepts];
    }
    
    const coordinates: number[][] = [];
    for (const rtept of rtepts) {
      const lat = parseFloat(rtept['@_lat'] || '0');
      const lon = parseFloat(rtept['@_lon'] || '0');
      coordinates.push([lon, lat]);
    }
    
    if (coordinates.length > 0) {
      features.push({
        type: 'Feature',
        properties: { name },
        geometry: {
          type: 'LineString',
          coordinates
        }
      });
    }
  }
  
  return {
    type: 'FeatureCollection',
    features
  };
}

// Helper function to convert CSV to GeoJSON
async function convertCSVToGeoJSON(csvText: string): Promise<any> {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('CSV file must have at least a header and one data row');
  }
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  // Find latitude and longitude columns
  const latIndex = headers.findIndex(h => 
    h.includes('lat') || h === 'y' || h === 'latitude'
  );
  const lonIndex = headers.findIndex(h => 
    h.includes('lon') || h === 'x' || h === 'longitude' || h.includes('lng')
  );
  
  if (latIndex === -1 || lonIndex === -1) {
    throw new Error('CSV must contain latitude/longitude columns (e.g., "lat", "lon", "latitude", "longitude", "x", "y")');
  }
  
  const features: any[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length !== headers.length) continue;
    
    const lat = parseFloat(values[latIndex]);
    const lon = parseFloat(values[lonIndex]);
    
    if (isNaN(lat) || isNaN(lon)) continue;
    
    // Collect other properties
    const properties: any = {};
    headers.forEach((header, idx) => {
      if (idx !== latIndex && idx !== lonIndex) {
        properties[header] = values[idx];
      }
    });
    
    features.push({
      type: 'Feature',
      properties,
      geometry: {
        type: 'Point',
        coordinates: [lon, lat]
      }
    });
  }
  
  return {
    type: 'FeatureCollection',
    features
  };
}

// Helper function to convert Shapefile to GeoJSON
async function convertShapefileToGeoJSON(arrayBuffer: ArrayBuffer): Promise<any> {
  // Import required libraries
  const shapefile = await import('https://esm.sh/shapefile@0.6.6');
  const JSZip = (await import('https://esm.sh/jszip@3.10.1')).default;
  
  try {
    console.log('Processing shapefile ZIP, size:', arrayBuffer.byteLength);
    
    // Extract ZIP contents
    const zip = await JSZip.loadAsync(arrayBuffer);
    console.log('ZIP files:', Object.keys(zip.files));
    
    // Find the required shapefile components
    const shpFile = Object.keys(zip.files).find(name => name.toLowerCase().endsWith('.shp'));
    const dbfFile = Object.keys(zip.files).find(name => name.toLowerCase().endsWith('.dbf'));
    
    if (!shpFile) {
      throw new Error('No .shp file found in the ZIP archive. Please ensure your shapefile includes a .shp file.');
    }
    
    console.log('Found .shp file:', shpFile);
    if (dbfFile) console.log('Found .dbf file:', dbfFile);
    
    // Extract the .shp file as ArrayBuffer
    const shpData = await zip.files[shpFile].async('arraybuffer');
    
    // Extract the .dbf file if it exists
    let dbfData = undefined;
    if (dbfFile) {
      dbfData = await zip.files[dbfFile].async('arraybuffer');
    }
    
    console.log('Extracted .shp size:', shpData.byteLength);
    if (dbfData) console.log('Extracted .dbf size:', dbfData.byteLength);
    
    // Read the shapefile with both .shp and .dbf data
    const source = await shapefile.open(shpData, dbfData);
    const features: any[] = [];
    
    let result = await source.read();
    while (!result.done) {
      if (result.value) {
        features.push(result.value);
      }
      result = await source.read();
    }
    
    console.log('Successfully parsed shapefile, features:', features.length);
    
    return {
      type: 'FeatureCollection',
      features
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Shapefile parsing error:', errorMessage);
    throw new Error(`Failed to parse shapefile: ${errorMessage}`);
  }
}
