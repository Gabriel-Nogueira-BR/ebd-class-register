-- classes
DROP POLICY IF EXISTS "Anyone can delete classes" ON public.classes;
DROP POLICY IF EXISTS "Anyone can insert classes" ON public.classes;
DROP POLICY IF EXISTS "Anyone can update classes" ON public.classes;
CREATE POLICY "Signed-in staff can insert classes" ON public.classes FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Signed-in staff can update classes" ON public.classes FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Signed-in staff can delete classes" ON public.classes FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- students
DROP POLICY IF EXISTS "Anyone can delete students" ON public.students;
DROP POLICY IF EXISTS "Anyone can insert students" ON public.students;
DROP POLICY IF EXISTS "Anyone can update students" ON public.students;
CREATE POLICY "Signed-in staff can insert students" ON public.students FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Signed-in staff can update students" ON public.students FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Signed-in staff can delete students" ON public.students FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- registrations
DROP POLICY IF EXISTS "Anyone can delete registrations" ON public.registrations;
DROP POLICY IF EXISTS "Anyone can update registrations" ON public.registrations;
CREATE POLICY "Signed-in staff can delete registrations" ON public.registrations FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Signed-in staff can update registrations" ON public.registrations FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Secretaries can update recent registrations" ON public.registrations FOR UPDATE TO anon
  USING (registration_date > now() - interval '2 days') WITH CHECK (registration_date > now() - interval '2 days');

-- student_change_requests
DROP POLICY IF EXISTS "Anyone can delete student change requests" ON public.student_change_requests;
DROP POLICY IF EXISTS "Anyone can update student change requests" ON public.student_change_requests;
DROP POLICY IF EXISTS "Anyone can insert student change requests" ON public.student_change_requests;
CREATE POLICY "Anyone can submit pending change requests" ON public.student_change_requests FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'pending' AND reviewed_at IS NULL);
CREATE POLICY "Signed-in staff can update change requests" ON public.student_change_requests FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Signed-in staff can delete change requests" ON public.student_change_requests FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- system_settings
DROP POLICY IF EXISTS "Enable update access for all users" ON public.system_settings;
DROP POLICY IF EXISTS "Allow authenticated users to update registration settings" ON public.system_settings;
DROP POLICY IF EXISTS "Allow ANY user to read settings" ON public.system_settings;
CREATE POLICY "Signed-in staff can update settings" ON public.system_settings FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- storage pix-receipts
DROP POLICY IF EXISTS "Anyone can update pix receipts" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload pix receipts" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads to pix-receipts" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete pix receipts" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to pix-receipts" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view pix receipts" ON storage.objects;
CREATE POLICY "Secretaries can upload pix receipts" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'pix-receipts');
CREATE POLICY "Staff can view pix receipts" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'pix-receipts' AND auth.uid() IS NOT NULL);
CREATE POLICY "Secretaries can view recent pix receipts" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'pix-receipts' AND created_at > now() - interval '2 days');
CREATE POLICY "Staff can delete pix receipts" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'pix-receipts' AND auth.uid() IS NOT NULL);
CREATE POLICY "Secretaries can delete recent pix receipts" ON storage.objects FOR DELETE TO anon USING (bucket_id = 'pix-receipts' AND created_at > now() - interval '2 days');