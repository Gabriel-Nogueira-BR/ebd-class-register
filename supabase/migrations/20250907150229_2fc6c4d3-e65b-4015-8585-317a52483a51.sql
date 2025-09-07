-- Atualizar o valor para permitir registros (formato JSONB)
UPDATE system_settings 
SET value = to_jsonb(true),
    updated_at = now()
WHERE key = 'allow_registrations';