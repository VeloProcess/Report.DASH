import { useState, useEffect } from 'react';
import { getOperatorConfirmation, saveOperatorConfirmation } from '../services/api';
import './OperatorConfirmation.css';

function OperatorConfirmation({ feedbackId, month, year }) {
  // Garantir valores padrão
  const currentMonth = month || 'Dezembro';
  const currentYear = year || new Date().getFullYear();
  
  const [understood, setUnderstood] = useState(false);
  const [observations, setObservations] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    console.log('🔍 OperatorConfirmation montado:', { feedbackId, month: currentMonth, year: currentYear });
    if (feedbackId) {
      loadConfirmation();
    }
  }, [feedbackId, currentMonth, currentYear]);

  const loadConfirmation = async () => {
    if (!feedbackId) {
      console.warn('⚠️ feedbackId não fornecido, não é possível carregar confirmação');
      return;
    }
    
    try {
      setLoading(true);
      const response = await getOperatorConfirmation(feedbackId);
      if (response.data.success && response.data.confirmation) {
        setUnderstood(response.data.confirmation.understood || false);
        setObservations(response.data.confirmation.observations || '');
        setSaved(!!response.data.confirmation.confirmed_at);
      }
    } catch (error) {
      console.error('Erro ao carregar confirmação (não crítico):', error);
      // Continuar mesmo com erro - permitir que o usuário ainda possa confirmar
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!feedbackId) {
      alert('Erro: ID do feedback não fornecido. Não é possível salvar a confirmação.');
      return;
    }
    
    try {
      setSaving(true);
      const response = await saveOperatorConfirmation(
        feedbackId,
        currentMonth,
        currentYear,
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
    if (!feedbackId) {
      console.warn('⚠️ feedbackId não fornecido, não é possível salvar confirmação');
      return;
    }
    
    setUnderstood(checked);
    // Salvar automaticamente quando marcar/desmarcar
    try {
      await saveOperatorConfirmation(
        feedbackId,
        currentMonth,
        currentYear,
        checked,
        observations
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Erro ao salvar confirmação:', error);
    }
  };

  console.log('🔍 OperatorConfirmation renderizando:', { 
    feedbackId,
    loading, 
    understood, 
    observations, 
    month: currentMonth, 
    year: currentYear,
    componentVisible: true
  });
  
  // Não renderizar se não tiver feedbackId
  if (!feedbackId) {
    return null;
  }

  // SEMPRE renderizar o componente, mesmo durante loading
  return (
    <div 
      className="operator-confirmation" 
      style={{ 
        display: 'block', 
        visibility: 'visible', 
        opacity: 1,
        background: 'white',
        borderRadius: '8px',
        padding: '20px',
        marginTop: '30px',
        marginBottom: '30px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        border: '2px solid #e0e0e0',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}
    >
      <div className="confirmation-header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: '2px solid #f0f0f0'
      }}>
        <h3 style={{ margin: 0, color: '#2c3e50', fontSize: '18px', fontWeight: 600 }}>
          Confirmação de Leitura
        </h3>
        {saved && <span style={{ color: '#27ae60', fontSize: '14px', fontWeight: 600 }}>✓ Salvo</span>}
      </div>
      
      <div className="confirmation-content" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '20px'
      }}>
        <div className="confirmation-checkbox" style={{ 
          display: 'flex', 
          alignItems: 'center',
          minHeight: '30px'
        }}>
          <label 
            htmlFor="compreendi-checkbox"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              userSelect: 'none',
              width: '100%'
            }}
          >
            <input
              id="compreendi-checkbox"
              type="checkbox"
              checked={understood}
              onChange={(e) => {
                console.log('✅ Checkbox clicado:', e.target.checked);
                handleUnderstoodChange(e.target.checked);
              }}
              style={{ 
                width: '20px', 
                height: '20px', 
                marginRight: '12px', 
                cursor: 'pointer',
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
          gap: '8px',
          width: '100%'
        }}>
          <label 
            htmlFor="observations-textarea" 
            style={{ fontSize: '14px', fontWeight: 600, color: '#2c3e50' }}
          >
            Observações (pontos que discorda ou algo específico):
          </label>
          <textarea
            id="observations-textarea"
            value={observations}
            onChange={(e) => {
              console.log('✅ Textarea alterado:', e.target.value);
              setObservations(e.target.value);
            }}
            onBlur={handleSave}
            placeholder="Digite suas observações aqui..."
            rows="4"
            style={{ 
              width: '100%', 
              padding: '12px', 
              border: '1px solid #ddd', 
              borderRadius: '6px',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            console.log('✅ Botão salvar clicado');
            handleSave();
          }}
          disabled={saving}
          style={{ 
            alignSelf: 'flex-start',
            padding: '10px 20px', 
            background: saving ? '#ccc' : '#1694ff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
            minWidth: '150px'
          }}
        >
          {saving ? 'Salvando...' : 'Salvar Observações'}
        </button>
      </div>
    </div>
  );
}

export default OperatorConfirmation;

