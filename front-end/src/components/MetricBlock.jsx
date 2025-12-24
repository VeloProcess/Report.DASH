import { useState, useEffect } from 'react';
import { getLatestAIFeedback } from '../services/api';
import AIFeedbackCard from './AIFeedbackCard';
import './MetricBlock.css';

const METRIC_LABELS = {
  chamadas: 'Chamadas',
  tickets: 'Tickets',
  qualidade: 'Qualidade',
  pausas: 'Pausas e Disponibilidade'
};

function MetricBlock({ 
  metricType, 
  metric, 
  checked, 
  onCheckChange, 
  onGenerateFeedback 
}) {
  const [feedback, setFeedback] = useState(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  useEffect(() => {
    if (metric) {
      loadFeedback();
    }
  }, [metric]);

  const loadFeedback = async () => {
    try {
      setLoadingFeedback(true);
      const response = await getLatestAIFeedback(metricType);
      if (response.data.success && response.data.feedback) {
        setFeedback(response.data.feedback);
      } else {
        setFeedback(null);
      }
    } catch (error) {
      console.error('Erro ao carregar feedback:', error);
      setFeedback(null);
    } finally {
      setLoadingFeedback(false);
    }
  };

  const handleGenerate = async () => {
    setLoadingFeedback(true);
    try {
      await onGenerateFeedback();
      await loadFeedback();
    } catch (error) {
      console.error('Erro ao gerar feedback:', error);
    } finally {
      setLoadingFeedback(false);
    }
  };

  const renderMetricValue = () => {
    if (!metric || !metric.metric_value) {
      return <p className="no-data">Dados não disponíveis</p>;
    }

    const value = metric.metric_value;
    const label = METRIC_LABELS[metricType] || metricType;

    switch (metricType) {
      case 'chamadas':
        return (
          <div className="metric-values">
            <div className="metric-item">
              <span className="metric-label">Chamadas:</span>
              <span className="metric-value">{value.calls || 'N/A'}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">TMA:</span>
              <span className="metric-value">{value.tma || 'N/A'}</span>
            </div>
          </div>
        );

      case 'tickets':
        return (
          <div className="metric-values">
            <div className="metric-item">
              <span className="metric-label">Tickets:</span>
              <span className="metric-value">{value.tickets || 'N/A'}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">TMT:</span>
              <span className="metric-value">{value.tmt || 'N/A'}</span>
            </div>
          </div>
        );

      case 'qualidade':
        return (
          <div className="metric-values">
            <div className="metric-item">
              <span className="metric-label">Nota Qualidade:</span>
              <span className="metric-value">{value.nota_qualidade || 'N/A'}%</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Avaliações:</span>
              <span className="metric-value">{value.qtd_avaliacoes || 'N/A'}</span>
            </div>
          </div>
        );

      case 'pausas':
        return (
          <div className="metric-values">
            <div className="metric-item">
              <span className="metric-label">% Logado:</span>
              <span className="metric-value">{value.percent_logado || 'N/A'}%</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Pausas Escaladas:</span>
              <span className="metric-value">{value.pausa_escalada || 'N/A'}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Pausas Realizadas:</span>
              <span className="metric-value">{value.total_pausas || 'N/A'}</span>
            </div>
          </div>
        );

      default:
        return <pre>{JSON.stringify(value, null, 2)}</pre>;
    }
  };

  return (
    <div className="metric-block">
      <div className="metric-block-header">
        <div className="metric-checkbox-wrapper">
          <input
            type="checkbox"
            id={`check-${metricType}`}
            checked={checked}
            onChange={(e) => onCheckChange(e.target.checked)}
            className="metric-checkbox"
          />
          <label htmlFor={`check-${metricType}`} className="metric-checkbox-label">
            {METRIC_LABELS[metricType] || metricType}
          </label>
        </div>
      </div>

      <div className="metric-block-content">
        {renderMetricValue()}
      </div>

      <div className="metric-block-feedback">
        {loadingFeedback ? (
          <div className="feedback-loading">Carregando feedback...</div>
        ) : feedback ? (
          <AIFeedbackCard feedback={feedback} />
        ) : (
          <button 
            className="btn-generate-feedback"
            onClick={handleGenerate}
            disabled={!metric}
          >
            Gerar Feedback I.A
          </button>
        )}
      </div>
    </div>
  );
}

export default MetricBlock;

