import './MetricsHeader.css';

function MetricsHeader({ lastUpdated }) {
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="metrics-header">
      <h1>Dashboard de Métricas</h1>
      <div className="metrics-updated">
        <span className="updated-label">Métricas atualizadas em:</span>
        <span className="updated-date">{formatDate(lastUpdated)}</span>
      </div>
    </div>
  );
}

export default MetricsHeader;

