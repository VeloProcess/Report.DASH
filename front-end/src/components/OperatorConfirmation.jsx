import { useState, useEffect } from 'react';
import { getOperatorConfirmation, saveOperatorConfirmation } from '../services/api';
import './OperatorConfirmation.css';

function OperatorConfirmation({ month, year }) {
  const [understood, setUnderstood] = useState(false);
  const [observations, setObservations] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadConfirmation();
  }, [month, year]);

  const loadConfirmation = async () => {
    try {
      setLoading(true);
      const response = await getOperatorConfirmation(month, year || new Date().getFullYear());
      if (response.data.success && response.data.confirmation) {
        setUnderstood(response.data.confirmation.understood || false);
        setObservations(response.data.confirmation.observations || '');
        setSaved(!!response.data.confirmation.confirmed_at);
      }
    } catch (error) {
      console.error('Erro ao carregar confirmação:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await saveOperatorConfirmation(
        month,
        year || new Date().getFullYear(),
        understood,
        observations
      );
      if (response.data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000); // Esconder mensagem após 3 segundos
      }
    } catch (error) {
      console.error('Erro ao salvar confirmação:', error);
      alert('Erro ao salvar confirmação. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleUnderstoodChange = async (checked) => {
    setUnderstood(checked);
    // Salvar automaticamente quando marcar/desmarcar
    try {
      await saveOperatorConfirmation(
        month,
        year || new Date().getFullYear(),
        checked,
        observations
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Erro ao salvar confirmação:', error);
    }
  };

  if (loading) {
    return (
      <div className="operator-confirmation">
        <div className="confirmation-loading">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="operator-confirmation">
      <div className="confirmation-header">
        <h3>Confirmação de Leitura</h3>
        {saved && <span className="saved-indicator">✓ Salvo</span>}
      </div>
      
      <div className="confirmation-content">
        <div className="confirmation-checkbox">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={understood}
              onChange={(e) => handleUnderstoodChange(e.target.checked)}
              className="checkbox-input"
            />
            <span className="checkbox-text">Compreendi</span>
          </label>
        </div>

        <div className="confirmation-observations">
          <label htmlFor="observations" className="observations-label">
            Observações (pontos que discorda ou algo específico):
          </label>
          <textarea
            id="observations"
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            onBlur={handleSave}
            placeholder="Digite suas observações aqui..."
            className="observations-textarea"
            rows="4"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-save-confirmation"
        >
          {saving ? 'Salvando...' : 'Salvar Observações'}
        </button>
      </div>
    </div>
  );
}

export default OperatorConfirmation;

