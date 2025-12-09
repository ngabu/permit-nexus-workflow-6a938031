-- Allow compliance staff to upload inspection reports
CREATE POLICY "Compliance staff can upload inspection reports"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = 'inspection-reports'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.staff_unit = 'compliance'
    AND profiles.user_type = 'staff'
  )
);

-- Allow compliance staff to view inspection reports
CREATE POLICY "Compliance staff can view inspection reports"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = 'inspection-reports'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.staff_unit = 'compliance'
    AND profiles.user_type = 'staff'
  )
);

-- Allow compliance staff to update inspection reports
CREATE POLICY "Compliance staff can update inspection reports"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = 'inspection-reports'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.staff_unit = 'compliance'
    AND profiles.user_type = 'staff'
  )
);

-- Allow compliance staff to delete inspection reports
CREATE POLICY "Compliance staff can delete inspection reports"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = 'inspection-reports'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.staff_unit = 'compliance'
    AND profiles.user_type = 'staff'
  )
);