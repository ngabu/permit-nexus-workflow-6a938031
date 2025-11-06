
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CalendarDays, MapPin, User, Plus, Search, Filter } from 'lucide-react';

const Inspections = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showScheduleForm, setShowScheduleForm] = useState(false);

  const inspections = [
    {
      id: 'INS-2024-001',
      permitId: 'EP-2024-001',
      type: 'Air Quality Inspection',
      status: 'scheduled',
      date: '2024-02-15',
      time: '10:00 AM',
      inspector: 'Dr. Sarah Johnson',
      location: 'Industrial Zone A, District 5',
      applicant: 'GreenTech Industries'
    },
    {
      id: 'INS-2024-002',
      permitId: 'EP-2024-002',
      type: 'Water Discharge Inspection',
      status: 'completed',
      date: '2024-01-28',
      time: '2:00 PM',
      inspector: 'Mark Chen',
      location: 'Riverside Manufacturing Complex',
      applicant: 'AquaClean Solutions',
      findings: 'All parameters within permitted limits'
    },
    {
      id: 'INS-2024-003',
      permitId: 'EP-2024-003',
      type: 'Waste Management Inspection',
      status: 'in-progress',
      date: '2024-02-01',
      time: '9:00 AM',
      inspector: 'Lisa Rodriguez',
      location: 'Commercial District 12',
      applicant: 'EcoWaste Corp'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const ScheduleInspectionForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <CardHeader>
          <CardTitle>Schedule New Inspection</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="permitId">Permit ID</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select permit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EP-2024-001">EP-2024-001 - Air Quality</SelectItem>
                    <SelectItem value="EP-2024-002">EP-2024-002 - Water Discharge</SelectItem>
                    <SelectItem value="EP-2024-003">EP-2024-003 - Waste Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inspectionType">Inspection Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine">Routine Inspection</SelectItem>
                    <SelectItem value="compliance">Compliance Check</SelectItem>
                    <SelectItem value="complaint">Complaint Investigation</SelectItem>
                    <SelectItem value="follow-up">Follow-up Inspection</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inspector">Inspector</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Assign inspector" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sarah">Dr. Sarah Johnson</SelectItem>
                    <SelectItem value="mark">Mark Chen</SelectItem>
                    <SelectItem value="lisa">Lisa Rodriguez</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input type="time" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea placeholder="Special instructions or notes for the inspection..." />
            </div>

            <div className="flex space-x-4">
              <Button type="submit" className="flex-1">Schedule Inspection</Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowScheduleForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Inspections</h1>
              <p className="text-gray-600 mt-2">Schedule and manage environmental inspections</p>
            </div>
            <Button 
              onClick={() => setShowScheduleForm(true)}
              className="bg-environmental-600 hover:bg-environmental-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Schedule Inspection
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">
                {inspections.filter(i => i.status === 'scheduled').length}
              </div>
              <p className="text-sm text-gray-600">Scheduled</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">
                {inspections.filter(i => i.status === 'in-progress').length}
              </div>
              <p className="text-sm text-gray-600">In Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {inspections.filter(i => i.status === 'completed').length}
              </div>
              <p className="text-sm text-gray-600">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-gray-600">
                {new Set(inspections.map(i => i.inspector)).size}
              </div>
              <p className="text-sm text-gray-600">Active Inspectors</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input placeholder="Search inspections..." className="pl-10" />
                </div>
              </div>
              <div className="flex gap-2">
                <Select>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inspections List */}
        <div className="space-y-4">
          {inspections.map((inspection) => (
            <Card key={inspection.id} className="permit-card">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{inspection.type}</h3>
                    <p className="text-sm text-gray-600">ID: {inspection.id} | Permit: {inspection.permitId}</p>
                  </div>
                  <Badge className={getStatusColor(inspection.status)}>
                    {inspection.status.replace('-', ' ').toUpperCase()}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarDays className="h-4 w-4 mr-2" />
                    <span>{inspection.date} at {inspection.time}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    <span>{inspection.inspector}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{inspection.location}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Applicant: <span className="font-medium">{inspection.applicant}</span>
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">View Details</Button>
                    {inspection.status === 'completed' && (
                      <Button variant="outline" size="sm">View Report</Button>
                    )}
                  </div>
                </div>

                {inspection.findings && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Findings:</strong> {inspection.findings}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {showScheduleForm && <ScheduleInspectionForm />}
      </div>
    </DashboardLayout>
  );
};

export default Inspections;
