-- Script SQL para criar tabela manager_feedbacks no Supabase
-- Execute este script no SQL Editor do Supabase Dashboard

-- Criar tabela manager_feedbacks
CREATE TABLE IF NOT EXISTS manager_feedbacks (
  id BIGSERIAL PRIMARY KEY,
  operator_id INTEGER NOT NULL,
  month VARCHAR(20) NOT NULL,
  year INTEGER NOT NULL,
  feedback_text TEXT NOT NULL,
  manager_email VARCHAR(255) NOT NULL,
  manager_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(operator_id, month, year)
);

-- Índices para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_manager_feedbacks_operator ON manager_feedbacks(operator_id);
CREATE INDEX IF NOT EXISTS idx_manager_feedbacks_month_year ON manager_feedbacks(month, year);
CREATE INDEX IF NOT EXISTS idx_manager_feedbacks_manager_email ON manager_feedbacks(manager_email);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at em updates
DROP TRIGGER IF EXISTS update_manager_feedbacks_updated_at ON manager_feedbacks;
CREATE TRIGGER update_manager_feedbacks_updated_at 
  BEFORE UPDATE ON manager_feedbacks 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Desabilitar RLS (Row Level Security) para permitir acesso do backend
-- Se você quiser usar RLS, crie políticas apropriadas
ALTER TABLE manager_feedbacks DISABLE ROW LEVEL SECURITY;

-- Comentários na tabela
COMMENT ON TABLE manager_feedbacks IS 'Feedbacks manuais aplicados por gestores aos operadores';
COMMENT ON COLUMN manager_feedbacks.operator_id IS 'ID do operador que recebeu o feedback';
COMMENT ON COLUMN manager_feedbacks.month IS 'Mês do feedback (Outubro, Novembro, Dezembro)';
COMMENT ON COLUMN manager_feedbacks.year IS 'Ano do feedback';
COMMENT ON COLUMN manager_feedbacks.feedback_text IS 'Texto do feedback aplicado pelo gestor';
COMMENT ON COLUMN manager_feedbacks.manager_email IS 'Email do gestor que aplicou o feedback';
COMMENT ON COLUMN manager_feedbacks.manager_name IS 'Nome do gestor que aplicou o feedback';

