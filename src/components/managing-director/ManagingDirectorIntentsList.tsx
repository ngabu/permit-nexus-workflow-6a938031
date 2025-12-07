import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Loader2, Search, Filter, ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, FileDown, Clock, AlertCircle, User, Mail, Calendar } from 'lucide-react';
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
  total_area_sqkm: number | null;
  signed_document_path?: string | null;
  docusign_envelope_id?: string | null;
  entity?: {
    id: string;
    name: string;
    entity_type: string;
  };
  reviewer?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
}

export function ManagingDirectorIntentsList() {
  const { toast } = useToast();
  const [intents, setIntents] = useState<IntentRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [expandedIntentId, setExpandedIntentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('mapping');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      submitted: 'secondary',
      approved: 'default',
      rejected: 'destructive',
      under_review: 'outline'
    };
    return <Badge variant={variants[status] || 'outline'} className="capitalize">
        {status.replace('_', ' ')}
      </Badge>;
  };

  useEffect(() => {
    fetchIntents();
  }, []);

  const fetchIntents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('intent_registrations')
        .select(`
          *,
          entity:entities(id, name, entity_type)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process data to ensure proper typing
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
      console.error('Error fetching intents:', error);
      toast({
        title: 'Error',
        description: 'Failed to load intent registrations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter and search intents
  const filteredIntents = useMemo(() => {
    return intents.filter((intent) => {
      const matchesSearch = 
        intent.activity_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intent.entity?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intent.project_site_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intent.province?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || intent.status === statusFilter;
      const matchesLevel = levelFilter === 'all' || intent.activity_level === levelFilter;
      const matchesEntity = entityFilter === 'all' || intent.entity_id === entityFilter;
      
      return matchesSearch && matchesStatus && matchesLevel && matchesEntity;
    });
  }, [intents, searchTerm, statusFilter, levelFilter, entityFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredIntents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedIntents = filteredIntents.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, levelFilter, entityFilter]);

  // Get unique values for filters
  const statuses = useMemo(() => {
    return Array.from(new Set(intents.map(i => i.status)));
  }, [intents]);

  const levels = useMemo(() => {
    return Array.from(new Set(intents.map(i => i.activity_level)));
  }, [intents]);

  const entities = useMemo(() => {
    const uniqueEntities = intents
      .filter(i => i.entity_id && i.entity?.name)
      .map(i => ({ id: i.entity_id!, name: i.entity!.name }));
    
    const seen = new Set();
    return uniqueEntities.filter(e => {
      const duplicate = seen.has(e.id);
      seen.add(e.id);
      return !duplicate;
    });
  }, [intents]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      case 'under_review':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const exportToExcel = () => {
    const exportData = filteredIntents.map(intent => ({
      'Project Description': intent.activity_description,
      'Entity': intent.entity?.name || '-',
      'Activity Level': intent.activity_level,
      'Project Site': intent.project_site_address || '-',
      'Province': intent.province || '-',
      'Status': intent.status,
      'Submitted Date': format(new Date(intent.created_at), 'MMM dd, yyyy')
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    
    worksheet['!cols'] = [
      { wch: 40 }, { wch: 25 }, { wch: 15 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Intent Registrations');
    XLSX.writeFile(workbook, `MD_Intents_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const exportToCSV = () => {
    const exportData = filteredIntents.map(intent => ({
      'Project Description': intent.activity_description,
      'Entity': intent.entity?.name || '-',
      'Activity Level': intent.activity_level,
      'Project Site': intent.project_site_address || '-',
      'Province': intent.province || '-',
      'Status': intent.status,
      'Submitted Date': format(new Date(intent.created_at), 'MMM dd, yyyy')
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `MD_Intents_${format(new Date(), 'yyyy-MM-dd')}.csv`;
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
            <CardTitle>All Intent Registrations</CardTitle>
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
                placeholder="Search by project description, entity, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] bg-background">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  <SelectItem value="all">All Status</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status} className="capitalize">
                      {status.replace(/_/g, ' ')}
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
                    <SelectItem key={level} value={level}>
                      {level}
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
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredIntents.length)} of {filteredIntents.length} intent registrations
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>Entity</TableHead>
              <TableHead>Activity Level</TableHead>
              <TableHead>Project Description</TableHead>
              <TableHead>Province</TableHead>
              <TableHead>Submitted Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIntents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' || levelFilter !== 'all' || entityFilter !== 'all'
                    ? 'No intent registrations match your search criteria'
                    : 'No intent registrations found'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedIntents.map((intent) => {
                const isExpanded = expandedIntentId === intent.id;
                return (
                  <>
                    <TableRow 
                      key={intent.id}
                      className={`cursor-pointer transition-colors ${
                        isExpanded ? 'bg-accent hover:bg-accent/90' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setExpandedIntentId(isExpanded ? null : intent.id)}
                    >
                      <TableCell>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-primary" />
                        ) : (
                          <ChevronsUpDown className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{intent.entity?.name || '-'}</TableCell>
                      <TableCell>{intent.activity_level}</TableCell>
                      <TableCell className="max-w-xs truncate">{intent.activity_description}</TableCell>
                      <TableCell>{intent.province || '-'}</TableCell>
                      <TableCell>{format(new Date(intent.created_at), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(intent.status)}>
                          {intent.status.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow key={`${intent.id}-details`} className="bg-glass/50 backdrop-blur-md hover:bg-glass/50">
                        <TableCell colSpan={7} className="p-0">
                          <div className="border-t border-glass/30 bg-white/80 dark:bg-primary/5 backdrop-blur-md p-6">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                                  key={`map-${intent.id}`}
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
                                  customTitle="Proposed Project Site Map"
                                  customDescription=""
                                />
                              </TabsContent>

                              <TabsContent value="details" className="space-y-4 mt-4">
                                <IntentRegistrationReadOnlyView intent={intent} />
                              </TabsContent>

                              <TabsContent value="registry-review" className="mt-4">
                                <IntentRegistryReviewTab 
                                  intentId={intent.id} 
                                  currentStatus={intent.status}
                                  onStatusUpdate={fetchIntents}
                                />
                              </TabsContent>

                              <TabsContent value="compliance-review" className="mt-4">
                                <IntentComplianceReviewTab 
                                  intentId={intent.id} 
                                  currentStatus={intent.status}
                                  onStatusUpdate={fetchIntents}
                                />
                              </TabsContent>

                              <TabsContent value="invoice-payments" className="mt-4">
                                <IntentInvoicePaymentsTab 
                                  intentId={intent.id}
                                  entityId={intent.entity_id}
                                  onStatusUpdate={fetchIntents}
                                />
                              </TabsContent>

                              <TabsContent value="md-review" className="mt-4">
                                <IntentMDReviewTab 
                                  intentId={intent.id} 
                                  currentStatus={intent.status}
                                  onStatusUpdate={fetchIntents}
                                />
                              </TabsContent>
                            </Tabs>

                            {/* Official Feedback Section - Below Tabs */}
                            <div>
                              <Separator className="my-6" />
                              <Card className="bg-muted/30">
                                <CardHeader className="bg-primary/10">
                                  <CardTitle className="text-lg">Official Feedback from CEPA</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-4">
                                  {intent.status === 'pending' ? (
                                    <Alert>
                                      <Clock className="h-4 w-4" />
                                      <AlertDescription>
                                        This submission is currently under review. Any feedback from CEPA will be displayed here once the review is complete.
                                      </AlertDescription>
                                    </Alert>
                                  ) : (
                                    <>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <Label className="text-muted-foreground mb-1">Status</Label>
                                          <div className="mt-1">{getStatusBadge(intent.status)}</div>
                                        </div>
                                        {intent.reviewed_at && (
                                          <div>
                                            <Label className="text-muted-foreground mb-1">Review Date</Label>
                                            <div className="flex items-center gap-2 mt-1">
                                              <Calendar className="w-4 h-4 text-muted-foreground" />
                                              <p className="text-sm">{format(new Date(intent.reviewed_at), 'PPP p')}</p>
                                            </div>
                                          </div>
                                        )}
                                      </div>

                                      {intent.reviewer && (
                                        <div className="bg-background/50 p-4 rounded-lg">
                                          <Label className="text-muted-foreground mb-2">Reviewed By</Label>
                                          <div className="space-y-1 mt-2">
                                            <div className="flex items-center gap-2">
                                              <User className="w-4 h-4 text-muted-foreground" />
                                              <p className="text-sm font-medium">
                                                {intent.reviewer?.first_name} {intent.reviewer?.last_name}
                                              </p>
                                            </div>
                                            {intent.reviewer?.email && (
                                              <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-muted-foreground" />
                                                <p className="text-sm text-muted-foreground">{intent.reviewer.email}</p>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {intent.review_notes && (
                                        <div>
                                          <Label className="text-muted-foreground mb-2">Official Review Notes</Label>
                                          <div className="bg-background/50 p-4 rounded-lg mt-2">
                                            <p className="text-sm whitespace-pre-wrap">{intent.review_notes}</p>
                                          </div>
                                        </div>
                                      )}

                                      {!intent.review_notes && !intent.reviewer && (
                                        <Alert>
                                          <AlertCircle className="h-4 w-4" />
                                          <AlertDescription>
                                            The Registry team has updated the status but has not yet provided detailed feedback.
                                          </AlertDescription>
                                        </Alert>
                                      )}
                                    </>
                                  )}
                                </CardContent>
                              </Card>
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
