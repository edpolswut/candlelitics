// src/components/Layout.js
import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import textLogoLight from '../img/candleliticsTextLogo.png';
import textLogoDark from '../img/candleliticsTextLogo.png';
import './Layout.css';

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

  return (
    <>
      <header className="navbar">
        <div className="nav-brand">
          <Link to="/"><img src={currentLogo} alt="Candlelitics Logo" className="nav-logo"/></Link>
        </div>
        
        <div className="nav-actions">
          <Link to="/dashboards" className="nav-link">Meu Dashboard</Link>
          <button className="btn-nav btn-login">Entrar</button>
          <button className="btn-nav btn-register">Registrar</button>
          
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
        {/* Pass the theme state to child routes (like Home) using context */}
        <Outlet context={{ isDarkTheme }} />
      </main>
    </>
  );
}

export default Layout;