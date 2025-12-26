import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getCompleteHistory } from '../services/api';
import './CompleteHistoryPage.css';

function CompleteHistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && user.isManager) {
      loadCompleteHistory();
    } else {
      setError('Acesso negado: apenas gestores podem acessar esta página');
      setLoading(false);
    }
  }, [user]);

  const loadCompleteHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCompleteHistory();
      if (response.data.success) {
        setHistory(response.data.history || []);
      } else {
        setError('Erro ao carregar histórico');
      }
    } catch (err) {
      console.error('Erro ao carregar histórico completo:', err);
      setError('Erro ao carregar histórico completo');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="complete-history-page">
        <div className="complete-history-loading">
          <div className="loading-spinner"></div>
          <p>Carregando histórico completo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="complete-history-page">
        <div className="complete-history-error">
          <h2>Erro</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="complete-history-page">
      <div className="complete-history-header">
        <h1>Histórico Completo</h1>
        <p className="complete-history-subtitle">
          Visualize todos os feedbacks de gestores e confirmações dos operadores
        </p>
        <div className="complete-history-stats">
          <span>Total de registros: <strong>{history.length}</strong></span>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="complete-history-empty">
          <p>Nenhum feedback encontrado.</p>
        </div>
      ) : (
        <div className="complete-history-content">
          {history.map((item) => (
            <div 
              key={item.id} 
              className={`history-item ${item.confirmed ? 'confirmed' : 'not-confirmed'}`}
            >
              <div className="history-item-header">
                <div className="history-item-date">
                  <strong>Data do Feedback:</strong> {formatDate(item.created_at)}
                </div>
                <div className={`history-item-status ${item.confirmed ? 'status-confirmed' : 'status-not-confirmed'}`}>
                  {item.confirmed ? (
                    <span className="status-badge confirmed-badge">✓ Confirmado</span>
                  ) : (
                    <span className="status-badge not-confirmed-badge">⚠️ Não confirmado</span>
                  )}
                </div>
              </div>

              <div className="history-item-content">
                {/* Informações do Gestor */}
                <div className="history-section manager-section">
                  <h3>📝 Gestor</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <strong>Nome:</strong> {item.manager_name || item.manager_email}
                    </div>
                    <div className="info-item">
                      <strong>Email:</strong> {item.manager_email}
                    </div>
                  </div>
                </div>

                {/* Informações do Operador */}
                <div className="history-section operator-section">
                  <h3>👤 Operador</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <strong>Nome:</strong> {item.operator_name}
                    </div>
                    <div className="info-item">
                      <strong>Email:</strong> {item.operator_email || 'N/A'}
                    </div>
                    <div className="info-item">
                      <strong>ID:</strong> {item.operator_id}
                    </div>
                  </div>
                </div>

                {/* Período */}
                <div className="history-section period-section">
                  <h3>📅 Período</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <strong>Mês:</strong> {item.month}
                    </div>
                    <div className="info-item">
                      <strong>Ano:</strong> {item.year}
                    </div>
                  </div>
                </div>

                {/* Feedback do Gestor */}
                <div className="history-section feedback-section">
                  <h3>💬 Feedback do Gestor</h3>
                  <div className="feedback-text">
                    {item.feedback_text}
                  </div>
                </div>

                {/* Confirmação do Operador */}
                <div className={`history-section confirmation-section ${item.confirmed ? 'confirmed' : 'not-confirmed'}`}>
                  <h3>✅ Confirmação do Operador</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <strong>Status:</strong>
                      <span className={`status-value ${item.confirmed ? 'confirmed' : 'not-confirmed'}`}>
                        {item.confirmed ? '✓ Confirmado' : '⚠️ Não confirmado'}
                      </span>
                    </div>
                    {item.confirmation_date && (
                      <div className="info-item">
                        <strong>Data de Confirmação:</strong> {formatDate(item.confirmation_date)}
                      </div>
                    )}
                  </div>
                  
                  {/* Observações */}
                  {item.observations && item.observations.trim() !== '' ? (
                    <div className="observations-content">
                      <strong>Observações do Operador:</strong>
                      <div className="observations-text">
                        {item.observations}
                      </div>
                    </div>
                  ) : (
                    <div className="no-observations">
                      <em>Nenhuma observação registrada pelo operador.</em>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CompleteHistoryPage;

