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
import { Loader2, Search, Filter, ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, FileDown, FileText, Building2, MapPin, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';
import { IntentRegistrationReadOnlyView } from '@/components/public/IntentRegistrationReadOnlyView';

interface IntentRegistration {
  id: string;
  activity_description: string;
  activity_level: string;
  project_site_address: string | null;
  status: string;
  created_at: string;
  entity_id: string | null;
  entity?: {
    name: string;
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
  const [expandedIntentDetails, setExpandedIntentDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchIntents();
  }, []);

  const fetchIntents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('intent_registrations')
        .select(`
          id,
          activity_description,
          activity_level,
          project_site_address,
          status,
          created_at,
          entity_id,
          entity:entities(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIntents(data || []);
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

  const fetchIntentDetails = async (intentId: string) => {
    try {
      setLoadingDetails(true);
      const { data, error } = await supabase
        .from('intent_registrations')
        .select(`
          *,
          entity:entities(*)
        `)
        .eq('id', intentId)
        .single();

      if (error) throw error;
      setExpandedIntentDetails(data);
    } catch (error) {
      console.error('Error fetching intent details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load intent details',
        variant: 'destructive',
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleRowClick = (intentId: string) => {
    if (expandedIntentId === intentId) {
      setExpandedIntentId(null);
      setExpandedIntentDetails(null);
    } else {
      setExpandedIntentId(intentId);
      fetchIntentDetails(intentId);
    }
  };

  // Filter and search intents
  const filteredIntents = useMemo(() => {
    return intents.filter((intent) => {
      const matchesSearch = 
        intent.activity_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intent.entity?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intent.project_site_address?.toLowerCase().includes(searchTerm.toLowerCase());
      
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
      case 'rejected':
        return 'destructive';
      case 'under_review':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const exportToExcel = () => {
    const exportData = filteredIntents.map(intent => ({
      'Activity Description': intent.activity_description,
      'Entity': intent.entity?.name || '-',
      'Activity Level': intent.activity_level,
      'Project Site': intent.project_site_address || '-',
      'Status': intent.status,
      'Submitted Date': format(new Date(intent.created_at), 'MMM dd, yyyy')
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    
    worksheet['!cols'] = [
      { wch: 40 }, { wch: 25 }, { wch: 15 }, { wch: 30 }, { wch: 15 }, { wch: 15 }
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Intent Registrations');
    XLSX.writeFile(workbook, `MD_Intents_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const exportToCSV = () => {
    const exportData = filteredIntents.map(intent => ({
      'Activity Description': intent.activity_description,
      'Entity': intent.entity?.name || '-',
      'Activity Level': intent.activity_level,
      'Project Site': intent.project_site_address || '-',
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
                placeholder="Search by activity description, entity, or location..."
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
              <TableHead>Activity Description</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Submitted Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIntents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
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
                      onClick={() => handleRowClick(intent.id)}
                    >
                      <TableCell>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-primary" />
                        ) : (
                          <ChevronsUpDown className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium max-w-xs truncate">
                        {intent.activity_description}
                      </TableCell>
                      <TableCell>{intent.entity?.name || '-'}</TableCell>
                      <TableCell>{intent.activity_level}</TableCell>
                      <TableCell>{format(new Date(intent.created_at), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(intent.status)}>
                          {intent.status.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow key={`${intent.id}-details`} className="bg-muted/30 hover:bg-muted/30">
                        <TableCell colSpan={6} className="p-0">
                          {loadingDetails ? (
                            <div className="flex items-center justify-center p-8">
                              <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            </div>
                          ) : expandedIntentDetails ? (
                            <div className="border-t border-border bg-background/50 backdrop-blur-sm p-6">
                              <IntentRegistrationReadOnlyView intent={expandedIntentDetails} />
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
