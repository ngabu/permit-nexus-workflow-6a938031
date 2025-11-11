
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RoleBasedStats } from '@/components/shared/RoleBasedStats';
import { ReportGenerator } from '@/components/shared/ReportGenerator';
import { Building, Target, Users, BarChart3, Settings, UserCheck } from 'lucide-react';
import { useState } from 'react';

export default function DirectorateDashboard() {
  const { profile } = useAuth();
  
  // Directorate staff can have any position
  const isDirectorateStaff = profile?.staff_unit === 'directorate';
  const isManagement = profile?.staff_position && ['manager', 'director', 'managing_director'].includes(profile.staff_position);
  const userRole = isManagement ? 'manager' : 'officer';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Directorate {isManagement ? 'Leadership' : ''} Dashboard
            </h1>
            <p className="text-slate-600 mt-1">
              {isManagement 
                ? 'Executive oversight and strategic planning for PNG Conservation'
                : 'Strategic planning and organizational oversight'
              }
            </p>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 bg-slate-100 rounded-lg">
            <Building className="w-5 h-5 text-slate-600" />
            <span className="text-slate-800 font-medium">
              {profile?.staff_position === 'managing_director' ? 'Managing Director' :
               profile?.staff_position === 'director' ? 'Director' :
               profile?.staff_position === 'manager' ? 'Directorate Manager' : 'Directorate'}
            </span>
          </div>
        </div>

        {/* Role-based Statistics */}
        <RoleBasedStats userRole={userRole} staffUnit="directorate" />

        {/* Executive-level controls for management */}
        {isManagement && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-slate-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-slate-800 flex items-center gap-2">
                    <UserCheck className="w-5 h-5" />
                    Executive Functions
                  </CardTitle>
                  <Badge variant="secondary">
                    {profile?.staff_position === 'managing_director' ? 'MD' : 
                     profile?.staff_position === 'director' ? 'Director' : 'Manager'}
                  </Badge>
                </div>
                <CardDescription>Strategic decision making and oversight</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full mb-2">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Strategic Overview
                </Button>
                <Button variant="outline" className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Organization Settings
                </Button>
              </CardContent>
            </Card>

            <ReportGenerator staffUnit="directorate" />
          </div>
        )}

        {/* Operational cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-slate-200">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-slate-600" />
                <CardTitle className="text-slate-800">
                  {isManagement ? 'Strategic Planning' : 'Strategic Initiatives'}
                </CardTitle>
              </div>
              <CardDescription>
                {isManagement ? 'Executive strategic planning and vision' : 'Long-term strategic initiatives'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                {isManagement 
                  ? 'Executive strategic planning tools and vision setting capabilities will be implemented here.'
                  : 'Strategic planning tools and frameworks will be implemented here.'
                }
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-slate-600" />
                <CardTitle className="text-slate-800">
                  {isManagement ? 'Executive Leadership' : 'Leadership Support'}
                </CardTitle>
              </div>
              <CardDescription>
                {isManagement ? 'Senior leadership and governance' : 'Support leadership initiatives'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                {isManagement
                  ? 'Executive leadership dashboard and governance tools coming soon.'
                  : 'Leadership support tools and governance frameworks will be available here.'
                }
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-slate-600" />
                <CardTitle className="text-slate-800">
                  {isManagement ? 'Executive Performance' : 'Performance Monitoring'}
                </CardTitle>
              </div>
              <CardDescription>
                {isManagement ? 'Organization-wide performance metrics' : 'Monitor organizational performance'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                {isManagement
                  ? 'Executive performance dashboard and organizational metrics will be available here.'
                  : 'Performance monitoring and reporting dashboard will be available here.'
                }
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
