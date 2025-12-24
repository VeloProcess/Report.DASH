-- ============================================
-- SCHEMA COMPLETO: Dashboard de Métricas com Feedback I.A
-- ============================================
-- Este script cria todas as tabelas necessárias para o sistema de métricas
-- Execute este script no SQL Editor do Supabase Dashboard

-- ============================================
-- 1. Tabela de Métricas Atuais
-- ============================================
CREATE TABLE IF NOT EXISTS metrics (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  metric_type VARCHAR(100) NOT NULL,
  metric_value JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(email, metric_type)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_metrics_email ON metrics(email);
CREATE INDEX IF NOT EXISTS idx_metrics_type ON metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_metrics_updated ON metrics(updated_at DESC);

-- ============================================
-- 2. Tabela de Histórico de Métricas
-- ============================================
CREATE TABLE IF NOT EXISTS metrics_history (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  metric_type VARCHAR(100) NOT NULL,
  metric_value JSONB NOT NULL,
  snapshot_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_metrics_history_email ON metrics_history(email);
CREATE INDEX IF NOT EXISTS idx_metrics_history_date ON metrics_history(snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_history_type ON metrics_history(metric_type);
CREATE INDEX IF NOT EXISTS idx_metrics_history_email_date ON metrics_history(email, snapshot_date DESC);

-- ============================================
-- 3. Tabela de Checks de Métricas
-- ============================================
CREATE TABLE IF NOT EXISTS metric_checks (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  metric_type VARCHAR(100) NOT NULL,
  checked BOOLEAN DEFAULT false,
  check_date TIMESTAMP DEFAULT NOW(),
  UNIQUE(email, metric_type)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_metric_checks_email ON metric_checks(email);
CREATE INDEX IF NOT EXISTS idx_metric_checks_type ON metric_checks(metric_type);

-- ============================================
-- 4. Tabela de Histórico de Ações
-- ============================================
CREATE TABLE IF NOT EXISTS action_history (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL,
  context JSONB,
  action_date TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_action_history_email ON action_history(email);
CREATE INDEX IF NOT EXISTS idx_action_history_date ON action_history(action_date DESC);
CREATE INDEX IF NOT EXISTS idx_action_history_action ON action_history(action);
CREATE INDEX IF NOT EXISTS idx_action_history_email_date ON action_history(email, action_date DESC);

-- ============================================
-- 5. Tabela de Feedbacks I.A
-- ============================================
CREATE TABLE IF NOT EXISTS ai_feedbacks (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  metric_type VARCHAR(100) NOT NULL,
  feedback_text TEXT NOT NULL,
  generated_at TIMESTAMP DEFAULT NOW()
);

-- Índice único composto para evitar duplicatas no mesmo dia
CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_feedbacks_unique 
ON ai_feedbacks(email, metric_type, DATE(generated_at));

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ai_feedbacks_email ON ai_feedbacks(email);
CREATE INDEX IF NOT EXISTS idx_ai_feedbacks_type ON ai_feedbacks(metric_type);
CREATE INDEX IF NOT EXISTS idx_ai_feedbacks_date ON ai_feedbacks(generated_at DESC);

-- ============================================
-- 6. Row Level Security (RLS) Policies
-- ============================================
-- Habilitar RLS em todas as tabelas
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE metric_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feedbacks ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários só podem ver seus próprios dados (baseado em email)
-- Nota: Como estamos usando service_role key no backend, essas policies
-- são principalmente para proteção adicional. O backend sempre filtra por email.

-- Metrics
DROP POLICY IF EXISTS "Users can only view their own metrics" ON metrics;
CREATE POLICY "Users can only view their own metrics"
  ON metrics FOR SELECT
  USING (auth.jwt() ->> 'email' = email);

DROP POLICY IF EXISTS "Users can only insert their own metrics" ON metrics;
CREATE POLICY "Users can only insert their own metrics"
  ON metrics FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = email);

DROP POLICY IF EXISTS "Users can only update their own metrics" ON metrics;
CREATE POLICY "Users can only update their own metrics"
  ON metrics FOR UPDATE
  USING (auth.jwt() ->> 'email' = email);

-- Metrics History
DROP POLICY IF EXISTS "Users can only view their own metrics history" ON metrics_history;
CREATE POLICY "Users can only view their own metrics history"
  ON metrics_history FOR SELECT
  USING (auth.jwt() ->> 'email' = email);

DROP POLICY IF EXISTS "Users can only insert their own metrics history" ON metrics_history;
CREATE POLICY "Users can only insert their own metrics history"
  ON metrics_history FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = email);

-- Metric Checks
DROP POLICY IF EXISTS "Users can only view their own metric checks" ON metric_checks;
CREATE POLICY "Users can only view their own metric checks"
  ON metric_checks FOR SELECT
  USING (auth.jwt() ->> 'email' = email);

DROP POLICY IF EXISTS "Users can only insert their own metric checks" ON metric_checks;
CREATE POLICY "Users can only insert their own metric checks"
  ON metric_checks FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = email);

DROP POLICY IF EXISTS "Users can only update their own metric checks" ON metric_checks;
CREATE POLICY "Users can only update their own metric checks"
  ON metric_checks FOR UPDATE
  USING (auth.jwt() ->> 'email' = email);

-- Action History
DROP POLICY IF EXISTS "Users can only view their own action history" ON action_history;
CREATE POLICY "Users can only view their own action history"
  ON action_history FOR SELECT
  USING (auth.jwt() ->> 'email' = email);

DROP POLICY IF EXISTS "Users can only insert their own action history" ON action_history;
CREATE POLICY "Users can only insert their own action history"
  ON action_history FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = email);

-- AI Feedbacks
DROP POLICY IF EXISTS "Users can only view their own AI feedbacks" ON ai_feedbacks;
CREATE POLICY "Users can only view their own AI feedbacks"
  ON ai_feedbacks FOR SELECT
  USING (auth.jwt() ->> 'email' = email);

DROP POLICY IF EXISTS "Users can only insert their own AI feedbacks" ON ai_feedbacks;
CREATE POLICY "Users can only insert their own AI feedbacks"
  ON ai_feedbacks FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = email);

-- ============================================
-- 7. Triggers para Auditoria
-- ============================================
-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_metrics_updated_at ON metrics;
CREATE TRIGGER update_metrics_updated_at
  BEFORE UPDATE ON metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. Comentários nas Tabelas
-- ============================================
COMMENT ON TABLE metrics IS 'Métricas atuais por operador, identificado por email';
COMMENT ON TABLE metrics_history IS 'Histórico de snapshots de métricas por data';
COMMENT ON TABLE metric_checks IS 'Estado de checks marcados pelos operadores em cada bloco de métricas';
COMMENT ON TABLE action_history IS 'Histórico de todas as ações realizadas no sistema';
COMMENT ON TABLE ai_feedbacks IS 'Feedbacks gerados por I.A para cada tipo de métrica';

-- ============================================
-- FIM DO SCRIPT
-- ============================================
-- Após executar este script:
-- 1. Verifique se todas as tabelas foram criadas
-- 2. Verifique se os índices foram criados
-- 3. Verifique se as RLS policies estão ativas
-- 4. Teste inserção e leitura de dados

