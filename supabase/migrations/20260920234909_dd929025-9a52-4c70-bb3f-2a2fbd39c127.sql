CREATE TABLE public.student_change_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_type text NOT NULL CHECK (request_type IN ('add','remove')),
  class_id integer REFERENCES public.classes(id),
  student_id integer REFERENCES public.students(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  birth_date date,
  phone text,
  address text,
  reason text,
  requested_by text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_change_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_change_requests TO authenticated;
GRANT ALL ON public.student_change_requests TO service_role;

ALTER TABLE public.student_change_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view student change requests" ON public.student_change_requests FOR SELECT USING (true);
CREATE POLICY "Anyone can insert student change requests" ON public.student_change_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update student change requests" ON public.student_change_requests FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete student change requests" ON public.student_change_requests FOR DELETE USING (true);

CREATE TRIGGER update_student_change_requests_updated_at
BEFORE UPDATE ON public.student_change_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.student_change_requests REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_change_requests;