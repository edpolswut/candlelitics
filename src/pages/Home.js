import React, { useState } from 'react';
import logo from '../img/candleliticsText.png';
import Chart from 'react-apexcharts';
import CandlestickChart from '../components/Graph';
import './Home.css';

function Home() {
  return (
    <div className="page-container">
      <div class="title-container">
        <h1>Bem-vindo à </h1>
        <img src={logo} alt="Logo" id='logoh1'/>
      </div>
      <CandlestickChart />
    </div>
  );
}

export default Home;