import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  History, 
  User, 
  FileEdit, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  UserPlus,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface AuditTrailEntry {
  id: string;
  officer_name: string;
  officer_email: string;
  action_type: string;
  previous_status: string | null;
  new_status: string | null;
  previous_outcome: string | null;
  new_outcome: string | null;
  assessment_notes: string | null;
  feedback_provided: string | null;
  changes_made: any;
  metadata: any;
  created_at: string;
}

interface RegistryAuditTrailProps {
  permitApplicationId: string;
  className?: string;
}

export function RegistryAuditTrail({ permitApplicationId, className }: RegistryAuditTrailProps) {
  const [auditEntries, setAuditEntries] = useState<AuditTrailEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAuditTrail();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('registry-audit-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'registry_audit_trail',
          filter: `permit_application_id=eq.${permitApplicationId}`
        },
        (payload) => {
          setAuditEntries(prev => [payload.new as AuditTrailEntry, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [permitApplicationId]);

  const fetchAuditTrail = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('registry_audit_trail')
        .select('*')
        .eq('permit_application_id', permitApplicationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAuditEntries(data || []);
    } catch (error) {
      console.error('Error fetching audit trail:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (entryId: string) => {
    setExpandedEntries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'status_changed':
        return <FileEdit className="w-4 h-4" />;
      case 'assessment_created':
        return <CheckCircle className="w-4 h-4" />;
      case 'assessment_updated':
        return <FileEdit className="w-4 h-4" />;
      case 'officer_assigned':
        return <UserPlus className="w-4 h-4" />;
      default:
        return <History className="w-4 h-4" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'status_changed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'assessment_created':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'assessment_updated':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'officer_assigned':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getActionLabel = (actionType: string) => {
    switch (actionType) {
      case 'status_changed':
        return 'Status Changed';
      case 'assessment_created':
        return 'Assessment Created';
      case 'assessment_updated':
        return 'Assessment Updated';
      case 'assessment_modified':
        return 'Assessment Modified';
      case 'officer_assigned':
        return 'Officer Assigned';
      default:
        return actionType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return null;
    
    const statusColors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'passed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'failed': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'requires_clarification': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
    };

    return (
      <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
        {status.replace(/_/g, ' ')}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <div className="flex justify-center items-center">
            <Clock className="w-6 h-6 mr-2 animate-spin" />
            Loading audit trail...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <History className="w-5 h-5 mr-2" />
          Registry Audit Trail ({auditEntries.length})
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Complete history of all registry actions and changes for this application
        </p>
      </CardHeader>
      <CardContent>
        {auditEntries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No audit trail entries yet</p>
            <p className="text-xs mt-2">Actions will be logged here as they occur</p>
          </div>
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {auditEntries.map((entry, index) => {
                const isExpanded = expandedEntries.has(entry.id);
                const hasDetails = entry.assessment_notes || entry.feedback_provided || 
                                  entry.previous_status || entry.new_status;

                return (
                  <div key={entry.id}>
                    <div className="flex items-start gap-3">
                      {/* Timeline indicator */}
                      <div className="flex flex-col items-center">
                        <div className={`rounded-full p-2 ${getActionColor(entry.action_type)}`}>
                          {getActionIcon(entry.action_type)}
                        </div>
                        {index < auditEntries.length - 1 && (
                          <div className="w-px h-full min-h-[40px] bg-border mt-2" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={getActionColor(entry.action_type)}>
                                {getActionLabel(entry.action_type)}
                              </Badge>
                              {entry.previous_status && entry.new_status && (
                                <div className="flex items-center gap-1 text-sm">
                                  {getStatusBadge(entry.previous_status)}
                                  <span>→</span>
                                  {getStatusBadge(entry.new_status)}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                              <User className="w-3 h-3" />
                              <span className="font-medium">{entry.officer_name}</span>
                              <span className="text-xs">({entry.officer_email})</span>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{format(new Date(entry.created_at), 'PPpp')}</span>
                            </div>
                          </div>

                          {hasDetails && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpanded(entry.id)}
                              className="shrink-0"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                        </div>

                        {/* Expanded details */}
                        {isExpanded && hasDetails && (
                          <div className="mt-3 p-4 bg-muted/50 rounded-lg space-y-3 text-sm">
                            {entry.previous_outcome && entry.new_outcome && (
                              <div>
                                <span className="font-medium">Outcome Changed: </span>
                                <span className="text-muted-foreground">
                                  {entry.previous_outcome} → {entry.new_outcome}
                                </span>
                              </div>
                            )}
                            
                            {entry.assessment_notes && (
                              <div>
                                <span className="font-medium">Assessment Notes:</span>
                                <p className="mt-1 text-muted-foreground whitespace-pre-wrap">
                                  {entry.assessment_notes}
                                </p>
                              </div>
                            )}
                            
                            {entry.feedback_provided && (
                              <div>
                                <span className="font-medium">Feedback to Applicant:</span>
                                <p className="mt-1 text-muted-foreground whitespace-pre-wrap">
                                  {entry.feedback_provided}
                                </p>
                              </div>
                            )}

                            {entry.changes_made && Object.keys(entry.changes_made).length > 0 && (
                              <div>
                                <span className="font-medium">Changes Made:</span>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {Object.entries(entry.changes_made).map(([key, value]) => 
                                    value && (
                                      <Badge key={key} variant="outline" className="text-xs">
                                        {key.replace(/_/g, ' ')}
                                      </Badge>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {index < auditEntries.length - 1 && <Separator className="my-4" />}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
