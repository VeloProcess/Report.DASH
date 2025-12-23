import './MetricCard.css';

function MetricCard({ label, value, explanation, status, isPercentage = false }) {
  const getStatusClass = () => {
    if (!status) return '';
    if (status === 'MANTER' || status === 'manter') return 'status-maintain';
    if (status === 'MELHORAR' || status === 'melhorar') return 'status-improve';
    return '';
  };

  const formatValue = (val, isPercentage = false) => {
    if (val === null || val === undefined || val === '') return 'N/A';
    if (isPercentage) {
      // Se já vier como número decimal (0-1), converter para porcentagem
      const numVal = typeof val === 'string' ? parseFloat(val) : val;
      if (isNaN(numVal)) return 'N/A';
      // Se o valor for menor ou igual a 1, assumir que é decimal (0.85 = 85%)
      if (numVal <= 1) {
        return `${(numVal * 100).toFixed(1)}%`;
      }
      // Se já vier como porcentagem (85), apenas adicionar o símbolo
      return `${numVal.toFixed(1)}%`;
    }
    return String(val);
  };

  return (
    <div className={`metric-card ${getStatusClass()}`}>
      <div className="metric-header">
        <h3 className="metric-label">{label}</h3>
        {status && (
          <span className={`metric-status ${getStatusClass()}`}>
            {status === 'MANTER' || status === 'manter' ? '✓ MANTER' : '⚠ MELHORAR'}
          </span>
        )}
      </div>
      <div className="metric-value">{formatValue(value, isPercentage)}</div>
      {explanation && (
        <p className="metric-explanation">{explanation}</p>
      )}
    </div>
  );
}

export default MetricCard;

