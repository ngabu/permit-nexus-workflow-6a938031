-- Create security definer functions to check user roles (avoids infinite recursion)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND user_type = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND user_type = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin_or_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND user_type IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Drop existing problematic policies on profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create new comprehensive policies for profiles table
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Admin can view all profiles
CREATE POLICY "Admin can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.is_admin_or_super_admin());

-- Admin can create new user profiles
CREATE POLICY "Admin can create user profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (public.is_admin_or_super_admin());

-- Admin can update other users (change user_type, staff_units, staff_position, suspend)
CREATE POLICY "Admin can update user profiles" 
ON public.profiles 
FOR UPDATE 
USING (
  public.is_admin_or_super_admin() 
  OR auth.uid() = user_id
);

-- Super admin can delete profiles, admin cannot
CREATE POLICY "Super admin can delete profiles" 
ON public.profiles 
FOR DELETE 
USING (public.is_super_admin());

-- Update permit_applications policies - Admin CANNOT apply for permits or manage permit status
DROP POLICY IF EXISTS "Users can view their own applications" ON public.permit_applications;
DROP POLICY IF EXISTS "Users can create their own applications" ON public.permit_applications;
DROP POLICY IF EXISTS "Users can update their own applications" ON public.permit_applications;
DROP POLICY IF EXISTS "Users can delete their own applications" ON public.permit_applications;

-- Regular users can manage their own applications
CREATE POLICY "Users can view their own applications" 
ON public.permit_applications 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR public.is_super_admin()
);

CREATE POLICY "Users can create their own applications" 
ON public.permit_applications 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND user_type = 'admin'
  )
);

CREATE POLICY "Users can update their own applications" 
ON public.permit_applications 
FOR UPDATE 
USING (
  (auth.uid() = user_id AND NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND user_type = 'admin'
  ))
  OR public.is_super_admin()
);

CREATE POLICY "Users can delete their own applications" 
ON public.permit_applications 
FOR DELETE 
USING (
  (auth.uid() = user_id AND NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND user_type = 'admin'
  ))
  OR public.is_super_admin()
);

-- Admin can READ all applications but not modify
CREATE POLICY "Admin can view all applications" 
ON public.permit_applications 
FOR SELECT 
USING (public.is_admin_or_super_admin());

-- Update entities policies - Admin cannot create entities (related to permit applications)
DROP POLICY IF EXISTS "Users can view their own entities" ON public.entities;
DROP POLICY IF EXISTS "Users can create their own entities" ON public.entities;
DROP POLICY IF EXISTS "Users can update their own entities" ON public.entities;
DROP POLICY IF EXISTS "Users can delete their own entities" ON public.entities;

CREATE POLICY "Users can view their own entities" 
ON public.entities 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR public.is_admin_or_super_admin()
);

CREATE POLICY "Users can create their own entities" 
ON public.entities 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND user_type = 'admin'
  )
);

CREATE POLICY "Users can update their own entities" 
ON public.entities 
FOR UPDATE 
USING (
  (auth.uid() = user_id AND NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND user_type = 'admin'
  ))
  OR public.is_super_admin()
);

CREATE POLICY "Users can delete their own entities" 
ON public.entities 
FOR DELETE 
USING (
  (auth.uid() = user_id AND NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND user_type = 'admin'
  ))
  OR public.is_super_admin()
);

-- Update documents policies - Admin cannot upload documents (related to permit applications)
DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can create their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.documents;

CREATE POLICY "Users can view their own documents" 
ON public.documents 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR public.is_admin_or_super_admin()
);

CREATE POLICY "Users can create their own documents" 
ON public.documents 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND user_type = 'admin'
  )
);

CREATE POLICY "Users can delete their own documents" 
ON public.documents 
FOR DELETE 
USING (
  (auth.uid() = user_id AND NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND user_type = 'admin'
  ))
  OR public.is_super_admin()
);

-- Update financial_transactions policies - Admin can READ but not modify status
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.financial_transactions;

CREATE POLICY "Users can view their own transactions" 
ON public.financial_transactions 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR public.is_admin_or_super_admin()
);

-- Only super_admin can modify financial transactions
CREATE POLICY "Super admin can manage financial transactions" 
ON public.financial_transactions 
FOR ALL 
USING (public.is_super_admin());

-- Update invoices policies - Admin can READ but not modify
DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;

CREATE POLICY "Users can view their own invoices" 
ON public.invoices 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR public.is_admin_or_super_admin()
);

-- Only super_admin can modify invoices
CREATE POLICY "Super admin can manage invoices" 
ON public.invoices 
FOR ALL 
USING (public.is_super_admin());

-- Update notifications policies - Admin can READ all notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;

CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR public.is_admin_or_super_admin()
);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (
  auth.uid() = user_id 
  OR public.is_super_admin()
);

-- Super admin can create notifications for any user
CREATE POLICY "Super admin can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (public.is_super_admin());

-- Admin and super admin can view audit logs and system metrics
CREATE POLICY "Admin can view audit logs" ON public.audit_logs
FOR SELECT USING (public.is_admin_or_super_admin());

CREATE POLICY "Admin can view system metrics" ON public.system_metrics
FOR SELECT USING (public.is_admin_or_super_admin());

-- Only super admin can create audit logs and system metrics
CREATE POLICY "Super admin can create audit logs" ON public.audit_logs
FOR INSERT WITH CHECK (public.is_super_admin());

CREATE POLICY "Super admin can create system metrics" ON public.system_metrics
FOR INSERT WITH CHECK (public.is_super_admin());