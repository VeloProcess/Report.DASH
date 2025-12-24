import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './NavigationMenu.css';

function NavigationMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <button 
        className="menu-toggle"
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <span className={`hamburger ${isOpen ? 'open' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>

      {isOpen && (
        <div className="menu-overlay" onClick={closeMenu}></div>
      )}

      <nav className={`navigation-menu ${isOpen ? 'open' : ''}`}>
        <div className="menu-header">
          <h2>Menu</h2>
          <button className="menu-close" onClick={closeMenu}>×</button>
        </div>

        <ul className="menu-items">
          <li>
            <Link 
              to="/dashboard" 
              className={isActive('/dashboard') ? 'active' : ''}
              onClick={closeMenu}
            >
              📊 Dashboard
            </Link>
          </li>
          <li>
            <Link 
              to="/history" 
              className={isActive('/history') ? 'active' : ''}
              onClick={closeMenu}
            >
              📜 Histórico
            </Link>
          </li>
          {user?.isManager && (
            <li>
              <Link 
                to="/manager" 
                className={isActive('/manager') ? 'active' : ''}
                onClick={closeMenu}
              >
                👥 Dashboard Gestor
              </Link>
            </li>
          )}
        </ul>

        <div className="menu-footer">
          <div className="user-info">
            <strong>{user?.operatorName || user?.email}</strong>
            {user?.isManager && <span className="manager-badge">Gestor</span>}
          </div>
        </div>
      </nav>
    </>
  );
}

export default NavigationMenu;

