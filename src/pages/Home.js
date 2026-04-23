import React from 'react';
import logo from '../img/candlelitics.png';
import './Home.css';

function Home() {
  return (
    <div className="page-container">
        <div class="title-container">
            <h1>Bem-vindo à </h1>
            <img src={logo} alt="Logo" id='logoh1'/>
        </div>
    </div>
  );
}

export default Home;