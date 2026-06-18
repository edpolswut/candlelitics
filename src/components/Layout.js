import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import textLogoLight from '../img/candleliticsTextLogo.png';
import textLogoDark from '../img/candleliticsTextLogoDark.png';
import './Layout.css';
import AuthModal from './AuthModal';

function Layout() {
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const currentLogo = isDarkTheme ? textLogoDark : textLogoLight;
  
  const [modalType, setModalType] = useState(null);
  
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  }); 
  const navigate = useNavigate();

  useEffect(() => {
    if (isDarkTheme) {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
    }
  }, [isDarkTheme]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setModalType(null);
  };

  return (
    <>
      <header className="navbar">
        <div className="nav-brand">
          <Link to="/"><img src={currentLogo} alt="Candlelitics Logo" className="nav-logo"/></Link>
        </div>
        
        <div className="nav-actions">
          {user && (
            <Link to="/dashboards" className="nav-link">Meu Dashboard</Link>
          )}

          {user ? (
            <div className="user-profile">
              {user.photoUrl ? (
                <img 
                  src={user.photoUrl}
                  alt="Foto do usuário" 
                  className="user-photo" 
                />
              ) : (
                <div className="default-avatar">
                  <i className="fas fa-user"></i>
                </div>
              )}
              <span className="user-name">{user.username}</span>
              <button className="btn-logout" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i>
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <button className="btn-login" onClick={() => setModalType('login')}>Login</button>
              <button className="btn-register" onClick={() => setModalType('register')}>Cadastrar</button>
            </div>
          )}
          
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
        <Outlet context={{ isDarkTheme, user }} />
      </main>

      {modalType && (
        <AuthModal 
          type={modalType} 
          isDarkTheme={isDarkTheme} 
          onClose={() => setModalType(null)}
          onLoginSuccess={handleLoginSuccess} 
        />
      )}
      
      <ToastContainer 
        position="bottom-center" 
        autoClose={3000} 
        theme={isDarkTheme ? "dark" : "light"} 
        hideProgressBar={true}
      />
    </>
  );
}

export default Layout;