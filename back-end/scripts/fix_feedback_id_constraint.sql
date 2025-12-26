-- ============================================
-- Script para corrigir constraint UNIQUE(feedback_id)
-- ============================================
-- Execute este script se estiver recebendo erro ao salvar confirmações
-- Erro: "não existe nenhuma restrição única ou de exclusão que corresponda à especificação ON CONFLICT"

-- Verificar se a constraint existe
DO $$
DECLARE
  constraint_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'operator_confirmations_feedback_id_key'
  ) INTO constraint_exists;
  
  IF NOT constraint_exists THEN
    -- Criar constraint UNIQUE(feedback_id)
    ALTER TABLE operator_confirmations 
    ADD CONSTRAINT operator_confirmations_feedback_id_key UNIQUE(feedback_id);
    
    RAISE NOTICE '✅ Constraint UNIQUE(feedback_id) criada';
  ELSE
    RAISE NOTICE '✅ Constraint UNIQUE(feedback_id) já existe';
  END IF;
END $$;

-- Verificar se a coluna feedback_id existe
DO $$
DECLARE
  column_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'operator_confirmations' 
    AND column_name = 'feedback_id'
  ) INTO column_exists;
  
  IF NOT column_exists THEN
    RAISE WARNING '⚠️ Coluna feedback_id não existe! Execute primeiro modify_operator_confirmations_table.sql';
  ELSE
    RAISE NOTICE '✅ Coluna feedback_id existe';
  END IF;
END $$;

-- Listar todas as constraints únicas da tabela
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'operator_confirmations'::regclass
AND contype = 'u';

