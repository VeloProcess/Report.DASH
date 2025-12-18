import { useState, useEffect } from 'react';
import { getLogs } from '../services/api';
import './LogsPanel.css';

function LogsPanel() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadLogs();
    const interval = setInterval(loadLogs, 5000); // Atualiza a cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  const loadLogs = async () => {
    try {
      const response = await getLogs(filter || null);
      setLogs(response.data);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    return status === 'success' ? 'status-success' : 'status-error';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  };

  return (
    <div className="logs-panel">
      <div className="page-header">
        <h1>Painel de Logs</h1>
        <div className="filter-section">
          <input
            type="text"
            placeholder="Filtrar por nome do operador..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && loadLogs()}
            className="filter-input"
          />
          <button onClick={loadLogs} className="btn btn-secondary">
            Buscar
          </button>
        </div>
      </div>

      {loading ? (
        <p>Carregando logs...</p>
      ) : logs.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum log encontrado.</p>
        </div>
      ) : (
        <div className="logs-table-container">
          <table className="logs-table">
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Operador</th>
                <th>Mês</th>
                <th>Ação</th>
                <th>Status</th>
                <th>Mensagem</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{formatDate(log.created_at)}</td>
                  <td>{log.operator_name || '-'}</td>
                  <td>{log.reference_month || '-'}</td>
                  <td>{log.action}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(log.status)}`}>
                      {log.status}
                    </span>
                  </td>
                  <td>{log.message || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default LogsPanel;

