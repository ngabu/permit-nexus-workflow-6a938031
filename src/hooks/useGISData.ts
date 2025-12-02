import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GISDataCache {
  [key: string]: any;
}

const cache: GISDataCache = {};

export const useGISData = () => {
  const [districtBoundaries, setDistrictBoundaries] = useState<any>(cache['district'] || null);
  const [llgBoundaries, setLlgBoundaries] = useState<any>(cache['llg'] || null);
  const [biodiversityAreas, setBiodiversityAreas] = useState<any>(cache['biodiversity'] || null);
  const [conservationAreas, setConservationAreas] = useState<any>(cache['conservation'] || null);
  const [kbaAreas, setKbaAreas] = useState<any>(cache['kba'] || null);
  const [protectedExisting, setProtectedExisting] = useState<any>(cache['protectedExisting'] || null);
  const [protectedProposed, setProtectedProposed] = useState<any>(cache['protectedProposed'] || null);
  const [dbGISLayers, setDbGISLayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFromDatabase = useCallback(async () => {
    // Check cache first
    if (cache['database']) {
      setDbGISLayers(cache['database']);
      return;
    }
    
    // Don't set loading for database queries as they're optional
    try {
      const { data, error } = await supabase
        .from('gis_data')
        .select('id, name, data');
      
      if (error) {
        console.warn('GIS data table query failed (table may be empty):', error);
        cache['database'] = [];
        setDbGISLayers([]);
        return;
      }
      
      cache['database'] = data || [];
      setDbGISLayers(data || []);
    } catch (error) {
      console.warn('Error loading GIS data from database:', error);
      cache['database'] = [];
      setDbGISLayers([]);
    }
  }, []);

  const loadGISLayerData = useCallback(async (layerId: string, filePath: string) => {
    const cacheKey = `gis_layer_${layerId}`;
    
    // Check cache first
    if (cache[cacheKey]) {
      return cache[cacheKey];
    }
    
    try {
      const res = await fetch(filePath);
      const data = await res.json();
      cache[cacheKey] = data;
      return data;
    } catch (error) {
      console.error(`Error loading GIS layer data from ${filePath}:`, error);
      return null;
    }
  }, []);

  const loadDistrictBoundaries = useCallback(async () => {
    if (cache['district']) return;
    setLoading(true);
    try {
      const res = await fetch('/gis-data/png_dist_boundaries.json');
      const data = await res.json();
      cache['district'] = data;
      setDistrictBoundaries(data);
    } catch (error) {
      console.error('Error loading district boundaries:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadLLGBoundaries = useCallback(async () => {
    if (cache['llg']) return;
    setLoading(true);
    try {
      const res = await fetch('/gis-data/png_llg_boundaries.json');
      const data = await res.json();
      cache['llg'] = data;
      setLlgBoundaries(data);
    } catch (error) {
      console.error('Error loading LLG boundaries:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadBiodiversityAreas = useCallback(async () => {
    if (cache['biodiversity']) return;
    setLoading(true);
    try {
      const res = await fetch('/gis-data/biodiversity_priority_areas.json');
      const data = await res.json();
      cache['biodiversity'] = data;
      setBiodiversityAreas(data);
    } catch (error) {
      console.error('Error loading biodiversity areas:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadConservationAreas = useCallback(async () => {
    if (cache['conservation']) return;
    setLoading(true);
    try {
      const res = await fetch('/gis-data/conservation_national_areas.json');
      const data = await res.json();
      cache['conservation'] = data;
      setConservationAreas(data);
    } catch (error) {
      console.error('Error loading conservation areas:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadKBAreas = useCallback(async () => {
    if (cache['kba']) return;
    setLoading(true);
    try {
      const res = await fetch('/gis-data/KBA_Key_Biodiversity_Area.json');
      const data = await res.json();
      cache['kba'] = data;
      setKbaAreas(data);
    } catch (error) {
      console.error('Error loading KBA areas:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadProtectedExisting = useCallback(async () => {
    if (cache['protectedExisting']) return;
    setLoading(true);
    try {
      const res = await fetch('/gis-data/protected_areas_existing.json');
      const data = await res.json();
      cache['protectedExisting'] = data;
      setProtectedExisting(data);
    } catch (error) {
      console.error('Error loading protected existing areas:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadProtectedProposed = useCallback(async () => {
    if (cache['protectedProposed']) return;
    setLoading(true);
    try {
      const res = await fetch('/gis-data/protected_areas_proposed.json');
      const data = await res.json();
      cache['protectedProposed'] = data;
      setProtectedProposed(data);
    } catch (error) {
      console.error('Error loading protected proposed areas:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { 
    districtBoundaries, 
    llgBoundaries, 
    biodiversityAreas,
    conservationAreas,
    kbaAreas,
    protectedExisting,
    protectedProposed,
    dbGISLayers,
    loading,
    loadDistrictBoundaries,
    loadLLGBoundaries,
    loadBiodiversityAreas,
    loadConservationAreas,
    loadKBAreas,
    loadProtectedExisting,
    loadProtectedProposed,
    loadFromDatabase,
    loadGISLayerData
  };
};
