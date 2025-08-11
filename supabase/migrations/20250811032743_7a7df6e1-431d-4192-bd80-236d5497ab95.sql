-- Create storage bucket for PIX receipts
INSERT INTO storage.buckets (id, name, public) VALUES ('pix-receipts', 'pix-receipts', false);

-- Create classes table
CREATE TABLE public.classes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create students table
CREATE TABLE public.students (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  class_id INTEGER REFERENCES public.classes(id),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create registrations table
CREATE TABLE public.registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id INTEGER REFERENCES public.classes(id),
  registration_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  present_students TEXT[] DEFAULT '{}',
  total_present INTEGER DEFAULT 0,
  visitors INTEGER DEFAULT 0,
  bibles INTEGER DEFAULT 0,
  magazines INTEGER DEFAULT 0,
  offering_cash DECIMAL(10,2) DEFAULT 0,
  offering_pix DECIMAL(10,2) DEFAULT 0,
  hymn TEXT,
  pix_receipt_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert initial classes data
INSERT INTO public.classes (id, name) VALUES
(1, '01. OVELHINHAS E CORDEIRINHOS DE CRISTO (2 a 5 anos)'),
(2, '02. SOLDADOS DE CRISTO (6 a 8 anos)'),
(3, '03. ESTRELA DE DAVI (9 a 11 anos)'),
(4, '04. LAEL (12 a 14 anos)'),
(5, '05. ÁGAPE (15 a 17 anos)'),
(6, '06. NOVA VIDA (Novos Convertidos)'),
(7, '07. EMANUEL (Jovens)'),
(8, '08. ESTER (irmãs)'),
(9, '09. LÍRIOS DOS VALES (irmãs)'),
(10, '10. VENCEDORAS PELA FÉ (irmãs)'),
(11, '11. ESPERANÇA (irmãs)'),
(12, '12. HERÓIS DA FÉ (irmãos)'),
(13, '13. DÉBORA (Pastora, Missionárias e Diaconisas)'),
(14, '14. MOISES (Diáconos)'),
(15, '15. ABRAÃO (Pastores, Evangelistas e Presbíteros)'),
(16, '16. PROFESSORES'),
(17, '17. CLASSE EXTRA - REGIONAL');

-- Insert sample students
INSERT INTO public.students (name, class_id) VALUES
('Ana Beatriz', 1),
('Lucas Gabriel', 1),
('Sofia Oliveira', 1),
('Davi Luiz', 2),
('Isabela Costa', 2),
('Mateus Pereira', 3),
('Júlia Martins', 3),
('Enzo Rodrigues', 3),
('Laura Almeida', 3),
('Gabriel Ferreira', 7),
('Beatriz Lima', 7),
('Thiago Souza', 7);

-- Enable Row Level Security
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is internal church system)
CREATE POLICY "Anyone can view classes" ON public.classes FOR SELECT USING (true);
CREATE POLICY "Anyone can view students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Anyone can view registrations" ON public.registrations FOR SELECT USING (true);
CREATE POLICY "Anyone can insert registrations" ON public.registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update registrations" ON public.registrations FOR UPDATE USING (true);

-- Storage policies for PIX receipts
CREATE POLICY "Anyone can upload PIX receipts" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'pix-receipts');

CREATE POLICY "Anyone can view PIX receipts" ON storage.objects 
FOR SELECT USING (bucket_id = 'pix-receipts');

CREATE POLICY "Anyone can delete PIX receipts" ON storage.objects 
FOR DELETE USING (bucket_id = 'pix-receipts');