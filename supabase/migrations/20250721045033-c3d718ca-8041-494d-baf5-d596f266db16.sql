-- Create security definer function to check if current user is public user
CREATE OR REPLACE FUNCTION public.is_public_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND user_type = 'public'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Update entities policies to restrict to public users only
DROP POLICY IF EXISTS "Users can create their own entities" ON public.entities;
DROP POLICY IF EXISTS "Users can update their own entities" ON public.entities;
DROP POLICY IF EXISTS "Users can delete their own entities" ON public.entities;
DROP POLICY IF EXISTS "Users can view their own entities" ON public.entities;

CREATE POLICY "Public users can create their own entities" 
ON public.entities 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND public.is_public_user());

CREATE POLICY "Public users can update their own entities" 
ON public.entities 
FOR UPDATE 
USING (auth.uid() = user_id AND public.is_public_user());

CREATE POLICY "Public users can delete their own entities" 
ON public.entities 
FOR DELETE 
USING (auth.uid() = user_id AND public.is_public_user());

CREATE POLICY "Public users can view their own entities" 
ON public.entities 
FOR SELECT 
USING (auth.uid() = user_id AND public.is_public_user());

-- Update permit_applications policies to restrict to public users only
DROP POLICY IF EXISTS "Users can create their own applications" ON public.permit_applications;
DROP POLICY IF EXISTS "Users can update their own applications" ON public.permit_applications;
DROP POLICY IF EXISTS "Users can delete their own applications" ON public.permit_applications;
DROP POLICY IF EXISTS "Users can view their own applications" ON public.permit_applications;

CREATE POLICY "Public users can create their own applications" 
ON public.permit_applications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND public.is_public_user());

CREATE POLICY "Public users can update their own applications" 
ON public.permit_applications 
FOR UPDATE 
USING (auth.uid() = user_id AND public.is_public_user());

CREATE POLICY "Public users can delete their own applications" 
ON public.permit_applications 
FOR DELETE 
USING (auth.uid() = user_id AND public.is_public_user());

CREATE POLICY "Public users can view their own applications" 
ON public.permit_applications 
FOR SELECT 
USING (auth.uid() = user_id AND public.is_public_user());

-- Update permit_activities policies to restrict to public users only
DROP POLICY IF EXISTS "Users can manage activities for their permits" ON public.permit_activities;
DROP POLICY IF EXISTS "Users can view permit activities for their permits" ON public.permit_activities;

CREATE POLICY "Public users can manage activities for their permits" 
ON public.permit_activities 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.permit_applications 
    WHERE permit_applications.id = permit_activities.permit_id 
    AND permit_applications.user_id = auth.uid()
  ) AND public.is_public_user()
);

-- Update documents policies to restrict to public users only
DROP POLICY IF EXISTS "Users can create their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;

CREATE POLICY "Public users can create their own documents" 
ON public.documents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND public.is_public_user());

CREATE POLICY "Public users can delete their own documents" 
ON public.documents 
FOR DELETE 
USING (auth.uid() = user_id AND public.is_public_user());

CREATE POLICY "Public users can view their own documents" 
ON public.documents 
FOR SELECT 
USING (auth.uid() = user_id AND public.is_public_user());

-- Update invoices policies to restrict to public users only
DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;

CREATE POLICY "Public users can view their own invoices" 
ON public.invoices 
FOR SELECT 
USING (auth.uid() = user_id AND public.is_public_user());

-- Update financial_transactions policies to restrict to public users only
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.financial_transactions;

CREATE POLICY "Public users can view their own transactions" 
ON public.financial_transactions 
FOR SELECT 
USING (auth.uid() = user_id AND public.is_public_user());

-- Update notifications policies to restrict to public users only
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;

CREATE POLICY "Public users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id AND public.is_public_user());

CREATE POLICY "Public users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id AND public.is_public_user());