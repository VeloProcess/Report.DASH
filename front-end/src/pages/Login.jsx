import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

function Login() {
  const { handleGoogleSuccess, handleGoogleError } = useAuth();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    return (
      <div className="login-container">
        <div className="login-error">
          <h2>Erro de Configuração</h2>
          <p>Google Client ID não configurado. Configure VITE_GOOGLE_CLIENT_ID no arquivo .env</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Sistema de Feedback Mensal</h1>
        <p className="login-subtitle">Faça login com sua conta Google</p>
        
        <div className="google-login-wrapper">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap={false}
          />
        </div>
        
        <p className="login-info">
          Apenas operadores cadastrados podem acessar o sistema.
        </p>
      </div>
    </div>
  );
}

export default Login;

