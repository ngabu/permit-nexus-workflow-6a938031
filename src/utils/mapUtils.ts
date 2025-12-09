/**
 * Calculate the center point of a GeoJSON polygon boundary
 * @param boundary - GeoJSON polygon geometry or feature
 * @returns Object with lat and lng coordinates of the center, or default PNG center
 */
export function calculateBoundaryCenter(boundary: any): { lat: number; lng: number } {
  const defaultCenter = { lat: -6.314993, lng: 147.1494 }; // PNG default center
  
  if (!boundary) return defaultCenter;
  
  try {
    // Handle both Feature and direct geometry formats
    const geometry = boundary.type === 'Feature' ? boundary.geometry : boundary;
    
    if (!geometry || !geometry.coordinates) return defaultCenter;
    
    // Get the coordinates array based on geometry type
    let coords: [number, number][] = [];
    
    if (geometry.type === 'Polygon' && geometry.coordinates[0]) {
      coords = geometry.coordinates[0];
    } else if (geometry.type === 'MultiPolygon' && geometry.coordinates[0]?.[0]) {
      coords = geometry.coordinates[0][0];
    } else {
      return defaultCenter;
    }
    
    if (coords.length === 0) return defaultCenter;
    
    // Calculate the center by averaging all coordinate points
    const sumLng = coords.reduce((sum, coord) => sum + coord[0], 0);
    const sumLat = coords.reduce((sum, coord) => sum + coord[1], 0);
    
    return {
      lng: sumLng / coords.length,
      lat: sumLat / coords.length
    };
  } catch (error) {
    console.error('Error calculating boundary center:', error);
    return defaultCenter;
  }
}
