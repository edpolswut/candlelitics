// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Chart from 'react-apexcharts';
import logoLight from '../img/candleliticsText.png';
import logoDark from '../img/candleliticsText.png';
import './Home.css';
import FeatureCard from '../components/FeatureCard';

function Home() {
  const { isDarkTheme } = useOutletContext();
  const currentLogo = isDarkTheme ? logoDark : logoLight;

  const [series, setSeries] = useState([{ name: 'Market Data', data: [] }]);

  useEffect(() => {
    let currentData = [];
    let xValue = new Date().getTime();
    let iteration = 0;
    const maxIterations = 40; // The graph will stop after 40 points

    // Faster interval: 50ms instead of 1000ms
    const interval = setInterval(() => {
      let yValue = Math.floor(Math.random() * (90 - 20 + 1)) + 20;
      currentData.push([xValue, yValue]);
      
      setSeries([{ name: 'Market Data', data: [...currentData] }]);
      xValue += 86400000; // Increment by 1 day visually
      iteration++;

      // Stop the animation once it fills the screen
      if (iteration >= maxIterations) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const chartOptions = {
    chart: {
      type: 'area',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 50,
        dynamicAnimation: { enabled: false }
      },
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    colors: ['var(--accent-primary)'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.0,
        stops: [0, 90, 100]
      }
    },
    grid: { show: false },
    xaxis: { labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { show: false },
    tooltip: { enabled: false }
  };

  return (
    <div className="home-page-wrapper">
      
      <section className="home-hero-container">
        <div className="background-chart-wrapper">
          <Chart options={chartOptions} series={series} type="area" height="100%" width="100%" />
        </div>

        <div className="hero-content">
          <div className="title-container">
            <h1>Bem-vindo à </h1>
            <img src={currentLogo} alt="Candlelitics Logo" id="logoh1" />
          </div>
          <p className="hero-subtitle">Transforme seus dados em decisões precisas.</p>
        </div>
      </section>

      <section className="home-scrollable-content">
        <h2>Explore seus Dashboards</h2>
        <div className="features-grid">
          
          <FeatureCard 
            header="Análise em Tempo Real" 
            desc="Acompanhe as variações de mercado com gráficos atualizados instantaneamente." 
            icon="fa-chart-line" 
          />
          
          <FeatureCard 
            header="Gestão de Portfólio" 
            desc="Controle seus ativos e avalie o desempenho dos seus investimentos em um só lugar." 
            icon="fa-wallet" 
          />
          
          <FeatureCard 
            header="Segurança de Dados" 
            desc="Suas informações financeiras armazenadas com a mais alta tecnologia de criptografia." 
            icon="fa-shield-alt" 
          />

        </div>
      </section>

    </div>
  );
}

export default Home;