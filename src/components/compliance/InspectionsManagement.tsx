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
import { useInspections } from '@/hooks/useInspections';
import { usePermitApplications } from '@/hooks/usePermitApplications';
import { CalendarIcon, Plus, Search, Filter, MapPin, DollarSign, Calendar as CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export const InspectionsManagement = () => {
  const { inspections, loading, createInspection } = useInspections();
  const { applications } = usePermitApplications();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [provinceFilter, setProvinceFilter] = useState<string>('all');

  // Filter approved permits only
  const approvedPermits = useMemo(() => {
    return applications.filter(app => app.status === 'approved');
  }, [applications]);

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
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalTravelCost = formData.accommodation_cost + formData.transportation_cost + formData.daily_allowance;

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <div className="text-2xl font-bold text-gray-600">
              {approvedPermits.length}
            </div>
            <p className="text-sm text-muted-foreground">Active Permits</p>
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
                  <Label>Permit *</Label>
                  <Select
                    value={formData.permit_application_id}
                    onValueChange={(value) => {
                  const permit = approvedPermits.find(p => p.id === value);
                  setFormData({
                    ...formData,
                    permit_application_id: value,
                    permit_category: permit?.permit_type || '',
                    province: permit?.details?.activity_location || ''
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select approved permit" />
                </SelectTrigger>
                <SelectContent>
                  {approvedPermits.map((permit) => (
                    <SelectItem key={permit.id} value={permit.id}>
                      {permit.permit_number || permit.title} - {permit.entity?.name || 'Unknown Entity'}
                        </SelectItem>
                      ))}
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
                  <Label>Accommodation Cost (Kina)</Label>
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
                  <Label>Daily Allowance (Kina)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.daily_allowance}
                    onChange={(e) => setFormData({ ...formData, daily_allowance: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Total Travel Cost</Label>
                  <Input
                    type="text"
                    value={`K ${totalTravelCost.toFixed(2)}`}
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

              <div className="flex gap-4">
                <Button type="submit" className="flex-1">Schedule Inspection</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
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

      {/* Inspections List */}
      <div className="space-y-4">
        {filteredInspections.map((inspection) => (
          <Card key={inspection.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{inspection.inspection_type}</h3>
                  <p className="text-sm text-muted-foreground">
                    Permit: {inspection.permit_number} | Entity: {inspection.entity_name}
                  </p>
                </div>
                <Badge className={getStatusColor(inspection.status)}>
                  {inspection.status.replace('-', ' ').toUpperCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center text-sm">
                  <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{format(new Date(inspection.scheduled_date), 'PP')}</span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{inspection.province || 'N/A'}</span>
                </div>
                <div className="flex items-center text-sm">
                  <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>K {inspection.total_travel_cost.toFixed(2)}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Duration:</span> {inspection.number_of_days} day(s)
                </div>
              </div>

              {inspection.total_travel_cost > 0 && (
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <p className="font-medium mb-1">Travel Costs Breakdown:</p>
                  <div className="grid grid-cols-3 gap-2">
                    <span>Accommodation: K {inspection.accommodation_cost.toFixed(2)}</span>
                    <span>Transport: K {inspection.transportation_cost.toFixed(2)}</span>
                    <span>Allowance: K {inspection.daily_allowance.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {inspection.notes && (
                <div className="mt-3 text-sm text-muted-foreground">
                  <strong>Notes:</strong> {inspection.notes}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredInspections.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No inspections found matching your filters.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
