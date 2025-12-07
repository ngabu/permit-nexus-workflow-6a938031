-- Allow Managing Director to upload MD review documents
CREATE POLICY "Managing Director can upload MD review documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[2] = 'md-review'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND (
      profiles.staff_position = 'managing_director'
      OR profiles.user_type IN ('admin', 'super_admin')
    )
  )
);

-- Allow Managing Director to view all documents in the bucket
CREATE POLICY "Managing Director can view all documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND (
      profiles.staff_position = 'managing_director'
      OR profiles.user_type IN ('admin', 'super_admin')
    )
  )
);

-- Allow Managing Director to delete MD review documents
CREATE POLICY "Managing Director can delete MD review documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[2] = 'md-review'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND (
      profiles.staff_position = 'managing_director'
      OR profiles.user_type IN ('admin', 'super_admin')
    )
  )
);