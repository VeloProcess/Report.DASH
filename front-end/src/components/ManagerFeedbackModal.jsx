import { useState, useEffect } from 'react';
import { getManagerFeedback, saveManagerFeedback, deleteManagerFeedback } from '../services/api';
import './ManagerFeedbackModal.css';

const FIXED_MONTHS = ['Dezembro', 'Novembro', 'Outubro'];

function ManagerFeedbackModal({ operator, isOpen, onClose, onSave }) {
  const [selectedMonth, setSelectedMonth] = useState('Dezembro');
  const [feedbackText, setFeedbackText] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState(null);

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (isOpen && operator) {
      loadFeedback();
    }
  }, [isOpen, operator, selectedMonth]);

  const loadFeedback = async () => {
    if (!operator) return;
    
    setLoading(true);
    try {
      const response = await getManagerFeedback(operator.id, selectedMonth, currentYear);
      if (response.data.success && response.data.feedback) {
        setExistingFeedback(response.data.feedback);
        setFeedbackText(response.data.feedback.feedback_text || '');
      } else {
        setExistingFeedback(null);
        setFeedbackText('');
      }
    } catch (error) {
      console.error('Erro ao carregar feedback:', error);
      setExistingFeedback(null);
      setFeedbackText('');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!feedbackText.trim()) {
      alert('Por favor, digite o feedback antes de salvar.');
      return;
    }

    setSaving(true);
    try {
      await saveManagerFeedback(operator.id, selectedMonth, currentYear, feedbackText.trim());
      if (onSave) {
        onSave();
      }
      alert('Feedback salvo com sucesso!');
      onClose();
    } catch (error) {
      console.error('Erro ao salvar feedback:', error);
      alert('Erro ao salvar feedback. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existingFeedback) return;
    
    const confirmDelete = window.confirm(
      'Tem certeza que deseja excluir este feedback? Esta ação não pode ser desfeita.'
    );
    
    if (!confirmDelete) return;
    
    setDeleting(true);
    try {
      await deleteManagerFeedback(existingFeedback.id);
      if (onSave) {
        onSave();
      }
      alert('Feedback excluído com sucesso!');
      setExistingFeedback(null);
      setFeedbackText('');
      onClose();
    } catch (error) {
      console.error('Erro ao excluir feedback:', error);
      alert('Erro ao excluir feedback. Tente novamente.');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    setFeedbackText('');
    setExistingFeedback(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="feedback-modal-overlay" onClick={handleCancel}>
      <div className="feedback-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="feedback-modal-header">
          <h2>Aplicar Feedback</h2>
          <button className="feedback-modal-close" onClick={handleCancel}>×</button>
        </div>

        <div className="feedback-modal-body">
          <div className="feedback-operator-info">
            <h3>{operator?.name}</h3>
            <p>{operator?.position || 'N/A'} | {operator?.team || 'N/A'}</p>
          </div>

          <div className="feedback-month-selector">
            <label htmlFor="feedback-month">Selecione o período:</label>
            <select
              id="feedback-month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              disabled={loading}
            >
              {FIXED_MONTHS.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="feedback-loading">Carregando...</div>
          ) : (
            <>
              {existingFeedback && (
                <div className="feedback-existing-info">
                  <div className="feedback-existing-header">
                    <div>
                      <p className="feedback-existing-label">Feedback existente:</p>
                      <p className="feedback-existing-date">
                        Por: {existingFeedback.manager_name} em{' '}
                        {new Date(existingFeedback.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <button
                      className="btn btn-delete"
                      onClick={handleDelete}
                      disabled={deleting || saving}
                      title="Excluir feedback"
                    >
                      {deleting ? 'Excluindo...' : '🗑️ Excluir'}
                    </button>
                  </div>
                </div>
              )}

              <div className="feedback-textarea-wrapper">
                <label htmlFor="feedback-text">Feedback:</label>
                <textarea
                  id="feedback-text"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Ex: Dia 15/12, apliquei um feedback sobre assunto tal."
                  rows={6}
                  disabled={saving}
                />
              </div>
            </>
          )}
        </div>

        <div className="feedback-modal-footer">
          <button
            className="btn btn-cancel"
            onClick={handleCancel}
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            className="btn btn-save"
            onClick={handleSave}
            disabled={saving || !feedbackText.trim()}
          >
            {saving ? 'Salvando...' : 'Salvar Feedback'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManagerFeedbackModal;

