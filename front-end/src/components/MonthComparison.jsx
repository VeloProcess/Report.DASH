import { useState, useEffect } from 'react';
import { getDashboardComparison } from '../services/api';
import './MonthComparison.css';

function MonthComparison({ currentMonth, operatorEmail = null }) {
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComparison();
  }, [currentMonth, operatorEmail]);

  const loadComparison = async () => {
    try {
      setLoading(true);
      console.log('🔍 Carregando comparação para mês:', currentMonth, operatorEmail ? `(operador: ${operatorEmail})` : '');
      // Se operatorEmail for fornecido, usar endpoint de gestor
      // Por enquanto, usar o mesmo endpoint que funciona para o operador autenticado
      // A API já usa req.user.email, então precisamos criar um endpoint específico para gestores
      const response = await getDashboardComparison(currentMonth, operatorEmail);
      console.log('📊 Resposta da API:', response.data);
      if (response.data.success) {
        console.log('✅ Comparação carregada:', response.data.comparison);
        console.log('📋 Comparação detalhada:', JSON.stringify(response.data.comparison, null, 2));
        console.log('📊 Keys do comparison:', Object.keys(response.data.comparison.comparison || {}));
        setComparison(response.data.comparison);
      } else {
        console.log('⚠️ API retornou success: false');
        setComparison(null);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar comparação:', error);
      console.error('Detalhes do erro:', error.response?.data || error.message);
      setComparison(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="metrics-section">
        <div className="month-comparison-loading">
          <h2 className="comparison-title">Comparativo com Meses Anteriores</h2>
          <p>Carregando comparação...</p>
        </div>
      </section>
    );
  }

  // Sempre mostrar algo, mesmo se não houver dados
  console.log('🔍 Verificando comparação:', {
    hasComparison: !!comparison,
    hasComparisonData: !!(comparison && comparison.comparison),
    comparisonKeys: comparison && comparison.comparison ? Object.keys(comparison.comparison) : [],
    comparisonLength: comparison && comparison.comparison ? Object.keys(comparison.comparison).length : 0,
    fullComparison: comparison
  });
  
  if (!comparison || !comparison.comparison || Object.keys(comparison.comparison).length === 0) {
    console.log('⚠️ Não há dados suficientes para exibir comparação');
    return (
      <section className="metrics-section">
        <div className="month-comparison">
          <h2 className="comparison-title">
            Comparativo com Meses Anteriores
          </h2>
          <div className="comparison-empty">
            <p>Dados insuficientes para comparação. É necessário ter dados de pelo menos 2 meses para comparar.</p>
            <p style={{ fontSize: '12px', marginTop: '8px', color: '#94a3b8' }}>
              Mês atual: {currentMonth || 'Não especificado'}
            </p>
            {comparison && (
              <p style={{ fontSize: '12px', marginTop: '8px', color: '#94a3b8' }}>
                Debug: comparison existe, mas comparison.comparison está vazio ou não existe
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

  const { comparison: data, currentMonth: month, previousMonths } = comparison;

  const getStatusIcon = (status) => {
    if (status === 'subindo') return '📈';
    if (status === 'caindo') return '📉';
    if (status === 'mantendo') return '➡️';
    return '';
  };

  const getStatusClass = (status) => {
    if (status === 'subindo') return 'status-up';
    if (status === 'caindo') return 'status-down';
    if (status === 'mantendo') return 'status-maintain';
    return '';
  };

  // Regras de cores por tópico:
  // Atendimento, Qualidade, Disponibilidade: subindo = verde (bom)
  // Pausas, Intervalos: subindo = vermelho (ruim)
  const getStatusClassForTopic = (topic, status) => {
    if (!status) return '';
    
    // Tópicos onde subir é bom (verde)
    const goodWhenUp = ['atendimento', 'qualidade', 'disponibilidade'];
    // Tópicos onde subir é ruim (vermelho)
    const badWhenUp = ['pausas', 'intervalos'];
    
    if (status === 'mantendo') {
      return 'status-maintain';
    }
    
    if (goodWhenUp.includes(topic)) {
      // Para estes tópicos, subindo = verde, caindo = vermelho
      return status === 'subindo' ? 'status-up' : 'status-down';
    } else if (badWhenUp.includes(topic)) {
      // Para estes tópicos, subindo = vermelho, caindo = verde
      return status === 'subindo' ? 'status-down' : 'status-up';
    }
    
    return getStatusClass(status);
  };

  const getStatusText = (status) => {
    if (status === 'subindo') return 'Subindo';
    if (status === 'caindo') return 'Caindo';
    if (status === 'mantendo') return 'Mantendo';
    return '';
  };


  return (
    <section className="metrics-section">
      <div className="month-comparison">
        <h2 className="comparison-title">
          Comparativo com Meses Anteriores
          <span className="comparison-subtitle">
            {month} vs {previousMonths.join(' e ')}
          </span>
        </h2>

      <div className="comparison-grid">
        {/* Atendimento - Subindo = Verde (bom) */}
        {data.atendimento && (
          <div className={`comparison-card ${getStatusClassForTopic('atendimento', data.atendimento.status)}`}>
            <div className="comparison-header">
              <h3>Atendimento</h3>
              <span className={`status-badge ${getStatusClassForTopic('atendimento', data.atendimento.status)}`}>
                {getStatusIcon(data.atendimento.status)} {getStatusText(data.atendimento.status)}
              </span>
            </div>
            <div className="comparison-content">
              <div className="comparison-percent">
                {data.atendimento.percentChange > 0 ? '+' : ''}{data.atendimento.percentChange}%
              </div>
            </div>
          </div>
        )}

        {/* Qualidade - Subindo = Verde (bom) */}
        {data.qualidade && (
          <div className={`comparison-card ${getStatusClassForTopic('qualidade', data.qualidade.status)}`}>
            <div className="comparison-header">
              <h3>Qualidade</h3>
              <span className={`status-badge ${getStatusClassForTopic('qualidade', data.qualidade.status)}`}>
                {getStatusIcon(data.qualidade.status)} {getStatusText(data.qualidade.status)}
              </span>
            </div>
            <div className="comparison-content">
              <div className="comparison-percent">
                {data.qualidade.percentChange > 0 ? '+' : ''}{data.qualidade.percentChange}%
              </div>
            </div>
          </div>
        )}

        {/* Disponibilidade - Subindo = Verde (bom) */}
        {data.disponibilidade && (
          <div className={`comparison-card ${getStatusClassForTopic('disponibilidade', data.disponibilidade.status)}`}>
            <div className="comparison-header">
              <h3>Disponibilidade</h3>
              <span className={`status-badge ${getStatusClassForTopic('disponibilidade', data.disponibilidade.status)}`}>
                {getStatusIcon(data.disponibilidade.status)} {getStatusText(data.disponibilidade.status)}
              </span>
            </div>
            <div className="comparison-content">
              <div className="comparison-percent">
                {data.disponibilidade.percentChange > 0 ? '+' : ''}{data.disponibilidade.percentChange}%
              </div>
            </div>
          </div>
        )}

        {/* Pausas - Subindo = Vermelho (ruim) */}
        {data.pausas && (
          <div className={`comparison-card ${getStatusClassForTopic('pausas', data.pausas.status)}`}>
            <div className="comparison-header">
              <h3>Pausas</h3>
              <span className={`status-badge ${getStatusClassForTopic('pausas', data.pausas.status)}`}>
                {getStatusIcon(data.pausas.status)} {getStatusText(data.pausas.status)}
              </span>
            </div>
            <div className="comparison-content">
              <div className="comparison-percent">
                {data.pausas.percentChange > 0 ? '+' : ''}{data.pausas.percentChange}%
              </div>
            </div>
          </div>
        )}

        {/* Intervalos - Subindo = Vermelho (ruim) */}
        {(data.intervalos_almoco || data.intervalos_pausa10) && (
          <div className={`comparison-card ${getStatusClassForTopic('intervalos', 
            data.intervalos_almoco?.status || data.intervalos_pausa10?.status
          )}`}>
            <div className="comparison-header">
              <h3>Intervalos</h3>
              <span className={`status-badge ${getStatusClassForTopic('intervalos', 
                data.intervalos_almoco?.status || data.intervalos_pausa10?.status
              )}`}>
                {getStatusIcon(data.intervalos_almoco?.status || data.intervalos_pausa10?.status)} 
                {getStatusText(data.intervalos_almoco?.status || data.intervalos_pausa10?.status)}
              </span>
            </div>
            <div className="comparison-content">
              <div className="comparison-percent">
                {(data.intervalos_almoco?.percentChange || data.intervalos_pausa10?.percentChange || 0) > 0 ? '+' : ''}
                {data.intervalos_almoco?.percentChange || data.intervalos_pausa10?.percentChange || '0'}%
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </section>
  );
}

export default MonthComparison;

