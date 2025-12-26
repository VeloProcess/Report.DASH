-- ============================================
-- Script de Migração: Gerar códigos para feedbacks existentes
-- ============================================
-- Este script:
-- 1. Gera códigos sequenciais (FB00001, FB00002, etc.) para feedbacks existentes sem código
-- 2. Exclui todas as confirmações antigas (que não têm feedback_id)
-- Execute este script no SQL Editor do Supabase Dashboard

-- Passo 1: Gerar códigos para feedbacks existentes que não têm código
DO $$
DECLARE
  feedback_record RECORD;
  current_num INTEGER := 1;
  new_code VARCHAR(20);
BEGIN
  -- Buscar o maior número existente
  SELECT COALESCE(MAX(CAST(SUBSTRING(feedback_code FROM 3) AS INTEGER)), 0)
  INTO current_num
  FROM manager_feedbacks
  WHERE feedback_code IS NOT NULL AND feedback_code ~ '^FB[0-9]+$';
  
  current_num := current_num + 1;
  
  -- Gerar códigos para feedbacks sem código, ordenados por id (mais antigos primeiro)
  FOR feedback_record IN 
    SELECT id FROM manager_feedbacks 
    WHERE feedback_code IS NULL OR feedback_code = ''
    ORDER BY id ASC
  LOOP
    new_code := 'FB' || LPAD(current_num::TEXT, 5, '0');
    
    UPDATE manager_feedbacks
    SET feedback_code = new_code
    WHERE id = feedback_record.id;
    
    RAISE NOTICE '✅ Feedback ID % recebeu código %', feedback_record.id, new_code;
    
    current_num := current_num + 1;
  END LOOP;
  
  RAISE NOTICE '✅ Migração de códigos concluída';
END $$;

-- Passo 2: Excluir todas as confirmações antigas (que não têm feedback_id)
-- Isso garante que apenas confirmações vinculadas a feedbacks específicos existam
-- Verificar se a coluna feedback_id existe antes de tentar excluir
DO $$
DECLARE
  column_exists BOOLEAN;
  deleted_count INTEGER;
BEGIN
  -- Verificar se a coluna feedback_id existe
  SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'operator_confirmations' 
    AND column_name = 'feedback_id'
  ) INTO column_exists;
  
  IF column_exists THEN
    -- Excluir confirmações antigas que não têm feedback_id
    DELETE FROM operator_confirmations 
    WHERE feedback_id IS NULL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '✅ % confirmações antigas foram excluídas', deleted_count;
  ELSE
    RAISE WARNING '⚠️ Coluna feedback_id não existe ainda. Execute primeiro o script modify_operator_confirmations_table.sql';
  END IF;
END $$;

-- Verificar se há feedbacks sem código (não deveria acontecer após migração)
DO $$
DECLARE
  feedbacks_without_code INTEGER;
BEGIN
  SELECT COUNT(*) INTO feedbacks_without_code
  FROM manager_feedbacks
  WHERE feedback_code IS NULL OR feedback_code = '';
  
  IF feedbacks_without_code > 0 THEN
    RAISE WARNING '⚠️ Ainda existem % feedbacks sem código', feedbacks_without_code;
  ELSE
    RAISE NOTICE '✅ Todos os feedbacks têm código';
  END IF;
END $$;

