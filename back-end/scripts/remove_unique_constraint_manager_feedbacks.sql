-- ============================================
-- Remover constraint UNIQUE(operator_id, month, year) da tabela manager_feedbacks
-- ============================================
-- Este script remove a constraint que impede criar múltiplos feedbacks
-- para o mesmo operador no mesmo mês/ano
-- Execute este script no SQL Editor do Supabase Dashboard

-- Remover constraint UNIQUE(operator_id, month, year) se existir
DO $$ 
BEGIN
  -- Tentar remover a constraint pelo nome padrão
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'manager_feedbacks_operator_id_month_year_key'
  ) THEN
    ALTER TABLE manager_feedbacks DROP CONSTRAINT manager_feedbacks_operator_id_month_year_key;
    RAISE NOTICE '✅ Constraint manager_feedbacks_operator_id_month_year_key removida';
  ELSIF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'manager_feedbacks'::regclass
    AND contype = 'u'
    AND pg_get_constraintdef(oid) LIKE '%operator_id%month%year%'
  ) THEN
    -- Se o nome for diferente, buscar e remover
    DECLARE
      constraint_name TEXT;
    BEGIN
      SELECT conname INTO constraint_name
      FROM pg_constraint
      WHERE conrelid = 'manager_feedbacks'::regclass
      AND contype = 'u'
      AND pg_get_constraintdef(oid) LIKE '%operator_id%month%year%'
      LIMIT 1;
      
      IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE manager_feedbacks DROP CONSTRAINT %I', constraint_name);
        RAISE NOTICE '✅ Constraint % removida', constraint_name;
      END IF;
    END;
  ELSE
    RAISE NOTICE '⚠️ Constraint UNIQUE(operator_id, month, year) não encontrada';
  END IF;
END $$;

-- Listar todas as constraints únicas da tabela para verificação
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'manager_feedbacks'::regclass
AND contype = 'u'
ORDER BY conname;

-- Verificar se a constraint foi removida
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'manager_feedbacks'::regclass
    AND contype = 'u'
    AND pg_get_constraintdef(oid) LIKE '%operator_id%month%year%'
  ) THEN
    RAISE NOTICE '✅ Constraint UNIQUE(operator_id, month, year) removida com sucesso!';
    RAISE NOTICE '✅ Agora é possível criar múltiplos feedbacks para o mesmo operador/mês/ano';
  ELSE
    RAISE WARNING '⚠️ Ainda existe uma constraint UNIQUE envolvendo operator_id, month, year';
  END IF;
END $$;

