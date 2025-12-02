import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEntities } from '@/hooks/useEntities';
import { format } from 'date-fns';
import { Loader2, Search, Filter, ChevronDown, ChevronRight, ChevronLeft, ChevronsUpDown, FileDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import { EntityDetailsReadOnly } from '@/components/public/EntityDetailsReadOnly';

export function RevenueEntitiesList() {
  const { entities, loading } = useEntities();
  const [searchTerm, setSearchTerm] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedEntityId, setExpandedEntityId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Filter and search entities
  const filteredEntities = useMemo(() => {
    return entities.filter((entity) => {
      const matchesSearch = 
        entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entity.registration_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entity.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = entityTypeFilter === 'all' || entity.entity_type === entityTypeFilter;
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && !entity.is_suspended) ||
        (statusFilter === 'suspended' && entity.is_suspended);
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [entities, searchTerm, entityTypeFilter, statusFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredEntities.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedEntities = filteredEntities.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, entityTypeFilter, statusFilter]);

  // Get unique entity types
  const entityTypes = useMemo(() => {
    return Array.from(new Set(entities.map(e => e.entity_type)));
  }, [entities]);

  const exportToExcel = () => {
    const exportData = filteredEntities.map(entity => ({
      'Name': entity.name,
      'Entity Type': entity.entity_type,
      'Email': entity.email || '-',
      'Phone': entity.phone || '-',
      'Province': entity.province || '-',
      'District': entity.district || '-',
      'Registered Address': entity['registered address'] || '-',
      'Postal Address': entity.postal_address || '-',
      'Registration Number': entity.registration_number || '-',
      'IRC Tax Number': entity.tax_number || '-',
      'Contact Person': entity.contact_person || '-',
      'Contact Person Phone': entity.contact_person_phone || '-',
      'Contact Person Email': entity.contact_person_email || '-',
      'Status': entity.is_suspended ? 'Suspended' : 'Active',
      'Created Date': format(new Date(entity.created_at), 'MMM dd, yyyy'),
      'Last Updated': format(new Date(entity.updated_at), 'MMM dd, yyyy')
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    
    const maxColumns = Math.max(...exportData.map(row => Object.keys(row).length));
    worksheet['!cols'] = Array(maxColumns).fill({ wch: 20 });

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Entities');
    XLSX.writeFile(workbook, `Entities_Revenue_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const exportToCSV = () => {
    const exportData = filteredEntities.map(entity => ({
      'Name': entity.name,
      'Entity Type': entity.entity_type,
      'Email': entity.email || '-',
      'Phone': entity.phone || '-',
      'Province': entity.province || '-',
      'District': entity.district || '-',
      'Registered Address': entity['registered address'] || '-',
      'Postal Address': entity.postal_address || '-',
      'Registration Number': entity.registration_number || '-',
      'IRC Tax Number': entity.tax_number || '-',
      'Contact Person': entity.contact_person || '-',
      'Contact Person Phone': entity.contact_person_phone || '-',
      'Contact Person Email': entity.contact_person_email || '-',
      'Status': entity.is_suspended ? 'Suspended' : 'Active',
      'Created Date': format(new Date(entity.created_at), 'MMM dd, yyyy'),
      'Last Updated': format(new Date(entity.updated_at), 'MMM dd, yyyy')
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Entities_Revenue_${format(new Date(), 'yyyy-MM-dd')}.csv`;
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
            <CardTitle>All Entities</CardTitle>
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
                placeholder="Search by name, registration number, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
                <SelectTrigger className="w-[180px] bg-background">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Entity Type" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  <SelectItem value="all">All Types</SelectItem>
                  {entityTypes.map((type) => (
                    <SelectItem key={type} value={type} className="capitalize">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] bg-background">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredEntities.length)} of {filteredEntities.length} entities
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Registration Number</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  {searchTerm || entityTypeFilter !== 'all' || statusFilter !== 'all' 
                    ? 'No entities match your search criteria' 
                    : 'No entities found'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedEntities.map((entity) => {
                const isExpanded = expandedEntityId === entity.id;
                return (
                  <>
                    <TableRow 
                      key={entity.id}
                      className={`cursor-pointer transition-colors ${
                        isExpanded ? 'bg-accent hover:bg-accent/90' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setExpandedEntityId(isExpanded ? null : entity.id)}
                    >
                      <TableCell>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-primary" />
                        ) : (
                          <ChevronsUpDown className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {entity.name}
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{entity.entity_type}</TableCell>
                      <TableCell>{entity.registration_number || '-'}</TableCell>
                      <TableCell>{format(new Date(entity.created_at), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{format(new Date(entity.updated_at), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <Badge variant={entity.is_suspended ? 'destructive' : 'default'}>
                          {entity.is_suspended ? 'Suspended' : 'Active'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow key={`${entity.id}-details`} className="bg-glass/50 backdrop-blur-md hover:bg-glass/50">
                        <TableCell colSpan={7} className="p-0">
                          <div className="border-t border-glass/30 bg-white/80 dark:bg-primary/5 backdrop-blur-md p-6">
                            <EntityDetailsReadOnly entity={entity} />
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
