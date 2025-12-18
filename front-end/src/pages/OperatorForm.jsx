import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOperator, getAvailableOperatorNames } from '../services/api';
import './OperatorForm.css';

function OperatorForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    team: '',
    referenceMonth: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableNames, setAvailableNames] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    loadAvailableNames();
  }, []);

  const loadAvailableNames = async () => {
    try {
      const response = await getAvailableOperatorNames();
      setAvailableNames(response.data.names || []);
    } catch (err) {
      console.error('Erro ao carregar nomes disponíveis:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNameSelect = (name) => {
    setFormData({ ...formData, name });
    setShowDropdown(false);
  };

  const filteredNames = formData.name
    ? availableNames.filter(name =>
        name.toLowerCase().includes(formData.name.toLowerCase())
      )
    : availableNames;

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.name-input-container')) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await createOperator(formData);
      alert('Operador cadastrado com sucesso!');
      navigate(`/indicators/${response.data.id}`);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Backend não encontrado. Verifique se o servidor está rodando na porta 3001.');
      } else if (err.response?.status >= 500) {
        setError('Erro no servidor. Tente novamente mais tarde.');
      } else {
        setError(err.response?.data?.error || err.message || 'Erro ao cadastrar operador');
      }
      console.error('Erro ao cadastrar operador:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="operator-form">
      <h1>Cadastrar Novo Operador</h1>
      
      <form onSubmit={handleSubmit} className="form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="name">Nome do Operador *</label>
          <div className="name-input-container" style={{ position: 'relative' }}>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={(e) => {
                handleChange(e);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              required
              placeholder="Digite ou selecione um nome"
              autoComplete="off"
            />
            {showDropdown && filteredNames.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderTop: 'none',
                borderRadius: '0 0 4px 4px',
                maxHeight: '200px',
                overflowY: 'auto',
                zIndex: 1000,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                {filteredNames.map((name, index) => (
                  <div
                    key={index}
                    onClick={() => handleNameSelect(name)}
                    style={{
                      padding: '10px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #eee'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                  >
                    {name}
                  </div>
                ))}
              </div>
            )}
          </div>
          {availableNames.length > 0 && (
            <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
              {availableNames.length} nomes disponíveis no sistema
            </small>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="position">Cargo *</label>
          <input
            type="text"
            id="position"
            name="position"
            value={formData.position}
            onChange={handleChange}
            required
            placeholder="Ex: Operador de Atendimento"
          />
        </div>

        <div className="form-group">
          <label htmlFor="team">Equipe *</label>
          <input
            type="text"
            id="team"
            name="team"
            value={formData.team}
            onChange={handleChange}
            required
            placeholder="Ex: Equipe A"
          />
        </div>

        <div className="form-group">
          <label htmlFor="referenceMonth">Mês de Referência *</label>
          <input
            type="text"
            id="referenceMonth"
            name="referenceMonth"
            value={formData.referenceMonth}
            onChange={handleChange}
            required
            placeholder="Ex: Novembro/2024"
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/')} className="btn btn-secondary">
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default OperatorForm;

