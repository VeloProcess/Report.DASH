import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getMetrics, 
  getMetricChecks, 
  setMetricCheck,
  getLatestAIFeedback,
  generateAIFeedback
} from '../services/api';
import MetricBlock from '../components/MetricBlock';
import MetricsHeader from '../components/MetricsHeader';
import './MetricsDashboard.css';

const METRIC_TYPES = {
  CHAMADAS: 'chamadas',
  TICKETS: 'tickets',
  QUALIDADE: 'qualidade',
  PAUSAS: 'pausas'
};

function MetricsDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState([]);
  const [checks, setChecks] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (user) {
      loadDashboard();
    }
  }, [user]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      
      // Carregar métricas
      const metricsResponse = await getMetrics();
      if (metricsResponse.data.success) {
        setMetrics(metricsResponse.data.metrics || []);
        
        // Encontrar última atualização
        if (metricsResponse.data.metrics && metricsResponse.data.metrics.length > 0) {
          const latest = metricsResponse.data.metrics
            .map(m => new Date(m.updated_at))
            .sort((a, b) => b - a)[0];
          setLastUpdated(latest);
        }
      }

      // Carregar checks
      const checksResponse = await getMetricChecks();
      if (checksResponse.data.success) {
        const checksMap = {};
        checksResponse.data.checks.forEach(check => {
          checksMap[check.metric_type] = check.checked;
        });
        setChecks(checksMap);
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckChange = async (metricType, checked) => {
    try {
      await setMetricCheck(metricType, checked);
      setChecks(prev => ({
        ...prev,
        [metricType]: checked
      }));
    } catch (error) {
      console.error('Erro ao salvar check:', error);
      alert('Erro ao salvar check. Tente novamente.');
    }
  };

  const handleGenerateFeedback = async (metricType) => {
    try {
      const response = await generateAIFeedback(metricType, false);
      if (response.data.success) {
        // Recarregar métricas para atualizar feedback
        await loadDashboard();
        alert('Feedback gerado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao gerar feedback:', error);
      alert('Erro ao gerar feedback. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="metrics-dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Carregando métricas...</p>
      </div>
    );
  }

  // Organizar métricas por tipo
  const metricsByType = {};
  metrics.forEach(metric => {
    metricsByType[metric.metric_type] = metric;
  });

  return (
    <div className="metrics-dashboard">
      <MetricsHeader lastUpdated={lastUpdated} />
      
      <div className="metrics-blocks">
        <MetricBlock
          metricType={METRIC_TYPES.CHAMADAS}
          metric={metricsByType[METRIC_TYPES.CHAMADAS]}
          checked={checks[METRIC_TYPES.CHAMADAS] || false}
          onCheckChange={(checked) => handleCheckChange(METRIC_TYPES.CHAMADAS, checked)}
          onGenerateFeedback={() => handleGenerateFeedback(METRIC_TYPES.CHAMADAS)}
        />
        
        <MetricBlock
          metricType={METRIC_TYPES.TICKETS}
          metric={metricsByType[METRIC_TYPES.TICKETS]}
          checked={checks[METRIC_TYPES.TICKETS] || false}
          onCheckChange={(checked) => handleCheckChange(METRIC_TYPES.TICKETS, checked)}
          onGenerateFeedback={() => handleGenerateFeedback(METRIC_TYPES.TICKETS)}
        />
        
        <MetricBlock
          metricType={METRIC_TYPES.QUALIDADE}
          metric={metricsByType[METRIC_TYPES.QUALIDADE]}
          checked={checks[METRIC_TYPES.QUALIDADE] || false}
          onCheckChange={(checked) => handleCheckChange(METRIC_TYPES.QUALIDADE, checked)}
          onGenerateFeedback={() => handleGenerateFeedback(METRIC_TYPES.QUALIDADE)}
        />
        
        <MetricBlock
          metricType={METRIC_TYPES.PAUSAS}
          metric={metricsByType[METRIC_TYPES.PAUSAS]}
          checked={checks[METRIC_TYPES.PAUSAS] || false}
          onCheckChange={(checked) => handleCheckChange(METRIC_TYPES.PAUSAS, checked)}
          onGenerateFeedback={() => handleGenerateFeedback(METRIC_TYPES.PAUSAS)}
        />
      </div>
    </div>
  );
}

export default MetricsDashboard;

