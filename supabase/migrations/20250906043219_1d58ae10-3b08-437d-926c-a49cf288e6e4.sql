-- Criar sequências
CREATE SEQUENCE IF NOT EXISTS classes_id_seq;
CREATE SEQUENCE IF NOT EXISTS students_id_seq;

-- Criar tabela classes
CREATE TABLE IF NOT EXISTS public.classes (
  id INTEGER NOT NULL DEFAULT nextval('classes_id_seq'::regclass) PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  name TEXT NOT NULL
);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view classes" 
ON public.classes 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert classes" 
ON public.classes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update classes" 
ON public.classes 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete classes" 
ON public.classes 
FOR DELETE 
USING (true);

-- Criar tabela students
CREATE TABLE IF NOT EXISTS public.students (
  id INTEGER NOT NULL DEFAULT nextval('students_id_seq'::regclass) PRIMARY KEY,
  class_id INTEGER REFERENCES public.classes(id),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  birth_date DATE,
  address TEXT,
  phone TEXT,
  name TEXT NOT NULL
);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view students" 
ON public.students 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert students" 
ON public.students 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update students" 
ON public.students 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete students" 
ON public.students 
FOR DELETE 
USING (true);

-- Criar tabela registrations
CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_present INTEGER DEFAULT 0,
  visitors INTEGER DEFAULT 0,
  bibles INTEGER DEFAULT 0,
  magazines INTEGER DEFAULT 0,
  offering_cash NUMERIC DEFAULT 0,
  offering_pix NUMERIC DEFAULT 0,
  class_id INTEGER REFERENCES public.classes(id),
  registration_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  pix_receipt_urls TEXT[] DEFAULT '{}'::text[],
  present_students TEXT[] DEFAULT '{}'::text[],
  hymn TEXT
);

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view registrations" 
ON public.registrations 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert registrations" 
ON public.registrations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update registrations" 
ON public.registrations 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete registrations" 
ON public.registrations 
FOR DELETE 
USING (true);

-- Inserir as 17 classes
INSERT INTO public.classes (name) VALUES
  ('Berçário'),
  ('Maternal'),
  ('Jardim'),
  ('Primários'),
  ('Juniores'),
  ('Pré-Adolescentes'),
  ('Adolescentes'),
  ('Jovens'),
  ('Adultos I'),
  ('Adultos II'),
  ('Adultos III'),
  ('Senhoras'),
  ('Varões'),
  ('Novos Convertidos'),
  ('Discipulado'),
  ('Escola de Líderes'),
  ('Classe Especial');

-- Inserir alguns alunos fictícios de exemplo
INSERT INTO public.students (name, class_id, birth_date, phone, address, active) VALUES
  ('Maria Silva', 1, '2023-05-15', '(11) 98765-4321', 'Rua das Flores, 123', true),
  ('João Santos', 1, '2023-08-20', '(11) 91234-5678', 'Av. Principal, 456', true),
  ('Ana Oliveira', 2, '2021-03-10', '(11) 94567-8901', 'Rua dos Lírios, 789', true),
  ('Pedro Costa', 3, '2020-11-25', '(11) 92345-6789', 'Alameda das Rosas, 321', true),
  ('Lucas Ferreira', 4, '2018-07-12', '(11) 93456-7890', 'Praça Central, 654', true),
  ('Julia Rodrigues', 5, '2015-02-28', '(11) 95678-9012', 'Rua das Palmeiras, 987', true),
  ('Gabriel Almeida', 6, '2013-09-05', '(11) 96789-0123', 'Av. dos Ipês, 147', true),
  ('Beatriz Lima', 7, '2010-12-18', '(11) 97890-1234', 'Rua do Sol, 258', true),
  ('Matheus Souza', 8, '2005-04-22', '(11) 98901-2345', 'Alameda Lua, 369', true),
  ('Sofia Pereira', 9, '1985-06-30', '(11) 99012-3456', 'Praça das Águas, 741', true),
  ('Carlos Mendes', 10, '1975-01-15', '(11) 90123-4567', 'Rua do Comércio, 852', true),
  ('Fernanda Gomes', 11, '1968-08-08', '(11) 91234-6789', 'Av. da Liberdade, 963', true),
  ('Roberto Martins', 12, '1960-03-25', '(11) 92345-7890', 'Rua da Paz, 159', true),
  ('Patricia Barbosa', 12, '1955-11-11', '(11) 93456-8901', 'Alameda Verde, 753', true),
  ('José Ribeiro', 13, '1950-07-07', '(11) 94567-9012', 'Praça da Fé, 357', true),
  ('Amanda Dias', 14, '1995-09-09', '(11) 95678-0123', 'Rua Nova, 951', true),
  ('Thiago Nunes', 15, '1992-12-31', '(11) 96789-1234', 'Av. do Trabalho, 456', true),
  ('Camila Freitas', 16, '1988-05-05', '(11) 97890-2345', 'Rua da Esperança, 789', true),
  ('Daniel Carvalho', 17, '2008-10-10', '(11) 98901-3456', 'Alameda Azul, 321', true);

-- Inserir alguns registros de teste
INSERT INTO public.registrations (
  class_id, 
  total_present, 
  visitors, 
  bibles, 
  magazines, 
  offering_cash, 
  offering_pix, 
  hymn,
  registration_date,
  present_students
) VALUES
  (1, 2, 1, 2, 3, 15.50, 0, 'Hino 245', NOW() - INTERVAL '7 days', ARRAY['Maria Silva', 'João Santos']),
  (2, 1, 0, 1, 1, 10.00, 5.00, 'Hino 123', NOW() - INTERVAL '7 days', ARRAY['Ana Oliveira']),
  (8, 1, 2, 3, 3, 50.00, 25.00, 'Hino 456', NOW() - INTERVAL '7 days', ARRAY['Matheus Souza']),
  (9, 1, 0, 1, 1, 20.00, 30.00, 'Hino 789', NOW() - INTERVAL '14 days', ARRAY['Sofia Pereira']),
  (13, 1, 1, 2, 2, 100.00, 50.00, 'Hino 321', NOW() - INTERVAL '14 days', ARRAY['José Ribeiro']);

-- Criar função para atualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;