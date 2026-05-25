// src/pages/Home.js
import React, { useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import logoLight from '../img/candleliticsTextLogo.png';
import logoDark from '../img/candleliticsTextLogoDark.png';
import './Home.css';
import FeatureCard from '../components/FeatureCard';

const CanvasChartBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Configurações do traço
    let points = [{ x: 0, y: 0 }];
    let offsetX = 0; 
    let offsetY = 0; 
    
    const stepX = 50; 
    const speedX = 3.5; 

    // Gera os traços preenchendo a tela
    const generatePoints = () => {
      while (points[points.length - 1].x - offsetX < canvas.width + 150) {
        const lastPoint = points[points.length - 1];

        // Força de retorno ao centro: quanto mais longe do zero (centro vertical), 
        // maior a chance de o próximo movimento ser na direção oposta.
        const gravity = lastPoint.y * 0.001;
        const baseUpChance = 0.35; // 65% de chance de subir normalmente
        const adjustedThreshold = Math.max(0.15, Math.min(0.85, baseUpChance - gravity));

        const isUp = Math.random() > adjustedThreshold;
        const deltaY = isUp ? -(Math.random() * 25 + 10) : (Math.random() * 20 + 5);

        points.push({ 
          x: lastPoint.x + stepX, 
          y: lastPoint.y + deltaY 
        });
      }
    };
    
    generatePoints();

    const renderLoop = () => {
      offsetX += speedX;

      // --- NOVA LÓGICA DE CÂMERA (Bouding Box Visível) ---
      let visibleMinY = Infinity;
      let visibleMaxY = -Infinity;
      let visibleCount = 0;

      // Descobre qual é o ponto mais alto e o mais baixo que estão atualmente dentro da tela
      for (let i = 0; i < points.length; i++) {
        const screenX = points[i].x - offsetX;
        if (screenX >= -stepX && screenX <= canvas.width + stepX) {
          if (points[i].y < visibleMinY) visibleMinY = points[i].y;
          if (points[i].y > visibleMaxY) visibleMaxY = points[i].y;
          visibleCount++;
        }
      }

      // O alvo da câmera passa a ser exatamente o centro entre o ponto mais alto e o mais baixo visíveis
      if (visibleCount > 0) {
        const targetY = (visibleMinY + visibleMaxY) / 2;
        // Aumentamos a velocidade de resposta (0.12) para que a câmera não "se perca"
        offsetY += (targetY - offsetY) * 0.12; 
      }
      // ---------------------------------------------------

      generatePoints();

      if (points[0].x - offsetX < -100) {
        points.shift();
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (let i = 1; i < points.length; i++) {
        const p1 = points[i - 1];
        const p2 = points[i];

        const screenX1 = p1.x - offsetX;
        const screenY1 = p1.y - offsetY + canvas.height / 2;
        const screenX2 = p2.x - offsetX;
        const screenY2 = p2.y - offsetY + canvas.height / 2;

        ctx.beginPath();
        ctx.moveTo(screenX1, screenY1);
        ctx.lineTo(screenX2, screenY2);
        
        ctx.strokeStyle = p2.y < p1.y ? '#00b746' : '#ef403c';
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        pointerEvents: 'none',
        zIndex: 0
      }} 
    />
  );
};

function Home() {
  const { isDarkTheme } = useOutletContext();
  const currentLogo = isDarkTheme ? logoDark : logoLight;

  return (
    <div className="home-page-wrapper">
      
      {/* Container exatamente igual ao seu código original */}
      <section className="home-hero-container" style={{ position: 'relative', overflow: 'hidden' }}>
        
        <div className="background-chart-wrapper" style={{ opacity: 0.6 }}>
          <CanvasChartBackground />
        </div>

        <div className="hero-content" style={{ position: 'relative', zIndex: 1 }}>
          <div className="title-container">
            <h1>Bem-vindo à </h1>
            <img src={currentLogo} alt="Candlelitics Logo" id="logoh1" />
          </div>
          <p className="hero-subtitle">Transforme seus dados em decisões precisas</p>
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
            header="Layout Personalizável" 
            desc="Organize seus widgets e gráficos da maneira que melhor se adapte ao seu fluxo de trabalho." 
            icon="fa-th-large" 
          />

        </div>
      </section>

    </div>
  );
}

export default Home;