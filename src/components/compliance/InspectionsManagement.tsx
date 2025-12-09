import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useInspections, Inspection } from '@/hooks/useInspections';
import { useInspectionApplications } from '@/hooks/useInspectionApplications';
import { supabase } from '@/integrations/supabase/client';
import { CalendarIcon, Plus, Search, Filter, MapPin, Loader2, DollarSign, Calendar as CalendarDays, PauseCircle, Trash2, PlayCircle, Eye, Edit, Upload, FileText, Download } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export const InspectionsManagement = () => {
  const { inspections, loading, createInspection, updateInspection, suspendInspection, reactivateInspection, deleteInspection, refetch } = useInspections();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [provinceFilter, setProvinceFilter] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'permit' | 'intent' | 'amalgamation' | 'amendment' | 'renewal' | 'surrender' | 'transfer'>('permit');
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<string | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  
  // View/Update dialog state
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [currentInspection, setCurrentInspection] = useState<Inspection | null>(null);
  const [updateStatus, setUpdateStatus] = useState<string>('');
  const [updateFindings, setUpdateFindings] = useState<string>('');
  const [uploadingReport, setUploadingReport] = useState(false);

  // Fetch applications based on selected type
  const { options: applicationOptions, loading: optionsLoading } = useInspectionApplications(selectedType);

  // Filter inspections
  const filteredInspections = useMemo(() => {
    return inspections.filter(inspection => {
      const matchesSearch = 
        inspection.permit_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inspection.permit_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inspection.entity_name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || inspection.permit_category === categoryFilter;
      const matchesProvince = provinceFilter === 'all' || inspection.province === provinceFilter;

      return matchesSearch && matchesCategory && matchesProvince;
    });
  }, [inspections, searchQuery, categoryFilter, provinceFilter]);

  // Extract unique categories and provinces
  const categories = useMemo(() => {
    const cats = new Set(inspections.map(i => i.permit_category).filter(Boolean));
    return Array.from(cats);
  }, [inspections]);

  const provinces = useMemo(() => {
    const provs = new Set(inspections.map(i => i.province).filter(Boolean));
    return Array.from(provs);
  }, [inspections]);

  const [formData, setFormData] = useState({
    permit_application_id: '',
    inspection_type: '',
    scheduled_date: '',
    number_of_days: 1,
    accommodation_cost: 0,
    transportation_cost: 0,
    daily_allowance: 0,
    province: '',
    permit_category: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.permit_application_id || !formData.scheduled_date) {
      return;
    }

    const success = await createInspection(formData);
    if (success) {
      setFormData({
        permit_application_id: '',
        inspection_type: '',
        scheduled_date: '',
        number_of_days: 1,
        accommodation_cost: 0,
        transportation_cost: 0,
        daily_allowance: 0,
        province: '',
        permit_category: '',
        notes: ''
      });
      setSelectedDate(undefined);
      setShowCreateForm(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSuspend = async () => {
    if (!selectedInspection) return;
    await suspendInspection(selectedInspection, suspendReason);
    setSuspendDialogOpen(false);
    setSelectedInspection(null);
    setSuspendReason('');
  };

  const handleDelete = async () => {
    if (!selectedInspection) return;
    await deleteInspection(selectedInspection);
    setDeleteDialogOpen(false);
    setSelectedInspection(null);
  };

  const openSuspendDialog = (id: string) => {
    setSelectedInspection(id);
    setSuspendDialogOpen(true);
  };

  const openDeleteDialog = (id: string) => {
    setSelectedInspection(id);
    setDeleteDialogOpen(true);
  };

  const openViewDialog = (inspection: Inspection) => {
    setCurrentInspection(inspection);
    setUpdateStatus(inspection.status);
    setUpdateFindings(inspection.findings || '');
    setViewDialogOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!currentInspection) return;
    
    const updates: Partial<Inspection> = {
      status: updateStatus,
      findings: updateFindings
    };
    
    // Set completed_date when status changes to completed
    if (updateStatus === 'completed' && currentInspection.status !== 'completed') {
      updates.completed_date = new Date().toISOString();
    }
    
    const success = await updateInspection(currentInspection.id, updates);
    if (success) {
      setViewDialogOpen(false);
      setCurrentInspection(null);
    }
  };

  const handleReportUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentInspection) return;

    setUploadingReport(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `inspection-reports/${currentInspection.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Update inspection with report path
      const { error: updateError } = await supabase
        .from('inspections')
        .update({ report_path: fileName })
        .eq('id', currentInspection.id);

      if (updateError) throw updateError;

      toast.success('Inspection report uploaded successfully');
      await refetch();
      
      // Update local state
      setCurrentInspection({
        ...currentInspection,
        report_path: fileName
      });
    } catch (error) {
      console.error('Error uploading report:', error);
      toast.error('Failed to upload inspection report');
    } finally {
      setUploadingReport(false);
    }
  };

  const handleDownloadReport = async (reportPath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(reportPath);
      
      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = reportPath.split('/').pop() || 'inspection-report';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    }
  };

  // Calculate total accommodation and daily allowance based on number of days
  const totalAccommodation = formData.accommodation_cost * formData.number_of_days;
  const totalDailyAllowance = formData.daily_allowance * formData.number_of_days;
  const totalInspectionCost = totalAccommodation + formData.transportation_cost + totalDailyAllowance;

  if (loading) {
    return <div>Loading inspections...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inspections Management</h1>
          <p className="text-muted-foreground mt-2">Schedule and manage permit inspections</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Inspection
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-600">
              {inspections.filter(i => i.status === 'pending').length}
            </div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {inspections.filter(i => i.status === 'scheduled').length}
            </div>
            <p className="text-sm text-muted-foreground">Scheduled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">
              {inspections.filter(i => i.status === 'in-progress').length}
            </div>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {inspections.filter(i => i.status === 'completed').length}
            </div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">
              {inspections.filter(i => i.status === 'suspended').length}
            </div>
            <p className="text-sm text-muted-foreground">Suspended</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">
              {applicationOptions.length}
            </div>
            <p className="text-sm text-muted-foreground">Eligible</p>
          </CardContent>
        </Card>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Schedule New Inspection</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Application Type *</Label>
                  <Select
                    value={selectedType}
                    onValueChange={(value: 'permit' | 'intent' | 'amalgamation' | 'amendment' | 'renewal' | 'surrender' | 'transfer') => {
                      setSelectedType(value);
                      setFormData({ ...formData, permit_application_id: '', permit_category: '', province: '' });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="permit">Permit Application</SelectItem>
                      <SelectItem value="intent">Intent Registration</SelectItem>
                      <SelectItem value="amalgamation">Permit Amalgamation</SelectItem>
                      <SelectItem value="amendment">Permit Amendment</SelectItem>
                      <SelectItem value="renewal">Permit Renewal</SelectItem>
                      <SelectItem value="surrender">Permit Surrender</SelectItem>
                      <SelectItem value="transfer">Permit Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{selectedType === 'intent' ? 'Intent' : 'Application'} *</Label>
                  <Select
                    value={formData.permit_application_id}
                    onValueChange={(value) => {
                      const selected = applicationOptions.find(opt => opt.id === value);
                      const typeLabels: Record<string, string> = {
                        permit: 'Permit Application',
                        intent: 'Intent Registration',
                        amalgamation: 'Permit Amalgamation',
                        amendment: 'Permit Amendment',
                        renewal: 'Permit Renewal',
                        surrender: 'Permit Surrender',
                        transfer: 'Permit Transfer'
                      };
                      setFormData({
                        ...formData,
                        permit_application_id: value,
                        permit_category: typeLabels[selectedType] || '',
                        province: selected?.province || ''
                      });
                    }}
                    disabled={optionsLoading}
                  >
                    <SelectTrigger>
                      {optionsLoading ? (
                        <div className="flex items-center">
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Loading...
                        </div>
                      ) : (
                        <SelectValue placeholder={`Select ${selectedType === 'intent' ? 'intent' : 'application'}`} />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {applicationOptions.length === 0 ? (
                        <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                          No {selectedType === 'intent' ? 'intents' : 'applications'} available
                        </div>
                      ) : (
                        applicationOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label} - {option.entityName} ({option.status})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Inspection Type *</Label>
                  <Select
                    value={formData.inspection_type}
                    onValueChange={(value) => setFormData({ ...formData, inspection_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine">Routine Inspection</SelectItem>
                      <SelectItem value="compliance">Compliance Check</SelectItem>
                      <SelectItem value="complaint">Complaint Investigation</SelectItem>
                      <SelectItem value="follow-up">Follow-up Inspection</SelectItem>
                      <SelectItem value="special">Special Inspection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Scheduled Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          setSelectedDate(date);
                          setFormData({
                            ...formData,
                            scheduled_date: date ? format(date, "yyyy-MM-dd") : ''
                          });
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Number of Days *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.number_of_days}
                    onChange={(e) => setFormData({ ...formData, number_of_days: parseInt(e.target.value) || 1 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Accommodation Costs (Kina) per day</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.accommodation_cost}
                    onChange={(e) => setFormData({ ...formData, accommodation_cost: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Transportation Cost (Kina)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.transportation_cost}
                    onChange={(e) => setFormData({ ...formData, transportation_cost: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Daily Allowance (Kina) per day</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.daily_allowance}
                    onChange={(e) => setFormData({ ...formData, daily_allowance: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Total Inspection Cost</Label>
                  <Input
                    type="text"
                    value={`K ${totalInspectionCost.toFixed(2)}`}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes or instructions..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="destructive" onClick={() => setShowCreateForm(false)} className="w-32">
                  Cancel
                </Button>
                <Button type="submit" className="w-48">Register Inspection</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      {!showCreateForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by permit number, title, or entity..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat as string}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={provinceFilter} onValueChange={setProvinceFilter}>
                <SelectTrigger className="w-48">
                  <MapPin className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Province" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Provinces</SelectItem>
                  {provinces.map(prov => (
                    <SelectItem key={prov} value={prov as string}>{prov}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inspections Table */}
      {!showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Inspections</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Permit/Intent</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Scheduled Date</TableHead>
                  <TableHead>Province</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Report</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInspections.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No inspections found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInspections.map((inspection) => (
                    <TableRow key={inspection.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{inspection.permit_number}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {inspection.permit_title}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{inspection.entity_name || 'N/A'}</TableCell>
                      <TableCell className="capitalize">{inspection.inspection_type}</TableCell>
                      <TableCell>{format(new Date(inspection.scheduled_date), 'PP')}</TableCell>
                      <TableCell>{inspection.province || 'N/A'}</TableCell>
                      <TableCell>K {inspection.total_travel_cost.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(inspection.status)}>
                          {inspection.status.replace('-', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {inspection.report_path ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadReport(inspection.report_path!)}
                            className="text-blue-600"
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openViewDialog(inspection)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {inspection.status !== 'suspended' && inspection.status !== 'completed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openSuspendDialog(inspection.id)}
                              className="text-orange-600 border-orange-600 hover:bg-orange-50"
                            >
                              <PauseCircle className="h-4 w-4" />
                            </Button>
                          )}
                          {inspection.status === 'suspended' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => reactivateInspection(inspection.id)}
                                className="text-green-600 border-green-600 hover:bg-green-50"
                              >
                                <PlayCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => openDeleteDialog(inspection.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* View/Update Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Inspection Details</DialogTitle>
            <DialogDescription>
              View and update inspection information
            </DialogDescription>
          </DialogHeader>
          
          {currentInspection && (
            <div className={`space-y-4 py-4 ${updateStatus === 'completed' ? 'max-h-[60vh] overflow-y-auto pr-2' : ''}`}>
              {/* Inspection Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Permit/Intent</Label>
                  <p className="font-medium">{currentInspection.permit_number}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Entity</Label>
                  <p className="font-medium">{currentInspection.entity_name || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Inspection Type</Label>
                  <p className="font-medium capitalize">{currentInspection.inspection_type}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Scheduled Date</Label>
                  <p className="font-medium">{format(new Date(currentInspection.scheduled_date), 'PPP')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Province</Label>
                  <p className="font-medium">{currentInspection.province || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Total Cost</Label>
                  <p className="font-medium">K {currentInspection.total_travel_cost.toFixed(2)}</p>
                </div>
              </div>

              {/* Travel Cost Breakdown */}
              {currentInspection.total_travel_cost > 0 && (
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <p className="font-medium mb-2">Travel Costs Breakdown:</p>
                  <div className="grid grid-cols-3 gap-2">
                    <span>Accommodation: K {currentInspection.accommodation_cost.toFixed(2)}</span>
                    <span>Transport: K {currentInspection.transportation_cost.toFixed(2)}</span>
                    <span>Allowance: K {currentInspection.daily_allowance.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Notes */}
              {currentInspection.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="text-sm">{currentInspection.notes}</p>
                </div>
              )}

              {/* Status Update */}
              <div className="space-y-2">
                <Label>Status *</Label>
                <Select value={updateStatus} onValueChange={setUpdateStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Findings */}
              <div className="space-y-2">
                <Label>Findings</Label>
                <Textarea
                  value={updateFindings}
                  onChange={(e) => setUpdateFindings(e.target.value)}
                  placeholder="Enter inspection findings..."
                  rows={3}
                />
              </div>

              {/* Report Upload - Only show when completed */}
              {updateStatus === 'completed' && (
                <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
                  <Label>Inspection Report</Label>
                  {currentInspection.report_path ? (
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-green-600" />
                      <span className="text-sm">Report uploaded</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadReport(currentInspection.report_path!)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleReportUpload}
                        disabled={uploadingReport}
                        className="max-w-sm"
                      />
                      {uploadingReport && <Loader2 className="h-4 w-4 animate-spin" />}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Upload the completed inspection report (PDF, DOC, DOCX)
                  </p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate}>
              Update Inspection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Dialog */}
      <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend Inspection</DialogTitle>
            <DialogDescription>
              This will suspend the scheduled inspection. Suspended inspections can be deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reason for Suspension (Optional)</Label>
              <Textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Enter reason for suspension..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="default" className="bg-orange-600 hover:bg-orange-700" onClick={handleSuspend}>
              Suspend Inspection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Inspection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this suspended inspection? This action cannot be undone.
              Any associated invoice will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
