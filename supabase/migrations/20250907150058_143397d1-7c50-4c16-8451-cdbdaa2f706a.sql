-- Atualizar o valor padrão para permitir registros
UPDATE system_settings 
SET value = true,
    updated_at = now()
WHERE key = 'allow_registrations';