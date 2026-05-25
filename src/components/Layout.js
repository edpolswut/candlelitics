// src/components/Layout.js
import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import textLogoLight from '../img/candleliticsTextLogo.png';
import textLogoDark from '../img/candleliticsTextLogoDark.png';
import './Layout.css';
import AuthModal from './AuthModal';

function Layout() {
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const currentLogo = isDarkTheme ? textLogoDark : textLogoLight;

  // Toggle the data-theme attribute on the body whenever the state changes
  useEffect(() => {
    if (isDarkTheme) {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
    }
  }, [isDarkTheme]);


  const [modalType, setModalType] = useState(null);

  return (
    <>
      <header className="navbar">
        <div className="nav-brand">
          <Link to="/"><img src={currentLogo} alt="Candlelitics Logo" className="nav-logo"/></Link>
        </div>
        
        <div className="nav-actions">
          <Link to="/dashboards" className="nav-link">Meu Dashboard</Link>
          <div className="auth-buttons">
            <button className="btn-login" onClick={() => setModalType('login')}>Login</button>
            <button className="btn-register" onClick={() => setModalType('register')}>Cadastrar</button>
          </div>
          
          <button 
            className="theme-toggle" 
            onClick={() => setIsDarkTheme(!isDarkTheme)}
            aria-label="Toggle Theme"
          >
            <i className={`fas ${isDarkTheme ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>
        </div>
      </header>

      <main className="main-content">
        <Outlet context={{ isDarkTheme }} />
      </main>

      {modalType && (
        <AuthModal 
          type={modalType} 
          isDarkTheme={isDarkTheme} 
          onClose={() => setModalType(null)}
        />
      )}
    </>
  );
}

export default Layout;
