import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { saveOperatorConfirmation, deleteManagerFeedback } from '../services/api';
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

function HistoryTimeline({ actions, metricsHistory, feedbacks, managerFeedbacks = [], onFeedbackDeleted }) {
  const { user } = useAuth();
  const isManager = user?.isManager || false;
  
  // Estado para gerenciar confirmações de cada feedback
  const [confirmations, setConfirmations] = useState({});
  const [savingStates, setSavingStates] = useState({});
  const [deletingStates, setDeletingStates] = useState({});

  // Inicializar confirmações quando os feedbacks mudarem
  useEffect(() => {
    const newConfirmations = {};
    managerFeedbacks.forEach(feedback => {
      const feedbackId = `${feedback.id || feedback.month}_${feedback.year}`;
      // Garantir que confirmed seja sempre um boolean explícito
      // Se não houver confirmação ou se for null/undefined, considerar como false
      const isConfirmed = feedback.confirmed === true || feedback.confirmed === 1 || feedback.confirmed === 'true';
      newConfirmations[feedbackId] = {
        understood: isConfirmed,
        observations: feedback.observations || ''
      };
    });
    setConfirmations(prev => {
      // Só atualizar se houver mudanças
      const hasChanges = Object.keys(newConfirmations).some(id => 
        !prev[id] || 
        prev[id].understood !== newConfirmations[id].understood ||
        prev[id].observations !== newConfirmations[id].observations
      );
      return hasChanges ? { ...prev, ...newConfirmations } : prev;
    });
  }, [managerFeedbacks]);

  // Combinar todos os eventos em uma timeline ordenada
  // APENAS feedbacks de gestores devem aparecer (sem logs de login, ações, métricas, etc)
  const timeline = useMemo(() => {
    const events = [];

    // APENAS adicionar feedbacks de gestores
    managerFeedbacks.forEach(feedback => {
      // Se tiver operator_name, significa que é um gestor vendo seus próprios feedbacks
      const label = feedback.operator_name 
        ? `Feedback para ${feedback.operator_name} - ${feedback.month}/${feedback.year}`
        : `Feedback do Gestor - ${feedback.month}/${feedback.year}`;
      
      const feedbackId = `${feedback.id || feedback.month}_${feedback.year}`;
      
      // Garantir que confirmed seja sempre um boolean explícito
      const isConfirmed = feedback.confirmed === true || feedback.confirmed === 1 || feedback.confirmed === 'true';
      
      events.push({
        type: 'manager_feedback',
        date: new Date(feedback.created_at),
        data: feedback,
        label: label,
        confirmed: isConfirmed,
        feedbackId: feedbackId
      });
    });

    // Ordenar por data (mais recente primeiro)
    return events.sort((a, b) => b.date - a.date);
  }, [managerFeedbacks]);

  const handleConfirmationChange = async (feedbackId, understood, observations = '') => {
    const feedback = managerFeedbacks.find(fb => `${fb.id || fb.month}_${fb.year}` === feedbackId);
    if (!feedback || !feedback.id) return;

    setSavingStates(prev => ({ ...prev, [feedbackId]: true }));
    
    try {
      const response = await saveOperatorConfirmation(
        feedback.id, // Usar feedback.id (número) em vez de month/year
        feedback.month,
        feedback.year,
        understood,
        observations
      );
      
      if (response.data.success) {
        setConfirmations(prev => ({
          ...prev,
          [feedbackId]: { understood, observations }
        }));
      }
    } catch (error) {
      console.error('Erro ao salvar confirmação:', error);
      alert('Erro ao salvar confirmação. Tente novamente.');
    } finally {
      setSavingStates(prev => ({ ...prev, [feedbackId]: false }));
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    const feedback = managerFeedbacks.find(fb => `${fb.id || fb.month}_${fb.year}` === feedbackId);
    if (!feedback || !feedback.id) return;

    const confirmDelete = window.confirm(
      'Tem certeza que deseja excluir este feedback? Esta ação não pode ser desfeita.'
    );

    if (!confirmDelete) return;

    setDeletingStates(prev => ({ ...prev, [feedbackId]: true }));

    try {
      const response = await deleteManagerFeedback(feedback.id);
      
      if (response.data && response.data.success) {
        // Chamar callback para atualizar a lista
        if (onFeedbackDeleted) {
          await onFeedbackDeleted();
        }
        
        // Forçar atualização da página após um pequeno delay para garantir que o backend processou
        setTimeout(() => {
          window.location.reload();
        }, 500);
        
        alert('Feedback excluído com sucesso! A página será atualizada.');
      } else {
        throw new Error(response.data?.error || 'Erro ao excluir feedback');
      }
    } catch (error) {
      console.error('Erro ao excluir feedback:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao excluir feedback. Tente novamente.';
      alert(`Erro ao excluir feedback: ${errorMessage}`);
    } finally {
      setDeletingStates(prev => ({ ...prev, [feedbackId]: false }));
    }
  };

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
    // Apenas renderizar feedbacks de gestores
    if (event.type === 'manager_feedback') {
        // Usar o contexto de autenticação para determinar se é gestor ou operador
        // Se o usuário é gestor, não mostrar checkbox (ele está vendo feedbacks que criou)
        // Se o usuário é operador, mostrar checkbox (ele está vendo feedbacks recebidos)
        const feedbackId = event.feedbackId;
        // Garantir que sempre use um boolean explícito para understood
        const eventConfirmed = event.confirmed === true || event.confirmed === 1 || event.confirmed === 'true';
        const confirmation = confirmations[feedbackId] || { 
          understood: eventConfirmed, 
          observations: event.data.observations || '' 
        };
        const isSaving = savingStates[feedbackId] || false;
        
        console.log('🔍 Renderizando feedback:', { 
          feedbackId, 
          isManager, 
          confirmation, 
          hasCheckbox: !isManager 
        });
        
        const isDeleting = deletingStates[feedbackId] || false;
        // Mostrar botão de excluir apenas para gestores que criaram o feedback
        const canDelete = isManager && event.data.manager_email === user?.email;
        
        return (
          <div className="timeline-event-content">
            <div className="event-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                {isManager && event.data.operator_name
                  ? `Feedback para ${event.data.operator_name} - ${event.data.month}/${event.data.year}`
                  : event.label
                }
                {!isManager && !confirmation.understood && (
                  <span className="unconfirmed-badge">⚠️ Não confirmado</span>
                )}
              </div>
              {canDelete && (
                <button
                  onClick={() => handleDeleteFeedback(feedbackId)}
                  disabled={isDeleting}
                  className="btn-delete-feedback"
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                    opacity: isDeleting ? 0.6 : 1,
                    transition: 'all 0.2s',
                    marginLeft: '10px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isDeleting) {
                      e.target.style.backgroundColor = '#c0392b';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isDeleting) {
                      e.target.style.backgroundColor = '#e74c3c';
                    }
                  }}
                  title="Excluir feedback"
                >
                  {isDeleting ? 'Excluindo...' : '🗑️ Excluir'}
                </button>
              )}
            </div>
            <div className="event-feedback">
              <p>{event.data.feedback_text}</p>
              {isManager && event.data.operator_name ? (
                // Gestor vendo: mostrar para qual operador foi o feedback + status de confirmação
                <>
                  <div className="feedback-operator" style={{ marginBottom: '15px' }}>
                    <strong>Para:</strong> {event.data.operator_name}
                    {event.data.operator_email && (
                      <span style={{ marginLeft: '10px', fontSize: '14px', color: '#666' }}>
                        ({event.data.operator_email})
                      </span>
                    )}
                  </div>
                  
                  {/* Status de confirmação do operador */}
                  <div className="manager-confirmation-status" style={{
                    marginTop: '20px',
                    paddingTop: '20px',
                    borderTop: '1px solid #e0e0e0',
                    backgroundColor: (event.data.confirmed || confirmation.understood) ? '#e8f5e9' : '#fff3e0',
                    padding: '15px',
                    borderRadius: '6px',
                    border: `2px solid ${(event.data.confirmed || confirmation.understood) ? '#4caf50' : '#ff9800'}`
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      marginBottom: '10px',
                      gap: '10px'
                    }}>
                      <strong style={{ fontSize: '16px', color: '#2c3e50' }}>
                        Status de Confirmação:
                      </strong>
                      {(event.data.confirmed || confirmation.understood) ? (
                        <span style={{ 
                          color: '#4caf50', 
                          fontWeight: 600,
                          fontSize: '16px'
                        }}>
                          ✓ Confirmado
                        </span>
                      ) : (
                        <span style={{ 
                          color: '#ff9800', 
                          fontWeight: 600,
                          fontSize: '16px'
                        }}>
                          ⚠️ Não confirmado
                        </span>
                      )}
                    </div>
                    
                    {(event.data.confirmationDate || event.data.confirmation_date) && (
                      <div style={{ 
                        fontSize: '14px', 
                        color: '#666',
                        marginBottom: '10px'
                      }}>
                        Confirmado em: {new Date(event.data.confirmationDate || event.data.confirmation_date).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    )}
                    
                    {(event.data.observations || confirmation.observations) && (event.data.observations || confirmation.observations).trim() !== '' && (
                      <div style={{ 
                        marginTop: '15px',
                        paddingTop: '15px',
                        borderTop: '1px solid #ddd'
                      }}>
                        <strong style={{ 
                          fontSize: '14px', 
                          color: '#2c3e50',
                          display: 'block',
                          marginBottom: '8px'
                        }}>
                          Observações do Operador:
                        </strong>
                        <div style={{ 
                          fontSize: '14px', 
                          color: '#333',
                          backgroundColor: '#f5f5f5',
                          padding: '12px',
                          borderRadius: '4px',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word'
                        }}>
                          {event.data.observations || confirmation.observations}
                        </div>
                      </div>
                    )}
                    
                    {(!event.data.observations && !confirmation.observations) || ((event.data.observations || confirmation.observations || '').trim() === '') && (
                      <div style={{ 
                        fontSize: '14px', 
                        color: '#999',
                        fontStyle: 'italic',
                        marginTop: '10px'
                      }}>
                        Nenhuma observação registrada pelo operador.
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Operador vendo: mostrar quem foi o gestor */}
                  {event.data.manager_name && (
                    <div className="feedback-manager">
                      <strong>Gestor:</strong> {event.data.manager_name}
                    </div>
                  )}
                  
                  {/* Checkbox e campo de observações para operadores */}
                  <div className="feedback-confirmation-section" style={{
                    marginTop: '20px',
                    paddingTop: '20px',
                    borderTop: '1px solid #e0e0e0'
                  }}>
                    <div className="confirmation-checkbox" style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      marginBottom: '15px'
                    }}>
                      <label 
                        htmlFor={`checkbox-${feedbackId}`}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                      >
                        <input
                          id={`checkbox-${feedbackId}`}
                          type="checkbox"
                          checked={confirmation.understood}
                          onChange={(e) => {
                            console.log('✅ Checkbox clicado no histórico:', e.target.checked);
                            handleConfirmationChange(feedbackId, e.target.checked, confirmation.observations);
                          }}
                          disabled={isSaving}
                          style={{ 
                            width: '20px', 
                            height: '20px', 
                            marginRight: '12px', 
                            cursor: isSaving ? 'not-allowed' : 'pointer',
                            accentColor: '#1694ff',
                            flexShrink: 0
                          }}
                        />
                        <span style={{ fontSize: '16px', fontWeight: 500, color: '#2c3e50' }}>
                          Compreendi
                        </span>
                      </label>
                    </div>

                    <div className="confirmation-observations" style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '8px'
                    }}>
                      <label 
                        htmlFor={`observations-${feedbackId}`}
                        style={{ fontSize: '14px', fontWeight: 600, color: '#2c3e50' }}
                      >
                        Observações (pontos que discorda ou algo específico):
                      </label>
                      <textarea
                        id={`observations-${feedbackId}`}
                        value={confirmation.observations}
                        onChange={(e) => {
                          console.log('✅ Textarea alterado no histórico:', e.target.value);
                          setConfirmations(prev => ({
                            ...prev,
                            [feedbackId]: { ...confirmation, observations: e.target.value }
                          }));
                        }}
                        onBlur={() => {
                          console.log('✅ Salvando observações no histórico');
                          handleConfirmationChange(feedbackId, confirmation.understood, confirmation.observations);
                        }}
                        placeholder="Digite suas observações aqui..."
                        disabled={isSaving}
                        rows="3"
                        style={{ 
                          width: '100%', 
                          padding: '10px', 
                          border: '1px solid #ddd', 
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontFamily: 'inherit',
                          resize: 'vertical',
                          boxSizing: 'border-box'
                        }}
                      />
                      {isSaving && (
                        <span style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                          Salvando...
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {confirmation.understood && event.data.confirmationDate && (
                    <div className="feedback-confirmed" style={{ marginTop: '10px', color: '#27ae60', fontSize: '14px' }}>
                      ✓ Confirmado em {new Date(event.data.confirmationDate).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        );
    }
    
    // Fallback (não deve acontecer, mas por segurança)
    return <div>{event.label}</div>;
  };

  if (timeline.length === 0) {
    return (
      <div className="timeline-empty">
        <p>Nenhum feedback encontrado para o período selecionado.</p>
        <p className="timeline-empty-hint">
          💡 Os feedbacks dos gestores aparecerão aqui quando forem adicionados.
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

