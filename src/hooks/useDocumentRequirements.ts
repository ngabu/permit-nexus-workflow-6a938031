import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DocumentRequirement {
  id: string;
  name: string;
  description?: string;
  is_mandatory: boolean;
  document_type: 'base' | 'activity';
  activity_level?: number;
  activity_classification?: string;
  template_path?: string;
}

export interface DocumentUploadStatus {
  requirement_id: string;
  file_id?: string;
  uploaded: boolean;
  file_name?: string;
}

export function useDocumentRequirements(
  entityType?: string, 
  activityLevel?: string, 
  prescribedActivityId?: string
) {
  const [requirements, setRequirements] = useState<DocumentRequirement[]>([]);
  const [uploadStatuses, setUploadStatuses] = useState<DocumentUploadStatus[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('useDocumentRequirements - Effect triggered:', {
      entityType,
      activityLevel,
      prescribedActivityId
    });
    
    if (entityType) {
      loadData();
    } else {
      console.log('useDocumentRequirements - No entityType, skipping load');
    }
  }, [entityType, activityLevel, prescribedActivityId]);

  const loadData = async () => {
    console.log('useDocumentRequirements - loadData called with:', {
      entityType,
      activityLevel,
      prescribedActivityId
    });
    
    setLoading(true);
    try {
      const allRequirements: DocumentRequirement[] = [];

      // Get base requirements
      if (entityType) {
        console.log('useDocumentRequirements - Looking for base requirements for entity_type:', entityType.toUpperCase());
        
        const { data, error } = await supabase
          .from('base_document_requirements')
          .select('id, name, description, is_mandatory, template_path')
          .filter('applies_to_entities', 'cs', `{${entityType.toUpperCase()}}`);

        console.log('useDocumentRequirements - Base requirements query result:', { data, error });

        if (data) {
          data.forEach(item => {
            // Create descriptive text based on document name
            let defaultDescription = item.description;
            if (!defaultDescription) {
              const docNameLower = item.name.toLowerCase();
              if (docNameLower.includes('registration') || docNameLower.includes('certificate')) {
                defaultDescription = `Official registration document proving the legal status of your ${entityType.toLowerCase()} entity. Required to establish your identity and authority to apply for permits.`;
              } else if (docNameLower.includes('tax') || docNameLower.includes('tin')) {
                defaultDescription = `Tax Identification Number (TIN) certificate issued by the Internal Revenue Commission. Confirms your entity is registered for tax purposes in PNG.`;
              } else if (docNameLower.includes('id') || docNameLower.includes('identification')) {
                defaultDescription = `Valid identification document for the applicant or authorized representative. Must be current and government-issued.`;
              } else {
                defaultDescription = `Required base document for ${entityType.toLowerCase()} entities. Essential for establishing legal status and identity.`;
              }
            }
            
            allRequirements.push({
              id: item.id,
              name: item.name,
              description: defaultDescription,
              is_mandatory: item.is_mandatory,
              document_type: 'base',
              template_path: item.template_path
            });
          });
        }
      }

      // Get activity-specific requirements
      if (activityLevel && prescribedActivityId) {
        console.log('useDocumentRequirements - Processing activityLevel and prescribedActivityId:', {
          activityLevel,
          prescribedActivityId
        });
        
        const levelNum = activityLevel.includes('Level 1') ? 1 :
                        activityLevel.includes('Level 2') ? 2 :
                        activityLevel.includes('Level 3') ? 3 : null;
        
        console.log('useDocumentRequirements - Extracted level number:', levelNum);
        
        if (levelNum) {
          // Build query with prescribed activity filter for specific permit type requirements
          let query = supabase
            .from('activity_document_requirements')
            .select('*')
            .eq('activity_level', levelNum);
          
          // Filter by specific prescribed activity (permit type) for more accurate requirements
          query = query.or(`prescribed_activity_id.eq.${prescribedActivityId},prescribed_activity_id.is.null`);

          const { data: activityData, error: activityError } = await query;

          console.log('useDocumentRequirements - Activity query result:', { activityData, activityError });

          if (activityData) {
            activityData.forEach((item: any) => {
              // Create contextual descriptions based on document type and permit type
              let defaultDescription = item.description;
              if (!defaultDescription) {
                const docNameLower = item.document_name.toLowerCase();
                
                // Water Extraction specific (category 13.3)
                if (prescribedActivityId === 'e73a7724-759c-42c9-8928-e23a06683b4d') {
                  if (docNameLower.includes('map') || docNameLower.includes('coordinate') || docNameLower.includes('diagram')) {
                    defaultDescription = `Map showing coordinates (Easting and Northing) and detailed diagram of water extraction site. Must clearly indicate the location and layout of all structures.`;
                  } else if (docNameLower.includes('plan') || docNameLower.includes('structure')) {
                    defaultDescription = `Detailed plans of structures for taking, damming, or diverting water. Include engineering specifications and site layout.`;
                  } else if (docNameLower.includes('hydrological') || docNameLower.includes('water source')) {
                    defaultDescription = `Hydrological data including estimated annual flow, dry/wet weather flows (minimum, maximum, mean in L/hr), and environmental values within 1km downstream.`;
                  } else if (docNameLower.includes('application form')) {
                    defaultDescription = `Completed Application Form for Environment (Water Extraction) Permit as per Environment Act 2000, Section 60.`;
                  }
                }
                // Water Investigation specific
                else if (docNameLower.includes('investigation')) {
                  if (docNameLower.includes('drill') || docNameLower.includes('material')) {
                    defaultDescription = `Details of drill materials (drill mud, fluids, etc.) including chemical composition and potential environmental impacts.`;
                  } else if (docNameLower.includes('plan') || docNameLower.includes('structure')) {
                    defaultDescription = `Plans of structures for conducting hydrological investigation including drilling equipment and monitoring installations.`;
                  } else if (docNameLower.includes('application form')) {
                    defaultDescription = `Completed Application Form for Environment (Water Investigation) Permit as per Environment Act 2000, Section 60.`;
                  }
                }
                // ODS/Pesticide Import specific (category 13.4)
                else if (prescribedActivityId === '7943499b-a5b7-49ca-b181-e5bb1760100b') {
                  if (docNameLower.includes('msds') || docNameLower.includes('safety')) {
                    defaultDescription = `Current Material Safety Data Sheet (MSDS) detailing chemical composition, hazards, handling procedures, and emergency response measures.`;
                  } else if (docNameLower.includes('label')) {
                    defaultDescription = `Two (2) original copies of the product label to be used when imported and sold in PNG. Must comply with labeling standards.`;
                  } else if (docNameLower.includes('use pattern') || docNameLower.includes('summary')) {
                    defaultDescription = `Summary of intended use patterns and/or statement of need justifying the use of this substance/pesticide in Papua New Guinea.`;
                  } else if (docNameLower.includes('registration') && docNameLower.includes('overseas')) {
                    defaultDescription = `Evidence that the product is registered overseas (copies of registration certificates, affidavits, or certified labels from the country of origin).`;
                  } else if (docNameLower.includes('application form')) {
                    defaultDescription = `Two (2) completed copies of Application Form for Environment Permit (ODS/Pesticide) as per Environment Act 2000, Section 60.`;
                  }
                }
                // Waste Discharge specific (category 13.2)
                else if (prescribedActivityId === '500779ad-21b6-46df-ac92-b12f7e0d4c3d') {
                  if (docNameLower.includes('submission') || docNameLower.includes('detailed')) {
                    defaultDescription = `Detailed submission as per DEC Information Guideline for Submission of an Application for Environment Permit to Discharge Waste. Include waste characteristics, discharge methods, and environmental impacts.`;
                  } else if (docNameLower.includes('application form')) {
                    defaultDescription = `Completed Application Form for Environment (Waste Discharge) Permit as per Environment Act 2000, Section 60.`;
                  }
                }
                // Generic descriptions
                else {
                  if (docNameLower.includes('eia') || docNameLower.includes('impact assessment')) {
                    defaultDescription = `Environmental Impact Assessment documenting potential environmental effects and proposed mitigation measures for ${activityLevel} activities.`;
                  } else if (docNameLower.includes('mitigation') || docNameLower.includes('management')) {
                    defaultDescription = `Environmental management and mitigation plan detailing how environmental impacts will be avoided, minimized, or remediated.`;
                  } else if (docNameLower.includes('consultation') || docNameLower.includes('public')) {
                    defaultDescription = `Documentation of public consultation process including stakeholder engagement, comments received, and how concerns were addressed.`;
                  } else if (docNameLower.includes('site plan') || docNameLower.includes('layout')) {
                    defaultDescription = `Detailed site plan showing project boundaries, facilities layout, access roads, and surrounding land use within the affected area.`;
                  } else {
                    defaultDescription = `Required document for ${activityLevel} activities. Provides essential information for permit assessment and regulatory compliance.`;
                  }
                }
              }
              
              allRequirements.push({
                id: item.id,
                name: item.document_name,
                description: defaultDescription,
                is_mandatory: item.is_mandatory,
                document_type: 'activity',
                activity_level: levelNum,
                activity_classification: item.activity_classification,
                template_path: item.template_path
              });
            });
          }
        }
      } else if (activityLevel) {
        // Fallback: If no prescribed activity selected yet, show general level-based requirements
        console.log('useDocumentRequirements - Processing activityLevel only (no prescribed activity):', activityLevel);
        
        const levelNum = activityLevel.includes('Level 1') ? 1 :
                        activityLevel.includes('Level 2') ? 2 :
                        activityLevel.includes('Level 3') ? 3 : null;
        
        if (levelNum) {
          const { data: activityData, error: activityError } = await supabase
            .from('activity_document_requirements')
            .select('*')
            .eq('activity_level', levelNum)
            .is('prescribed_activity_id', null); // Only generic level requirements

          console.log('useDocumentRequirements - Generic activity query result:', { activityData, activityError });

          if (activityData) {
            activityData.forEach((item: any) => {
              // Use same logic as above for fallback generic requirements
              let defaultDescription = item.description;
              if (!defaultDescription) {
                const docNameLower = item.document_name.toLowerCase();
                if (docNameLower.includes('eia') || docNameLower.includes('impact assessment')) {
                  defaultDescription = `Environmental Impact Assessment documenting potential environmental effects and proposed mitigation measures for ${activityLevel} activities.`;
                } else if (docNameLower.includes('mitigation') || docNameLower.includes('management')) {
                  defaultDescription = `Environmental management and mitigation plan detailing how environmental impacts will be avoided, minimized, or remediated.`;
                } else if (docNameLower.includes('consultation') || docNameLower.includes('public')) {
                  defaultDescription = `Documentation of public consultation process including stakeholder engagement, comments received, and how concerns were addressed.`;
                } else if (docNameLower.includes('site plan') || docNameLower.includes('layout')) {
                  defaultDescription = `Detailed site plan showing project boundaries, facilities layout, access roads, and surrounding land use within the affected area.`;
                } else if (docNameLower.includes('screening')) {
                  defaultDescription = `Basic environmental screening form to identify potential environmental impacts and determine assessment requirements.`;
                } else {
                  defaultDescription = `Required document for ${activityLevel} activities. Provides essential information for permit assessment and regulatory compliance.`;
                }
              }
              
              allRequirements.push({
                id: item.id,
                name: item.document_name,
                description: defaultDescription,
                is_mandatory: item.is_mandatory,
                document_type: 'activity',
                activity_level: levelNum,
                activity_classification: item.activity_classification,
                template_path: item.template_path
              });
            });
          }
        }
      }

      console.log('useDocumentRequirements - Final requirements:', allRequirements);
      
      setRequirements(allRequirements);
      setUploadStatuses(allRequirements.map(req => ({
        requirement_id: req.id,
        uploaded: false
      })));

    } catch (error) {
      console.error('Error loading requirements:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUploadStatus = (requirementId: string, uploaded: boolean, fileName?: string, fileId?: string) => {
    setUploadStatuses(prev => 
      prev.map(status => 
        status.requirement_id === requirementId 
          ? { ...status, uploaded, file_name: fileName, file_id: fileId }
          : status
      )
    );
  };

  const downloadTemplate = async (templatePath: string, documentName: string) => {
    console.log('Template download requested:', documentName);
  };

  const validateRequiredDocuments = () => {
    const mandatoryReqs = requirements.filter(req => req.is_mandatory);
    const missingDocs = mandatoryReqs.filter(req => {
      const status = uploadStatuses.find(s => s.requirement_id === req.id);
      return !status?.uploaded;
    });

    return {
      isValid: missingDocs.length === 0,
      missingDocuments: missingDocs.map(req => req.name)
    };
  };

  return {
    requirements,
    uploadStatuses,
    loading,
    refreshRequirements: loadData,
    updateUploadStatus,
    downloadTemplate,
    validateRequiredDocuments
  };
}