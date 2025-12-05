-- Allow registry staff to upload document templates and guides
CREATE POLICY "Registry staff can upload document templates"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'documents' 
  AND (
    (storage.foldername(name))[1] IN ('templates', 'guides')
  )
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.staff_unit = 'registry'
    AND profiles.user_type = 'staff'
  )
);

-- Allow registry staff to delete document templates and guides
CREATE POLICY "Registry staff can delete document templates"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'documents' 
  AND (
    (storage.foldername(name))[1] IN ('templates', 'guides')
  )
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.staff_unit = 'registry'
    AND profiles.user_type = 'staff'
  )
);

-- Allow anyone authenticated to download templates and guides (they are public documents)
CREATE POLICY "Anyone can download document templates and guides"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] IN ('templates', 'guides')
  AND auth.uid() IS NOT NULL
);