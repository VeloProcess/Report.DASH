-- ============================================
-- Modificar tabela operator_confirmations para usar feedback_id
-- ============================================
-- Este script modifica a tabela para vincular confirmações diretamente ao feedback_id
-- Execute este script no SQL Editor do Supabase Dashboard

-- Adicionar coluna feedback_id se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'operator_confirmations' AND column_name = 'feedback_id'
  ) THEN
    ALTER TABLE operator_confirmations ADD COLUMN feedback_id INTEGER;
    RAISE NOTICE '✅ Coluna feedback_id adicionada';
  ELSE
    RAISE NOTICE '⚠️ Coluna feedback_id já existe';
  END IF;
END $$;

-- Remover constraint UNIQUE(email, month, year) se existir
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'operator_confirmations_email_month_year_key'
  ) THEN
    ALTER TABLE operator_confirmations DROP CONSTRAINT operator_confirmations_email_month_year_key;
    RAISE NOTICE '✅ Constraint UNIQUE(email, month, year) removida';
  ELSE
    RAISE NOTICE '⚠️ Constraint UNIQUE(email, month, year) não encontrada';
  END IF;
END $$;

-- Adicionar constraint UNIQUE(feedback_id) - uma confirmação por feedback
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'operator_confirmations_feedback_id_key'
  ) THEN
    ALTER TABLE operator_confirmations ADD CONSTRAINT operator_confirmations_feedback_id_key UNIQUE(feedback_id);
    RAISE NOTICE '✅ Constraint UNIQUE(feedback_id) adicionada';
  ELSE
    RAISE NOTICE '⚠️ Constraint UNIQUE(feedback_id) já existe';
  END IF;
END $$;

-- Adicionar foreign key para manager_feedbacks (opcional, pode causar problemas se houver dados órfãos)
-- Comentado por enquanto para evitar erros durante migração
-- ALTER TABLE operator_confirmations 
--   ADD CONSTRAINT fk_operator_confirmations_feedback_id 
--   FOREIGN KEY (feedback_id) REFERENCES manager_feedbacks(id) ON DELETE CASCADE;

-- Criar índice para feedback_id
CREATE INDEX IF NOT EXISTS idx_operator_confirmations_feedback_id ON operator_confirmations(feedback_id);

-- Atualizar RLS policies para incluir feedback_id
-- Primeiro, desabilitar RLS temporariamente para permitir migração
ALTER TABLE operator_confirmations DISABLE ROW LEVEL SECURITY;

-- Recriar policies considerando feedback_id
DROP POLICY IF EXISTS "Users can only view their own confirmations" ON operator_confirmations;
CREATE POLICY "Users can only view their own confirmations"
  ON operator_confirmations FOR SELECT
  USING (auth.jwt() ->> 'email' = email);

DROP POLICY IF EXISTS "Users can only insert their own confirmations" ON operator_confirmations;
CREATE POLICY "Users can only insert their own confirmations"
  ON operator_confirmations FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = email);

DROP POLICY IF EXISTS "Users can only update their own confirmations" ON operator_confirmations;
CREATE POLICY "Users can only update their own confirmations"
  ON operator_confirmations FOR UPDATE
  USING (auth.jwt() ->> 'email' = email);

-- Reabilitar RLS
ALTER TABLE operator_confirmations ENABLE ROW LEVEL SECURITY;

-- Comentário na coluna
COMMENT ON COLUMN operator_confirmations.feedback_id IS 'ID do feedback ao qual esta confirmação está vinculada';

