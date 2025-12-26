-- ============================================
-- Adicionar coluna feedback_code na tabela manager_feedbacks
-- ============================================
-- Este script adiciona uma coluna para armazenar código único do feedback (ex: FB00001)
-- Execute este script no SQL Editor do Supabase Dashboard

-- Adicionar coluna feedback_code se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'manager_feedbacks' AND column_name = 'feedback_code'
  ) THEN
    ALTER TABLE manager_feedbacks ADD COLUMN feedback_code VARCHAR(20) UNIQUE;
    RAISE NOTICE '✅ Coluna feedback_code adicionada';
  ELSE
    RAISE NOTICE '⚠️ Coluna feedback_code já existe';
  END IF;
END $$;

-- Criar índice para feedback_code
CREATE INDEX IF NOT EXISTS idx_manager_feedbacks_feedback_code ON manager_feedbacks(feedback_code);

-- Função para gerar próximo código disponível
CREATE OR REPLACE FUNCTION generate_next_feedback_code()
RETURNS VARCHAR(20) AS $$
DECLARE
  next_num INTEGER;
  code VARCHAR(20);
BEGIN
  -- Buscar o maior número existente
  SELECT COALESCE(MAX(CAST(SUBSTRING(feedback_code FROM 3) AS INTEGER)), 0) + 1
  INTO next_num
  FROM manager_feedbacks
  WHERE feedback_code IS NOT NULL AND feedback_code ~ '^FB[0-9]+$';
  
  -- Formatar como FB00001, FB00002, etc. (5 dígitos)
  code := 'FB' || LPAD(next_num::TEXT, 5, '0');
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Função para gerar código automaticamente ao inserir novo feedback
CREATE OR REPLACE FUNCTION set_feedback_code()
RETURNS TRIGGER AS $$
BEGIN
  -- Se feedback_code não foi fornecido, gerar automaticamente
  -- Durante UPDATE, preservar o código existente se já houver
  IF NEW.feedback_code IS NULL OR NEW.feedback_code = '' THEN
    -- Se for UPDATE e já existir código, preservar
    IF TG_OP = 'UPDATE' AND OLD.feedback_code IS NOT NULL AND OLD.feedback_code != '' THEN
      NEW.feedback_code := OLD.feedback_code;
    ELSE
      -- Gerar novo código apenas em INSERT ou se não houver código anterior
      NEW.feedback_code := generate_next_feedback_code();
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para gerar código automaticamente (INSERT e UPDATE)
DROP TRIGGER IF EXISTS trigger_set_feedback_code ON manager_feedbacks;
CREATE TRIGGER trigger_set_feedback_code
  BEFORE INSERT OR UPDATE ON manager_feedbacks
  FOR EACH ROW
  EXECUTE FUNCTION set_feedback_code();

-- Comentário na coluna
COMMENT ON COLUMN manager_feedbacks.feedback_code IS 'Código único do feedback (ex: FB00001)';

