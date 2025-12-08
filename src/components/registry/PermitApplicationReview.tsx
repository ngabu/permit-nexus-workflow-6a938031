import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Clock, Search, Filter, MapPin, Shield, Receipt, UserCheck, ChevronDown, ChevronsUpDown, FileDown, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import {
  PermitSiteMappingTab,
  PermitRegistrationDetailsTab,
  PermitRegistryReviewTab,
  PermitComplianceReviewTab,
  PermitInvoicePaymentsTab,
  PermitMDReviewTab,
} from './permit-review';

interface PermitApplication {
  id: string;
  user_id: string;
  entity_id: string;
  title: string;
  description: string | null;
  permit_type: string;
  status: string;
  application_number: string | null;
  created_at: string;
  updated_at: string;
  activity_location?: string | null;
  estimated_cost_kina?: number | null;
  activity_classification?: string | null;
  activity_category?: string | null;
  activity_subcategory?: string | null;
  activity_level?: string | null;
  permit_period?: string | null;
  commencement_date?: string | null;
  completion_date?: string | null;
  entity_name?: string | null;
  entity_type?: string | null;
  coordinates?: any;
  project_boundary?: any;
  environmental_impact?: string | null;
  mitigation_measures?: string | null;
  compliance_checks?: any;
  uploaded_files?: any;
  project_description?: string | null;
  project_start_date?: string | null;
  project_end_date?: string | null;
  district?: string | null;
  province?: string | null;
  llg?: string | null;
  permit_specific_fields?: any;
  entity?: {
    id: string;
    name: string;
    entity_type: string;
  };
}

export function PermitApplicationReview() {
  const { toast } = useToast();
  const [applications, setApplications] = useState<PermitApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [expandedApplicationId, setExpandedApplicationId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('site-mapping');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('permit_applications')
        .select(`
          *,
          entity:entities(id, name, entity_type)
        `)
        .not('status', 'eq', 'approved')
        .not('status', 'eq', 'draft')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const mappedApplications: PermitApplication[] = (data || []).map(app => ({
        ...app,
        entity_name: app.entity?.name || app.entity_name || null,
        entity_type: app.entity?.entity_type || app.entity_type || null,
      }));
      
      setApplications(mappedApplications);
    } catch (error) {
      console.error('Error fetching permit applications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch permit applications.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'secondary';
      case 'under_initial_review':
      case 'under_review':
        return 'outline';
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'requires_clarification':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = !searchTerm || 
        app.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.entity?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.entity_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.application_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.province?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      const matchesLevel = levelFilter === 'all' || app.activity_level === levelFilter;

      return matchesSearch && matchesStatus && matchesLevel;
    });
  }, [applications, searchTerm, statusFilter, levelFilter]);

  const activityLevels = useMemo(() => {
    return Array.from(new Set(applications.map(a => a.activity_level).filter(Boolean)));
  }, [applications]);

  const totalPages = Math.ceil(filteredApplications.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedApplications = filteredApplications.slice(startIndex, endIndex);

  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, levelFilter]);

  const exportToExcel = () => {
    const exportData = filteredApplications.map(app => ({
      'Application Number': app.application_number || '-',
      'Title': app.title,
      'Entity': app.entity?.name || app.entity_name || '-',
      'Permit Type': app.permit_type,
      'Activity Level': app.activity_level || '-',
      'Province': app.province || '-',
      'District': app.district || '-',
      'Status': app.status,
      'Created Date': format(new Date(app.created_at), 'MMM dd, yyyy'),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    worksheet['!cols'] = [
      { wch: 20 }, { wch: 30 }, { wch: 25 }, { wch: 20 }, { wch: 15 },
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
    ];
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Permit Applications');
    XLSX.writeFile(workbook, `Permit_Applications_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const exportToCSV = () => {
    const exportData = filteredApplications.map(app => ({
      'Application Number': app.application_number || '-',
      'Title': app.title,
      'Entity': app.entity?.name || app.entity_name || '-',
      'Permit Type': app.permit_type,
      'Activity Level': app.activity_level || '-',
      'Province': app.province || '-',
      'District': app.district || '-',
      'Status': app.status,
      'Created Date': format(new Date(app.created_at), 'MMM dd, yyyy'),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Permit_Applications_${format(new Date(), 'yyyy-MM-dd')}.csv`;
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
    <Card className="print:border-none print:shadow-none print:bg-transparent">
      <CardHeader className="print:hidden">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Permit Application Reviews
            </CardTitle>
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
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by title, entity, application number, or province..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="pl-9" 
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] bg-background">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_initial_review">Under Initial Review</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="requires_clarification">Requires Clarification</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-[180px] bg-background">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Activity Level" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  <SelectItem value="all">All Levels</SelectItem>
                  {activityLevels.map(level => (
                    <SelectItem key={level} value={level!}>
                      Level {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Showing {filteredApplications.length > 0 ? startIndex + 1 : 0}-{Math.min(endIndex, filteredApplications.length)} of {filteredApplications.length} permit applications
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader className="print:hidden">
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>Entity</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Permit Type</TableHead>
              <TableHead>Activity Level</TableHead>
              <TableHead>Province</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApplications.length === 0 ? (
              <TableRow className="print:hidden">
                <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No permit applications found</h3>
                  <p>
                    {applications.length === 0 
                      ? "No permit applications have been submitted yet."
                      : "Try adjusting your filters to see more results."
                    }
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedApplications.map(app => {
                const isExpanded = expandedApplicationId === app.id;
                return (
                  <>
                    <TableRow 
                      key={app.id} 
                      className={`cursor-pointer transition-colors print:hidden ${isExpanded ? 'bg-accent hover:bg-accent/90' : 'hover:bg-muted/50'}`} 
                      onClick={() => setExpandedApplicationId(isExpanded ? null : app.id)}
                    >
                      <TableCell>
                        {isExpanded 
                          ? <ChevronDown className="w-4 h-4 text-primary" /> 
                          : <ChevronsUpDown className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />}
                      </TableCell>
                      <TableCell className="font-medium">{app.entity?.name || app.entity_name || '-'}</TableCell>
                      <TableCell className="max-w-xs truncate">{app.title}</TableCell>
                      <TableCell>{app.permit_type}</TableCell>
                      <TableCell>{app.activity_level ? `Level ${app.activity_level}` : '-'}</TableCell>
                      <TableCell>{app.province || '-'}</TableCell>
                      <TableCell>{format(new Date(app.created_at), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(app.status)}>
                          {app.status.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow key={`${app.id}-details`} className="bg-glass/50 backdrop-blur-md hover:bg-glass/50 print:bg-transparent">
                        <TableCell colSpan={8} className="p-0 print:p-0">
                          <div className="border-t border-glass/30 bg-white/80 dark:bg-primary/5 backdrop-blur-md p-6 print:border-none print:p-0 print:bg-transparent print:block">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full print:hidden">
                              <TabsList className="grid w-full grid-cols-6">
                                <TabsTrigger value="site-mapping" className="flex items-center gap-1 text-xs">
                                  <MapPin className="w-3 h-3" />
                                  Site Mapping
                                </TabsTrigger>
                                <TabsTrigger value="registration" className="flex items-center gap-1 text-xs">
                                  <FileText className="w-3 h-3" />
                                  Registration
                                </TabsTrigger>
                                <TabsTrigger value="registry-review" className="flex items-center gap-1 text-xs">
                                  <FileText className="w-3 h-3" />
                                  Registry Review
                                </TabsTrigger>
                                <TabsTrigger value="compliance-review" className="flex items-center gap-1 text-xs">
                                  <Shield className="w-3 h-3" />
                                  Compliance
                                </TabsTrigger>
                                <TabsTrigger value="invoice-payments" className="flex items-center gap-1 text-xs">
                                  <Receipt className="w-3 h-3" />
                                  Invoices
                                </TabsTrigger>
                                <TabsTrigger value="md-review" className="flex items-center gap-1 text-xs">
                                  <UserCheck className="w-3 h-3" />
                                  MD Approval
                                </TabsTrigger>
                              </TabsList>

                              <TabsContent value="site-mapping" className="mt-4">
                                <PermitSiteMappingTab application={app} />
                              </TabsContent>

                              <TabsContent value="registration" className="mt-4">
                                <PermitRegistrationDetailsTab application={app} />
                              </TabsContent>

                              <TabsContent value="registry-review" className="mt-4">
                                <PermitRegistryReviewTab 
                                  applicationId={app.id}
                                  currentStatus={app.status}
                                  onStatusUpdate={fetchApplications}
                                />
                              </TabsContent>

                              <TabsContent value="compliance-review" className="mt-4">
                                <PermitComplianceReviewTab 
                                  applicationId={app.id}
                                  currentStatus={app.status}
                                  onStatusUpdate={fetchApplications}
                                />
                              </TabsContent>

                              <TabsContent value="invoice-payments" className="mt-4">
                                <PermitInvoicePaymentsTab 
                                  applicationId={app.id}
                                  entityId={app.entity_id}
                                  onStatusUpdate={fetchApplications}
                                />
                              </TabsContent>

                              <TabsContent value="md-review" className="mt-4">
                                <PermitMDReviewTab 
                                  applicationId={app.id}
                                  currentStatus={app.status}
                                  onStatusUpdate={fetchApplications}
                                />
                              </TabsContent>
                            </Tabs>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
