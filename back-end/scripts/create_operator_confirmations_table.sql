-- ============================================
-- Tabela de Confirmações de Operadores
-- ============================================
-- Armazena confirmações de compreensão e observações dos operadores
-- sobre suas métricas e feedbacks

CREATE TABLE IF NOT EXISTS operator_confirmations (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  month VARCHAR(20) NOT NULL,
  year INTEGER NOT NULL,
  feedback_id INTEGER UNIQUE,
  understood BOOLEAN DEFAULT false,
  observations TEXT,
  confirmed_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_operator_confirmations_email ON operator_confirmations(email);
CREATE INDEX IF NOT EXISTS idx_operator_confirmations_month_year ON operator_confirmations(month, year);
CREATE INDEX IF NOT EXISTS idx_operator_confirmations_email_month_year ON operator_confirmations(email, month, year);
CREATE INDEX IF NOT EXISTS idx_operator_confirmations_feedback_id ON operator_confirmations(feedback_id);

-- Row Level Security
ALTER TABLE operator_confirmations ENABLE ROW LEVEL SECURITY;

-- Policies: Operadores só podem ver/editar suas próprias confirmações
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

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_operator_confirmations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_operator_confirmations_updated_at ON operator_confirmations;
CREATE TRIGGER update_operator_confirmations_updated_at
  BEFORE UPDATE ON operator_confirmations
  FOR EACH ROW
  EXECUTE FUNCTION update_operator_confirmations_updated_at();

-- Comentários na tabela
COMMENT ON TABLE operator_confirmations IS 'Confirmações de compreensão e observações dos operadores sobre suas métricas e feedbacks';
COMMENT ON COLUMN operator_confirmations.feedback_id IS 'ID do feedback ao qual esta confirmação está vinculada (chave única)';

