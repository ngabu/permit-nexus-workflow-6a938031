import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SimpleHeader } from "@/components/SimpleHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarDays, MapPin, Clock, FileText, Plus, Edit } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { ComprehensiveDraftEditor } from "@/components/public/ComprehensiveDraftEditor";
import { MyApplicationsTabs } from "@/components/public/MyApplicationsTabs";

type Permit = {
  id: string;
  title: string;
  permit_type: string;
  description?: string;
  status: string;
  permit_number?: string;
  application_date?: string;
  approval_date?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  entity_id?: string;
  entities?: {
    name: string;
    entity_type: string;
  };
};

const Applications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Permit[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDraft, setEditingDraft] = useState<Permit | null>(null);

  useEffect(() => {
    fetchApplications();
  }, [user]);

  const fetchApplications = async () => {
    if (!user) return;

    try {
      const { data, error } = await (supabase as any)
        .from('permit_applications')
        .select(`
          *,
          entities (
            name,
            entity_type
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under_assessment': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'draft': return 'Application is being prepared and has not been submitted yet.';
      case 'submitted': return 'Your application has been received and is pending initial review.';
      case 'under_assessment': return 'Your application is currently being assessed by CEPA staff.';
      case 'approved': return 'Congratulations! Your permit application has been approved.';
      case 'rejected': return 'Unfortunately, your application was not approved. Check rejection reason.';
      case 'completed': return 'Your permit has been issued and the application process is complete.';
      default: return 'Status update pending.';
    }
  };

  const handleEditDraft = (application: Permit) => {
    setEditingDraft(application);
  };

  const handleDraftSaved = () => {
    setEditingDraft(null);
    fetchApplications();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SimpleHeader />
        <main className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading applications...</div>
          </div>
        </main>
      </div>
    );
  }

  if (editingDraft) {
    return (
      <div className="min-h-screen bg-background">
        <SimpleHeader />
        <main className="p-6">
          <ComprehensiveDraftEditor
            permitId={editingDraft.id}
            onSave={handleDraftSaved}
            onCancel={() => setEditingDraft(null)}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SimpleHeader />
      <main className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-forest-800">My Applications</h1>
              <p className="text-forest-600 mt-1">Manage your permit applications and activities</p>
            </div>
          </div>

          {/* Applications Tabs Component */}
          <MyApplicationsTabs />
        </div>
      </main>
    </div>
  );
};

export default Applications;
