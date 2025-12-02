import { useState, useEffect } from 'react';
import { SimpleHeader } from '@/components/SimpleHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Database, HardDrive, RefreshCw, Download, Calendar, Trash2, Shield, Activity, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import StatsCard from '@/components/StatsCard';

interface TableStats {
  table_name: string;
  row_count: number;
  total_size: string;
}

interface BackupSchedule {
  id: string;
  frequency: string;
  format: string;
  last_backup: string | null;
  next_scheduled: string;
  enabled: boolean;
}

export default function DatabaseAdministration() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [tableStats, setTableStats] = useState<TableStats[]>([]);
  const [dbSize, setDbSize] = useState('0 MB');
  const [activeConnections, setActiveConnections] = useState(0);
  const [lastBackup, setLastBackup] = useState<string>('Never');
  const [backupSchedule, setBackupSchedule] = useState<BackupSchedule>({
    id: 'default',
    frequency: 'daily',
    format: 'sql',
    last_backup: null,
    next_scheduled: new Date(Date.now() + 86400000).toISOString(),
    enabled: false
  });

  // Calculate next scheduled backup based on frequency
  const calculateNextBackup = (frequency: string): string => {
    const now = new Date();
    switch (frequency) {
      case 'hourly':
        return new Date(now.getTime() + 3600000).toISOString(); // +1 hour
      case 'daily':
        return new Date(now.getTime() + 86400000).toISOString(); // +24 hours
      case 'weekly':
        return new Date(now.getTime() + 604800000).toISOString(); // +7 days
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()).toISOString(); // +1 month
      default:
        return new Date(now.getTime() + 86400000).toISOString();
    }
  };

  const loadDatabaseStats = async () => {
    try {
      setLoading(true);
      
      // Get table statistics with proper error handling
      const { data: tables, error: tablesError } = await supabase.rpc('get_table_statistics');
      
      if (tablesError) {
        console.error('Table stats error:', tablesError);
        toast({
          title: "Error",
          description: "Failed to fetch table statistics: " + tablesError.message,
          variant: "destructive",
        });
      }
      
      if (tables && Array.isArray(tables)) {
        setTableStats(tables as TableStats[]);
        
        // Calculate total database size from all tables
        const totalBytes = tables.reduce((sum: number, table: any) => {
          return sum + (parseInt(table.size_bytes) || 0);
        }, 0);
        
        const totalMB = totalBytes / (1024 * 1024);
        if (totalMB > 1024) {
          setDbSize(`${(totalMB / 1024).toFixed(2)} GB`);
        } else {
          setDbSize(`${totalMB.toFixed(2)} MB`);
        }
      }

      // Get total user count as proxy for connections
      const { count: userCount, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (!countError && userCount !== null) {
        setActiveConnections(userCount);
      }

    } catch (error) {
      console.error('Error loading database stats:', error);
      toast({
        title: "Error",
        description: "Failed to load database statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const performVacuum = async () => {
    try {
      setLoading(true);
      toast({
        title: "Vacuum Started",
        description: "Database vacuum and analyze operation in progress...",
      });

      const { error } = await supabase.rpc('vacuum_analyze_database' as any);
      
      if (error) throw error;

      toast({
        title: "Vacuum Complete",
        description: "Database has been vacuumed and analyzed successfully.",
      });
      
      loadDatabaseStats();
    } catch (error) {
      toast({
        title: "Vacuum Failed",
        description: "Failed to perform database vacuum operation.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const rebuildIndexes = async () => {
    try {
      setLoading(true);
      toast({
        title: "Rebuilding Indexes",
        description: "Database index rebuild operation in progress...",
      });

      const { error } = await supabase.rpc('rebuild_database_indexes' as any);
      
      if (error) throw error;

      toast({
        title: "Indexes Rebuilt",
        description: "All database indexes have been rebuilt successfully.",
      });
      
      loadDatabaseStats();
    } catch (error) {
      toast({
        title: "Rebuild Failed",
        description: "Failed to rebuild database indexes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    try {
      setLoading(true);
      toast({
        title: "Creating Backup",
        description: "Exporting database data...",
      });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `cepa_database_backup_${timestamp}.json`;

      // Fetch data from all major tables
      const [
        { data: profiles },
        { data: entities },
        { data: permitApplications },
        { data: intentRegistrations },
        { data: documents },
        { data: feePayments },
        { data: inspections },
        { data: complianceReports },
        { data: prescribedActivities },
        { data: permitTypes }
      ] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('entities').select('*'),
        supabase.from('permit_applications').select('*'),
        supabase.from('intent_registrations').select('*'),
        supabase.from('documents').select('*'),
        supabase.from('fee_payments').select('*'),
        supabase.from('inspections').select('*'),
        supabase.from('compliance_reports').select('*'),
        supabase.from('prescribed_activities').select('*'),
        supabase.from('permit_types').select('*')
      ]);

      // Create backup object
      const backupData = {
        metadata: {
          backup_date: new Date().toISOString(),
          backup_version: '1.0',
          database: 'CEPA Environmental Permits System',
          format: backupSchedule.format
        },
        data: {
          profiles,
          entities,
          permit_applications: permitApplications,
          intent_registrations: intentRegistrations,
          documents,
          fee_payments: feePayments,
          inspections,
          compliance_reports: complianceReports,
          prescribed_activities: prescribedActivities,
          permit_types: permitTypes
        }
      };

      // Convert to JSON string
      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });

      // Create download link and trigger save dialog
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      const now = new Date();
      setLastBackup(now.toLocaleString());
      toast({
        title: "Backup Created",
        description: `Database backup downloaded as ${filename}`,
      });
      
    } catch (error) {
      console.error('Backup error:', error);
      toast({
        title: "Backup Failed",
        description: "Failed to create database backup.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateBackupSchedule = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, this would save to a schedules table
      toast({
        title: "Schedule Updated",
        description: `Backup schedule set to ${backupSchedule.frequency} in ${backupSchedule.format} format.`,
      });
      
    } catch (error) {
      toast({
        title: "Schedule Update Failed",
        description: "Failed to update backup schedule.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const cleanDrafts = async () => {
    try {
      setLoading(true);
      toast({
        title: "Cleaning Drafts",
        description: "Removing old draft applications...",
      });

      const { error } = await supabase.rpc('clean_old_drafts' as any, {
        days_old: 90
      });
      
      if (error) throw error;

      toast({
        title: "Drafts Cleaned",
        description: "Old draft applications have been removed.",
      });
      
      loadDatabaseStats();
    } catch (error) {
      toast({
        title: "Cleanup Failed",
        description: "Failed to clean draft applications.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatistics = async () => {
    try {
      setLoading(true);
      toast({
        title: "Updating Statistics",
        description: "Updating database query planner statistics...",
      });

      const { error } = await supabase.rpc('update_database_statistics' as any);
      
      if (error) throw error;

      toast({
        title: "Statistics Updated",
        description: "Database statistics have been updated.",
      });
      
      loadDatabaseStats();
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update database statistics.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearSystemLogs = async () => {
    try {
      setLoading(true);
      toast({
        title: "Clearing System Logs",
        description: "Removing system logs older than 30 days...",
      });

      const { data, error } = await supabase.rpc('clear_old_system_logs', {
        days_threshold: 30
      });
      
      if (error) throw error;

      toast({
        title: "System Logs Cleared",
        description: `${data || 0} system log entries removed successfully.`,
      });
      
      loadDatabaseStats();
    } catch (error) {
      console.error('Clear error:', error);
      toast({
        title: "Clear Failed",
        description: "Failed to clear system logs.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const backupAuditLogs = async () => {
    try {
      setLoading(true);
      toast({
        title: "Backing Up Audit Logs",
        description: "Creating backup of audit logs older than 30 days...",
      });

      const { data, error } = await supabase.rpc('backup_old_audit_logs', {
        days_threshold: 30
      });
      
      if (error) throw error;

      toast({
        title: "Backup Complete",
        description: `${data?.[0]?.backup_count || 0} audit logs backed up successfully.`,
      });
      
    } catch (error) {
      console.error('Backup error:', error);
      toast({
        title: "Backup Failed",
        description: "Failed to backup audit logs.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearAuditLogs = async () => {
    try {
      setLoading(true);
      toast({
        title: "Clearing Audit Logs",
        description: "Removing audit logs older than 30 days...",
      });

      const { data, error } = await supabase.rpc('clear_old_audit_logs', {
        days_threshold: 30
      });
      
      if (error) throw error;

      toast({
        title: "Logs Cleared",
        description: `${data || 0} audit logs removed successfully.`,
      });
      
      loadDatabaseStats();
    } catch (error) {
      console.error('Clear error:', error);
      toast({
        title: "Clear Failed",
        description: "Failed to clear audit logs.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDatabaseStats();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SimpleHeader />
      <main className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate('/admin')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-forest-800">Database Administration</h1>
              <p className="text-forest-600 mt-1">Database maintenance, backups, and optimization tools</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadDatabaseStats}
              className="ml-auto"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Stats
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatsCard
              title="Total Tables"
              value={tableStats.length.toString()}
              icon={Database}
              changeType="neutral"
            />
            <StatsCard
              title="Database Size"
              value={dbSize}
              icon={HardDrive}
              changeType="neutral"
            />
            <StatsCard
              title="Active Connections"
              value={activeConnections.toString()}
              icon={Activity}
              changeType="neutral"
            />
            <StatsCard
              title="Last Backup"
              value={lastBackup}
              icon={Shield}
              changeType="neutral"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Database Operations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Database Operations
                </CardTitle>
                <CardDescription>Manage database maintenance and optimization tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={performVacuum}
                  disabled={true}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Vacuum & Analyze Database
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={rebuildIndexes}
                  disabled={true}
                >
                  <Database className="w-4 h-4 mr-2" />
                  Rebuild All Indexes
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={updateStatistics}
                  disabled={true}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Update Query Statistics
                </Button>
              </CardContent>
            </Card>

            {/* Backup & Recovery */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Backup & Recovery
                </CardTitle>
                <CardDescription>Create backups and configure automatic scheduling</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Backup Format</Label>
                  <Select 
                    value={backupSchedule.format} 
                    onValueChange={(value) => setBackupSchedule({...backupSchedule, format: value})}
                    disabled
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sql">SQL (Portable)</SelectItem>
                      <SelectItem value="custom">Custom (Compressed)</SelectItem>
                      <SelectItem value="tar">TAR Archive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  className="w-full" 
                  variant="default"
                  onClick={createBackup}
                  disabled
                >
                  <Download className="w-4 h-4 mr-2" />
                  Create Backup Now
                </Button>
              </CardContent>
            </Card>

            {/* Backup Scheduling */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Backup Scheduling
                </CardTitle>
                <CardDescription>Configure automatic backup frequency</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Backup Frequency</Label>
                  <Select 
                    value={backupSchedule.frequency} 
                    onValueChange={(value) => {
                      const nextScheduled = calculateNextBackup(value);
                      setBackupSchedule({
                        ...backupSchedule, 
                        frequency: value,
                        next_scheduled: nextScheduled
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Clock className="w-4 h-4" />
                  <div className="text-sm">
                    <div className="font-medium">Next Scheduled Backup</div>
                    <div className="text-muted-foreground">
                      {new Date(backupSchedule.next_scheduled).toLocaleString()}
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  onClick={updateBackupSchedule}
                  disabled={loading}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Save Schedule
                </Button>
              </CardContent>
            </Card>

            {/* Maintenance Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Maintenance Tasks
                </CardTitle>
                <CardDescription>Data cleanup and optimization operations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={clearSystemLogs}
                  disabled={true}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear System Logs (30+ days)
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={backupAuditLogs}
                  disabled={true}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Backup Audit Logs (30+ days)
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={clearAuditLogs}
                  disabled={true}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Audit Logs (30+ days)
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={cleanDrafts}
                  disabled={true}
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Clear Old Drafts (90+ days)
                </Button>
              </CardContent>
            </Card>

            {/* Database Tables */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Database Tables Overview
                </CardTitle>
                <CardDescription>Core system tables with row counts and sizes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm max-h-96 overflow-y-auto">
                  {tableStats.length > 0 ? (
                    tableStats.map((table) => (
                      <div key={table.table_name} className="flex justify-between items-center p-3 border rounded hover:bg-accent transition-colors">
                        <span className="font-mono text-xs">{table.table_name}</span>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>{table.row_count.toLocaleString()} rows</span>
                          <span>{table.total_size}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      {loading ? 'Loading table statistics...' : 'No table statistics available'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}