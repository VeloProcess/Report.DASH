import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllOperators } from '../services/api';
import './Home.css';

function Home() {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOperators();
  }, []);

  const loadOperators = async () => {
    try {
      const response = await getAllOperators();
      // Garantir que sempre seja um array, mesmo em caso de resposta inesperada
      const operatorsData = Array.isArray(response.data) ? response.data : [];
      setOperators(operatorsData);
    } catch (error) {
      console.error('Erro ao carregar operadores:', error);
      // Em caso de erro, garantir que operators seja um array vazio
      setOperators([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      <div className="home-header">
        <h1>Sistema de Feedback Mensal</h1>
        <Link to="/operator/new" className="btn btn-primary">
          + Novo Operador
        </Link>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : operators.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum operador cadastrado ainda.</p>
          <Link to="/operator/new" className="btn btn-primary">
            Cadastrar Primeiro Operador
          </Link>
        </div>
      ) : (
        <div className="operators-list">
          <h2>Operadores Cadastrados</h2>
          <div className="operators-grid">
            {operators.map((operator) => (
              <div key={operator.id} className="operator-card">
                <h3>{operator.name}</h3>
                <p><strong>Cargo:</strong> {operator.position}</p>
                <p><strong>Equipe:</strong> {operator.team}</p>
                <p><strong>Mês:</strong> {operator.reference_month}</p>
                <div className="operator-actions">
                  <Link 
                    to={`/indicators/${operator.id}`} 
                    className="btn btn-secondary"
                  >
                    Inserir Indicadores
                  </Link>
                  <Link 
                    to={`/feedback/${operator.id}`} 
                    className="btn btn-primary"
                  >
                    Ver Feedback
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;

