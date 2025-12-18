import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

function Navigation() {
  const location = useLocation();

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          Sistema de Feedback
        </Link>
        <div className="nav-links">
          <Link 
            to="/" 
            className={location.pathname === '/' ? 'active' : ''}
          >
            Home
          </Link>
          <Link 
            to="/logs" 
            className={location.pathname === '/logs' ? 'active' : ''}
          >
            Logs
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;

