-- Adicionar campos de observações para secretários de classe e EBD
ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS class_notes TEXT,
ADD COLUMN IF NOT EXISTS ebd_notes TEXT;

-- Adicionar comentários para documentação
COMMENT ON COLUMN public.registrations.class_notes IS 'Observações dos secretários de classe';
COMMENT ON COLUMN public.registrations.ebd_notes IS 'Observações dos secretários da EBD';

-- Atualizar setting de bloqueio para usar banco de dados
INSERT INTO public.system_settings (key, value, description) 
VALUES ('allow_registrations', 'true'::jsonb, 'Controla se os secretários de classe podem enviar registros')
ON CONFLICT (key) DO UPDATE 
SET value = EXCLUDED.value;