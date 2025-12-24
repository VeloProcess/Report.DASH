import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import HistoryPage from './pages/HistoryPage';
import NavigationMenu from './components/NavigationMenu';
import './styles/App.css';

function AppRoutes() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Carregando...
      </div>
    );
  }

  // Redirecionar gestores para dashboard de gestão
  const isManager = user?.isManager || false;
  const defaultRoute = isManager ? "/manager" : "/dashboard";

  return (
    <>
      {isAuthenticated && <NavigationMenu />}
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to={defaultRoute} replace /> : <Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              {isManager ? <Navigate to="/manager" replace /> : <Dashboard />}
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager"
          element={
            <ProtectedRoute>
              {isManager ? <ManagerDashboard /> : <Navigate to="/dashboard" replace />}
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to={isAuthenticated ? defaultRoute : "/login"} replace />} />
        <Route path="*" element={<Navigate to={isAuthenticated ? defaultRoute : "/login"} replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="app">
        <main className="main-content">
          <AppRoutes />
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;

