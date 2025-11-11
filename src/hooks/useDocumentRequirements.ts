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
            allRequirements.push({
              id: item.id,
              name: item.name,
              description: item.description,
              is_mandatory: item.is_mandatory,
              document_type: 'base',
              template_path: item.template_path
            });
          });
        }
      }

      // Get activity-specific requirements
      if (activityLevel) {
        console.log('useDocumentRequirements - Processing activityLevel:', activityLevel);
        
        const levelNum = activityLevel.includes('Level 1') ? 1 :
                        activityLevel.includes('Level 2') ? 2 :
                        activityLevel.includes('Level 3') ? 3 : null;
        
        console.log('useDocumentRequirements - Extracted level number:', levelNum);
        
        if (levelNum) {
          // Match by activity level and classification
          const activityClassification = activityLevel; // "Level 1", "Level 2", or "Level 3"
          
          console.log('useDocumentRequirements - Looking for activity_classification:', activityClassification);
          
          // Query activity documents by level and classification
          const { data: activityData, error: activityError } = await supabase
            .from('activity_document_requirements')
            .select('*')
            .eq('activity_level', levelNum)
            .eq('activity_classification', activityClassification);

          console.log('useDocumentRequirements - Activity query result:', { activityData, activityError });

          if (activityData) {
            activityData.forEach((item: any) => {
              allRequirements.push({
                id: item.id,
                name: item.document_name,
                description: item.description,
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