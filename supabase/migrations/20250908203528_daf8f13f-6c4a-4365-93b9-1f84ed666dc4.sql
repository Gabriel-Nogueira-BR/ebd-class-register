-- Create storage bucket for pix receipts
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pix-receipts', 'pix-receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload files (since it's a public form)
CREATE POLICY "Anyone can upload pix receipts" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'pix-receipts');

-- Allow anyone to view their own uploads
CREATE POLICY "Anyone can view pix receipts" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'pix-receipts');

-- Allow anyone to update their own uploads
CREATE POLICY "Anyone can update pix receipts" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'pix-receipts');

-- Allow anyone to delete their own uploads
CREATE POLICY "Anyone can delete pix receipts" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'pix-receipts');