-- Create bucket for appointment result photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('appointment-photos', 'appointment-photos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policy for upload
CREATE POLICY "Users can upload appointment photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'appointment-photos');

-- RLS policy for public viewing
CREATE POLICY "Anyone can view appointment photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'appointment-photos');

-- RLS policy for delete
CREATE POLICY "Users can delete appointment photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'appointment-photos');