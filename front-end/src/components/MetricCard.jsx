import './MetricCard.css';

function MetricCard({ label, value, explanation, status }) {
  const getStatusClass = () => {
    if (!status) return '';
    if (status === 'MANTER' || status === 'manter') return 'status-maintain';
    if (status === 'MELHORAR' || status === 'melhorar') return 'status-improve';
    return '';
  };

  const formatValue = (val) => {
    if (val === null || val === undefined || val === '') return 'N/A';
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
      <div className="metric-value">{formatValue(value)}</div>
      {explanation && (
        <p className="metric-explanation">{explanation}</p>
      )}
    </div>
  );
}

export default MetricCard;

