import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getActionHistory, getMetricsHistory, getAIFeedbacks, getOperatorFeedbacks } from '../services/api';
import HistoryTimeline from '../components/HistoryTimeline';
import HistoryFilters from '../components/HistoryFilters';
import './HistoryPage.css';

function HistoryPage() {
  const { user } = useAuth();
  const [actions, setActions] = useState([]);
  const [metricsHistory, setMetricsHistory] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [managerFeedbacks, setManagerFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    selectedMonth: null,
    startDate: null,
    endDate: null,
    actionType: null
  });

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user, filters]);

  const loadHistory = async () => {
    try {
      setLoading(true);

      // Carregar histórico de ações
      const actionsResponse = await getActionHistory(
        filters.startDate,
        filters.endDate,
        filters.actionType
      );
      if (actionsResponse.data.success) {
        setActions(actionsResponse.data.history || []);
      }

      // Carregar histórico de métricas
      try {
        const metricsResponse = await getMetricsHistory(
          null,
          filters.startDate,
          filters.endDate
        );
        if (metricsResponse.data.success) {
          setMetricsHistory(metricsResponse.data.history || []);
        }
      } catch (error) {
        console.warn('Erro ao carregar histórico de métricas (não crítico):', error);
        setMetricsHistory([]);
      }

      // Carregar feedbacks I.A
      const feedbacksResponse = await getAIFeedbacks();
      if (feedbacksResponse.data.success) {
        setFeedbacks(feedbacksResponse.data.feedbacks || []);
      }

      // Carregar feedbacks de gestores
      // IMPORTANTE: Para operadores, sempre buscar TODOS os feedbacks (sem filtro de mês)
      // Para gestores, pode filtrar por mês se selecionado
      try {
        const isManager = user?.isManager || false;
        const month = isManager ? (filters.selectedMonth || null) : null; // Operadores não filtram por mês
        const year = null; // Não filtrar por ano para garantir que todos apareçam
        
        const managerFeedbacksResponse = await getOperatorFeedbacks(month, year);
        
        if (managerFeedbacksResponse.data.success) {
          setManagerFeedbacks(managerFeedbacksResponse.data.feedbacks || []);
        } else {
          setManagerFeedbacks([]);
        }
      } catch (error) {
        console.warn('⚠️ Erro ao carregar feedbacks de gestores (não crítico):', error);
        setManagerFeedbacks([]);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <div className="history-page-loading">
        <div className="loading-spinner"></div>
        <p>Carregando histórico...</p>
      </div>
    );
  }

  return (
    <div className="history-page">
      <div className="history-header">
        <h1>Histórico de Feedbacks</h1>
        <p className="history-subtitle">Visualize os feedbacks dos gestores</p>
      </div>

      <HistoryFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      <div className="history-content">
        <HistoryTimeline
          actions={[]}
          metricsHistory={[]}
          feedbacks={[]}
          managerFeedbacks={managerFeedbacks}
          onFeedbackDeleted={loadHistory}
        />
      </div>
    </div>
  );
}

export default HistoryPage;

