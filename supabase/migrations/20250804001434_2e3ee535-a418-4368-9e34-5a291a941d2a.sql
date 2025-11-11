-- Ensure documents bucket exists and is properly configured
INSERT INTO storage.buckets (id, name, public) 
VALUES ('permit-documents', 'permit-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create policies for document viewing by registry staff and public users for their own documents
CREATE POLICY "Registry staff can view all permit documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'permit-documents' AND 
  (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND staff_unit = 'registry' 
      AND user_type = 'staff'
    )
    OR 
    EXISTS (
      SELECT 1 FROM permit_applications pa
      WHERE pa.user_id = auth.uid()
      AND storage.foldername(name)[1] = pa.id::text
    )
  )
);

CREATE POLICY "Registry staff and document owners can download permit documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'permit-documents' AND 
  (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND staff_unit = 'registry' 
      AND user_type = 'staff'
    )
    OR 
    EXISTS (
      SELECT 1 FROM permit_applications pa
      WHERE pa.user_id = auth.uid()
      AND storage.foldername(name)[1] = pa.id::text
    )
  )
);

-- Update existing documents bucket policy for backward compatibility
CREATE POLICY "Registry staff can view all documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'documents' AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND staff_unit = 'registry' 
    AND user_type = 'staff'
  )
);