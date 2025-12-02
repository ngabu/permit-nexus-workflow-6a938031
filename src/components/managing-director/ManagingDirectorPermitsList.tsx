import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Loader2, Search, Filter, ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, FileDown, User, Building, MapPin, Upload, Shield } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';
import { BasicInfoReadOnly } from '@/components/registry/read-only/BasicInfoReadOnly';
import { ProjectAndSpecificDetailsReadOnly } from '@/components/registry/read-only/ProjectAndSpecificDetailsReadOnly';
import { LocationReadOnly } from '@/components/registry/read-only/LocationReadOnly';
import { DocumentsReadOnly } from '@/components/registry/read-only/DocumentsReadOnly';
import { ComplianceReadOnly } from '@/components/registry/read-only/ComplianceReadOnly';

interface Permit {
  id: string;
  title: string;
  permit_number: string | null;
  permit_type: string;
  description: string | null;
  approval_date: string | null;
  created_at: string;
  updated_at: string;
  entity_name: string | null;
  entity_id: string | null;
  activity_level: string | null;
}

export function ManagingDirectorPermitsList() {
  const { toast } = useToast();
  const [permits, setPermits] = useState<Permit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [permitTypeFilter, setPermitTypeFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [expandedPermitId, setExpandedPermitId] = useState<string | null>(null);
  const [expandedPermitDetails, setExpandedPermitDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchPermits();
  }, []);

  const fetchPermits = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('permit_applications')
        .select('id, title, permit_number, permit_type, description, approval_date, created_at, updated_at, entity_name, entity_id, activity_level')
        .eq('status', 'approved')
        .not('permit_number', 'is', null)
        .order('approval_date', { ascending: false });

      if (error) throw error;
      setPermits(data || []);
    } catch (error) {
      console.error('Error fetching permits:', error);
      toast({
        title: 'Error',
        description: 'Failed to load permits',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPermitDetails = async (permitId: string) => {
    try {
      setLoadingDetails(true);
      const { data, error } = await supabase
        .from('permit_applications')
        .select(`
          *,
          entity:entities(*)
        `)
        .eq('id', permitId)
        .single();

      if (error) throw error;
      setExpandedPermitDetails(data);
    } catch (error) {
      console.error('Error fetching permit details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load permit details',
        variant: 'destructive',
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleRowClick = (permitId: string) => {
    if (expandedPermitId === permitId) {
      setExpandedPermitId(null);
      setExpandedPermitDetails(null);
    } else {
      setExpandedPermitId(permitId);
      fetchPermitDetails(permitId);
    }
  };

  // Filter and search permits
  const filteredPermits = useMemo(() => {
    return permits.filter((permit) => {
      const matchesSearch = 
        permit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permit.permit_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permit.entity_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = permitTypeFilter === 'all' || permit.permit_type === permitTypeFilter;
      const matchesEntity = entityFilter === 'all' || permit.entity_id === entityFilter;
      const matchesLevel = levelFilter === 'all' || permit.activity_level === levelFilter;
      
      return matchesSearch && matchesType && matchesEntity && matchesLevel;
    });
  }, [permits, searchTerm, permitTypeFilter, entityFilter, levelFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredPermits.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedPermits = filteredPermits.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, permitTypeFilter, entityFilter, levelFilter]);

  // Get unique values for filters
  const permitTypes = useMemo(() => {
    return Array.from(new Set(permits.map(p => p.permit_type)));
  }, [permits]);

  const entities = useMemo(() => {
    const uniqueEntities = permits
      .filter(p => p.entity_id && p.entity_name)
      .map(p => ({ id: p.entity_id!, name: p.entity_name! }));
    
    const seen = new Set();
    return uniqueEntities.filter(e => {
      const duplicate = seen.has(e.id);
      seen.add(e.id);
      return !duplicate;
    });
  }, [permits]);

  const levels = useMemo(() => {
    return Array.from(new Set(permits.map(p => p.activity_level).filter(Boolean)));
  }, [permits]);

  const exportToExcel = () => {
    const exportData = filteredPermits.map(permit => ({
      'Permit Number': permit.permit_number || '-',
      'Application Title': permit.title,
      'Entity': permit.entity_name || '-',
      'Permit Type': permit.permit_type.replace(/_/g, ' '),
      'Activity Level': permit.activity_level || '-',
      'Project Description': permit.description || '-',
      'Approval Date': permit.approval_date ? format(new Date(permit.approval_date), 'MMM dd, yyyy') : '-',
      'Status': 'Active',
      'Created Date': format(new Date(permit.created_at), 'MMM dd, yyyy'),
      'Last Updated': format(new Date(permit.updated_at), 'MMM dd, yyyy')
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    
    worksheet['!cols'] = [
      { wch: 20 }, { wch: 30 }, { wch: 25 }, { wch: 20 }, { wch: 15 },
      { wch: 40 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 15 }
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Approved Permits');
    XLSX.writeFile(workbook, `MD_Permits_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const exportToCSV = () => {
    const exportData = filteredPermits.map(permit => ({
      'Permit Number': permit.permit_number || '-',
      'Application Title': permit.title,
      'Entity': permit.entity_name || '-',
      'Permit Type': permit.permit_type.replace(/_/g, ' '),
      'Activity Level': permit.activity_level || '-',
      'Project Description': permit.description || '-',
      'Approval Date': permit.approval_date ? format(new Date(permit.approval_date), 'MMM dd, yyyy') : '-',
      'Status': 'Active',
      'Created Date': format(new Date(permit.created_at), 'MMM dd, yyyy'),
      'Last Updated': format(new Date(permit.updated_at), 'MMM dd, yyyy')
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `MD_Permits_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <CardTitle>All Approved Permits</CardTitle>
            <div className="flex gap-2">
              <Button onClick={exportToExcel} className="bg-primary hover:bg-primary/90 text-primary-foreground" size="sm">
                <FileDown className="h-4 w-4 mr-2" />
                Export to Excel
              </Button>
              <Button onClick={exportToCSV} className="bg-accent hover:bg-accent/90 text-accent-foreground" size="sm">
                <FileDown className="h-4 w-4 mr-2" />
                Export to CSV
              </Button>
            </div>
          </div>
          
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by permit number, title, or entity name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Select value={permitTypeFilter} onValueChange={setPermitTypeFilter}>
                <SelectTrigger className="w-[180px] bg-background">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Permit Type" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  <SelectItem value="all">All Types</SelectItem>
                  {permitTypes.map((type) => (
                    <SelectItem key={type} value={type} className="capitalize">
                      {type.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger className="w-[180px] bg-background">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Entity" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  <SelectItem value="all">All Entities</SelectItem>
                  {entities.map((entity) => (
                    <SelectItem key={entity.id} value={entity.id}>
                      {entity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-[150px] bg-background">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  <SelectItem value="all">All Levels</SelectItem>
                  {levels.map((level) => (
                    <SelectItem key={level} value={level} className="capitalize">
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredPermits.length)} of {filteredPermits.length} permits
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>Permit Number</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Approval Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPermits.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  {searchTerm || permitTypeFilter !== 'all' || entityFilter !== 'all' || levelFilter !== 'all'
                    ? 'No permits match your search criteria'
                    : 'No approved permits found'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedPermits.map((permit) => {
                const isExpanded = expandedPermitId === permit.id;
                return (
                  <>
                    <TableRow 
                      key={permit.id}
                      className={`cursor-pointer transition-colors ${
                        isExpanded ? 'bg-accent hover:bg-accent/90' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => handleRowClick(permit.id)}
                    >
                      <TableCell>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-primary" />
                        ) : (
                          <ChevronsUpDown className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{permit.permit_number}</TableCell>
                      <TableCell>{permit.title}</TableCell>
                      <TableCell>{permit.entity_name || '-'}</TableCell>
                      <TableCell className="capitalize">{permit.permit_type.replace(/_/g, ' ')}</TableCell>
                      <TableCell>
                        {permit.approval_date ? format(new Date(permit.approval_date), 'MMM dd, yyyy') : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">Active</Badge>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow key={`${permit.id}-details`} className="bg-muted/30 hover:bg-muted/30">
                        <TableCell colSpan={7} className="p-0">
                          {loadingDetails ? (
                            <div className="flex items-center justify-center p-8">
                              <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            </div>
                          ) : expandedPermitDetails ? (
                            <div className="border-t border-border bg-background/50 backdrop-blur-sm p-6">
                              <Tabs defaultValue="basic-info" className="w-full">
                                <TabsList className="grid w-full grid-cols-5">
                                  <TabsTrigger value="basic-info" className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Basic Info
                                  </TabsTrigger>
                                  <TabsTrigger value="project-details" className="flex items-center gap-2">
                                    <Building className="w-4 h-4" />
                                    Project Details
                                  </TabsTrigger>
                                  <TabsTrigger value="location" className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    Location
                                  </TabsTrigger>
                                  <TabsTrigger value="documents" className="flex items-center gap-2">
                                    <Upload className="w-4 h-4" />
                                    Documents
                                  </TabsTrigger>
                                  <TabsTrigger value="compliance" className="flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    Compliance
                                  </TabsTrigger>
                                </TabsList>
                                
                                <div className="mt-6">
                                  <TabsContent value="basic-info" className="space-y-4">
                                    <BasicInfoReadOnly permit={expandedPermitDetails} />
                                  </TabsContent>
                                  
                                  <TabsContent value="project-details" className="space-y-4">
                                    <ProjectAndSpecificDetailsReadOnly permit={expandedPermitDetails} />
                                  </TabsContent>
                                  
                                  <TabsContent value="location" className="space-y-4">
                                    <LocationReadOnly permit={expandedPermitDetails} />
                                  </TabsContent>
                                  
                                  <TabsContent value="documents" className="space-y-4">
                                    <DocumentsReadOnly permit={expandedPermitDetails} />
                                  </TabsContent>
                                  
                                  <TabsContent value="compliance" className="space-y-4">
                                    <ComplianceReadOnly permit={expandedPermitDetails} />
                                  </TabsContent>
                                </div>
                              </Tabs>
                            </div>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
