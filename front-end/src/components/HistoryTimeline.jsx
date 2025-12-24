import { useMemo } from 'react';
import './HistoryTimeline.css';

const ACTION_LABELS = {
  login: 'Login realizado',
  view_dashboard: 'Visualização do dashboard',
  check_metric: 'Métrica marcada',
  uncheck_metric: 'Métrica desmarcada',
  generate_ai_feedback: 'Feedback I.A gerado',
  export: 'Exportação realizada',
  save_metric: 'Métrica salva',
  create_snapshot: 'Snapshot criado'
};

function HistoryTimeline({ actions, metricsHistory, feedbacks, managerFeedbacks = [] }) {
  // Combinar todos os eventos em uma timeline ordenada
  const timeline = useMemo(() => {
    const events = [];

    // Adicionar ações (filtrar ações técnicas que não devem ser exibidas)
    actions
      .filter(action => action.action !== 'view_history') // Não mostrar ações de visualização
      .forEach(action => {
        events.push({
          type: 'action',
          date: new Date(action.action_date),
          data: action,
          label: ACTION_LABELS[action.action] || action.action
        });
      });

    // Adicionar snapshots de métricas
    metricsHistory.forEach(snapshot => {
      events.push({
        type: 'metric_snapshot',
        date: new Date(snapshot.created_at),
        data: snapshot,
        label: `Snapshot de métricas - ${snapshot.metric_type}`
      });
    });

    // Adicionar feedbacks I.A
    feedbacks.forEach(feedback => {
      events.push({
        type: 'feedback',
        date: new Date(feedback.generated_at),
        data: feedback,
        label: `Feedback I.A - ${feedback.metric_type}`
      });
    });

    // Adicionar feedbacks de gestores
    managerFeedbacks.forEach(feedback => {
      // Se tiver operator_name, significa que é um gestor vendo seus próprios feedbacks
      const label = feedback.operator_name 
        ? `Feedback para ${feedback.operator_name} - ${feedback.month}/${feedback.year}`
        : `Feedback do Gestor - ${feedback.month}/${feedback.year}`;
      
      events.push({
        type: 'manager_feedback',
        date: new Date(feedback.created_at),
        data: feedback,
        label: label,
        confirmed: feedback.confirmed || false
      });
    });

    // Ordenar por data (mais recente primeiro)
    return events.sort((a, b) => b.date - a.date);
  }, [actions, metricsHistory, feedbacks, managerFeedbacks]);

  const formatDate = (date) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderEventContent = (event) => {
    switch (event.type) {
      case 'action':
        return (
          <div className="timeline-event-content">
            <div className="event-label">{event.label}</div>
            {event.data.context && Object.keys(event.data.context).length > 0 && (
              <div className="event-context">
                <pre>{JSON.stringify(event.data.context, null, 2)}</pre>
              </div>
            )}
          </div>
        );

      case 'metric_snapshot':
        return (
          <div className="timeline-event-content">
            <div className="event-label">{event.label}</div>
            <div className="event-metrics">
              <strong>Tipo:</strong> {event.data.metric_type}<br />
              <strong>Data do snapshot:</strong> {event.data.snapshot_date}
            </div>
          </div>
        );

      case 'feedback':
        return (
          <div className="timeline-event-content">
            <div className="event-label">{event.label}</div>
            <div className="event-feedback">
              <p>{event.data.feedback_text}</p>
            </div>
          </div>
        );

      case 'manager_feedback':
        // Verificar se é um gestor vendo seu próprio feedback ou um operador vendo feedback recebido
        const isManagerView = event.data.operator_name !== undefined;
        
        return (
          <div className="timeline-event-content">
            <div className="event-label">
              {isManagerView 
                ? `Feedback para ${event.data.operator_name} - ${event.data.month}/${event.data.year}`
                : event.label
              }
              {!isManagerView && !event.confirmed && (
                <span className="unconfirmed-badge">⚠️ Não confirmado</span>
              )}
            </div>
            <div className="event-feedback">
              <p>{event.data.feedback_text}</p>
              {isManagerView ? (
                // Gestor vendo: mostrar para qual operador foi o feedback
                <div className="feedback-operator">
                  <strong>Para:</strong> {event.data.operator_name}
                </div>
              ) : (
                // Operador vendo: mostrar quem foi o gestor
                event.data.manager_name && (
                  <div className="feedback-manager">
                    <strong>Gestor:</strong> {event.data.manager_name}
                  </div>
                )
              )}
              {!isManagerView && event.confirmed && event.data.confirmationDate && (
                <div className="feedback-confirmed">
                  ✓ Confirmado em {new Date(event.data.confirmationDate).toLocaleDateString('pt-BR')}
                </div>
              )}
              {!isManagerView && event.data.observations && (
                <div className="feedback-observations">
                  <strong>Observações:</strong> {event.data.observations}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return <div>{event.label}</div>;
    }
  };

  if (timeline.length === 0) {
    // Verificar se realmente não há conteúdo relevante
    const hasRelevantContent = 
      managerFeedbacks.length > 0 || 
      metricsHistory.length > 0 || 
      feedbacks.length > 0 ||
      actions.some(a => a.action !== 'view_history');
    
    if (!hasRelevantContent) {
      return (
        <div className="timeline-empty">
          <p>Nenhum histórico encontrado para o período selecionado.</p>
          <p className="timeline-empty-hint">
            💡 Os feedbacks de gestores, métricas históricas e outras ações aparecerão aqui quando disponíveis.
          </p>
        </div>
      );
    }
    
    // Se chegou aqui, há conteúdo mas foi filtrado pelo período selecionado
    return (
      <div className="timeline-empty">
        <p>Nenhum histórico encontrado para o período selecionado.</p>
        <p className="timeline-empty-hint">
          Tente selecionar um período diferente ou limpar os filtros.
        </p>
      </div>
    );
  }

  return (
    <div className="history-timeline">
      {timeline.map((event, index) => (
        <div 
          key={index} 
          className={`timeline-item timeline-item-${event.type} ${event.type === 'manager_feedback' && !event.confirmed ? 'unconfirmed-feedback' : ''}`}
        >
          <div className="timeline-marker"></div>
          <div className="timeline-content">
            <div className="timeline-date">{formatDate(event.date)}</div>
            {renderEventContent(event)}
          </div>
        </div>
      ))}
    </div>
  );
}

export default HistoryTimeline;

