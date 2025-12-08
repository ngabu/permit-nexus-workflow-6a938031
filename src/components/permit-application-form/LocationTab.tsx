import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, ChevronDown, HelpCircle } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import PNGMap from './PNGMap';

interface LocationTabProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
  hasLinkedIntent?: boolean;
}

const LocationTab: React.FC<LocationTabProps> = ({ formData, handleInputChange, hasLinkedIntent = false }) => {
  const [isOpen, setIsOpen] = useState(true);
  
  // Read-only styling for fields populated from intent
  const intentFieldStyles = hasLinkedIntent 
    ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 cursor-not-allowed' 
    : 'bg-glass/50';

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Project Site Map - Pass boundary data from selected intent */}
        <PNGMap 
          projectBoundary={formData.project_boundary}
          province={formData.province}
          district={formData.district}
          llg={formData.llg}
          projectSiteAddress={formData.projectLocation}
          projectSiteDescription={formData.project_site_description}
          activityDescription={formData.selected_intent_activity_description || formData.activity_description}
        />

        {/* Project Site Information - Collapsible */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Project Site Information
                  </div>
                  <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6">
                {/* Project Site Address and Total Area */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="projectLocation">
                        Project Site Address *
                        {hasLinkedIntent && (
                          <span className="text-xs text-amber-600 dark:text-amber-400 font-normal ml-2">(From Intent)</span>
                        )}
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Provide the physical address or location details where the activity will be conducted.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="projectLocation"
                      value={formData.projectLocation || ''}
                      onChange={(e) => !hasLinkedIntent && handleInputChange('projectLocation', e.target.value)}
                      placeholder="Enter the physical address of the project site..."
                      className={intentFieldStyles}
                      readOnly={hasLinkedIntent}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="total_area_sqkm">
                        Total Area (sq km)
                        {hasLinkedIntent && (
                          <span className="text-xs text-amber-600 dark:text-amber-400 font-normal ml-2">(From Intent)</span>
                        )}
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Enter the total area of the project site in square kilometers.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="total_area_sqkm"
                      type="number"
                      value={formData.total_area_sqkm || ''}
                      onChange={(e) => !hasLinkedIntent && handleInputChange('total_area_sqkm', e.target.value)}
                      placeholder="Enter total area"
                      step="0.01"
                      className={intentFieldStyles}
                      readOnly={hasLinkedIntent}
                    />
                  </div>
                </div>

                {/* LLG, District, Province */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="llg">
                        LLG
                        {hasLinkedIntent && (
                          <span className="text-xs text-amber-600 dark:text-amber-400 font-normal ml-2">(From Intent)</span>
                        )}
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Local Level Government area where the project is located.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="llg"
                      value={formData.llg || ''}
                      onChange={(e) => !hasLinkedIntent && handleInputChange('llg', e.target.value)}
                      placeholder="Enter LLG"
                      className={intentFieldStyles}
                      readOnly={hasLinkedIntent}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="district">
                        District
                        {hasLinkedIntent && (
                          <span className="text-xs text-amber-600 dark:text-amber-400 font-normal ml-2">(From Intent)</span>
                        )}
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>District where the project is located.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="district"
                      value={formData.district || ''}
                      onChange={(e) => !hasLinkedIntent && handleInputChange('district', e.target.value)}
                      placeholder="Enter district"
                      className={intentFieldStyles}
                      readOnly={hasLinkedIntent}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="province">
                        Province
                        {hasLinkedIntent && (
                          <span className="text-xs text-amber-600 dark:text-amber-400 font-normal ml-2">(From Intent)</span>
                        )}
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Province where the project is located.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="province"
                      value={formData.province || ''}
                      onChange={(e) => !hasLinkedIntent && handleInputChange('province', e.target.value)}
                      placeholder="Enter province"
                      className={intentFieldStyles}
                      readOnly={hasLinkedIntent}
                    />
                  </div>
                </div>

                {/* Description of Project Site */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="project_site_description">
                      Description of Project Site *
                      {hasLinkedIntent && (
                        <span className="text-xs text-amber-600 dark:text-amber-400 font-normal ml-2">(From Intent)</span>
                      )}
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Describe the location characteristics, terrain, current land use, and any notable environmental or geographical features of the site.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Textarea
                    id="project_site_description"
                    value={formData.project_site_description || ''}
                    onChange={(e) => !hasLinkedIntent && handleInputChange('project_site_description', e.target.value)}
                    placeholder="Provide details about the project site location and characteristics..."
                    rows={4}
                    className={intentFieldStyles}
                    readOnly={hasLinkedIntent}
                  />
                </div>

                {/* Details of Site Ownership */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="site_ownership_details">
                      Details of Site Ownership *
                      {hasLinkedIntent && (
                        <span className="text-xs text-amber-600 dark:text-amber-400 font-normal ml-2">(From Intent)</span>
                      )}
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Include information about land ownership, tenure type, legal description, and any relevant documentation.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Textarea
                    id="site_ownership_details"
                    value={formData.site_ownership_details || ''}
                    onChange={(e) => !hasLinkedIntent && handleInputChange('site_ownership_details', e.target.value)}
                    placeholder="Provide information about land ownership, tenure, and legal description..."
                    rows={4}
                    className={intentFieldStyles}
                    readOnly={hasLinkedIntent}
                  />
                </div>

              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>
    </TooltipProvider>
  );
};

export default LocationTab;