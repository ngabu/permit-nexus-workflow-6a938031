import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Loader2, Search, Filter, ChevronLeft, ChevronRight, ChevronDown, ChevronsUpDown, FileDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';
import { IntentRegistrationReadOnlyView } from '@/components/public/IntentRegistrationReadOnlyView';
import { PermitApplicationsMap } from '@/components/public/PermitApplicationsMap';
import { IntentRegistryReviewTab, IntentComplianceReviewTab, IntentMDReviewTab, IntentInvoicePaymentsTab } from '@/components/registry/intent-review';

interface IntentRegistration {
  id: string;
  user_id: string;
  entity_id: string;
  activity_level: string;
  activity_description: string;
  preparatory_work_description: string;
  commencement_date: string;
  completion_date: string;
  project_site_address: string | null;
  district: string | null;
  province: string | null;
  llg: string | null;
  project_site_description: string | null;
  site_ownership_details: string | null;
  government_agreement: string | null;
  departments_approached: string | null;
  approvals_required: string | null;
  landowner_negotiation_status: string | null;
  estimated_cost_kina: number | null;
  status: string;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  review_notes: string | null;
  official_feedback_attachments: any[] | null;
  prescribed_activity_id: string | null;
  existing_permit_id: string | null;
  project_boundary: any | null;
  latitude: number | null;
  longitude: number | null;
  total_area_sqkm: number | null;
  entity?: {
    id: string;
    name: string;
    entity_type: string;
  };
}

export function ApprovedIntentsList() {
  const { toast } = useToast();
  const [intents, setIntents] = useState<IntentRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedIntentId, setExpandedIntentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('mapping');
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchIntentsForReview();
  }, []);

  const fetchIntentsForReview = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('intent_registrations')
        .select(`
          *,
          entity:entities(id, name, entity_type)
        `)
        .neq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedData = (data || []).map(intent => ({
        ...intent,
        official_feedback_attachments: intent.official_feedback_attachments 
          ? Array.isArray(intent.official_feedback_attachments) 
            ? intent.official_feedback_attachments 
            : [] 
          : null,
        project_boundary: intent.project_boundary || null
      }));
      setIntents(processedData);
    } catch (error) {
      console.error('Error fetching approved intent registrations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load approved intent registrations',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredIntents = useMemo(() => {
    return intents.filter(intent => {
      const matchesSearch = 
        intent.activity_description.toLowerCase().includes(searchTerm.toLowerCase()) || 
        intent.entity?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        intent.province?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || intent.status === statusFilter;
      const matchesLevel = levelFilter === 'all' || intent.activity_level === levelFilter;
      return matchesSearch && matchesStatus && matchesLevel;
    });
  }, [intents, searchTerm, statusFilter, levelFilter]);

  const totalPages = Math.ceil(filteredIntents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedIntents = filteredIntents.slice(startIndex, endIndex);

  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, levelFilter]);

  const activityLevels = useMemo(() => {
    return Array.from(new Set(intents.map(i => i.activity_level)));
  }, [intents]);

  const exportToExcel = () => {
    const exportData = filteredIntents.map(intent => ({
      'Entity': intent.entity?.name || '-',
      'Activity Level': intent.activity_level,
      'Activity Description': intent.activity_description,
      'Preparatory Work Description': intent.preparatory_work_description,
      'Commencement Date': format(new Date(intent.commencement_date), 'MMM dd, yyyy'),
      'Completion Date': format(new Date(intent.completion_date), 'MMM dd, yyyy'),
      'Project Site Address': intent.project_site_address || '-',
      'District': intent.district || '-',
      'Province': intent.province || '-',
      'Project Site Description': intent.project_site_description || '-',
      'Site Ownership Details': intent.site_ownership_details || '-',
      'Government Agreement': intent.government_agreement || '-',
      'Departments Approached': intent.departments_approached || '-',
      'Approvals Required': intent.approvals_required || '-',
      'Landowner Negotiation Status': intent.landowner_negotiation_status || '-',
      'Estimated Cost (Kina)': intent.estimated_cost_kina || '-',
      'Status': intent.status,
      'Created Date': format(new Date(intent.created_at), 'MMM dd, yyyy'),
      'Reviewed Date': intent.reviewed_at ? format(new Date(intent.reviewed_at), 'MMM dd, yyyy') : '-',
      'Review Notes': intent.review_notes || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    worksheet['!cols'] = [
      { wch: 25 }, { wch: 15 }, { wch: 40 }, { wch: 40 }, { wch: 15 },
      { wch: 15 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 40 },
      { wch: 30 }, { wch: 20 }, { wch: 30 }, { wch: 30 }, { wch: 20 },
      { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 40 }
    ];
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Intent Reviews');
    XLSX.writeFile(workbook, `Intent_Application_Reviews_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const exportToCSV = () => {
    const exportData = filteredIntents.map(intent => ({
      'Entity': intent.entity?.name || '-',
      'Activity Level': intent.activity_level,
      'Activity Description': intent.activity_description,
      'Preparatory Work Description': intent.preparatory_work_description,
      'Commencement Date': format(new Date(intent.commencement_date), 'MMM dd, yyyy'),
      'Completion Date': format(new Date(intent.completion_date), 'MMM dd, yyyy'),
      'Project Site Address': intent.project_site_address || '-',
      'District': intent.district || '-',
      'Province': intent.province || '-',
      'Project Site Description': intent.project_site_description || '-',
      'Site Ownership Details': intent.site_ownership_details || '-',
      'Government Agreement': intent.government_agreement || '-',
      'Departments Approached': intent.departments_approached || '-',
      'Approvals Required': intent.approvals_required || '-',
      'Landowner Negotiation Status': intent.landowner_negotiation_status || '-',
      'Estimated Cost (Kina)': intent.estimated_cost_kina || '-',
      'Status': intent.status,
      'Created Date': format(new Date(intent.created_at), 'MMM dd, yyyy'),
      'Reviewed Date': intent.reviewed_at ? format(new Date(intent.reviewed_at), 'MMM dd, yyyy') : '-',
      'Review Notes': intent.review_notes || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Intent_Application_Reviews_${format(new Date(), 'yyyy-MM-dd')}.csv`;
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
            <CardTitle>Intent Application Reviews</CardTitle>
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
                placeholder="Search by activity, entity name, or province..." 
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
                  <SelectItem value="pending">Pending</SelectItem>
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
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredIntents.length)} of {filteredIntents.length} intent registrations for review
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader className="print:hidden">
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>Entity</TableHead>
              <TableHead>Activity Level</TableHead>
              <TableHead>Activity Description</TableHead>
              <TableHead>Province</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIntents.length === 0 ? (
              <TableRow className="print:hidden">
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' || levelFilter !== 'all' 
                    ? 'No intent registrations match your search criteria' 
                    : 'No intent registrations pending review'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedIntents.map(intent => {
                const isExpanded = expandedIntentId === intent.id;
                const getStatusVariant = (status: string) => {
                  switch (status) {
                    case 'pending': return 'secondary';
                    case 'under_review': return 'outline';
                    case 'rejected': return 'destructive';
                    case 'requires_clarification': return 'outline';
                    default: return 'default';
                  }
                };
                return (
                  <>
                    <TableRow 
                      key={intent.id} 
                      className={`cursor-pointer transition-colors print:hidden ${isExpanded ? 'bg-accent hover:bg-accent/90' : 'hover:bg-muted/50'}`} 
                      onClick={() => setExpandedIntentId(isExpanded ? null : intent.id)}
                    >
                      <TableCell>
                        {isExpanded 
                          ? <ChevronDown className="w-4 h-4 text-primary" /> 
                          : <ChevronsUpDown className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                        }
                      </TableCell>
                      <TableCell className="font-medium">{intent.entity?.name || '-'}</TableCell>
                      <TableCell>{intent.activity_level}</TableCell>
                      <TableCell className="max-w-xs truncate">{intent.activity_description}</TableCell>
                      <TableCell>{intent.province || '-'}</TableCell>
                      <TableCell>{format(new Date(intent.created_at), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(intent.status)}>
                          {intent.status.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow key={`${intent.id}-details`} className="bg-glass/50 backdrop-blur-md hover:bg-glass/50 print:bg-transparent">
                        <TableCell colSpan={7} className="p-0 print:p-0">
                          <div className="border-t border-glass/30 bg-white/80 dark:bg-primary/5 backdrop-blur-md p-6 print:border-none print:p-0 print:bg-transparent print:block">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full print:hidden">
                              <TabsList className="grid w-full grid-cols-6">
                                <TabsTrigger value="mapping">Site Mapping</TabsTrigger>
                                <TabsTrigger value="details">Registration Details</TabsTrigger>
                                <TabsTrigger value="registry-review">Registry Review</TabsTrigger>
                                <TabsTrigger value="compliance-review">Compliance Review</TabsTrigger>
                                <TabsTrigger value="invoice-payments">Invoice & Payments</TabsTrigger>
                                <TabsTrigger value="md-review">MD Review & Approval</TabsTrigger>
                              </TabsList>

                              <TabsContent value="mapping" className="mt-4">
                                <PermitApplicationsMap 
                                  showAllApplications={false} 
                                  existingBoundary={intent.project_boundary} 
                                  onBoundarySave={() => {}} 
                                  coordinates={{
                                    lat: intent.project_boundary?.coordinates?.[0]?.[0]?.[1] || -6.314993,
                                    lng: intent.project_boundary?.coordinates?.[0]?.[0]?.[0] || 147.1494
                                  }} 
                                  onCoordinatesChange={() => {}} 
                                  readOnly={true}
                                  district={intent.district}
                                  province={intent.province}
                                  llg={intent.llg}
                                />
                              </TabsContent>

                              <TabsContent value="details" className="space-y-4 mt-4">
                                <IntentRegistrationReadOnlyView intent={intent} />
                              </TabsContent>

                              <TabsContent value="registry-review" className="mt-4">
                                <IntentRegistryReviewTab 
                                  intentId={intent.id} 
                                  currentStatus={intent.status}
                                  onStatusUpdate={fetchIntentsForReview}
                                />
                              </TabsContent>

                              <TabsContent value="compliance-review" className="mt-4">
                                <IntentComplianceReviewTab 
                                  intentId={intent.id} 
                                  currentStatus={intent.status}
                                  onStatusUpdate={fetchIntentsForReview}
                                />
                              </TabsContent>

                              <TabsContent value="invoice-payments" className="mt-4">
                                <IntentInvoicePaymentsTab 
                                  intentId={intent.id}
                                  entityId={intent.entity_id}
                                  onStatusUpdate={fetchIntentsForReview}
                                />
                              </TabsContent>

                              <TabsContent value="md-review" className="mt-4">
                                <IntentMDReviewTab 
                                  intentId={intent.id} 
                                  currentStatus={intent.status}
                                  onStatusUpdate={fetchIntentsForReview}
                                />
                              </TabsContent>
                            </Tabs>

                            {/* Print-only content */}
                            <div className="hidden print:block">
                              <IntentRegistrationReadOnlyView intent={intent} />
                            </div>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 print:hidden">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
