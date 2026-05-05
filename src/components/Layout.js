import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import './Layout.css';
import logo from '../img/candleliticsTextLogo.png';

function Layout() {
  return (
    <div>
      <nav className="navbar">
        <img src={logo} alt="Logo" id='logo'/>
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/sobre" className="nav-link">Sobre</Link>
        <Link to="/dashboards" className="nav-link">Meu Dashboard</Link>
      </nav>
      
      <main className="main-content">
        <Outlet /> 
      </main>
    </div>
  );
}

export default Layout;