-- Allow public users to view base document requirements for their applications
DROP POLICY IF EXISTS "Admin can view base document requirements" ON public.base_document_requirements;

CREATE POLICY "Authenticated users can view base document requirements" 
ON public.base_document_requirements 
FOR SELECT 
USING (auth.uid() IS NOT NULL);