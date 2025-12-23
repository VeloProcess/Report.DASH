import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getManagerOperators,
  getManagerOperatorMetrics,
  exportManagerPDF
} from '../services/api';
import MetricCard from '../components/MetricCard';
import './ManagerDashboard.css';

// Explicações das métricas (mesmas do Dashboard)
const METRIC_EXPLANATIONS = {
  calls: 'Total de ligações realizadas no período',
  tma: 'Tempo Médio de Atendimento - tempo médio gasto em cada ligação',
  quality_score: 'Nota média nas pesquisas de satisfação telefônica',
  qtd_pesq_telefone: 'Quantidade de pesquisas de satisfação recebidas',
  tickets: 'Número total de tickets atendidos',
  tmt: 'Tempo Médio de Tratamento - tempo médio para resolver tickets',
  pesquisa_ticket: 'Nota média nas pesquisas de satisfação de tickets',
  qtd_pesq_ticket: 'Quantidade de pesquisas de satisfação de tickets recebidas',
  total_escalado: 'Total de horas escaladas para trabalho',
  total_logado: 'Total de horas efetivamente logadas no sistema',
  percent_logado: 'Percentual de horas logadas em relação ao escalado',
  pausa_escalada: 'Tempo total de pausas escaladas',
  total_pausas: 'Tempo total de pausas realizadas',
  percent_pausas: 'Percentual de pausas realizadas em relação ao escalado',
  almoco_escalado: 'Tempo escalado para almoço',
  almoco_realizado: 'Tempo efetivamente usado para almoço',
  percent_almoco: 'Percentual de tempo de almoço realizado',
  pausa_10_escalada: 'Tempo escalado para pausa de 10 minutos',
  pausa_10_realizado: 'Tempo efetivamente usado na pausa de 10 minutos',
  percent_pausa_10: 'Percentual de pausa de 10 minutos realizado',
  pausa_banheiro: 'Tempo total de pausas para banheiro',
  percent_pausa_banheiro: 'Percentual de tempo usado em pausas de banheiro',
  pausa_feedback: 'Tempo total de pausas para feedback',
  percent_pausa_feedback: 'Percentual de tempo usado em pausas de feedback',
  treinamento: 'Tempo total dedicado a treinamentos',
  percent_treinamento: 'Percentual de tempo dedicado a treinamentos',
  nota_qualidade: 'Nota geral de qualidade do atendimento (em porcentagem)',
  qtd_avaliacoes: 'Quantidade de avaliações de qualidade recebidas',
};

function ManagerDashboard() {
  const { user, handleLogout } = useAuth();
  const [operators, setOperators] = useState([]);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [exporting, setExporting] = useState({ pdf: false });
  
  // Meses fixos disponíveis
  const FIXED_MONTHS = ['Dezembro', 'Novembro', 'Outubro'];
  const [selectedMonth, setSelectedMonth] = useState('Dezembro');
  const [availableMonths, setAvailableMonths] = useState(FIXED_MONTHS);

  useEffect(() => {
    loadOperators();
  }, []);

  useEffect(() => {
    if (selectedOperator) {
      loadOperatorMetrics();
    }
  }, [selectedOperator, selectedMonth]);

  const loadOperators = async () => {
    setLoading(true);
    try {
      const response = await getManagerOperators();
      if (response.data.success) {
        setOperators(response.data.operators);
      }
    } catch (error) {
      console.error('Erro ao carregar operadores:', error);
      alert('Erro ao carregar lista de operadores');
    } finally {
      setLoading(false);
    }
  };

  const loadOperatorMetrics = async () => {
    if (!selectedOperator) return;
    
    setLoadingMetrics(true);
    try {
      const response = await getManagerOperatorMetrics(selectedOperator.id, selectedMonth);
      if (response.data.hasData) {
        setMetrics(response.data.indicators);
        if (response.data.availableMonths) {
          setAvailableMonths(response.data.availableMonths);
        }
      } else {
        setMetrics(null);
      }
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
      setMetrics(null);
    } finally {
      setLoadingMetrics(false);
    }
  };

  const handleExportPDF = async () => {
    if (!selectedOperator) return;
    
    try {
      setExporting({ pdf: true });
      
      const response = await exportManagerPDF(selectedOperator.id, selectedMonth);
      const filename = `feedback_${selectedOperator.name.replace(/\s+/g, '_')}${selectedMonth ? `_${selectedMonth}` : ''}.pdf`;
      const mimeType = 'application/pdf';

      const url = window.URL.createObjectURL(new Blob([response.data], { type: mimeType }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      alert('PDF exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      alert('Erro ao exportar PDF. Tente novamente.');
    } finally {
      setExporting({ pdf: false });
    }
  };

  const renderMetricCard = (key, label, value, isPercentage = false) => {
    if (value === null || value === undefined || value === '') return null;
    
    return (
      <MetricCard
        key={key}
        label={label}
        value={value}
        explanation={METRIC_EXPLANATIONS[key]}
        status={null}
        isPercentage={isPercentage}
      />
    );
  };

  if (loading) {
    return (
      <div className="manager-dashboard">
        <div className="manager-loading">Carregando operadores...</div>
      </div>
    );
  }

  return (
    <div className="manager-dashboard">
      <div className="manager-header">
        <div>
          <h1>Dashboard de Gestão</h1>
          <p className="manager-subtitle">
            Olá, {user?.operatorName || user?.email} | Visão Administrativa
          </p>
        </div>
        <button onClick={handleLogout} className="btn btn-logout">
          Sair
        </button>
      </div>

      <div className="manager-content">
        {/* Lista de Operadores */}
        <div className="operators-list-section">
          <h2>Lista de Operadores</h2>
          <div className="operators-list">
            {operators.length === 0 ? (
              <p className="empty-message">Nenhum operador encontrado</p>
            ) : (
              operators.map((operator) => (
                <div
                  key={operator.id}
                  className={`operator-card ${selectedOperator?.id === operator.id ? 'selected' : ''}`}
                  onClick={() => setSelectedOperator(operator)}
                >
                  <div className="operator-card-header">
                    <h3>{operator.name}</h3>
                    {operator.hasMetrics && (
                      <span className="has-data-badge">✓ Dados</span>
                    )}
                  </div>
                  <div className="operator-card-info">
                    <p><strong>Cargo:</strong> {operator.position || 'N/A'}</p>
                    <p><strong>Equipe:</strong> {operator.team || 'N/A'}</p>
                    {operator.email && (
                      <p><strong>Email:</strong> {operator.email}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Métricas do Operador Selecionado */}
        <div className="metrics-section">
          {!selectedOperator ? (
            <div className="no-selection">
              <h2>Selecione um Operador</h2>
              <p>Clique em um operador da lista ao lado para visualizar suas métricas</p>
            </div>
          ) : (
            <>
              <div className="selected-operator-header">
                <div>
                  <h2>{selectedOperator.name}</h2>
                  <p className="operator-info">
                    {selectedOperator.position || 'N/A'} | {selectedOperator.team || 'N/A'}
                  </p>
                </div>
                <div className="manager-actions">
                  <div className="period-selector-wrapper">
                    <label htmlFor="manager-period-selector" className="period-label">
                      Período:
                    </label>
                    <select
                      id="manager-period-selector"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="month-selector"
                    >
                      {availableMonths.map((month) => (
                        <option key={month} value={month}>
                          {month}
                        </option>
                      ))}
                    </select>
                  </div>
                  {metrics && (
                    <button
                      onClick={handleExportPDF}
                      className="btn btn-export"
                      disabled={exporting.pdf}
                    >
                      {exporting.pdf ? 'Exportando...' : '📄 Exportar PDF'}
                    </button>
                  )}
                </div>
              </div>

              {loadingMetrics ? (
                <div className="loading-metrics">Carregando métricas...</div>
              ) : !metrics ? (
                <div className="no-metrics">
                  <p>Nenhuma métrica encontrada para este operador no período selecionado.</p>
                </div>
              ) : (
                <>
                  {/* Seção: Atendimento */}
                  <section className="metrics-section-content">
                    <h3>Atendimento</h3>
                    <div className="metrics-grid">
                      {renderMetricCard('calls', 'Ligações', metrics.calls)}
                      {renderMetricCard('tma', 'TMA', metrics.tma)}
                      {renderMetricCard('tickets', 'Tickets', metrics.tickets)}
                      {renderMetricCard('tmt', 'TMT', metrics.tmt)}
                    </div>
                  </section>

                  {/* Seção: Qualidade */}
                  <section className="metrics-section-content">
                    <h3>Qualidade</h3>
                    <div className="metrics-grid">
                      {renderMetricCard('quality_score', 'Pesquisa Telefone', metrics.quality_score)}
                      {renderMetricCard('qtd_pesq_telefone', 'Qtd Pesquisa Telefone', metrics.qtd_pesq_telefone)}
                      {renderMetricCard('pesquisa_ticket', 'Pesquisa Ticket', metrics.pesquisa_ticket)}
                      {renderMetricCard('qtd_pesq_ticket', 'Qtd Pesquisa Ticket', metrics.qtd_pesq_ticket)}
                      {renderMetricCard('nota_qualidade', 'Nota Qualidade', metrics.nota_qualidade, true)}
                      {renderMetricCard('qtd_avaliacoes', 'Qtd Avaliações', metrics.qtd_avaliacoes)}
                    </div>
                  </section>

                  {/* Seção: Disponibilidade */}
                  <section className="metrics-section-content">
                    <h3>Disponibilidade</h3>
                    <div className="metrics-grid">
                      {renderMetricCard('total_escalado', 'Total Escalado', metrics.total_escalado)}
                      {renderMetricCard('total_logado', 'Total Logado', metrics.total_logado)}
                      {renderMetricCard('percent_logado', '% Logado', metrics.percent_logado)}
                    </div>
                  </section>

                  {/* Seção: Pausas */}
                  <section className="metrics-section-content">
                    <h3>Pausas</h3>
                    <div className="metrics-grid">
                      {renderMetricCard('pausa_escalada', 'Pausa Escalada', metrics.pausa_escalada)}
                      {renderMetricCard('total_pausas', 'Total Pausas', metrics.total_pausas)}
                      {renderMetricCard('percent_pausas', '% Pausas', metrics.percent_pausas)}
                    </div>
                  </section>

                  {/* Seção: Intervalos */}
                  <section className="metrics-section-content">
                    <h3>Intervalos</h3>
                    <div className="metrics-grid">
                      {renderMetricCard('almoco_escalado', 'Almoço Escalado', metrics.almoco_escalado)}
                      {renderMetricCard('almoco_realizado', 'Almoço Realizado', metrics.almoco_realizado)}
                      {renderMetricCard('percent_almoco', '% Almoço', metrics.percent_almoco)}
                      {renderMetricCard('pausa_10_escalada', 'Pausa 10 Escalada', metrics.pausa_10_escalada)}
                      {renderMetricCard('pausa_10_realizado', 'Pausa 10 Realizado', metrics.pausa_10_realizado)}
                      {renderMetricCard('percent_pausa_10', '% Pausa 10', metrics.percent_pausa_10)}
                      {renderMetricCard('pausa_banheiro', 'Pausa Banheiro', metrics.pausa_banheiro)}
                      {renderMetricCard('percent_pausa_banheiro', '% Pausa Banheiro', metrics.percent_pausa_banheiro)}
                      {renderMetricCard('pausa_feedback', 'Pausa Feedback', metrics.pausa_feedback)}
                      {renderMetricCard('percent_pausa_feedback', '% Pausa Feedback', metrics.percent_pausa_feedback)}
                    </div>
                  </section>

                  {/* Seção: Desenvolvimento */}
                  <section className="metrics-section-content">
                    <h3>Desenvolvimento</h3>
                    <div className="metrics-grid">
                      {renderMetricCard('treinamento', 'Treinamento', metrics.treinamento)}
                      {renderMetricCard('percent_treinamento', '% Treinamento', metrics.percent_treinamento)}
                    </div>
                  </section>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ManagerDashboard;

