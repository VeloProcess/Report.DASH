-- ============================================
-- Script para corrigir políticas RLS da tabela operator_confirmations
-- ============================================
-- Este script ajusta as políticas para permitir que o backend insira/atualize confirmações
-- Execute este script no SQL Editor do Supabase Dashboard

-- Verificar se RLS está habilitado
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'operator_confirmations' 
    AND rowsecurity = true
  ) THEN
    RAISE NOTICE '✅ RLS está habilitado na tabela operator_confirmations';
  ELSE
    RAISE NOTICE '⚠️ RLS não está habilitado';
  END IF;
END $$;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can only view their own confirmations" ON operator_confirmations;
DROP POLICY IF EXISTS "Users can only insert their own confirmations" ON operator_confirmations;
DROP POLICY IF EXISTS "Users can only update their own confirmations" ON operator_confirmations;
DROP POLICY IF EXISTS "Users can only delete their own confirmations" ON operator_confirmations;

-- IMPORTANTE: Quando o backend usa SUPABASE_SERVICE_ROLE_KEY, o RLS é automaticamente bypassado
-- Mas se estiver usando SUPABASE_ANON_KEY, as políticas abaixo serão aplicadas

-- Política para SELECT: usuários podem ver apenas suas próprias confirmações
CREATE POLICY "Users can view their own confirmations"
  ON operator_confirmations FOR SELECT
  USING (
    -- Permitir se o email do JWT corresponde ao email da confirmação
    auth.jwt() ->> 'email' = email
  );

-- Política para INSERT: usuários podem inserir apenas suas próprias confirmações
-- NOTA: Se o backend usar service role key, esta política não será aplicada (RLS bypassado)
CREATE POLICY "Users can insert their own confirmations"
  ON operator_confirmations FOR INSERT
  WITH CHECK (
    -- Permitir se o email do JWT corresponde ao email sendo inserido
    auth.jwt() ->> 'email' = email
  );

-- Política para UPDATE: usuários podem atualizar apenas suas próprias confirmações
CREATE POLICY "Users can update their own confirmations"
  ON operator_confirmations FOR UPDATE
  USING (
    -- Permitir se o email do JWT corresponde ao email da confirmação
    auth.jwt() ->> 'email' = email
  )
  WITH CHECK (
    -- Permitir se o email do JWT corresponde ao email sendo atualizado
    auth.jwt() ->> 'email' = email
  );

-- Política para DELETE: usuários podem deletar apenas suas próprias confirmações
CREATE POLICY "Users can delete their own confirmations"
  ON operator_confirmations FOR DELETE
  USING (
    -- Permitir se o email do JWT corresponde ao email da confirmação
    auth.jwt() ->> 'email' = email
  );

RAISE NOTICE '✅ Políticas RLS atualizadas para operator_confirmations';

-- Verificar se as políticas foram criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'operator_confirmations'
ORDER BY policyname;

