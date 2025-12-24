-- ============================================
-- Script para Corrigir RLS Policies
-- ============================================
-- ⚠️ IMPORTANTE: Execute PRIMEIRO o script create_metrics_tables.sql
-- Este script ajusta as RLS policies para funcionar com SERVICE_ROLE_KEY
-- Quando usando SERVICE_ROLE_KEY, o backend já garante isolamento por email

-- Desabilitar RLS nas tabelas que são acessadas apenas pelo backend
-- O backend já garante isolamento por email através do código

-- Action History - Desabilitar RLS (backend garante isolamento)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'action_history') THEN
    ALTER TABLE action_history DISABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✅ RLS desabilitado em action_history';
  ELSE
    RAISE NOTICE '⚠️ Tabela action_history não existe. Execute create_metrics_tables.sql primeiro.';
  END IF;
END $$;

-- Metrics - Desabilitar RLS (backend garante isolamento)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'metrics') THEN
    ALTER TABLE metrics DISABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✅ RLS desabilitado em metrics';
  ELSE
    RAISE NOTICE '⚠️ Tabela metrics não existe. Execute create_metrics_tables.sql primeiro.';
  END IF;
END $$;

-- Metrics History - Desabilitar RLS (backend garante isolamento)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'metrics_history') THEN
    ALTER TABLE metrics_history DISABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✅ RLS desabilitado em metrics_history';
  ELSE
    RAISE NOTICE '⚠️ Tabela metrics_history não existe. Execute create_metrics_tables.sql primeiro.';
  END IF;
END $$;

-- Metric Checks - Desabilitar RLS (backend garante isolamento)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'metric_checks') THEN
    ALTER TABLE metric_checks DISABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✅ RLS desabilitado em metric_checks';
  ELSE
    RAISE NOTICE '⚠️ Tabela metric_checks não existe. Execute create_metrics_tables.sql primeiro.';
  END IF;
END $$;

-- AI Feedbacks - Desabilitar RLS (backend garante isolamento)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ai_feedbacks') THEN
    ALTER TABLE ai_feedbacks DISABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✅ RLS desabilitado em ai_feedbacks';
  ELSE
    RAISE NOTICE '⚠️ Tabela ai_feedbacks não existe. Execute create_metrics_tables.sql primeiro.';
  END IF;
END $$;

-- Operator Confirmations - Desabilitar RLS (backend garante isolamento)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'operator_confirmations') THEN
    ALTER TABLE operator_confirmations DISABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✅ RLS desabilitado em operator_confirmations';
  ELSE
    RAISE NOTICE '⚠️ Tabela operator_confirmations não existe. Execute create_operator_confirmations_table.sql primeiro.';
  END IF;
END $$;

-- ============================================
-- ALTERNATIVA: Se preferir manter RLS ativo,
-- use estas policies que permitem SERVICE_ROLE_KEY
-- ============================================

-- Descomente as linhas abaixo se preferir manter RLS ativo:

/*
-- Action History - Policy que permite SERVICE_ROLE_KEY
DROP POLICY IF EXISTS "Users can only insert their own action history" ON action_history;
CREATE POLICY "Backend can insert action history"
  ON action_history FOR INSERT
  WITH CHECK (true); -- Permite inserção quando usando SERVICE_ROLE_KEY

DROP POLICY IF EXISTS "Users can only view their own action history" ON action_history;
CREATE POLICY "Backend can view action history"
  ON action_history FOR SELECT
  USING (true); -- Permite leitura quando usando SERVICE_ROLE_KEY

-- Repetir para outras tabelas conforme necessário...
*/

-- ============================================
-- FIM DO SCRIPT
-- ============================================
-- Após executar:
-- 1. Verifique se RLS foi desabilitado nas tabelas
-- 2. Reinicie o servidor backend
-- 3. Teste inserção de dados

