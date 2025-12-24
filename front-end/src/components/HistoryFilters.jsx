import { useState } from 'react';
import './HistoryFilters.css';

const ACTION_TYPES = {
  ALL: '',
  LOGIN: 'login',
  VIEW_DASHBOARD: 'view_dashboard',
  CHECK_METRIC: 'check_metric',
  UNCHECK_METRIC: 'uncheck_metric',
  GENERATE_FEEDBACK: 'generate_ai_feedback',
  EXPORT: 'export'
};

// Meses disponíveis para seleção
const AVAILABLE_MONTHS = ['Dezembro', 'Novembro', 'Outubro'];

// Função para converter nome do mês em intervalo de datas
const getMonthDateRange = (monthName) => {
  const currentYear = new Date().getFullYear();
  const monthMap = {
    'Janeiro': 0, 'Fevereiro': 1, 'Março': 2, 'Abril': 3,
    'Maio': 4, 'Junho': 5, 'Julho': 6, 'Agosto': 7,
    'Setembro': 8, 'Outubro': 9, 'Novembro': 10, 'Dezembro': 11
  };
  
  const monthIndex = monthMap[monthName];
  if (monthIndex === undefined) return { startDate: null, endDate: null };
  
  const startDate = new Date(currentYear, monthIndex, 1);
  const endDate = new Date(currentYear, monthIndex + 1, 0, 23, 59, 59, 999);
  
  return { startDate, endDate };
};

function HistoryFilters({ filters, onFilterChange }) {
  const [localFilters, setLocalFilters] = useState({
    selectedMonth: filters.selectedMonth || '',
    actionType: filters.actionType || ''
  });

  const handleMonthChange = (monthName) => {
    const newFilters = {
      ...localFilters,
      selectedMonth: monthName
    };
    setLocalFilters(newFilters);
    
    const { startDate, endDate } = monthName ? getMonthDateRange(monthName) : { startDate: null, endDate: null };
    
    onFilterChange({
      selectedMonth: monthName || null,
      startDate: startDate,
      endDate: endDate,
      actionType: newFilters.actionType === ACTION_TYPES.ALL ? null : newFilters.actionType
    });
  };

  const handleActionTypeChange = (actionType) => {
    const newFilters = {
      ...localFilters,
      actionType: actionType
    };
    setLocalFilters(newFilters);
    
    const { startDate, endDate } = localFilters.selectedMonth 
      ? getMonthDateRange(localFilters.selectedMonth) 
      : { startDate: null, endDate: null };
    
    onFilterChange({
      selectedMonth: localFilters.selectedMonth || null,
      startDate: startDate,
      endDate: endDate,
      actionType: actionType === ACTION_TYPES.ALL || actionType === '' ? null : actionType
    });
  };

  const clearFilters = () => {
    const clearedFilters = {
      selectedMonth: '',
      actionType: ''
    };
    setLocalFilters(clearedFilters);
    onFilterChange({
      selectedMonth: null,
      startDate: null,
      endDate: null,
      actionType: null
    });
  };

  return (
    <div className="history-filters">
      <div className="filters-row">
        <div className="filter-group">
          <label htmlFor="month-selector">Período:</label>
          <select
            id="month-selector"
            value={localFilters.selectedMonth || ''}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="filter-select"
          >
            <option value="">Todos os períodos</option>
            {AVAILABLE_MONTHS.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="action-type">Tipo de Ação:</label>
          <select
            id="action-type"
            value={localFilters.actionType || ''}
            onChange={(e) => handleActionTypeChange(e.target.value)}
            className="filter-select"
          >
            <option value="">Todas</option>
            <option value={ACTION_TYPES.LOGIN}>Login</option>
            <option value={ACTION_TYPES.VIEW_DASHBOARD}>Visualização Dashboard</option>
            <option value={ACTION_TYPES.CHECK_METRIC}>Check Métrica</option>
            <option value={ACTION_TYPES.UNCHECK_METRIC}>Uncheck Métrica</option>
            <option value={ACTION_TYPES.GENERATE_FEEDBACK}>Gerar Feedback I.A</option>
            <option value={ACTION_TYPES.EXPORT}>Exportação</option>
          </select>
        </div>

        <button 
          className="btn-clear-filters"
          onClick={clearFilters}
        >
          Limpar Filtros
        </button>
      </div>
    </div>
  );
}

export default HistoryFilters;

