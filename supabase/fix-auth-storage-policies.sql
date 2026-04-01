-- Fix Storage Policies for Authenticated Users
-- Run this in Supabase SQL Editor to fix image upload issues

-- Drop existing storage policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;

-- Create new policies that work with NextAuth sessions

-- Policy 1: Public read access (everyone can view images)
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'Intandokazi Products');

-- Policy 2: Authenticated users can upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'Intandokazi Products' AND 
  auth.role() = 'authenticated'
);

-- Policy 3: Authenticated users can update (replace existing files)
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'Intandokazi Products' AND 
  auth.role() = 'authenticated'
);

-- Policy 4: Authenticated users can delete
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'Intandokazi Products' AND 
  auth.role() = 'authenticated'
);

-- Verify the policies
SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;
