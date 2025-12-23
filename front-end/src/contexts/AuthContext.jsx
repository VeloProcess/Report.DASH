import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, getCurrentUser } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Verificar se há token salvo ao carregar
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Validar token e buscar dados do usuário
      getCurrentUser()
        .then((response) => {
          setUser(response.data);
        })
        .catch(() => {
          // Token inválido, remover
          localStorage.removeItem('authToken');
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await login(credentialResponse.credential);
      
      if (response.data.success) {
        localStorage.setItem('authToken', response.data.token);
        setUser(response.data.user);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      alert(error.response?.data?.error || 'Erro ao fazer login');
    }
  };

  const handleGoogleError = () => {
    console.error('Erro no login do Google');
    alert('Erro ao fazer login com Google');
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    loading,
    handleGoogleSuccess,
    handleGoogleError,
    handleLogout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

