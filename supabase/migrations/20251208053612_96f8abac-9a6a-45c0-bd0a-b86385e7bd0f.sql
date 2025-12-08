-- Create permit_amalgamations table
CREATE TABLE public.permit_amalgamations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  permit_ids UUID[] NOT NULL,
  amalgamation_reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create permit_amendments table  
CREATE TABLE public.permit_amendments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  permit_id UUID NOT NULL REFERENCES public.permit_applications(id),
  amendment_type TEXT NOT NULL,
  amendment_reason TEXT,
  proposed_changes JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create permit_renewals table
CREATE TABLE public.permit_renewals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  permit_id UUID NOT NULL REFERENCES public.permit_applications(id),
  renewal_period_years INTEGER DEFAULT 1,
  renewal_reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create permit_surrenders table
CREATE TABLE public.permit_surrenders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  permit_id UUID NOT NULL REFERENCES public.permit_applications(id),
  surrender_reason TEXT NOT NULL,
  effective_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create permit_transfers table
CREATE TABLE public.permit_transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  permit_id UUID NOT NULL REFERENCES public.permit_applications(id),
  transferee_entity_id UUID REFERENCES public.entities(id),
  transfer_reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.permit_amalgamations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permit_amendments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permit_renewals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permit_surrenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permit_transfers ENABLE ROW LEVEL SECURITY;

-- RLS policies for permit_amalgamations
CREATE POLICY "Users can view their own amalgamations" ON public.permit_amalgamations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own amalgamations" ON public.permit_amalgamations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Staff can view all amalgamations" ON public.permit_amalgamations
  FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND user_type = 'staff'));

-- RLS policies for permit_amendments
CREATE POLICY "Users can view their own amendments" ON public.permit_amendments
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own amendments" ON public.permit_amendments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Staff can view all amendments" ON public.permit_amendments
  FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND user_type = 'staff'));

-- RLS policies for permit_renewals
CREATE POLICY "Users can view their own renewals" ON public.permit_renewals
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own renewals" ON public.permit_renewals
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Staff can view all renewals" ON public.permit_renewals
  FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND user_type = 'staff'));

-- RLS policies for permit_surrenders
CREATE POLICY "Users can view their own surrenders" ON public.permit_surrenders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own surrenders" ON public.permit_surrenders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Staff can view all surrenders" ON public.permit_surrenders
  FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND user_type = 'staff'));

-- RLS policies for permit_transfers
CREATE POLICY "Users can view their own transfers" ON public.permit_transfers
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own transfers" ON public.permit_transfers
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Staff can view all transfers" ON public.permit_transfers
  FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND user_type = 'staff'));

-- Create indexes for performance
CREATE INDEX idx_permit_amalgamations_user_id ON public.permit_amalgamations(user_id);
CREATE INDEX idx_permit_amalgamations_status ON public.permit_amalgamations(status);
CREATE INDEX idx_permit_amendments_permit_id ON public.permit_amendments(permit_id);
CREATE INDEX idx_permit_amendments_status ON public.permit_amendments(status);
CREATE INDEX idx_permit_renewals_permit_id ON public.permit_renewals(permit_id);
CREATE INDEX idx_permit_renewals_status ON public.permit_renewals(status);
CREATE INDEX idx_permit_surrenders_permit_id ON public.permit_surrenders(permit_id);
CREATE INDEX idx_permit_surrenders_status ON public.permit_surrenders(status);
CREATE INDEX idx_permit_transfers_permit_id ON public.permit_transfers(permit_id);
CREATE INDEX idx_permit_transfers_status ON public.permit_transfers(status);

-- Add updated_at triggers
CREATE TRIGGER update_permit_amalgamations_updated_at
  BEFORE UPDATE ON public.permit_amalgamations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_permit_amendments_updated_at
  BEFORE UPDATE ON public.permit_amendments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_permit_renewals_updated_at
  BEFORE UPDATE ON public.permit_renewals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_permit_surrenders_updated_at
  BEFORE UPDATE ON public.permit_surrenders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_permit_transfers_updated_at
  BEFORE UPDATE ON public.permit_transfers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();