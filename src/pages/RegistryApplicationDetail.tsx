import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, FileCheck, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { SimpleHeader } from '@/components/SimpleHeader';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PermitApplicationReviewForm } from '@/components/registry/PermitApplicationReviewForm';

export default function RegistryApplicationDetail() {
  return (
    <div className="min-h-screen bg-background">
      <SimpleHeader />
      <div className="container mx-auto p-6">
        <PermitApplicationReviewForm />
      </div>
    </div>
  );
}