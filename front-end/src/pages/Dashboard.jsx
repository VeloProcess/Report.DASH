import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getDashboardMetrics, 
  getDashboardFeedback,
  getDashboardOperator,
  getDashboardMonths,
  exportPDF,
  getOperatorFeedbacks,
  getThreeMonthsFeedback
} from '../services/api';
import MetricCard from '../components/MetricCard';
import OperatorConfirmation from '../components/OperatorConfirmation';
import MonthComparison from '../components/MonthComparison';
import './Dashboard.css';

// Explicações das métricas
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
};

function Dashboard() {
  const { user, handleLogout, loading: authLoading } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [operator, setOperator] = useState(null);
  const [managerFeedbacks, setManagerFeedbacks] = useState([]);
  const [threeMonthsFeedback, setThreeMonthsFeedback] = useState(null);
  const [loadingThreeMonthsFeedback, setLoadingThreeMonthsFeedback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState({ pdf: false });
  // Meses fixos disponíveis
  const FIXED_MONTHS = ['Dezembro', 'Novembro', 'Outubro'];
  const [selectedMonth, setSelectedMonth] = useState('Dezembro'); // Padrão: Dezembro (mês vigente)
  const [availableMonths, setAvailableMonths] = useState(FIXED_MONTHS);

  // Log quando user muda
  useEffect(() => {
    console.log('👤 User mudou no Dashboard:', { 
      hasUser: !!user, 
      email: user?.email, 
      authLoading 
    });
  }, [user, authLoading]);

  useEffect(() => {
    // Tentar carregar meses da API, mas usar os fixos como fallback
    loadAvailableMonths();
  }, []);

  useEffect(() => {
    console.log('🔄 useEffect Dashboard - authLoading:', authLoading, 'user:', user?.email, 'selectedMonth:', selectedMonth);
    if (!authLoading && user?.email) {
      console.log('✅ Usuário disponível, carregando dados...');
      loadDashboardData();
      loadThreeMonthsFeedback();
    } else if (!authLoading && !user?.email) {
      console.warn('⚠️ Usuário não disponível no useEffect (authLoading:', authLoading, ', user:', user, ')');
    }
  }, [user, selectedMonth, authLoading]);
  
  const loadThreeMonthsFeedback = async () => {
    if (!user?.email) {
      console.warn('⚠️ Usuário não disponível para carregar feedback de 3 meses');
      return;
    }
    
    setLoadingThreeMonthsFeedback(true);
    try {
      console.log('🔄 Carregando feedback de 3 meses para:', user.email);
      const response = await getThreeMonthsFeedback(user.email);
      console.log('📥 Resposta do feedback de 3 meses:', response.data);
      if (response.data && response.data.success) {
        console.log('✅ Feedback de 3 meses carregado:', response.data.feedback?.substring(0, 100));
        setThreeMonthsFeedback(response.data.feedback);
      } else {
        console.warn('⚠️ Resposta sem success ou sem feedback:', response.data);
        setThreeMonthsFeedback(null);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar feedback de 3 meses:', error);
      console.error('❌ Detalhes do erro:', error.response?.data || error.message);
      setThreeMonthsFeedback(null);
    } finally {
      setLoadingThreeMonthsFeedback(false);
    }
  };

  const loadAvailableMonths = async () => {
    try {
      const response = await getDashboardMonths();
      if (response.data.success && response.data.months && response.data.months.length > 0) {
        // Usar meses da API se disponíveis, mas garantir que Dezembro está na lista
        const apiMonths = response.data.months;
        const allMonths = [...new Set([...FIXED_MONTHS, ...apiMonths])];
        setAvailableMonths(allMonths);
        
        // Se Dezembro não estiver selecionado e estiver disponível, manter Dezembro
        if (!selectedMonth || selectedMonth === '') {
          setSelectedMonth('Dezembro');
        }
      } else {
        // Se API não retornar meses, usar os fixos
        setAvailableMonths(FIXED_MONTHS);
        if (!selectedMonth || selectedMonth === '') {
          setSelectedMonth('Dezembro');
        }
      }
    } catch (error) {
      console.error('Erro ao carregar meses disponíveis:', error);
      // Em caso de erro, usar meses fixos
      setAvailableMonths(FIXED_MONTHS);
      if (!selectedMonth || selectedMonth === '') {
        setSelectedMonth('Dezembro');
      }
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const currentYear = new Date().getFullYear();
      // IMPORTANTE: Para operadores, buscar TODOS os feedbacks (sem filtro de mês)
      // Para gestores, pode filtrar por mês se necessário
      const isManager = user?.isManager || false;
      const monthForFeedbacks = isManager ? selectedMonth : null; // Operadores não filtram por mês
      const yearForFeedbacks = null; // Não filtrar por ano para garantir que todos apareçam
      
      const [metricsRes, feedbackRes, operatorRes, managerFeedbacksRes] = await Promise.all([
        getDashboardMetrics(selectedMonth).catch(() => ({ data: { hasData: false } })),
        getDashboardFeedback().catch(() => ({ data: { hasData: false } })),
        getDashboardOperator().catch(() => null),
        getOperatorFeedbacks(monthForFeedbacks, yearForFeedbacks).catch(() => ({ data: { success: false, feedbacks: [] } })),
      ]);

      if (metricsRes.data.hasData) {
        setMetrics(metricsRes.data.indicators);
      }
      if (feedbackRes.data.hasData) {
        setFeedback(feedbackRes.data.feedback);
      }
      if (operatorRes) {
        setOperator(operatorRes.data);
      }
      if (managerFeedbacksRes.data.success) {
        setManagerFeedbacks(managerFeedbacksRes.data.feedbacks || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setExporting({ pdf: true });
      
      const response = await exportPDF(selectedMonth);
      const filename = `feedback_${user.operatorName.replace(/\s+/g, '_')}${selectedMonth ? `_${selectedMonth}` : ''}.pdf`;
      const mimeType = 'application/pdf';

      // Criar link de download
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

  const getMetricStatus = (key, value) => {
    // Lógica simples para determinar status (pode ser melhorada)
    // Por enquanto, retornar null (sem status)
    return null;
  };

  // Função para formatar o texto do feedback de IA (converte markdown simples para HTML)
  const formatAIFeedback = (text) => {
    if (!text) return '';
    
    // Dividir por linhas
    const lines = text.split('\n');
    const formatted = [];
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Linha vazia
      if (!trimmedLine) {
        formatted.push(<br key={`br-${index}`} />);
        return;
      }
      
      // Detectar títulos/seções (linhas que começam com emoji e texto em negrito)
      const titleMatch = trimmedLine.match(/^([📊✅⚠️➡️🎯])\s*\*\*(.+?)\*\*/);
      if (titleMatch) {
        const [, emoji, title] = titleMatch;
        formatted.push(
          <div key={`title-${index}`} className="ai-feedback-section-title">
            <span className="ai-feedback-emoji">{emoji}</span>
            <strong className="ai-feedback-title">{title}</strong>
          </div>
        );
        return;
      }
      
      // Detectar texto em negrito (**texto**)
      const boldMatch = trimmedLine.match(/\*\*(.+?)\*\*/);
      if (boldMatch && trimmedLine.startsWith('**')) {
        // Linha inteira em negrito (título)
        formatted.push(
          <div key={`bold-${index}`} className="ai-feedback-bold-line">
            <strong>{trimmedLine.replace(/\*\*/g, '')}</strong>
          </div>
        );
        return;
      }
      
      // Processar texto com negrito inline
      const parts = [];
      let currentIndex = 0;
      const boldRegex = /\*\*(.+?)\*\*/g;
      let match;
      let lastIndex = 0;
      
      while ((match = boldRegex.exec(trimmedLine)) !== null) {
        // Texto antes do negrito
        if (match.index > lastIndex) {
          parts.push(trimmedLine.substring(lastIndex, match.index));
        }
        // Texto em negrito
        parts.push(<strong key={`bold-${index}-${match.index}`}>{match[1]}</strong>);
        lastIndex = match.index + match[0].length;
      }
      
      // Texto restante
      if (lastIndex < trimmedLine.length) {
        parts.push(trimmedLine.substring(lastIndex));
      }
      
      // Se não encontrou nenhum negrito, usar o texto original
      if (parts.length === 0) {
        parts.push(trimmedLine);
      }
      
      // Detectar se é um item de lista (começa com - ou •)
      if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•')) {
        formatted.push(
          <div key={`item-${index}`} className="ai-feedback-item">
            {parts}
          </div>
        );
      } else {
        formatted.push(
          <p key={`para-${index}`} className="ai-feedback-paragraph">
            {parts}
          </p>
        );
      }
    });
    
    return formatted;
  };

  const renderMetricCard = (key, label, value, isPercentage = false) => {
    if (value === null || value === undefined || value === '') return null;
    
    return (
      <MetricCard
        key={key}
        label={label}
        value={value}
        explanation={METRIC_EXPLANATIONS[key]}
        status={getMetricStatus(key, value)}
        isPercentage={isPercentage}
      />
    );
  };

  if (authLoading || loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-loading">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard de Métricas</h1>
          {operator ? (
            <p className="dashboard-subtitle">
              {operator.name} | {operator.position} | Período: {selectedMonth || 'Dezembro'}
            </p>
          ) : (
            <p className="dashboard-subtitle">
              Olá, {user?.operatorName || user?.email} | Período: {selectedMonth || 'Dezembro'}
            </p>
          )}
          {user && !operator && (
            <p className="dashboard-subtitle">
              {user.operatorName || user.name || user.email}
            </p>
          )}
        </div>
        <div className="dashboard-actions">
          <div className="period-selector-wrapper">
            <label htmlFor="period-selector" className="period-label">
              Selecione o período:
            </label>
            <select
              id="period-selector"
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
          <button onClick={handleLogout} className="btn btn-logout">
            Sair
          </button>
        </div>
      </div>

      {!metrics && managerFeedbacks.length === 0 ? (
        <>
          <div className="dashboard-empty">
            <div className="empty-message">
              <h2>😔 Ops!</h2>
              <p>Infelizmente ainda não temos dados suficientes para criar seu dashboard.</p>
              <p>Entre em contato com o suporte ou aguarde a notificação!</p>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Seção: Feedbacks de Gestores */}
          {managerFeedbacks.length > 0 && (
            <section className="feedback-section">
              <h2>Feedbacks dos Gestores</h2>
              <div className="feedback-content">
                {/* IMPORTANTE: Mostrar TODOS os feedbacks para operadores, não filtrar por mês */}
                {managerFeedbacks
                  .map((feedback, index) => (
                    <div key={`feedback-${feedback.id || index}`} className="feedback-item manager-feedback">
                      <h3>
                        Feedback - {feedback.month}/{feedback.year}
                        {feedback.manager_name && (
                          <span className="manager-name"> - {feedback.manager_name}</span>
                        )}
                      </h3>
                      <p>{feedback.feedback_text}</p>
                      
                      {/* Componente de confirmação para cada feedback individual */}
                      <OperatorConfirmation 
                        feedbackId={feedback.id}
                        month={feedback.month} 
                        year={feedback.year} 
                      />
                    </div>
                  ))}
              </div>
            </section>
          )}

          {/* Métricas - só mostrar se existirem */}
          {metrics && (
            <>
              {/* Seção: Comparativo entre Meses - sempre mostrar quando há métricas */}
              <MonthComparison currentMonth={selectedMonth} />

              {/* Seção: Atendimento */}
              <section className="metrics-section">
                <h2>Atendimento</h2>
                <div className="metrics-grid">
                  {renderMetricCard('calls', 'Ligações', metrics.calls)}
                  {renderMetricCard('tma', 'TMA', metrics.tma)}
                  {renderMetricCard('tickets', 'Tickets', metrics.tickets)}
                  {renderMetricCard('tmt', 'TMT', metrics.tmt)}
                </div>
              </section>

              {/* Seção: Qualidade */}
              <section className="metrics-section">
                <h2>Qualidade</h2>
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
              <section className="metrics-section">
                <h2>Disponibilidade</h2>
                <div className="metrics-grid">
                  {renderMetricCard('total_escalado', 'Total Escalado', metrics.total_escalado)}
                  {renderMetricCard('total_logado', 'Total Logado', metrics.total_logado)}
                  {renderMetricCard('percent_logado', '% Logado', metrics.percent_logado)}
                </div>
              </section>

              {/* Seção: Pausas */}
              <section className="metrics-section">
                <h2>Pausas</h2>
                <div className="metrics-grid">
                  {renderMetricCard('pausa_escalada', 'Pausa Escalada', metrics.pausa_escalada)}
                  {renderMetricCard('total_pausas', 'Total Pausas', metrics.total_pausas)}
                  {renderMetricCard('percent_pausas', '% Pausas', metrics.percent_pausas)}
                </div>
              </section>

              {/* Seção: Intervalos */}
              <section className="metrics-section">
                <h2>Intervalos</h2>
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
              <section className="metrics-section">
                <h2>Desenvolvimento</h2>
                <div className="metrics-grid">
                  {renderMetricCard('treinamento', 'Treinamento', metrics.treinamento)}
                  {renderMetricCard('percent_treinamento', '% Treinamento', metrics.percent_treinamento)}
                </div>
              </section>

              {/* Seção: Feedback */}
              {feedback && (
                <section className="feedback-section">
                  <h2>Feedback</h2>
                  <div className="feedback-content">
                    {feedback.feedback_text && (
                      <div className="feedback-item">
                        <h3>Resumo Geral</h3>
                        <p>{feedback.feedback_text}</p>
                      </div>
                    )}
                    {feedback.positive_points && (
                      <div className="feedback-item positive">
                        <h3>Pontos Positivos</h3>
                        <p>{feedback.positive_points}</p>
                      </div>
                    )}
                    {feedback.attention_points && (
                      <div className="feedback-item attention">
                        <h3>Pontos de Atenção</h3>
                        <p>{feedback.attention_points}</p>
                      </div>
                    )}
                    {feedback.recommendations && (
                      <div className="feedback-item recommendations">
                        <h3>Recomendações</h3>
                        <p>{feedback.recommendations}</p>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </>
          )}

          {/* Seção: Feedback de IA dos Últimos 3 Meses - Aparece após todas as métricas e confirmações */}
          {user?.email && (
            <section className="feedback-section ai-feedback-section">
              <h2>🤖 Análise de IA - Últimos 3 Meses</h2>
              <div className="feedback-content">
                <div className="feedback-item ai-feedback">
                  {loadingThreeMonthsFeedback ? (
                    <p>Carregando análise...</p>
                  ) : threeMonthsFeedback ? (
                    <div className="ai-feedback-text">
                      {formatAIFeedback(threeMonthsFeedback)}
                    </div>
                  ) : (
                    <p>Não foi possível carregar a análise. Verifique o console para mais detalhes.</p>
                  )}
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;

