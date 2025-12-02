/**
 * Utility script to upload GIS boundary data to the database
 * Run this once to populate the gis_data table with boundary files
 */

import { supabase } from '@/integrations/supabase/client';

export async function uploadGISDataToDatabase() {
  try {
    console.log('Loading GIS data files...');
    
    // Load the GeoJSON files from public folder
    const [
      districtRes, 
      llgRes, 
      biodiversityRes, 
      conservationRes, 
      kbaRes, 
      protectedExistingRes, 
      protectedProposedRes
    ] = await Promise.all([
      fetch('/gis-data/png_dist_boundaries.json'),
      fetch('/gis-data/png_llg_boundaries.json'),
      fetch('/gis-data/biodiversity_priority_areas.json'),
      fetch('/gis-data/conservation_national_areas.json'),
      fetch('/gis-data/KBA_Key_Biodiversity_Area.json'),
      fetch('/gis-data/protected_areas_existing.json'),
      fetch('/gis-data/protected_areas_proposed.json')
    ]);

    const districtData = await districtRes.json();
    const llgData = await llgRes.json();
    const biodiversityData = await biodiversityRes.json();
    const conservationData = await conservationRes.json();
    const kbaData = await kbaRes.json();
    const protectedExistingData = await protectedExistingRes.json();
    const protectedProposedData = await protectedProposedRes.json();

    console.log('Uploading District Boundaries...');
    
    // Upload District Boundaries
    const { error: districtError } = await supabase
      .from('gis_data')
      .upsert({
        name: 'District Boundaries',
        data: districtData
      }, {
        onConflict: 'name'
      });

    if (districtError) {
      console.error('Error uploading District Boundaries:', districtError);
      throw districtError;
    }

    console.log('Uploading LLG Boundaries...');
    
    // Upload LLG Boundaries
    const { error: llgError } = await supabase
      .from('gis_data')
      .upsert({
        name: 'LLG Boundaries',
        data: llgData
      }, {
        onConflict: 'name'
      });

    if (llgError) {
      console.error('Error uploading LLG Boundaries:', llgError);
      throw llgError;
    }

    console.log('Uploading Biodiversity Priority Areas...');
    
    const { error: biodiversityError } = await supabase
      .from('gis_data')
      .upsert({
        name: 'Biodiversity Priority Areas',
        data: biodiversityData
      }, {
        onConflict: 'name'
      });

    if (biodiversityError) {
      console.error('Error uploading Biodiversity Priority Areas:', biodiversityError);
      throw biodiversityError;
    }

    console.log('Uploading Conservation National Areas...');
    
    const { error: conservationError } = await supabase
      .from('gis_data')
      .upsert({
        name: 'Conservation National Areas',
        data: conservationData
      }, {
        onConflict: 'name'
      });

    if (conservationError) {
      console.error('Error uploading Conservation National Areas:', conservationError);
      throw conservationError;
    }

    console.log('Uploading Key Biodiversity Areas...');
    
    const { error: kbaError } = await supabase
      .from('gis_data')
      .upsert({
        name: 'Key Biodiversity Areas',
        data: kbaData
      }, {
        onConflict: 'name'
      });

    if (kbaError) {
      console.error('Error uploading Key Biodiversity Areas:', kbaError);
      throw kbaError;
    }

    console.log('Uploading Protected Areas (Existing)...');
    
    const { error: protectedExistingError } = await supabase
      .from('gis_data')
      .upsert({
        name: 'Protected Areas Existing',
        data: protectedExistingData
      }, {
        onConflict: 'name'
      });

    if (protectedExistingError) {
      console.error('Error uploading Protected Areas (Existing):', protectedExistingError);
      throw protectedExistingError;
    }

    console.log('Uploading Protected Areas (Proposed)...');
    
    const { error: protectedProposedError } = await supabase
      .from('gis_data')
      .upsert({
        name: 'Protected Areas Proposed',
        data: protectedProposedData
      }, {
        onConflict: 'name'
      });

    if (protectedProposedError) {
      console.error('Error uploading Protected Areas (Proposed):', protectedProposedError);
      throw protectedProposedError;
    }

    console.log('All GIS data uploaded successfully!');
    return { success: true };
  } catch (error) {
    console.error('Failed to upload GIS data:', error);
    return { success: false, error };
  }
}
