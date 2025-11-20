import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Loader2, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

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

export function PermitsList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [permits, setPermits] = useState<Permit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [permitTypeFilter, setPermitTypeFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [categoryLevelFilter, setCategoryLevelFilter] = useState<string>('all');
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

  // Filter and search permits
  const filteredPermits = useMemo(() => {
    return permits.filter((permit) => {
      const matchesSearch = 
        permit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permit.permit_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permit.entity_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = permitTypeFilter === 'all' || permit.permit_type === permitTypeFilter;
      const matchesEntity = entityFilter === 'all' || permit.entity_id === entityFilter;
      const matchesLevel = categoryLevelFilter === 'all' || permit.activity_level === categoryLevelFilter;
      
      return matchesSearch && matchesType && matchesEntity && matchesLevel;
    });
  }, [permits, searchTerm, permitTypeFilter, entityFilter, categoryLevelFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredPermits.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedPermits = filteredPermits.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, permitTypeFilter, entityFilter, categoryLevelFilter]);

  // Get unique permit types
  const permitTypes = useMemo(() => {
    return Array.from(new Set(permits.map(p => p.permit_type)));
  }, [permits]);

  // Get unique entities
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

  // Get unique category levels
  const categoryLevels = useMemo(() => {
    return Array.from(new Set(permits.map(p => p.activity_level).filter(Boolean)));
  }, [permits]);

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
          <CardTitle>All Approved Permits</CardTitle>
          
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

              <Select value={categoryLevelFilter} onValueChange={setCategoryLevelFilter}>
                <SelectTrigger className="w-[180px] bg-background">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category Level" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  <SelectItem value="all">All Levels</SelectItem>
                  {categoryLevels.map((level) => (
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
              <TableHead>Permit Number</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Approval Date</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPermits.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  {searchTerm || permitTypeFilter !== 'all' || entityFilter !== 'all' || categoryLevelFilter !== 'all'
                    ? 'No permits match your search criteria'
                    : 'No approved permits found'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedPermits.map((permit) => (
                <TableRow 
                  key={permit.id}
                  className="cursor-pointer hover:bg-accent/50"
                  onClick={() => navigate(`/registry/permits/${permit.id}`)}
                >
                  <TableCell className="font-medium">{permit.permit_number}</TableCell>
                  <TableCell>{permit.title}</TableCell>
                  <TableCell>{permit.entity_name || '-'}</TableCell>
                  <TableCell className="capitalize">{permit.permit_type.replace(/_/g, ' ')}</TableCell>
                  <TableCell>
                    {permit.approval_date ? format(new Date(permit.approval_date), 'MMM dd, yyyy') : '-'}
                  </TableCell>
                  <TableCell>{format(new Date(permit.updated_at), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    <Badge variant="default">Active</Badge>
                  </TableCell>
                </TableRow>
              ))
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
