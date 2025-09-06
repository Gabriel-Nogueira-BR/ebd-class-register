# Estrutura do Banco de Dados Supabase - EBD 2.0

## Informações do Projeto
- **Nome do Projeto**: EBD 2.0
- **Project ID**: dtejicadqatmwrqivrwv

## Tabelas

### 1. Tabela: `classes`
```sql
CREATE TABLE public.classes (
  id INTEGER NOT NULL DEFAULT nextval('classes_id_seq'::regclass) PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  name TEXT NOT NULL
);

-- Políticas RLS
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view classes" 
ON public.classes 
FOR SELECT 
USING (true);
```

### 2. Tabela: `registrations`
```sql
CREATE TABLE public.registrations (
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

-- Políticas RLS
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
```

### 3. Tabela: `students`
```sql
CREATE TABLE public.students (
  id INTEGER NOT NULL DEFAULT nextval('students_id_seq'::regclass) PRIMARY KEY,
  class_id INTEGER REFERENCES public.classes(id),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  birth_date DATE,
  address TEXT,
  phone TEXT,
  name TEXT NOT NULL
);

-- Políticas RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view students" 
ON public.students 
FOR SELECT 
USING (true);
```

## Storage Buckets

### Bucket: `pix-receipts`
- **Nome**: pix-receipts
- **Público**: Não

## Sequências (Sequences)

```sql
CREATE SEQUENCE classes_id_seq;
CREATE SEQUENCE students_id_seq;
```

## Notas Importantes para Migração

1. **Ordem de Criação**:
   - Primeiro criar as sequências
   - Depois criar a tabela `classes`
   - Em seguida `students` e `registrations` (pois têm FK para `classes`)

2. **RLS (Row Level Security)**:
   - Todas as tabelas têm RLS habilitado
   - As políticas atuais são muito permissivas (anyone can...)
   - Recomenda-se revisar as políticas após a migração

3. **Storage**:
   - Criar o bucket `pix-receipts` com acesso privado
   - Configurar políticas de acesso conforme necessário

4. **Dados Existentes**:
   - Este arquivo contém apenas a estrutura
   - Para migrar dados, será necessário exportar/importar separadamente

## Script de Migração Completo

```sql
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
```

## Como Usar Este Arquivo

1. **Na nova conta Supabase**:
   - Acesse o SQL Editor
   - Cole o script de migração completo
   - Execute o script

2. **Criar o Storage Bucket**:
   - Vá para Storage no painel do Supabase
   - Crie um novo bucket chamado `pix-receipts`
   - Configure como privado

3. **Conectar o Lovable**:
   - Use o nome do novo projeto para conectar
   - O Lovable atualizará automaticamente os arquivos de configuração

4. **Verificar**:
   - Teste se as tabelas foram criadas corretamente
   - Verifique se as políticas RLS estão ativas
   - Confirme se o bucket de storage está configurado