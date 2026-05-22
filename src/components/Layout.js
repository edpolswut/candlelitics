import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import './Layout.css';
import './AuthModal.css';
import logo from '../img/candleliticsTextLogo.png';
import AuthModal from './AuthModal';

function Layout() {

  const [modalType, setModalType] = useState(null);

  return (
    <div>
      <nav className="navbar">
        <img src={logo} alt="Logo" id='logo'/>
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/sobre" className="nav-link">Sobre</Link>
        <Link to="/dashboards" className="nav-link">Meu Dashboard</Link>
        
        <div className="auth-buttons">
          <button className="btn-login" onClick={() => setModalType('login')}>Login</button>
          <button className="btn-register" onClick={() => setModalType('register')}>Cadastrar</button>
        </div>
      </nav>
      
      <main className="main-content"> 
        <Outlet /> 
      </main>

      {modalType && (
        <AuthModal type={modalType}onClose={() => setModalType(null)}/>
      )}
    </div>
  );
}

export default Layout;
