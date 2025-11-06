-- Update RLS policy to allow all authenticated users to view their own documents
DROP POLICY IF EXISTS "Public users can view their own documents" ON public.documents;

CREATE POLICY "Authenticated users can view their own documents" 
ON public.documents 
FOR SELECT 
USING (auth.uid() = user_id);