import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOperatorById, getFeedbackByOperator, generateFeedback, sendFeedbackEmail } from '../services/api';
import './FeedbackView.css';

function FeedbackView() {
  const { operatorId } = useParams();
  const navigate = useNavigate();
  const [operator, setOperator] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [operatorId]);

  const loadData = async () => {
    try {
      const [operatorRes, feedbackRes] = await Promise.all([
        getOperatorById(operatorId),
        getFeedbackByOperator(operatorId).catch(() => null),
      ]);
      
      setOperator(operatorRes.data);
      if (feedbackRes) {
        setFeedback(feedbackRes.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFeedback = async () => {
    setGenerating(true);
    setError(null);

    try {
      await generateFeedback(parseInt(operatorId));
      await loadData();
      alert('Feedback gerado com sucesso!');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao gerar feedback');
    } finally {
      setGenerating(false);
    }
  };

  const handleSendEmail = async () => {
    if (!window.confirm('Deseja enviar o feedback por email para o operador?')) {
      return;
    }

    setSendingEmail(true);
    setError(null);

    try {
      const response = await sendFeedbackEmail(parseInt(operatorId));
      alert(`Feedback enviado com sucesso para ${response.data.email}!`);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.details || 'Erro ao enviar email';
      setError(errorMessage);
      alert(`Erro ao enviar email: ${errorMessage}`);
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return <div className="feedback-view">Carregando...</div>;
  }

  if (!operator) {
    return <div className="feedback-view">Operador não encontrado</div>;
  }

  return (
    <div className="feedback-view">
      <div className="page-header">
        <h1>Feedback Mensal</h1>
        <p>
          <strong>Operador:</strong> {operator.name} | 
          <strong> Cargo:</strong> {operator.position} | 
          <strong> Mês:</strong> {operator.reference_month}
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {!feedback ? (
        <div className="no-feedback">
          <p>Nenhum feedback gerado ainda para este operador.</p>
          <button
            onClick={handleGenerateFeedback}
            className="btn btn-ai"
            disabled={generating}
          >
            {generating ? 'Gerando...' : '🤖 Gerar Feedback com IA'}
          </button>
          <p className="hint">
            Certifique-se de que os indicadores foram inseridos antes de gerar o feedback.
          </p>
        </div>
      ) : (
        <div className="feedback-content">
          <div className="feedback-section">
            <h2>Resumo Geral</h2>
            <div className="feedback-text">
              {feedback.feedback_text.split('\n\n')[0] && (
                <p>{feedback.feedback_text.split('\n\n')[0]}</p>
              )}
            </div>
          </div>

          {feedback.metrics_analysis && typeof feedback.metrics_analysis === 'string' && (
            <div className="feedback-section metrics">
              <h2>Análise Detalhada por Métrica</h2>
              <div className="feedback-text metrics-analysis">
                {feedback.metrics_analysis.split('\n').map((line, index) => {
                  if (!line.trim()) return <br key={index} />;
                  const upperLine = line.toUpperCase();
                  
                  // Títulos de seção
                  if (upperLine.includes('ATENDIMENTO') || upperLine.includes('QUALIDADE') || 
                      upperLine.includes('PRESENÇA') || upperLine.includes('DISPONIBILIDADE') ||
                      upperLine.includes('PAUSAS') || upperLine.includes('INTERVALOS') ||
                      upperLine.includes('DESENVOLVIMENTO')) {
                    return <h3 key={index} className="metric-section-title">{line.trim()}</h3>;
                  }
                  
                  // Nome da métrica (linha que não tem "Valor:", "Status:" ou "Análise:")
                  if (line.trim() && !line.includes(':') && !upperLine.includes('MANTER') && 
                      !upperLine.includes('MELHORAR') && !upperLine.includes('VALOR') && 
                      !upperLine.includes('STATUS') && !upperLine.includes('ANÁLISE')) {
                    return <h4 key={index} className="metric-name">{line.trim()}</h4>;
                  }
                  
                  // Valor da métrica
                  if (upperLine.includes('VALOR:') || upperLine.includes('VALOR ATUAL:')) {
                    const value = line.split(':')[1]?.trim() || '';
                    return (
                      <p key={index} className="metric-value">
                        <strong>Valor:</strong> <span className="value-highlight">{value}</span>
                      </p>
                    );
                  }
                  
                  // Status MANTER ou MELHORAR
                  if (upperLine.includes('MANTER') || upperLine.includes('MELHORAR')) {
                    const isMaintain = upperLine.includes('MANTER');
                    const statusText = line.includes(':') ? line.split(':')[1]?.trim() : '';
                    return (
                      <p key={index} className={isMaintain ? 'metric-maintain' : 'metric-improve'}>
                        <strong>{isMaintain ? '✓ MANTER' : '⚠ MELHORAR'}</strong>
                        {statusText && `: ${statusText}`}
                      </p>
                    );
                  }
                  
                  // Análise
                  if (upperLine.includes('ANÁLISE:')) {
                    const analysis = line.split(':')[1]?.trim() || line;
                    return <p key={index} className="metric-analysis">{analysis}</p>;
                  }
                  
                  // Linhas normais de texto
                  return <p key={index} className="metric-text">{line}</p>;
                })}
              </div>
            </div>
          )}

          {feedback.positive_points && (
            <div className="feedback-section positive">
              <h2>Pontos Positivos</h2>
              <p>{feedback.positive_points}</p>
            </div>
          )}

          {feedback.attention_points && (
            <div className="feedback-section attention">
              <h2>Pontos de Atenção</h2>
              <p>{feedback.attention_points}</p>
            </div>
          )}

          {feedback.recommendations && (
            <div className="feedback-section recommendations">
              <h2>Recomendações</h2>
              <p>{feedback.recommendations}</p>
            </div>
          )}

          {feedback.operator_response_model && (
            <div className="feedback-section response-model">
              <h2>Modelo de Resposta do Operador</h2>
              <div className="response-box">
                <p>{feedback.operator_response_model}</p>
              </div>
            </div>
          )}

          <div className="feedback-actions">
            <button onClick={() => navigate('/')} className="btn btn-secondary">
              Voltar
            </button>
            <button
              onClick={handleGenerateFeedback}
              className="btn btn-primary"
              disabled={generating}
            >
              {generating ? 'Regenerando...' : 'Regenerar Feedback'}
            </button>
            <button
              onClick={handleSendEmail}
              className="btn btn-email"
              disabled={sendingEmail || generating}
            >
              {sendingEmail ? 'Enviando...' : '📧 Enviar Feedback por Email'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FeedbackView;

